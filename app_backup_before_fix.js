// Trading System Application
class TradingSystem {
    constructor() {
        this.trades = [];
        this.settings = this.getDefaultSettings();
        this.chart = null;
        this.init();
    }

    getDefaultSettings() {
        return {
            initialCapital: 10000,
            targetGrowth: 8,
            riskPerTrade: 0.5,
            rLevel: 1.2,
            lockPercentage: 70,
            manualMode: false
        };
    }

    init() {
        this.loadSettings();
        this.loadTrades();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderTradeHistory();
        this.initChart();
        this.applyTheme();
    }

    // Storage Methods
    saveSettings() {
        localStorage.setItem('tradingSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('tradingSettings');
        if (saved) {
            this.settings = { ...this.getDefaultSettings(), ...JSON.parse(saved) };
        }
    }

    saveTrades() {
        localStorage.setItem('trades', JSON.stringify(this.trades));
    }

    loadTrades() {
        const saved = localStorage.getItem('trades');
        if (saved) {
            this.trades = JSON.parse(saved);
        }
    }

    // Theme Management
    applyTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update chart colors
        if (this.chart) {
            this.updateChart();
        }
    }

    // Chart Initialization
    initChart() {
        const ctx = document.getElementById('balanceChart').getContext('2d');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Bakiye',
                    data: [],
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                return 'Bakiye: ' + context.parsed.y.toFixed(2) + ' TL';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(0) + ' TL';
                            }
                        }
                    }
                }
            }
        });

        this.updateChart();
    }

    updateChart() {
        if (!this.chart) return;

        const balanceHistory = [this.settings.initialCapital];
        let runningBalance = this.settings.initialCapital;

        this.trades.forEach(trade => {
            runningBalance += trade.profitLoss;
            balanceHistory.push(runningBalance);
        });

        this.chart.data.labels = balanceHistory.map((_, i) => i === 0 ? 'Başlangıç' : `İşlem ${i}`);
        this.chart.data.datasets[0].data = balanceHistory;
        this.chart.update();
    }

    // Core Calculation Methods
    calculateTradeResult(result, firstCloseRRR = 0, firstClosePercent = 0, runnerCloseRRR = 0) {
        const riskAmount = (this.settings.initialCapital * this.settings.riskPerTrade) / 100;

        if (result === 'loss') {
            return {
                total: -riskAmount,
                breakdown: {
                    type: 'loss',
                    riskAmount: riskAmount
                }
            };
        }

        if (result === 'be') {
            const firstPart = (firstClosePercent / 100) * riskAmount * firstCloseRRR;
            const runnerPart = -((100 - firstClosePercent) / 100) * riskAmount;
            const total = firstPart + runnerPart;

            return {
                total: total,
                breakdown: {
                    type: 'be',
                    firstClose: {
                        rrr: firstCloseRRR,
                        percent: firstClosePercent,
                        profit: firstPart
                    },
                    runner: {
                        percent: 100 - firstClosePercent,
                        loss: runnerPart
                    }
                }
            };
        }

        // Win
        const firstPart = (firstClosePercent / 100) * riskAmount * firstCloseRRR;
        const runnerPart = ((100 - firstClosePercent) / 100) * riskAmount * runnerCloseRRR;
        const total = firstPart + runnerPart;

        return {
            total: total,
            breakdown: {
                type: 'win',
                firstClose: {
                    rrr: firstCloseRRR,
                    percent: firstClosePercent,
                    profit: firstPart
                },
                runner: {
                    rrr: runnerCloseRRR,
                    percent: 100 - firstClosePercent,
                    profit: runnerPart
                }
            }
        };
    }

    calculateMultiTPResult(rows) {
        const riskAmount = (this.settings.initialCapital * this.settings.riskPerTrade) / 100;
        let total = 0;
        const closes = [];

        rows.forEach(row => {
            const profit = (row.percent / 100) * riskAmount * row.rrr;
            total += profit;
            closes.push({
                rrr: row.rrr,
                percent: row.percent,
                profit: profit
            });
        });

        return {
            total: total,
            breakdown: {
                type: 'multi-tp',
                isMultiTP: true,
                closes: closes
            }
        };
    }

    // Trade Management
    addTrade(tradeData) {
        const trade = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...tradeData
        };

        this.trades.push(trade);
        this.saveTrades();
        return trade;
    }

    deleteTrade(id) {
        this.trades = this.trades.filter(t => t.id !== id);
        this.saveTrades();
        this.updateDashboard();
        this.renderTradeHistory();
        this.updateChart();
    }

    // Dashboard Updates
    updateDashboard() {
        const currentBalance = this.getCurrentBalance();
        const stats = this.calculateStats();

        // Safely update elements (check if they exist first)
        const currentBalanceEl = document.getElementById('currentBalance');
        if (currentBalanceEl) currentBalanceEl.textContent = currentBalance.toFixed(2);

        const totalTradesEl = document.getElementById('totalTrades');
        if (totalTradesEl) totalTradesEl.textContent = this.trades.length;

        const winRateEl = document.getElementById('winRate');
        if (winRateEl) winRateEl.textContent = stats.winRate.toFixed(1);

        const totalProfitEl = document.getElementById('totalProfit');
        if (totalProfitEl) totalProfitEl.textContent = stats.totalProfit.toFixed(2);

        // Update progress
        const growth = ((currentBalance - this.settings.initialCapital) / this.settings.initialCapital) * 100;
        const progressPercent = Math.min((growth / this.settings.targetGrowth) * 100, 100);

        const growthProgressEl = document.getElementById('growthProgress');
        if (growthProgressEl) growthProgressEl.style.width = progressPercent + '%';

        const currentGrowthEl = document.getElementById('currentGrowth');
        if (currentGrowthEl) currentGrowthEl.textContent = growth.toFixed(2);

        const targetGrowthEl = document.getElementById('targetGrowth');
        if (targetGrowthEl) targetGrowthEl.textContent = this.settings.targetGrowth;

        // Update chart
        this.updateChart();
    }

    getCurrentBalance() {
        return this.settings.initialCapital + this.trades.reduce((sum, t) => sum + t.profitLoss, 0);
    }

    calculateStats() {
        const wins = this.trades.filter(t => t.result === 'win').length;
        const totalProfit = this.trades.reduce((sum, t) => sum + t.profitLoss, 0);
        const winRate = this.trades.length > 0 ? (wins / this.trades.length) * 100 : 0;

        return { winRate, totalProfit };
    }

    // Trade History Rendering
    renderTradeHistory() {
        const container = document.getElementById('tradeHistory');

        if (this.trades.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Henüz işlem kaydı yok</p>';
            return;
        }

        const sortedTrades = [...this.trades].reverse();

        container.innerHTML = sortedTrades.map(trade => {
            const isProfit = trade.profitLoss > 0;
            const resultIcon = trade.result === 'win' ? '✅' : trade.result === 'loss' ? '❌' : '⚖️';
            const resultClass = trade.result === 'win' ? 'success' : trade.result === 'loss' ? 'danger' : 'warning';

            let breakdownHTML = '';
            if (trade.breakdown) {
                if (trade.breakdown.isManual) {
                    if (trade.breakdown.isMultiTP && trade.breakdown.closes) {
                        // Manual Multi-TP
                        breakdownHTML = '<div class="trade-breakdown">';
                        breakdownHTML += '<strong>Manuel Giriş (Çoklu TP):</strong><ul>';
                        trade.breakdown.closes.forEach((close, idx) => {
                            breakdownHTML += `<li>TP${idx + 1}: ${close.rrr}R @ %${close.percent} → ${close.profit.toFixed(2)} TL</li>`;
                        });
                        breakdownHTML += '</ul></div>';
                    } else {
                        // Manual Single Amount
                        breakdownHTML = `<div class="trade-breakdown"><strong>Manuel Giriş:</strong> ${trade.breakdown.manualAmount.toFixed(2)} TL</div>`;
                    }
                } else if (trade.breakdown.isMultiTP && trade.breakdown.closes) {
                    // Auto Multi-TP
                    breakdownHTML = '<div class="trade-breakdown">';
                    breakdownHTML += '<strong>Çoklu TP:</strong><ul>';
                    trade.breakdown.closes.forEach((close, idx) => {
                        breakdownHTML += `<li>TP${idx + 1}: ${close.rrr}R @ %${close.percent} → ${close.profit.toFixed(2)} TL</li>`;
                    });
                    breakdownHTML += '</ul></div>';
                } else if (trade.breakdown.type === 'win') {
                    breakdownHTML = `
                        <div class="trade-breakdown">
                            <strong>İlk Kapanış:</strong> ${trade.breakdown.firstClose.rrr}R @ %${trade.breakdown.firstClose.percent} → ${trade.breakdown.firstClose.profit.toFixed(2)} TL<br>
                            <strong>Runner:</strong> ${trade.breakdown.runner.rrr}R @ %${trade.breakdown.runner.percent} → ${trade.breakdown.runner.profit.toFixed(2)} TL
                        </div>
                    `;
                } else if (trade.breakdown.type === 'be') {
                    breakdownHTML = `
                        <div class="trade-breakdown">
                            <strong>İlk Kapanış:</strong> ${trade.breakdown.firstClose.rrr}R @ %${trade.breakdown.firstClose.percent} → ${trade.breakdown.firstClose.profit.toFixed(2)} TL<br>
                            <strong>Runner:</strong> BE @ %${trade.breakdown.runner.percent} → ${trade.breakdown.runner.loss.toFixed(2)} TL
                        </div>
                    `;
                }
            }

            return `
                <div class="trade-item ${resultClass}">
                    <div class="trade-header">
                        <div>
                            <span class="trade-pair">${trade.pair || 'Bilinmeyen'}</span>
                            <span class="trade-result">${resultIcon} ${trade.result.toUpperCase()}</span>
                        </div>
                        <div>
                            <span class="trade-amount ${isProfit ? 'profit' : 'loss'}">${isProfit ? '+' : ''}${trade.profitLoss.toFixed(2)} TL</span>
                            <button class="delete-btn" onclick="tradingSystem.deleteTrade(${trade.id})">🗑️</button>
                        </div>
                    </div>
                    ${breakdownHTML}
                    ${trade.notes ? `<div class="trade-notes">${trade.notes}</div>` : ''}
                    <div class="trade-time">${new Date(trade.timestamp).toLocaleString('tr-TR')}</div>
                </div>
            `;
        }).join('');
    }

    // Feedback Generation
    generateFeedback(trade) {
        const riskAmount = (this.settings.initialCapital * this.settings.riskPerTrade) / 100;
        const rMultiple = trade.profitLoss / riskAmount;

        let message = '';
        let emoji = '';

        if (trade.result === 'win') {
            if (rMultiple >= 3) {
                emoji = '🚀';
                message = `Muhteşem! ${rMultiple.toFixed(2)}R kazandınız!`;
            } else if (rMultiple >= 2) {
                emoji = '🎯';
                message = `Harika! ${rMultiple.toFixed(2)}R kazanç!`;
            } else {
                emoji = '✅';
                message = `Güzel! ${rMultiple.toFixed(2)}R kazanç.`;
            }
        } else if (trade.result === 'be') {
            emoji = '⚖️';
            message = rMultiple >= 0 ? `Başabaş+ (${rMultiple.toFixed(2)}R)` : `Başabaş (${rMultiple.toFixed(2)}R)`;
        } else {
            emoji = '❌';
            message = `Kayıp: -1R (${trade.profitLoss.toFixed(2)} TL)`;
        }

        return { emoji, message };
    }

    showFeedback(feedback) {
        const section = document.getElementById('feedbackSection');
        section.innerHTML = `
            <div class="feedback-card">
                <div class="feedback-emoji">${feedback.emoji}</div>
                <div class="feedback-message">${feedback.message}</div>
            </div>
        `;
        section.style.display = 'block';
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettingsFromForm());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());

        // Close modal when clicking overlay
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeSettingsModal());
        }

        // Trade form
        document.getElementById('tradeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitTrade();
        });

        document.getElementById('tradeResult').addEventListener('change', (e) => {
            this.toggleTradeInputs(e.target.value);
        });

        document.getElementById('multiTPToggle').addEventListener('change', (e) => {
            this.toggleMultiTP(e.target.value);
        });

        // Add TP Row button
        document.getElementById('addTPRowBtn').addEventListener('click', () => {
            this.addTPRow();
        });

        // Data management
        document.getElementById('clearAllData').addEventListener('click', () => this.performFullReset());

        // Calculator
        document.getElementById('openCalculator').addEventListener('click', () => this.openCalculator());
        document.getElementById('closeCalculator').addEventListener('click', () => this.closeCalculator());
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculate());
    }

    toggleTradeInputs(result) {
        console.log('toggleTradeInputs called with result:', result);
        console.log('Manual mode:', this.settings.manualMode);

        // Hide all conditional inputs first
        document.getElementById('firstCloseRRRGroup').style.display = 'none';
        document.getElementById('firstClosePercentGroup').style.display = 'none';
        document.getElementById('runnerCloseRRRGroup').style.display = 'none';
        document.getElementById('beCloseRRRGroup').style.display = 'none';
        document.getElementById('beClosePercentGroup').style.display = 'none';
        document.getElementById('multiTPToggleGroup').style.display = 'none';
        document.getElementById('multiTPContainer').style.display = 'none';
        document.getElementById('manualResultGroup').style.display = 'none';

        // Clear required attributes
        document.getElementById('firstCloseRRR').required = false;
        document.getElementById('firstClosePercent').required = false;
        document.getElementById('runnerCloseRRR').required = false;
        document.getElementById('beCloseRRR').required = false;
        document.getElementById('beClosePercent').required = false;
        document.getElementById('manualResultAmount').required = false;

        // Always read from localStorage to ensure we have the latest value
        let isManualMode = this.settings.manualMode;
        const savedSettings = localStorage.getItem('tradingSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                isManualMode = settings.manualMode || false;
            } catch (e) {
                isManualMode = false;
            }
        }

        if (result === 'win') {
            console.log('Win selected, manual mode:', isManualMode);
            if (isManualMode) {
                // Manual Mode: Use Multi-TP container
                document.getElementById('multiTPContainer').style.display = 'block';

                // Ensure rows have correct fields (clear if switching modes)
                const container = document.getElementById('tpRows');
                const existingRow = container.querySelector('.tp-row');
                const hasProfitField = existingRow ? existingRow.querySelector('.tp-profit') : false;

                if (!existingRow || (isManualMode && !hasProfitField) || (!isManualMode && hasProfitField)) {
                    container.innerHTML = '';
                    this.addTPRow();
                }
            } else {
                console.log('Auto mode - showing multiTPToggleGroup');
                // Standard Auto Mode
                document.getElementById('multiTPToggleGroup').style.display = 'flex';
                this.toggleMultiTP('no'); // Default to standard
            }
        } else if (result === 'be') {
            if (isManualMode) {
                document.getElementById('manualResultGroup').style.display = 'block';
                document.getElementById('manualResultAmount').required = true;
            } else {
                document.getElementById('beCloseRRRGroup').style.display = 'flex';
                document.getElementById('beClosePercentGroup').style.display = 'flex';

                document.getElementById('beCloseRRR').required = true;
                document.getElementById('beClosePercent').required = true;
            }
        } else if (result === 'loss') {
            if (isManualMode) {
                document.getElementById('manualResultGroup').style.display = 'block';
                document.getElementById('manualResultAmount').required = true;
            }
        }
    }

    toggleMultiTP(value) {
        if (value === 'yes') {
            // Show Multi TP, Hide Standard
            document.getElementById('firstCloseRRRGroup').style.display = 'none';
            document.getElementById('firstClosePercentGroup').style.display = 'none';
            document.getElementById('runnerCloseRRRGroup').style.display = 'none';

            document.getElementById('firstCloseRRR').required = false;
            document.getElementById('firstClosePercent').required = false;
            document.getElementById('runnerCloseRRR').required = false;

            document.getElementById('multiTPContainer').style.display = 'block';

            // Add initial rows if empty
            const container = document.getElementById('tpRows');
            if (container.children.length === 0) {
                this.addTPRow();
                this.addTPRow();
            }
        } else {
            // Show Standard, Hide Multi TP
            document.getElementById('firstCloseRRRGroup').style.display = 'flex';
            document.getElementById('firstClosePercentGroup').style.display = 'flex';
            document.getElementById('runnerCloseRRRGroup').style.display = 'flex';

            document.getElementById('firstCloseRRR').required = true;
            document.getElementById('firstClosePercent').required = true;
            document.getElementById('runnerCloseRRR').required = true;

            document.getElementById('multiTPContainer').style.display = 'none';
        }
    }

    addTPRow() {
        const container = document.getElementById('tpRows');
        const row = document.createElement('div');
        row.className = 'tp-row';

        // Always read from localStorage to ensure we have the latest value
        let isManualMode = this.settings.manualMode;
        const savedSettings = localStorage.getItem('tradingSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                isManualMode = settings.manualMode || false;
            } catch (e) {
                isManualMode = false;
            }
        }

        let profitInputHtml = '';
        if (isManualMode) {
            profitInputHtml = `
            <div class="form-group" style="flex: 1.5;">
                <input type="number" class="tp-profit" placeholder="Elde Edilen Kâr (TL)" step="0.01" required>
            </div>`;
        }

        row.innerHTML = `
            <div class="form-group" style="flex: 1;">
                <input type="number" class="tp-rrr" placeholder="R" step="0.1" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <input type="number" class="tp-percent" placeholder="%" max="100" required>
            </div>
            ${profitInputHtml}
            <button type="button" class="remove-tp-btn" onclick="tradingSystem.updateTotalPercent(); this.parentElement.remove();">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Force flex layout for manual mode
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.alignItems = 'center';

        container.appendChild(row);

        // Add listeners for live total update
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.updateTotalPercent());
        });
    }

    updateTotalPercent() {
        let total = 0;
        document.querySelectorAll('.tp-percent').forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        document.getElementById('totalTPPercent').textContent = total;

        const totalEl = document.getElementById('totalTPPercent');
        if (total > 100) totalEl.style.color = 'var(--accent-danger)';
        else totalEl.style.color = 'var(--text-secondary)';
    }

    submitTrade() {
        const result = document.getElementById('tradeResult').value;
        const notes = document.getElementById('tradeNotes').value.trim();
        const pair = document.getElementById('tradePair').value.trim();
        const isMultiTP = document.getElementById('multiTPToggle').value === 'yes';
        const isManualMode = this.settings.manualMode;

        // Validation
        if (!result) {
            alert('Lütfen işlem sonucunu seçin');
            return;
        }

        let tradeData = {
            pair: pair || 'Bilinmeyen Parite',
            result: result,
            notes: notes,
            profitLoss: 0,
            breakdown: {}
        };

        if (isManualMode && result === 'win') {
            // Manual Mode Win: Multi TP Style with Manual Amounts
            const rows = [];
            let totalPercent = 0;
            let totalProfit = 0;

            const rrrInputs = document.querySelectorAll('.tp-rrr');
            const percentInputs = document.querySelectorAll('.tp-percent');
            const profitInputs = document.querySelectorAll('.tp-profit');

            for (let i = 0; i < rrrInputs.length; i++) {
                const rrr = parseFloat(rrrInputs[i].value);
                const percent = parseFloat(percentInputs[i].value);
                const profit = parseFloat(profitInputs[i].value);

                if (!rrr || !percent || isNaN(profit)) {
                    alert('Lütfen tüm değerleri (R, %, Kâr) doldurun');
                    return;
                }

                rows.push({ rrr, percent, profit });
                totalPercent += percent;
                totalProfit += profit;
            }

            tradeData.profitLoss = totalProfit;
            tradeData.breakdown = {
                isMultiTP: true,
                isManual: true,
                closes: rows,
                totalPercent: totalPercent
            };

        } else if (isManualMode && (result === 'loss' || result === 'be')) {
            // Manual Mode Loss/BE: Direct Amount
            const amount = parseFloat(document.getElementById('manualResultAmount').value);
            if (isNaN(amount)) {
                alert('Lütfen geçerli bir tutar girin');
                return;
            }
            tradeData.profitLoss = amount;
            tradeData.breakdown = {
                isManual: true,
                manualAmount: amount
            };
        } else {
            // Auto Calculation (Existing Logic)
            if (result === 'win') {
                if (isMultiTP) {
                    // Handle Multi TP Auto
                    const rows = [];
                    let totalPercent = 0;

                    const rrrInputs = document.querySelectorAll('.tp-rrr');
                    const percentInputs = document.querySelectorAll('.tp-percent');

                    for (let i = 0; i < rrrInputs.length; i++) {
                        const rrr = parseFloat(rrrInputs[i].value);
                        const percent = parseFloat(percentInputs[i].value);

                        if (!rrr || !percent) {
                            alert('Lütfen tüm TP alanlarını doldurun');
                            return;
                        }

                        rows.push({ rrr, percent });
                        totalPercent += percent;
                    }

                    if (totalPercent > 100) {
                        alert('Toplam yüzde 100\'ü geçemez!');
                        return;
                    }

                    const calculation = this.calculateMultiTPResult(rows);
                    tradeData.profitLoss = calculation.total;
                    tradeData.breakdown = calculation.breakdown;

                } else {
                    // Standard Win Auto
                    const firstCloseRRR = parseFloat(document.getElementById('firstCloseRRR').value);
                    const firstClosePercent = parseFloat(document.getElementById('firstClosePercent').value);
                    const runnerCloseRRR = parseFloat(document.getElementById('runnerCloseRRR').value);

                    if (!firstCloseRRR || !firstClosePercent || !runnerCloseRRR) {
                        alert('Lütfen tüm kazanç bilgilerini girin');
                        return;
                    }

                    if (firstClosePercent < 0 || firstClosePercent > 100) {
                        alert('Kapanış yüzdesi 0-100 arasında olmalıdır');
                        return;
                    }

                    const calculation = this.calculateTradeResult(result, firstCloseRRR, firstClosePercent, runnerCloseRRR);
                    tradeData.profitLoss = calculation.total;
                    tradeData.breakdown = calculation.breakdown;
                }
            } else if (result === 'be') {
                const firstCloseRRR = parseFloat(document.getElementById('beCloseRRR').value);
                const firstClosePercent = parseFloat(document.getElementById('beClosePercent').value);

                if (!firstCloseRRR || !firstClosePercent) {
                    alert('Lütfen BE işlem bilgilerini girin');
                    return;
                }

                const calculation = this.calculateTradeResult(result, firstCloseRRR, firstClosePercent, 0);
                tradeData.profitLoss = calculation.total;
                tradeData.breakdown = calculation.breakdown;
            } else {
                // Loss Auto
                const calculation = this.calculateTradeResult(result);
                tradeData.profitLoss = calculation.total;
                tradeData.breakdown = calculation.breakdown;
            }
        }

        // Add Trade
        const trade = this.addTrade(tradeData);

        // Update UI
        this.updateDashboard();
        this.renderTradeHistory();

        // Show Feedback
        const feedback = this.generateFeedback(trade);
        this.showFeedback(feedback);

        // Reset Form
        document.getElementById('tradeForm').reset();
        this.toggleTradeInputs('');
        document.getElementById('tpRows').innerHTML = ''; // Clear TP rows

        // Scroll to feedback if exists
        if (feedback) {
            document.getElementById('feedbackSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    openSettingsModal() {
        // Populate form with current settings
        document.getElementById('initialCapital').value = this.settings.initialCapital;
        document.getElementById('targetGrowth').value = this.settings.targetGrowth;
        document.getElementById('riskPerTrade').value = this.settings.riskPerTrade;
        document.getElementById('rLevel').value = this.settings.rLevel;
        document.getElementById('lockPercentage').value = this.settings.lockPercentage;

        // Manual Mode Toggle
        if (document.getElementById('manualMode')) {
            document.getElementById('manualMode').checked = this.settings.manualMode || false;
        }

        document.getElementById('settingsModal').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettingsFromForm() {
        const newSettings = {
            initialCapital: parseFloat(document.getElementById('initialCapital').value),
            targetGrowth: parseFloat(document.getElementById('targetGrowth').value),
            riskPerTrade: parseFloat(document.getElementById('riskPerTrade').value),
            rLevel: parseFloat(document.getElementById('rLevel').value),
            lockPercentage: parseFloat(document.getElementById('lockPercentage').value),
            manualMode: document.getElementById('manualMode') ? document.getElementById('manualMode').checked : false
        };

        // Validation
        if (newSettings.initialCapital < 1000) {
            alert('Başlangıç sermayesi en az 1,000 TL olmalıdır');
            return;
        }

        if (newSettings.targetGrowth < 1 || newSettings.targetGrowth > 100) {
            alert('Hedef büyüme oranı 1-100 arasında olmalıdır');
            return;
        }

        if (newSettings.riskPerTrade < 0.1 || newSettings.riskPerTrade > 5) {
            alert('Risk oranı 0.1-5 arasında olmalıdır');
            return;
        }

        // Check if initial capital changed
        if (newSettings.initialCapital !== this.settings.initialCapital && this.trades.length > 0) {
            if (!confirm('Başlangıç sermayesini değiştirmek mevcut işlem geçmişinizi etkileyebilir. Devam etmek istiyor musunuz?')) {
                return;
            }
        }

        this.settings = newSettings;
        this.saveSettings();
        this.updateDashboard();
        this.closeSettingsModal();

        // Reload page to apply manual mode changes
        alert('✅ Ayarlar başarıyla kaydedildi');
        location.reload();
    }

    resetSettings() {
        if (confirm('Tüm ayarları varsayılan değerlere döndürmek istiyor musunuz?')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();

            // Refresh form values
            document.getElementById('initialCapital').value = this.settings.initialCapital;
            document.getElementById('targetGrowth').value = this.settings.targetGrowth;
            document.getElementById('riskPerTrade').value = this.settings.riskPerTrade;
            document.getElementById('rLevel').value = this.settings.rLevel;
            document.getElementById('lockPercentage').value = this.settings.lockPercentage;

            this.updateDashboard();
            alert('✅ Ayarlar varsayılan değerlere döndürüldü');
        }
    }

    performFullReset() {
        const btn = document.getElementById('clearAllData');

        // Check if already in confirmation state
        if (btn.innerText !== '⚠️ Emin misin?') {
            // First click: Ask for confirmation
            const originalText = btn.innerText;
            btn.innerText = '⚠️ Emin misin?';

            // Reset button text after 3 seconds if not clicked again
            setTimeout(() => {
                if (document.getElementById('clearAllData')) {
                    btn.innerText = originalText;
                }
            }, 3000);
            return;
        }

        // Second click: Perform reset
        console.log('Performing full reset...');

        // Reset Settings
        this.settings = this.getDefaultSettings();
        this.saveSettings();

        // Clear Trades
        this.trades = [];
        this.saveTrades();

        // Refresh form values
        document.getElementById('initialCapital').value = this.settings.initialCapital;
        document.getElementById('targetGrowth').value = this.settings.targetGrowth;
        document.getElementById('riskPerTrade').value = this.settings.riskPerTrade;
        document.getElementById('rLevel').value = this.settings.rLevel;
        document.getElementById('lockPercentage').value = this.settings.lockPercentage;

        // Update UI
        this.updateDashboard();
        this.renderTradeHistory();
        this.closeSettingsModal();

        alert('✅ Tüm veriler sıfırlandı');
        btn.innerText = '🗑️ Tüm Verileri Sil';
    }

    // Calculator Methods
    openCalculator() {
        document.getElementById('calculatorModal').classList.add('active');
    }

    closeCalculator() {
        document.getElementById('calculatorModal').classList.remove('active');
    }

    calculate() {
        const capital = parseFloat(document.getElementById('calcCapital').value);
        const risk = parseFloat(document.getElementById('calcRisk').value);
        const entry = parseFloat(document.getElementById('calcEntry').value);
        const sl = parseFloat(document.getElementById('calcSL').value);
        const tp = parseFloat(document.getElementById('calcTP').value);

        if (!capital || !risk || !entry || !sl || !tp) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }

        const riskAmount = (capital * risk) / 100;
        const slDistance = Math.abs(entry - sl);
        const tpDistance = Math.abs(tp - entry);
        const rrr = tpDistance / slDistance;
        const positionSize = riskAmount / slDistance;
        const potentialProfit = positionSize * tpDistance;

        document.getElementById('calcResults').innerHTML = `
            <div class="calc-result-item">
                <strong>Risk Tutarı:</strong> ${riskAmount.toFixed(2)} TL
            </div>
            <div class="calc-result-item">
                <strong>Pozisyon Büyüklüğü:</strong> ${positionSize.toFixed(4)} Lot
            </div>
            <div class="calc-result-item">
                <strong>RRR:</strong> 1:${rrr.toFixed(2)}
            </div>
            <div class="calc-result-item">
                <strong>Potansiyel Kâr:</strong> ${potentialProfit.toFixed(2)} TL
            </div>
        `;
    }
}

// Initialize the app
let tradingSystem;
document.addEventListener('DOMContentLoaded', () => {
    tradingSystem = new TradingSystem();
});

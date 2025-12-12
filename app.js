/* ===================================
   RUNNER R-PERFORMANCE TRACKER V2.1
   Advanced Trading Analytics System
   With Multi-TP, Calculator & Light Mode
   =================================== */

// ===================================
// STATE MANAGEMENT
// ===================================
class TradingSystem {
    constructor() {
        this.isReadOnly = false;
        this.settings = this.loadSettings();
        this.trades = this.loadTrades();
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.chart = null;
        this.init();
    }

    // Default Settings
    getDefaultSettings() {
        return {
            initialCapital: 50000,
            targetGrowth: 8,
            riskPerTrade: 0.5,
            rLevel: 1.2,
            lockPercentage: 70,
            manualMode: false,
            accountMode: 'challenge' // 'challenge' or 'free'
        };
    }

    // Load Settings from LocalStorage
    loadSettings() {
        const saved = localStorage.getItem('runnerSettings');
        const settings = saved ? JSON.parse(saved) : this.getDefaultSettings();
        // Ensure new fields exist
        if (!settings.targetBaseCapital) {
            settings.targetBaseCapital = settings.initialCapital;
        }
        return settings;
    }

    // Save Settings to LocalStorage
    saveSettings() {
        if (this.isReadOnly) return;
        localStorage.setItem('runnerSettings', JSON.stringify(this.settings));
    }

    // Load Trades from LocalStorage
    loadTrades() {
        const saved = localStorage.getItem('runnerTrades');
        return saved ? JSON.parse(saved) : [];
    }

    // Save Trades to LocalStorage
    saveTrades() {
        if (this.isReadOnly) return;
        localStorage.setItem('runnerTrades', JSON.stringify(this.trades));
    }

    // Initialize System
    // Initialize System
    init() {
        this.checkSharedUrl();
        this.initTheme();
        this.setupEventListeners();
        this.initChart();
        this.updateDashboard();
        this.renderTradeHistory();
    }

    // Check for Shared URL Data
    checkSharedUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('data');

        if (sharedData) {
            try {
                // Decode Base64 (handle UTF-8)
                const jsonString = decodeURIComponent(escape(atob(sharedData)));
                const data = JSON.parse(jsonString);

                if (data.trades && data.settings) {
                    this.trades = data.trades;
                    this.settings = data.settings;
                    this.isReadOnly = true;
                    // Force challenge mode for viewing
                    this.settings.accountMode = 'challenge';

                    console.log('Shared profile loaded:', this.trades.length, 'trades');

                    // UI Adjustments
                    // We need to wait for DOM to be ready if called in constructor, 
                    // but init() is called in constructor. 
                    // Usually DOMContentLoaded calls app init, but here app is new TradingSystem() at end of body.
                    // So DOM is ready.

                    const banner = document.getElementById('readOnlyBanner');
                    if (banner) banner.style.display = 'block';

                    // Hide controls
                    const style = document.createElement('style');
                    style.innerHTML = `
                        .entry-section, .header-actions, #clearHistoryBtn, .delete-trade-btn, #openCalcBtn { display: none !important; }
                    `;
                    document.head.appendChild(style);
                }
            } catch (e) {
                console.error('Error loading shared data:', e);
                // alert('Paylaşılan veri okunamadı!');
            }
        }
    }

    // Generate Share Link
    generateShareLink() {
        const data = {
            settings: this.settings,
            trades: this.trades
        };
        const jsonString = JSON.stringify(data);
        // Encode Base64 (handle UTF-8)
        const encoded = btoa(unescape(encodeURIComponent(jsonString)));

        // Use href split to support both file:// and https:// (GitHub Pages) correctly
        const baseUrl = window.location.href.split('?')[0];
        return `${baseUrl}?data=${encoded}`;
    }

    // ===================================
    // THEME SYSTEM
    // ===================================
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';

        if (newTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        localStorage.setItem('theme', newTheme);
    }

    // ===================================
    // CHART SYSTEM
    // ===================================
    initChart() {
        const ctx = document.getElementById('balanceChart').getContext('2d');

        // Chart.js Configuration
        Chart.defaults.color = '#8b949e';
        Chart.defaults.font.family = "'Inter', sans-serif";

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Bakiye',
                    data: [],
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#58a6ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#58a6ff',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#161b22',
                        titleColor: '#e6edf3',
                        bodyColor: '#8b949e',
                        borderColor: '#30363d',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                return `Bakiye: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: '#30363d' },
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;

        // Sort trades by date ascending for chart
        const sortedTrades = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const labels = ['Başlangıç', ...sortedTrades.map((_, i) => `İşlem ${i + 1}`)];
        const data = [this.settings.initialCapital, ...sortedTrades.map(t => t.balance)];

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    // ===================================
    // CALCULATIONS
    // ===================================

    // Calculate Fixed Risk Amount (TL)
    getFixedRiskAmount() {
        return (this.settings.initialCapital * this.settings.riskPerTrade) / 100;
    }

    // Calculate Target Profit (TL)
    getTargetProfit() {
        const base = this.settings.targetBaseCapital || this.settings.initialCapital;
        return base * (this.settings.targetGrowth / 100);
    }

    // Calculate Remaining amount to reach target
    getRemainingProfit() {
        const target = this.getTargetProfit();
        const currentNet = this.getNetProfit();
        return Math.max(0, target - currentNet);
    }

    // Calculate Trade Profit/Loss with Flexible Parameters
    calculateTradeResult(result, firstCloseRRR, firstClosePercent, runnerCloseRRR) {
        const riskAmount = this.getFixedRiskAmount();

        switch (result) {
            case 'loss':
                return {
                    total: -riskAmount,
                    breakdown: {
                        loss: -riskAmount
                    }
                };

            case 'be':
                // BE: First part profit, runner part closes at entry (0 profit)
                const firstPercent = firstClosePercent / 100;
                const beFirstProfit = firstPercent * firstCloseRRR * riskAmount;
                const beRunnerResult = 0; // Runner hits entry

                return {
                    total: beFirstProfit,
                    breakdown: {
                        firstClose: beFirstProfit,
                        firstCloseRRR: firstCloseRRR,
                        firstClosePercent: firstClosePercent,
                        runnerClose: beRunnerResult,
                        runnerPercent: 100 - firstClosePercent
                    }
                };

            case 'win':
                // Win: Calculate both parts
                const lockPercent = firstClosePercent / 100;
                const runnerPercent = 1 - lockPercent;

                const guaranteedProfit = lockPercent * firstCloseRRR * riskAmount;
                const runnerProfit = runnerPercent * runnerCloseRRR * riskAmount;

                return {
                    total: guaranteedProfit + runnerProfit,
                    breakdown: {
                        firstClose: guaranteedProfit,
                        firstCloseRRR: firstCloseRRR,
                        firstClosePercent: firstClosePercent,
                        runnerClose: runnerProfit,
                        runnerCloseRRR: runnerCloseRRR,
                        runnerPercent: (1 - lockPercent) * 100
                    }
                };

            default:
                return { total: 0, breakdown: {} };
        }
    }

    // Calculate Multi-TP Result
    calculateMultiTPResult(tpRows) {
        const riskAmount = this.getFixedRiskAmount();
        let totalProfit = 0;
        let totalPercent = 0;
        const closes = [];

        tpRows.forEach(row => {
            const profit = (row.percent / 100) * row.rrr * riskAmount;
            totalProfit += profit;
            totalPercent += row.percent;
            closes.push({
                rrr: row.rrr,
                percent: row.percent,
                profit: profit
            });
        });

        // If total percent < 100, the rest is assumed closed at 0 (BE) or lost?
        // Usually in a "Win" scenario with Multi-TP, user enters all profitable closes.
        // If there's remaining % that hit SL/BE, they should add a row with 0 RRR or negative?
        // For simplicity, we assume the entered rows are the realized gains.

        return {
            total: totalProfit,
            breakdown: {
                isMultiTP: true,
                closes: closes,
                totalPercent: totalPercent
            }
        };
    }

    // Calculate Current Balance
    getCurrentBalance() {
        const totalProfitLoss = this.trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
        return this.settings.initialCapital + totalProfitLoss;
    }

    // Calculate Net Profit
    getNetProfit() {
        const tradeProfit = this.trades.reduce((sum, trade) => sum + trade.profitLoss, 0);

        // Add difference between Start Balance (Initial) and Base Capital (Original Start)
        // If I start at 50,200 but Base is 50,000, I am already +200 profit relative to base.
        const capitalDiff = this.settings.initialCapital - (this.settings.targetBaseCapital || this.settings.initialCapital);

        return tradeProfit + capitalDiff;
    }

    // Calculate Win Rate
    getWinRate() {
        if (this.trades.length === 0) return 0;
        const wins = this.trades.filter(t => t.result === 'win').length;
        return (wins / this.trades.length) * 100;
    }

    // Calculate Fixed Risk Amount (TL)
    getFixedRiskAmount() {
        return this.settings.initialCapital * (this.settings.riskPerTrade / 100);
    }

    // Calculate Average RRR for Winning Trades
    getAverageRRR() {
        const winningTrades = this.trades.filter(t => t.result === 'win');
        if (winningTrades.length === 0) return 0;

        const totalRRR = winningTrades.reduce((sum, trade) => {
            if (trade.breakdown?.isMultiTP) {
                // Weighted average RRR for multi-TP
                const weightedSum = trade.breakdown.closes.reduce((acc, close) => acc + (close.rrr * close.percent), 0);
                return sum + (weightedSum / trade.breakdown.totalPercent);
            }
            return sum + (trade.breakdown?.runnerCloseRRR || 0);
        }, 0);
        return totalRRR / winningTrades.length;
    }

    // Calculate Max Drawdown
    calculateMaxDrawdown() {
        if (this.trades.length === 0) return 0;

        let maxPeak = this.settings.initialCapital;
        let maxDD = 0;

        // Sort trades by date ascending
        const sortedTrades = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        for (const trade of sortedTrades) {
            if (trade.balance > maxPeak) {
                maxPeak = trade.balance;
            }

            const dd = ((maxPeak - trade.balance) / maxPeak) * 100;
            if (dd > maxDD) {
                maxDD = dd;
            }
        }

        return maxDD;
    }

    // Calculate Remaining Profit to Target
    getRemainingProfit() {
        return this.getTargetProfit() - this.getNetProfit();
    }

    // Calculate Progress Percentage
    getProgressPercentage() {
        const progress = (this.getNetProfit() / this.getTargetProfit()) * 100;
        return Math.max(0, Math.min(100, progress));
    }

    // Estimate Trades Needed
    getEstimatedTradesNeeded() {
        const avgProfit = this.getAverageTradeProfit();
        if (avgProfit <= 0) return 0;

        const remaining = this.getRemainingProfit();
        return Math.ceil(remaining / avgProfit);
    }

    // Get Average Trade Profit
    getAverageTradeProfit() {
        if (this.trades.length === 0) return 0;
        return this.getNetProfit() / this.trades.length;
    }

    // ===================================
    // STRATEGY DEVIATION ANALYSIS
    // ===================================

    analyzeStrategyDeviation(firstCloseRRR, firstClosePercent) {
        const targetRRR = this.settings.rLevel;
        const targetPercent = this.settings.lockPercentage;

        const rrrDeviation = firstCloseRRR - targetRRR;
        const percentDeviation = firstClosePercent - targetPercent;

        let warnings = [];

        // RRR Deviation Check
        if (Math.abs(rrrDeviation) > 0.2) {
            if (rrrDeviation < 0) {
                // Early close
                const riskAmount = this.getFixedRiskAmount();
                const actualProfit = (firstClosePercent / 100) * firstCloseRRR * riskAmount;
                const targetProfit = (targetPercent / 100) * targetRRR * riskAmount;
                const difference = targetProfit - actualProfit;

                warnings.push({
                    type: 'danger',
                    icon: '⚠️',
                    title: 'ERKEN KAPANIŞ UYARISI!',
                    message: `İlk kapanışı ${firstCloseRRR.toFixed(1)}R'de yaptınız (hedef: ${targetRRR}R). Bu, risk yönetiminizi zayıflatır.\n\nBir sonraki işlem SL olursa:\n• Mevcut strateji: ${this.formatCurrency(actualProfit)} kâr - ${this.formatCurrency(riskAmount)} kayıp = ${this.formatCurrency(actualProfit - riskAmount)} net\n• Hedef strateji: ${this.formatCurrency(targetProfit)} kâr - ${this.formatCurrency(riskAmount)} kayıp = ${this.formatCurrency(targetProfit - riskAmount)} net\n\n⚠️ Fark: ${this.formatCurrency(difference)} daha az koruma!`
                });
            } else {
                // Aggressive close
                warnings.push({
                    type: 'warning',
                    icon: '🔥',
                    title: 'AGRESİF STRATEJI!',
                    message: `İlk kapanışı ${firstCloseRRR.toFixed(1)}R'de yaptınız (hedef: ${targetRRR}R). Bu daha fazla kâr sağlar ancak riski artırır.\n\n✅ Avantaj: Daha hızlı hesap büyümesi\n⚠️ Risk: Fiyat geri dönerse daha fazla kazanç kaybı\n\n💡 Tutarlılık önemlidir. Bu stratejiyi sürdürebilir misiniz?`
                });
            }
        }

        // Percent Deviation Check
        if (Math.abs(percentDeviation) > 10) {
            if (percentDeviation < 0) {
                warnings.push({
                    type: 'info',
                    icon: '📊',
                    title: 'RUNNER POTANSİYELİ ARTTI',
                    message: `Pozisyonun %${firstClosePercent}'ini kapattınız (hedef: %${targetPercent}). Kalan %${100 - firstClosePercent} ile daha büyük runner kazançları mümkün, ama BE/SL gelirse daha fazla kayıp riski var.\n\n💡 Tutarlı olun: Her işlemde aynı oranı kullanın.`
                });
            } else {
                warnings.push({
                    type: 'info',
                    icon: '🛡️',
                    title: 'DAHA FAZLA GARANTİ',
                    message: `Pozisyonun %${firstClosePercent}'ini kapattınız (hedef: %${targetPercent}). Daha fazla garantili kâr aldınız ama runner potansiyelinizi azalttınız.\n\n💡 Tutarlılık anahtardır!`
                });
            }
        }

        return warnings;
    }

    // ===================================
    // SMART FEEDBACK SYSTEM
    // ===================================

    generateFeedback(trade) {
        const consecutiveLosses = this.getConsecutiveLosses();
        const beCount = this.getRecentBECount();
        const netProfit = this.getNetProfit();
        const targetProfit = this.getTargetProfit();

        // Target Completed
        if (netProfit >= targetProfit) {
            return {
                type: 'success',
                icon: '🎉',
                title: 'HEDEF TAMAMLANDI!',
                message: `TEBRİKLER! %${this.settings.targetGrowth} Büyüme Hedefinize Ulaştınız (${this.formatCurrency(netProfit)}). Yeni hedefinizi belirleyin veya kârınızı çekin.`
            };
        }

        // Strategy Deviation Warnings (for win/be trades)
        if ((trade.result === 'win' || trade.result === 'be') && trade.breakdown && !trade.breakdown.isMultiTP) {
            const deviationWarnings = this.analyzeStrategyDeviation(
                trade.breakdown.firstCloseRRR,
                trade.breakdown.firstClosePercent
            );

            if (deviationWarnings.length > 0) {
                return deviationWarnings[0]; // Return first warning
            }
        }

        // Big Runner Caught
        if (trade.result === 'win' && trade.breakdown) {
            let maxRRR = 0;
            if (trade.breakdown.isMultiTP) {
                maxRRR = Math.max(...trade.breakdown.closes.map(c => c.rrr));
            } else {
                maxRRR = trade.breakdown.runnerCloseRRR;
            }

            if (maxRRR >= 4.0) {
                const lossesCompensated = Math.floor(trade.profitLoss / this.getFixedRiskAmount());
                return {
                    type: 'success',
                    icon: '🚀',
                    title: 'SÜPER RUNNER!',
                    message: `HARIKA! Bu ${maxRRR.toFixed(1)}R koşucu, ${lossesCompensated} adet kaybın maliyetini tek başına çıkardı. Hedefinize büyük bir adım attınız! (+${this.formatCurrency(trade.profitLoss)})`
                };
            }
        }

        // Consecutive Losses
        if (consecutiveLosses >= 3) {
            return {
                type: 'warning',
                icon: '⚠️',
                title: 'DİSİPLİNİ SÜRDÜRÜN',
                message: `${consecutiveLosses} ardışık kayıp yaşadınız. Runner Modelinin doğasında kayıp serileri vardır. Risk kuralınızı değiştirmeden en yüksek olasılıklı kurulumunuzu bekleyin. Sabır anahtardır.`
            };
        }

        // Too Many BE/Low RRR
        if (beCount >= 3 && this.getAverageRRR() < 2.5) {
            return {
                type: 'info',
                icon: '💡',
                title: 'RUNNER POTANSİYELİNİ ARTIRIN',
                message: `Risk Yönetimi Mükemmel (${beCount} BE). Ancak Runner potansiyelinizi artırmalısınız (Ort. RRR: ${this.getAverageRRR().toFixed(2)}R). Daha geniş zaman dilimlerinde veya ana trend yönünde işlem aramayı deneyin.`
            };
        }

        // Standard Feedback
        return null;
    }

    // Get Consecutive Losses
    getConsecutiveLosses() {
        let count = 0;
        for (let i = this.trades.length - 1; i >= 0; i--) {
            if (this.trades[i].result === 'loss') {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    // Get Recent BE Count (last 10 trades)
    getRecentBECount() {
        const recentTrades = this.trades.slice(-10);
        return recentTrades.filter(t => t.result === 'be').length;
    }

    // ===================================
    // TRADE MANAGEMENT
    // ===================================

    addTrade(tradeData) {
        const trade = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...tradeData,
            balance: this.getCurrentBalance() + tradeData.profitLoss
        };

        this.trades.push(trade);
        this.saveTrades();

        return trade;
    }

    clearAllTrades() {
        if (confirm('Tüm işlem geçmişini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            this.trades = [];
            this.saveTrades();
            this.updateDashboard();
            this.renderTradeHistory();
            this.showNotification('İşlem geçmişi temizlendi', 'info');
        }
    }

    deleteTrade(tradeId) {
        if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
            this.trades = this.trades.filter(t => t.id !== tradeId);
            this.saveTrades();
            this.updateDashboard();
            this.renderTradeHistory();
        }
    }

    // ===================================
    // UI UPDATES
    // ===================================

    updateDashboard() {
        const isFreeMode = (this.settings.accountMode === 'free');

        // Labels & Upper Cards
        if (isFreeMode) {
            // FREE MODE
            document.getElementById('targetBadge').textContent = 'Serbest Mod';

            // Card 1: Growth
            document.getElementById('cardLabel1').textContent = 'Net Bakiye Artışı';
            document.getElementById('targetProfit').textContent = this.formatCurrency(this.getNetProfit());
            document.getElementById('cardSub1').textContent = 'Toplam Büyüme';

            // Card 3: Balance
            document.getElementById('cardLabel3').textContent = 'Güncel Bakiye';
            document.getElementById('remainingProfit').textContent = this.formatCurrency(this.getCurrentBalance());
            document.getElementById('remainingTrades').textContent = 'Sınırsız İşlem';

            document.getElementById('progressLabel').textContent = 'Büyüme Oranı';

        } else {
            // CHALLENGE MODE
            document.getElementById('targetBadge').textContent = this.getProgressPercentage() >= 100 ? 'Tamamlandı ✓' : 'Aktif';

            // Card 1: Target
            document.getElementById('cardLabel1').textContent = 'Hedeflenen Kâr';
            document.getElementById('targetProfit').textContent = this.formatCurrency(this.getTargetProfit());
            document.getElementById('cardSub1').textContent = `%${this.settings.targetGrowth} Büyüme Hedefi`;

            // Card 3: Remaining
            document.getElementById('cardLabel3').textContent = 'Hedefe Kalan';
            document.getElementById('remainingProfit').textContent = this.formatCurrency(this.getRemainingProfit());

            const estimatedTrades = this.getEstimatedTradesNeeded();
            document.getElementById('remainingTrades').textContent =
                estimatedTrades > 0 ? `~${estimatedTrades} işlem gerekli` : 'Hedef tamamlandı!';

            document.getElementById('progressLabel').textContent = 'Tamamlanma Oranı';
        }

        // Card 2: Current Net Profit (Common)
        document.getElementById('currentProfit').textContent = this.formatCurrency(this.getNetProfit());


        // Progress Calculation
        let progress = 0;
        if (isFreeMode) {
            // Growth Percentage (Unlimited)
            const netProfit = this.getNetProfit();
            if (this.settings.initialCapital > 0) {
                progress = (netProfit / this.settings.initialCapital) * 100;
            }
        } else {
            progress = this.getProgressPercentage();
        }

        document.getElementById('progressPercentage').textContent = `${progress.toFixed(1)}%`;

        // Visual Bar (Limit to 100% for visual sanity, or allow overflow if desired)
        // For free mode, let's cap the visual bar at 100% but text is unlimited
        const visualProgress = Math.min(100, Math.max(0, isFreeMode ? (progress < 0 ? 0 : progress) : progress));

        document.getElementById('progressFill').style.width = `${visualProgress}%`;
        document.getElementById('progressGlow').style.width = `${visualProgress}%`;

        // Profit Change sublabel
        const netProfit = this.getNetProfit();
        const profitChangeEl = document.getElementById('profitChange');
        if (netProfit > 0) {
            profitChangeEl.textContent = `+${this.formatCurrency(netProfit)} kazanç`;
            profitChangeEl.className = 'card-sublabel text-success';
        } else if (netProfit < 0) {
            profitChangeEl.textContent = `${this.formatCurrency(netProfit)} kayıp`;
            profitChangeEl.className = 'card-sublabel text-danger';
        } else {
            profitChangeEl.textContent = 'Başlangıç';
            profitChangeEl.className = 'card-sublabel';
        }

        // Target Badge
        const targetBadge = document.getElementById('targetBadge');
        if (progress >= 100) {
            targetBadge.textContent = 'Tamamlandı ✓';
            targetBadge.style.background = 'rgba(16, 185, 129, 0.15)';
            targetBadge.style.borderColor = 'var(--accent-success)';
            targetBadge.style.color = 'var(--accent-success)';

            // Show Share Button if not read only
            if (!this.isReadOnly) {
                let shareBtn = document.getElementById('shareChallengeBtn');
                if (!shareBtn) {
                    shareBtn = document.createElement('button');
                    shareBtn.id = 'shareChallengeBtn';
                    shareBtn.className = 'btn-primary';
                    shareBtn.style.marginTop = '1rem';
                    shareBtn.style.width = '100%';
                    shareBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    shareBtn.innerHTML = '🏆 Hesabı Tamamla ve Paylaş';

                    // Insert after progress container
                    const progressContainer = document.querySelector('.progress-container');
                    if (progressContainer && !progressContainer.nextElementSibling?.id === 'shareChallengeBtn') {
                        progressContainer.parentNode.insertBefore(shareBtn, progressContainer.nextSibling);
                    } else if (progressContainer) {
                        // Check if already exists to avoid dupes
                        if (!document.getElementById('shareChallengeBtn')) {
                            progressContainer.insertAdjacentElement('afterend', shareBtn);
                        }
                    }

                    // Add listener immediately or in setupEventListeners (but element is dynamic)
                    // Better to add inline onclick or attach here
                    shareBtn.onclick = () => {
                        this.openShareModal('win');
                    };
                }
            }
        } else {
            targetBadge.textContent = 'Aktif';
            targetBadge.style.background = 'rgba(16, 185, 129, 0.15)';
            targetBadge.style.borderColor = 'var(--accent-success)';
            targetBadge.style.color = 'var(--accent-success)';
            // Remove share button if exists (in case user deletes a win trade)
            const shareBtn = document.getElementById('shareChallengeBtn');
            if (shareBtn) shareBtn.remove();
        }

        // Metrics
        document.getElementById('currentBalance').textContent = this.formatCurrency(this.getCurrentBalance());

        const winRate = this.getWinRate();
        document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;

        const wins = this.trades.filter(t => t.result === 'win').length;
        document.getElementById('winRateDetail').textContent = `${wins}/${this.trades.length} işlem`;

        const avgRRR = this.getAverageRRR();
        document.getElementById('avgRRR').textContent = `${avgRRR.toFixed(2)}R`;
        document.getElementById('rrrDetail').textContent = `${wins} kazanan işlem`;

        document.getElementById('netProfitLoss').textContent = this.formatCurrency(netProfit);
        const profitDetailEl = document.getElementById('profitDetail');
        profitDetailEl.textContent = `${this.trades.length} toplam işlem`;
        if (netProfit > 0) {
            profitDetailEl.parentElement.querySelector('.metric-value').classList.add('positive');
            profitDetailEl.parentElement.querySelector('.metric-value').classList.remove('negative');
        } else if (netProfit < 0) {
            profitDetailEl.parentElement.querySelector('.metric-value').classList.add('negative');
            profitDetailEl.parentElement.querySelector('.metric-value').classList.remove('positive');
        }

        // Max Drawdown
        const maxDD = this.calculateMaxDrawdown();
        document.getElementById('maxDrawdown').textContent = `-${maxDD.toFixed(2)}%`;

        // Update Chart
        this.updateChart();
    }

    showFeedback(feedback) {
        if (!feedback) {
            document.getElementById('feedbackSection').style.display = 'none';
            return;
        }

        const section = document.getElementById('feedbackSection');
        const card = document.getElementById('feedbackCard');
        const icon = document.getElementById('feedbackIcon');
        const title = document.getElementById('feedbackTitle');
        const message = document.getElementById('feedbackMessage');

        // Reset classes
        card.className = 'feedback-card';
        card.classList.add(feedback.type);

        icon.textContent = feedback.icon;
        title.textContent = feedback.title;
        message.textContent = feedback.message;

        section.style.display = 'block';

        // Auto-hide after 15 seconds
        setTimeout(() => {
            section.style.display = 'none';
        }, 15000);
    }

    renderTradeHistory() {
        const container = document.getElementById('historyContainer');
        const paginationContainer = document.getElementById('paginationContainer');

        if (this.trades.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <p>Henüz işlem kaydı yok</p>
                    <small>Yukarıdaki formdan ilk işleminizi ekleyin</small>
                </div>
            `;
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';

        // Sort to show newest first
        const sortedTrades = [...this.trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Pagination Logic
        const totalPages = Math.ceil(sortedTrades.length / this.itemsPerPage);

        // Ensure current page is valid
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageTrades = sortedTrades.slice(start, end);

        // Update Pagination Controls
        document.getElementById('paginationInfo').textContent = `Sayfa ${this.currentPage} / ${totalPages}`;
        document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
        document.getElementById('nextPageBtn').disabled = this.currentPage === totalPages;

        container.innerHTML = pageTrades.map((trade, index) => {
            const tradeNumber = sortedTrades.length - (start + index);

            const resultText = {
                'win': '✅ Kazanç',
                'loss': '❌ Kayıp',
                'be': '⚖️ Başa Baş'
            }[trade.result];

            const resultClass = trade.result;

            // Strategy compliance badge
            let strategyBadge = '';
            if (!trade.breakdown?.isMultiTP && (trade.result === 'win' || trade.result === 'be') && trade.breakdown) {
                const rrrDiff = Math.abs((trade.breakdown.firstCloseRRR || 0) - this.settings.rLevel);
                const percentDiff = Math.abs((trade.breakdown.firstClosePercent || 0) - this.settings.lockPercentage);

                if (rrrDiff <= 0.1 && percentDiff <= 5) {
                    strategyBadge = '<span class="strategy-badge compliant">✅ Strateji Uyumlu</span>';
                } else {
                    strategyBadge = '<span class="strategy-badge deviated">⚠️ Sapma Var</span>';
                }
            } else if (trade.breakdown?.isMultiTP) {
                strategyBadge = '<span class="strategy-badge compliant">🔄 Çoklu TP</span>';
            }

            // Detailed breakdown
            let breakdownHTML = '';

            if (trade.breakdown?.isMultiTP) {
                // Multi-TP Breakdown
                const rowsHTML = trade.breakdown.closes.map((close, i) => `
                    <div class="breakdown-item">
                        <span>TP ${i + 1} (${close.rrr}R @ %${close.percent}):</span>
                        <span class="positive">+${this.formatCurrency(close.profit)}</span>
                    </div>
                `).join('');

                breakdownHTML = `
                    <div class="trade-breakdown">
                        <div class="breakdown-title">🔄 Çoklu Kar Alımı:</div>
                        ${rowsHTML}
                        <div class="breakdown-total">
                            <span>Toplam Kar (%${trade.breakdown.totalPercent}):</span>
                            <span class="positive">+${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            } else if (trade.result === 'win' && trade.breakdown) {
                breakdownHTML = `
                    <div class="trade-breakdown">
                        <div class="breakdown-title">💰 Kar Dağılımı:</div>
                        <div class="breakdown-item">
                            <span>İlk Kapanış (${trade.breakdown.firstCloseRRR.toFixed(1)}R @ %${trade.breakdown.firstClosePercent}):</span>
                            <span class="positive">+${this.formatCurrency(trade.breakdown.firstClose)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Runner Kısmı (${trade.breakdown.runnerCloseRRR.toFixed(1)}R @ %${trade.breakdown.runnerPercent.toFixed(0)}):</span>
                            <span class="positive">+${this.formatCurrency(trade.breakdown.runnerClose)}</span>
                        </div>
                        <div class="breakdown-total">
                            <span>Toplam Kar:</span>
                            <span class="positive">+${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            } else if (trade.result === 'be' && trade.breakdown) {
                breakdownHTML = `
                    <div class="trade-breakdown">
                        <div class="breakdown-title">⚖️ Kısmi Kazanç + BE:</div>
                        <div class="breakdown-item">
                            <span>İlk Kapanış (${trade.breakdown.firstCloseRRR.toFixed(1)}R @ %${trade.breakdown.firstClosePercent}):</span>
                            <span class="positive">+${this.formatCurrency(trade.breakdown.firstClose)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Runner (Giriş Seviyesi):</span>
                            <span>${this.formatCurrency(trade.breakdown.runnerClose)}</span>
                        </div>
                        <div class="breakdown-total">
                            <span>Net Sonuç:</span>
                            <span class="positive">+${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            } else if (trade.result === 'loss') {
                breakdownHTML = `
                    <div class="trade-breakdown">
                        <div class="breakdown-title">❌ Kayıp:</div>
                        <div class="breakdown-item">
                            <span>Stop Loss:</span>
                            <span class="negative">${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="trade-item">
                    <div class="trade-header">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                             <span class="trade-number">#${tradeNumber} ${trade.pair ? `• ${trade.pair}` : ''}</span>
                             ${trade.direction ? `<span style="font-size: 0.85rem; color: ${trade.direction === 'long' ? 'var(--accent-success)' : 'var(--accent-danger)'}; font-weight: 500;">${trade.direction === 'long' ? 'LONG 🔼' : 'SHORT 🔻'}</span>` : ''}
                        </div>
                        <div class="trade-badges">
                            <span class="trade-result-badge ${resultClass}">${resultText}</span>
                            ${strategyBadge}
                            <button class="delete-trade-btn" onclick="tradingSystem.deleteTrade(${trade.id})" title="İşlemi Sil">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="trade-details">
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">Tarih</span>
                            <span class="trade-detail-value">${this.formatDate(trade.timestamp)}</span>
                        </div>
                        <div class="trade-detail-item">
                            <span class="trade-detail-label">Nihai Bakiye</span>
                            <span class="trade-detail-value">${this.formatCurrency(trade.balance)}</span>
                        </div>
                    </div>
                    ${breakdownHTML}
                    ${trade.notes ? `<div class="trade-notes">📝 ${trade.notes}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    changePage(direction) {
        this.currentPage += direction;
        this.renderTradeHistory();
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================

    setupEventListeners() {
        // Theme Toggle
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings Modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Calculator Modal
        const openCalcBtn = document.getElementById('openCalcBtn');
        if (openCalcBtn) {
            openCalcBtn.addEventListener('click', () => {
                console.log('Hesap makinesi butonu tıklandı');
                try {
                    if (typeof this.getFixedRiskAmount === 'function') {
                        const risk = this.getFixedRiskAmount();
                        document.getElementById('calcRiskAmount').value = risk.toFixed(0);
                    } else {
                        console.error('getFixedRiskAmount fonksiyonu bulunamadı!');
                    }
                } catch (error) {
                    console.error('Risk miktarı hesaplanırken hata:', error);
                }
                document.getElementById('calcModal').classList.add('active');
            });
        }

        const closeCalcBtn = document.getElementById('calcModalClose');
        if (closeCalcBtn) {
            closeCalcBtn.addEventListener('click', () => {
                document.getElementById('calcModal').classList.remove('active');
            });
        }

        const calcOverlay = document.getElementById('calcModalOverlay');
        if (calcOverlay) {
            calcOverlay.addEventListener('click', () => {
                document.getElementById('calcModal').classList.remove('active');
            });
        }

        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                console.log('Hesapla butonu tıklandı');
                if (typeof this.calculateProfit === 'function') {
                    this.calculateProfit();
                } else {
                    console.error('calculateProfit fonksiyonu bulunamadı!');
                    alert('Hesaplama fonksiyonu yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
                }
            });
        }

        // Settings Form
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettingsFromForm();
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('clearAllData').addEventListener('click', () => {
            this.performFullReset();
        });

        // Trade Form
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

        document.getElementById('addTPRowBtn').addEventListener('click', () => {
            this.addTPRow();
        });

        // Clear History
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearAllTrades();
        });

        // Pagination
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            this.changePage(-1);
        });

        document.getElementById('nextPageBtn').addEventListener('click', () => {
            this.changePage(1);
        });

        // App Share Button (Header)
        const headerShareBtn = document.getElementById('shareBtn');
        if (headerShareBtn) {
            headerShareBtn.addEventListener('click', () => {
                this.openShareModal('share');
            });
        }

        // Share Modal Listeners
        const shareModalClose = document.getElementById('shareModalClose');
        if (shareModalClose) {
            shareModalClose.addEventListener('click', () => {
                document.getElementById('shareModal').classList.remove('active');
            });
        }

        const shareModalOverlay = document.getElementById('shareModalOverlay');
        if (shareModalOverlay) {
            shareModalOverlay.addEventListener('click', () => {
                document.getElementById('shareModal').classList.remove('active');
            });
        }

        const copyLinkBtn = document.getElementById('copyLinkBtn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                const input = document.getElementById('shareLinkInput');
                input.select();
                document.execCommand('copy'); // Fallback

                // Modern API
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(input.value);
                }

                const originalText = copyLinkBtn.textContent;
                copyLinkBtn.textContent = 'Kopyalandı!';
                setTimeout(() => {
                    copyLinkBtn.textContent = originalText;
                }, 2000);
            });
        }

        const startNewChallengeBtn = document.getElementById('startNewChallengeBtn');
        if (startNewChallengeBtn) {
            startNewChallengeBtn.addEventListener('click', () => {
                this.startNewChallenge();
            });
        }
    }

    openShareModal(mode = 'share') {
        const link = this.generateShareLink();
        document.getElementById('shareLinkInput').value = link;

        // Custom UI based on mode
        const titleEl = document.getElementById('shareModalTitle');
        const iconEl = document.getElementById('shareModalIcon');
        const headingEl = document.getElementById('shareModalHeading');
        const msgEl = document.getElementById('shareModalMessage');
        const newChallengeSection = document.getElementById('newChallengeSection');

        if (mode === 'win') {
            titleEl.textContent = '🏆 Challenge Tamamlandı!';
            iconEl.textContent = '🎉';
            headingEl.textContent = 'Tebrikler! Hedefinize Ulaştınız.';
            msgEl.textContent = 'Başarınızı arkadaşlarınızla paylaşmak için aşağıdaki linki kullanabilirsiniz.';
            if (newChallengeSection) newChallengeSection.style.display = 'block';
        } else {
            titleEl.textContent = '📈 Profil Paylaşımı';
            iconEl.textContent = '🔗';
            headingEl.textContent = 'İstatistiklerini Paylaş';
            msgEl.textContent = 'Mevcut performansını ve işlem geçmişini görüntülemek için bu bağlantıyı paylaşabilirsin.';
            if (newChallengeSection) newChallengeSection.style.display = 'none';
        }

        document.getElementById('shareModal').classList.add('active');
    }

    startNewChallenge() {
        if (confirm('Yeni challenge başlatılacak. Mevcut bakiye başlangıç olarak ayarlanıp işlem geçmişi temizlenecek. Onaylıyor musunuz?')) {
            // Get current balance before clearing
            const newCapital = this.getCurrentBalance();

            // Update settings
            this.settings.initialCapital = newCapital;
            // Also reset base capital to new capital for fresh start 
            // (User can manually change base capital in settings if they want "carry over" logic)
            this.settings.targetBaseCapital = newCapital;
            this.saveSettings();

            // Clear trades
            this.trades = [];
            this.saveTrades();

            // Update UI
            document.getElementById('shareModal').classList.remove('active');
            this.updateDashboard();
            this.renderTradeHistory();

            // Update form input visual
            document.getElementById('initialCapital').value = newCapital;

            this.showNotification('Yeni challenge başlatıldı! Bol kazançlar 🚀', 'success');
        }
    }



    // Calculator Logic
    calculateProfit() {
        const risk = parseFloat(document.getElementById('calcRiskAmount').value) || 0;
        const r = parseFloat(document.getElementById('calcRRR').value) || 0;
        const p = parseFloat(document.getElementById('calcPercent').value) || 0;
        const lotSize = parseFloat(document.getElementById('calcLotSize').value) || 0;

        const profit = risk * r * (p / 100);
        document.getElementById('calcResult').textContent = this.formatCurrency(profit);

        // Lot hesaplama - MT5 mobil için
        if (lotSize > 0 && p > 0) {
            const lotsToClose = (lotSize * p / 100).toFixed(2);
            document.getElementById('lotResult').textContent = `${lotsToClose} lot`;
            document.getElementById('lotResultBox').style.display = 'block';
        } else {
            document.getElementById('lotResultBox').style.display = 'none';
        }
    }

    toggleTradeInputs(result) {
        // Hide all conditional inputs
        document.getElementById('firstCloseRRRGroup').style.display = 'none';
        document.getElementById('firstClosePercentGroup').style.display = 'none';
        document.getElementById('runnerCloseRRRGroup').style.display = 'none';
        document.getElementById('beCloseRRRGroup').style.display = 'none';
        document.getElementById('beClosePercentGroup').style.display = 'none';
        document.getElementById('multiTPToggleGroup').style.display = 'none';
        document.getElementById('multiTPContainer').style.display = 'none';
        document.getElementById('manualLossGroup').style.display = 'none'; // ADDED

        // Clear required attributes
        document.getElementById('firstCloseRRR').required = false;
        document.getElementById('firstClosePercent').required = false;
        document.getElementById('runnerCloseRRR').required = false;
        document.getElementById('beCloseRRR').required = false;
        document.getElementById('beClosePercent').required = false;
        document.getElementById('manualLossAmount').required = false; // ADDED

        // Reset Multi TP
        document.getElementById('multiTPToggle').value = 'no';

        // Check manual mode
        const isManualMode = this.settings.manualMode;

        // Show relevant inputs based on result
        if (result === 'win') {
            if (isManualMode) {
                // Manual Mode: Show Multi-TP container directly
                document.getElementById('multiTPContainer').style.display = 'block';

                // Ensure at least one row exists
                const container = document.getElementById('tpRows');
                if (container.children.length === 0) {
                    this.addTPRow();
                }
            } else {
                // Auto Mode: Show toggle as before
                document.getElementById('multiTPToggleGroup').style.display = 'flex';
                this.toggleMultiTP('no'); // Default to standard
            }
        } else if (result === 'be') {
            if (isManualMode) {
                // Manual Mode BE: Just 0 profit, no details needed
                // No inputs to show
            } else {
                document.getElementById('beCloseRRRGroup').style.display = 'flex';
                document.getElementById('beClosePercentGroup').style.display = 'flex';

                document.getElementById('beCloseRRR').required = true;
                document.getElementById('beClosePercent').required = true;
            }
        } else if (result === 'loss') {
            if (isManualMode) {
                // Manual Mode Loss: Show amount input
                document.getElementById('manualLossGroup').style.display = 'block';
                document.getElementById('manualLossAmount').required = true;
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
        const rowId = Date.now();
        const row = document.createElement('div');
        row.className = 'tp-row';

        // Check if manual mode is enabled
        const isManualMode = this.settings.manualMode;

        // Conditional profit input for manual mode
        const profitInput = isManualMode ? `
            <div class="form-group" style="flex: 1.5;">
                <input type="number" class="tp-profit" placeholder="Elde Edilen Kâr (TL)" step="0.01" required>
            </div>` : '';

        row.innerHTML = `
            <div class="form-group">
                <input type="number" class="tp-rrr" placeholder="R Seviyesi (Örn: 1.5)" step="0.1" required>
            </div>
            <div class="form-group">
                <input type="number" class="tp-percent" placeholder="Yüzde % (Örn: 50)" max="100" required>
            </div>
            ${profitInput}
            <button type="button" class="remove-tp-btn" onclick="this.parentElement.remove(); tradingSystem.updateTotalPercent()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
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
        const pair = document.getElementById('tradePair').value.toUpperCase();
        const direction = document.getElementById('tradeDirection').value;
        const notes = document.getElementById('tradeNotes').value.trim();
        const isMultiTP = document.getElementById('multiTPToggle').value === 'yes';

        // Validation
        if (!pair || !direction || !result) {
            alert('Lütfen parite, yön ve işlem sonucunu doldurun');
            return;
        }

        let tradeData = {
            pair: pair,
            direction: direction,
            result: result,
            notes: notes,
            profitLoss: 0,
            breakdown: {}
        };

        if (result === 'win') {
            // Check manual mode
            const isManualMode = this.settings.manualMode;

            if (isManualMode || isMultiTP) {
                // Handle Multi TP or Manual Mode
                const rows = [];
                let totalPercent = 0;
                let manualTotalProfit = 0;

                const rrrInputs = document.querySelectorAll('.tp-rrr');
                const percentInputs = document.querySelectorAll('.tp-percent');
                const profitInputs = document.querySelectorAll('.tp-profit'); // For manual mode

                for (let i = 0; i < rrrInputs.length; i++) {
                    const rrr = parseFloat(rrrInputs[i].value);
                    const percent = parseFloat(percentInputs[i].value);
                    let profit = 0;

                    if (!rrr || !percent) {
                        alert('Lütfen tüm TP alanlarını doldurun');
                        return;
                    }

                    if (isManualMode) {
                        profit = parseFloat(profitInputs[i].value);
                        if (isNaN(profit)) {
                            alert('Lütfen tüm kâr (TL) alanlarını doldurun');
                            return;
                        }
                        manualTotalProfit += profit;
                    }

                    rows.push({ rrr, percent, profit }); // Store profit directly if manual
                    totalPercent += percent;
                }

                if (totalPercent > 100) {
                    alert('Toplam yüzde 100\'ü geçemez!');
                    return;
                }

                if (isManualMode) {
                    // Manual Mode Calculation
                    tradeData.profitLoss = manualTotalProfit;
                    tradeData.breakdown = {
                        isMultiTP: true, // Treat layout as multiTP
                        totalPercent: totalPercent,
                        closes: rows,
                        firstCloseRRR: rows[0].rrr, // For backward compatibility
                        firstClosePercent: rows[0].percent
                    };
                } else {
                    // Standard Multi-TP Calculation
                    const calculation = this.calculateMultiTPResult(rows);
                    tradeData.profitLoss = calculation.total;
                    tradeData.breakdown = calculation.breakdown;
                }

            } else {
                // Standard Auto Mode Win
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
            // Check manual mode
            const isManualMode = this.settings.manualMode;

            if (isManualMode) {
                // Manual BE is just 0
                tradeData.profitLoss = 0;
                tradeData.breakdown = {
                    firstClose: 0,
                    firstCloseRRR: 0,
                    firstClosePercent: 0,
                    runnerClose: 0
                };
            } else {
                const firstCloseRRR = parseFloat(document.getElementById('beCloseRRR').value);
                const firstClosePercent = parseFloat(document.getElementById('beClosePercent').value);

                if (!firstCloseRRR || !firstClosePercent) {
                    alert('Lütfen BE işlem bilgilerini girin');
                    return;
                }

                const calculation = this.calculateTradeResult(result, firstCloseRRR, firstClosePercent, 0);
                tradeData.profitLoss = calculation.total;
                tradeData.breakdown = calculation.breakdown;
            }
        } else {
            // Loss
            const isManualMode = this.settings.manualMode;

            if (isManualMode) {
                const lossAmount = parseFloat(document.getElementById('manualLossAmount').value);
                if (isNaN(lossAmount)) {
                    alert('Lütfen kayıp miktarını girin');
                    return;
                }
                // Ensure it's negative
                tradeData.profitLoss = -Math.abs(lossAmount);
                tradeData.breakdown = null;
            } else {
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
        document.getElementById('manualMode').checked = this.settings.manualMode;

        // Account Mode Logic
        const mode = this.settings.accountMode || 'challenge'; // Default legacy to challenge
        const radios = document.getElementsByName('accountMode');
        let found = false;
        radios.forEach(r => {
            if (r.value === mode) {
                r.checked = true;
                found = true;
            }
        });
        if (!found && radios.length > 0) radios[0].checked = true;

        // Trigger manual update of input visibility
        if (typeof toggleTargetInput === 'function') toggleTargetInput();

        document.getElementById('settingsModal').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettingsFromForm() {
        // Get Account Mode
        let accountMode = 'challenge';
        document.getElementsByName('accountMode').forEach(r => {
            if (r.checked) accountMode = r.value;
        });

        // Parse new settings
        const initialCapital = parseFloat(document.getElementById('initialCapital').value);
        let targetBaseCapital = parseFloat(document.getElementById('targetBaseCapital').value);

        // If target base is invalid or 0, fallback to initial capital
        if (!targetBaseCapital || isNaN(targetBaseCapital)) {
            targetBaseCapital = initialCapital;
        }

        const newSettings = {
            initialCapital: initialCapital,
            targetBaseCapital: targetBaseCapital,
            targetGrowth: parseFloat(document.getElementById('targetGrowth').value),
            riskPerTrade: parseFloat(document.getElementById('riskPerTrade').value),
            rLevel: parseFloat(document.getElementById('rLevel').value),
            lockPercentage: parseFloat(document.getElementById('lockPercentage').value),
            manualMode: document.getElementById('manualMode').checked,
            accountMode: accountMode
        };

        // Validation (Allow 0 or more)
        if (newSettings.initialCapital < 0) {
            alert('Başlangıç sermayesi negatif olamaz');
            return;
        }

        if (accountMode === 'challenge') {
            if (newSettings.targetGrowth < 1 || newSettings.targetGrowth > 1000) {
                alert('Hedef büyüme oranı 1-1000 arasında olmalıdır');
                return;
            }
        } else {
            // Free mode default target (needed for calculations not to break)
            newSettings.targetGrowth = 100;
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
        this.showNotification('Ayarlar kaydedildi', 'success');
    }

    resetSettings() {
        if (confirm('Tüm ayarları varsayılan değerlere döndürmek istiyor musunuz?')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();

            // Refresh form values
            document.getElementById('initialCapital').value = this.settings.initialCapital;
            document.getElementById('targetBaseCapital').value = this.settings.targetBaseCapital || this.settings.initialCapital;
            document.getElementById('targetGrowth').value = this.settings.targetGrowth;
            document.getElementById('riskPerTrade').value = this.settings.riskPerTrade;
            document.getElementById('rLevel').value = this.settings.rLevel;
            document.getElementById('lockPercentage').value = this.settings.lockPercentage;
            document.getElementById('manualMode').checked = this.settings.manualMode;

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
                if (document.getElementById('clearAllData')) { // Check if element still exists
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
        document.getElementById('manualMode').checked = this.settings.manualMode;

        // Update UI
        this.updateDashboard();
        this.renderTradeHistory();
        this.closeSettingsModal();

        // Reset button text
        btn.innerText = 'Tüm Verileri Sıfırla';

        alert('✅ Sistem başarıyla sıfırlandı!');
    }

    // Calculator Logic
    calculateProfit() {
        const risk = parseFloat(document.getElementById('calcRiskAmount').value) || 0;
        const r = parseFloat(document.getElementById('calcRRR').value) || 0;
        const p = parseFloat(document.getElementById('calcPercent').value) || 0;
        const lotSize = parseFloat(document.getElementById('calcLotSize').value) || 0;

        const profit = risk * r * (p / 100);
        document.getElementById('calcResult').textContent = this.formatCurrency(profit);

        // Lot hesaplama - MT5 mobil için
        if (lotSize > 0 && p > 0) {
            const lotsToClose = (lotSize * p / 100).toFixed(2);
            document.getElementById('lotResult').textContent = `${lotsToClose} lot`;
            document.getElementById('lotResultBox').style.display = 'block';
        } else {
            document.getElementById('lotResultBox').style.display = 'none';
        }
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================

    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// ===================================
// INITIALIZE APPLICATION
// ===================================
let tradingSystem;

document.addEventListener('DOMContentLoaded', () => {
    tradingSystem = new TradingSystem();
    console.log('🚀 Runner R-Performance Tracker V2.1 initialized successfully!');
});

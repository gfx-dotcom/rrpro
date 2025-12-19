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

        // Multi-Profile State
        this.activeProfileId = localStorage.getItem('activeProfileId') || 'default';
        this.profiles = JSON.parse(localStorage.getItem('runnerProfiles')) || [
            { id: 'default', name: 'Ana Hesap' }
        ];

        this.settings = this.loadSettings();
        this.trades = this.loadTrades();
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.chart = null;

        // Initialize Core Systems
        this.checkSharedUrl();
        this.initTheme();
        this.setupEventListeners(); // Called only once

        // Initial UI Render
        this.refreshUI();
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
            accountMode: 'challenge', // 'challenge' or 'free'
            archiveName: 'RUNNER TRADER JOURNAL'
        };
    }

    // Load Settings from LocalStorage
    loadSettings() {
        const key = `runnerSettings_${this.activeProfileId}`;
        const saved = localStorage.getItem(key);

        // Fallback to old global key for default profile if new key doesn't exist
        if (this.activeProfileId === 'default' && !saved) {
            const legacy = localStorage.getItem('runnerSettings');
            if (legacy) {
                const settings = JSON.parse(legacy);
                if (!settings.targetBaseCapital) settings.targetBaseCapital = settings.initialCapital;
                return settings;
            }
        }

        const settings = saved ? JSON.parse(saved) : this.getDefaultSettings();
        if (!settings.targetBaseCapital) {
            settings.targetBaseCapital = settings.initialCapital;
        }
        return settings;
    }

    // Save Settings to LocalStorage
    saveSettings() {
        if (this.isReadOnly) return;
        localStorage.setItem(`runnerSettings_${this.activeProfileId}`, JSON.stringify(this.settings));
    }

    // Load Trades from LocalStorage
    loadTrades() {
        const key = `runnerTrades_${this.activeProfileId}`;
        const saved = localStorage.getItem(key);

        // Fallback for default profile
        if (this.activeProfileId === 'default' && !saved) {
            const legacy = localStorage.getItem('runnerTrades');
            if (legacy) return JSON.parse(legacy);
        }

        return saved ? JSON.parse(saved) : [];
    }

    // Save Trades to LocalStorage
    saveTrades() {
        if (this.isReadOnly) return;
        localStorage.setItem(`runnerTrades_${this.activeProfileId}`, JSON.stringify(this.trades));
    }

    // Profile Management Methods
    switchProfile(profileId) {
        if (this.activeProfileId === profileId) return;

        this.activeProfileId = profileId;
        localStorage.setItem('activeProfileId', profileId);

        // Reload data for the new profile
        this.settings = this.loadSettings();
        this.trades = this.loadTrades();
        this.currentPage = 1;

        // Re-initialize UI without page refresh
        this.refreshUI();
        this.showNotification(`${this.getActiveProfileName()} hesabına geçildi.`, 'info');
    }

    addNewProfile() {
        const name = prompt('Yeni portföy ismi giriniz:');
        if (!name || name.trim() === '') return;

        const id = 'profile_' + Date.now();
        const newProfile = { id, name };

        this.profiles.push(newProfile);
        this.saveProfiles();

        // Switch to the new profile
        this.switchProfile(id);
    }

    deleteProfile(id, event) {
        if (event) event.stopPropagation();
        if (id === 'default') {
            alert('Ana hesap silinemez!');
            return;
        }

        if (confirm('Bu portföyü ve içindeki TÜM verileri silmek istediğinize emin misiniz?')) {
            // Remove data from localStorage
            localStorage.removeItem(`runnerSettings_${id}`);
            localStorage.removeItem(`runnerTrades_${id}`);

            // Remove from profiles list
            this.profiles = this.profiles.filter(p => p.id !== id);
            this.saveProfiles();

            // If deleting active profile, switch to default
            if (this.activeProfileId === id) {
                this.switchProfile('default');
            } else {
                this.renderProfileList();
            }
        }
    }

    saveProfiles() {
        localStorage.setItem('runnerProfiles', JSON.stringify(this.profiles));
    }

    getActiveProfileName() {
        const p = this.profiles.find(p => p.id === this.activeProfileId);
        return p ? p.name : 'Bilinmeyen';
    }

    renderProfileList() {
        const profileList = document.getElementById('profileList');
        const activeNameSpan = document.getElementById('activeProfileName');
        if (!profileList) return;

        activeNameSpan.textContent = this.getActiveProfileName();
        profileList.innerHTML = '';

        this.profiles.forEach(p => {
            const item = document.createElement('div');
            item.className = `profile-item ${p.id === this.activeProfileId ? 'active' : ''}`;
            item.onclick = () => this.switchProfile(p.id);

            item.innerHTML = `
                <span class="profile-item-name">📁 ${p.name}</span>
                ${p.id !== 'default' ? `
                    <button class="delete-profile-btn" onclick="tradingSystem.deleteProfile('${p.id}', event)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                ` : ''}
            `;
            profileList.appendChild(item);
        });
    }

    // Refresh UI Components
    refreshUI() {
        this.initChart();
        this.updateDashboard();
        this.renderTradeHistory();
        this.renderProfileList();
    }

    checkSharedUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('data');

        if (sharedData) {
            try {
                let jsonString;
                const decompressed = typeof LZString !== 'undefined' ? LZString.decompressFromEncodedURIComponent(sharedData) : null;
                jsonString = decompressed || decodeURIComponent(escape(atob(sharedData)));

                let data = JSON.parse(jsonString);

                // Handle Version 2 (Ultra-Compact Array Format)
                if (data.v === 2) {
                    const s = data.s;
                    this.settings = {
                        accountMode: s.a === 1 ? 'free' : 'challenge',
                        initialCapital: s.c,
                        targetBaseCapital: s.b,
                        targetGrowth: s.g,
                        riskPerTrade: s.r,
                        rLevel: s.l,
                        lockPercentage: s.p,
                        manualMode: s.m === 1
                    };

                    this.trades = data.t.map(t => {
                        const trade = {
                            pair: t[0],
                            result: t[1] === 1 ? 'win' : (t[1] === 2 ? 'be' : 'loss'),
                            profitLoss: t[2],
                            timestamp: new Date(t[3] * 1000).toISOString(),
                            strategyCompliant: t[4] === 1,
                            balance: 0
                        };

                        if (t[5] !== 0) {
                            const b = t[5];
                            trade.breakdown = b.m === 1 ?
                                { isMultiTP: true, totalPercent: 100, closes: b.c.map(r => ({ rrr: r[0], percent: r[1], profit: r[2] })) } :
                                { firstCloseRRR: b.r, firstClosePercent: b.p, runnerCloseRRR: b.rc };
                        }

                        // Optional Fields (Indices 6, 7, 8)
                        if (t[6]) trade.notes = t[6];      // Notes
                        if (t[7]) trade.chartUrl = t[7];  // Chart URL
                        if (t[8]) trade.direction = t[8] === 1 ? 'long' : 'short'; // Direction

                        return trade;
                    });
                }
                // Handle Version 1 (Compact Keys Format)
                else if (data.s && data.t) {
                    this.settings = data.s;
                    this.trades = data.t.map(t => ({
                        pair: t.p, result: t.r, profitLoss: t.pl, timestamp: t.ts,
                        breakdown: t.b, notes: t.n || t.notes || t.note || "",
                        chartUrl: t.cu || t.chartUrl || "",
                        direction: t.d || t.direction || "",
                        strategyCompliant: t.sc, balance: 0
                    }));
                }
                // Legacy Format
                else if (data.trades && data.settings) {
                    this.trades = data.trades;
                    this.settings = data.settings;
                    // Ensure archiveName is set for legacy format if not present
                    if (this.settings.archiveName === undefined) {
                        this.settings.archiveName = '';
                    }
                }

                if (sharedData) {
                    this.isReadOnly = true;
                    this.recalculateBalances();
                    const banner = document.getElementById('readOnlyBanner');
                    if (banner) banner.style.display = 'block';
                    const style = document.createElement('style');
                    style.innerHTML = `.entry-section, .header-actions, #clearHistoryBtn, .delete-trade-btn, #openCalcBtn { display: none !important; }`;
                    document.head.appendChild(style);
                    document.title = 'Paylaşılan Trading Profili | Runner Tracker';
                }
            } catch (e) {
                console.error('Error loading shared data:', e);
            }
        }
    }

    // Recalculate all balances in trade history
    recalculateBalances() {
        if (!this.trades || this.trades.length === 0) return;
        const sorted = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        let runningBalance = this.settings.initialCapital;
        sorted.forEach(trade => {
            runningBalance += trade.profitLoss;
            trade.balance = runningBalance;
        });
        this.trades = sorted;
    }

    // Handle Close Account and Archive
    async handleCloseAccount() {
        if (this.trades.length === 0) {
            this.showNotification('Arşivlenecek işlem bulunamadı!', 'warning');
            return;
        }

        const confirmReset = confirm('DİKKAT: Mevcut dönemi kapatmak üzeresiniz.\n\n1. Tüm işlemleriniz PDF ve EXCEL olarak indirilecek.\n2. İşlem geçmişiniz sıfırlanacak.\n3. Mevcut bakiyeniz yeni dönemin başlangıç sermayesi olacak.\n\nOnaylıyor musunuz?');

        if (!confirmReset) return;

        try {
            this.showNotification('Dosyalar hazırlanıyor...', 'info');

            // Export to PDF
            this.exportToPDF();

            // Export to Excel
            this.exportToExcel();

            // Reset Account Logic (Keep current balance as new start)
            const newCapital = this.getCurrentBalance();
            this.settings.initialCapital = newCapital;
            this.settings.targetBaseCapital = newCapital;
            this.saveSettings();

            this.trades = [];
            this.saveTrades();

            this.updateDashboard();
            this.renderTradeHistory();
            this.closeSettingsModal();

            setTimeout(() => {
                alert('Tebrikler! Hesap başarıyla kapatıldı, verileriniz indirildi ve yeni döneminiz başlatıldı. 🚀');
            }, 500);
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Hata oluştu, veriler dışa aktarılamadı.', 'error');
        }
    }

    // Export to PDF
    exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Helper to fix Turkish characters for PDF (since default fonts don't support them)
        const fixTR = (text) => {
            if (!text) return "";
            return text.toString()
                .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
                .replace(/ü/g, 'u').replace(/Ü/g, 'U')
                .replace(/ş/g, 's').replace(/Ş/g, 'S')
                .replace(/ı/g, 'i').replace(/İ/g, 'I')
                .replace(/ö/g, 'o').replace(/Ö/g, 'O')
                .replace(/ç/g, 'c').replace(/Ç/g, 'C')
                .replace(/₺/g, 'TL');
        };

        // Title and Header
        doc.setFontSize(22);
        doc.setTextColor(88, 166, 255);
        doc.text(fixTR(this.settings.archiveName || 'RUNNER TRADER JOURNAL'), 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(fixTR(`Arsiv Tarihi: ${new Date().toLocaleString('tr-TR')}`), 14, 28);
        doc.text(fixTR(`Mod: ${this.settings.accountMode === 'challenge' ? 'Challenge' : 'Serbest'}`), 14, 33);
        doc.text(fixTR(`Baslangic Sermayesi: ${this.formatCurrency(this.settings.initialCapital).replace('₺', 'TL')}`), 14, 38);
        doc.text(fixTR(`Final Bakiyesi: ${this.formatCurrency(this.getCurrentBalance()).replace('₺', 'TL')}`), 14, 43);

        // --- Performance Statistics Section ---
        doc.setFontSize(14);
        doc.setTextColor(88, 166, 255);
        doc.text(fixTR('Performans Ozeti'), 140, 20);

        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(fixTR(`Toplam Islem: ${this.trades.length}`), 140, 28);
        doc.text(fixTR(`Win Rate: %${this.getWinRate()}`), 140, 33);
        doc.text(fixTR(`Net Kar: ${this.formatCurrency(this.getNetProfit()).replace('₺', 'TL')}`), 140, 38);
        doc.text(fixTR(`Max Drawdown: -%${this.calculateMaxDrawdown()}`), 140, 43);
        doc.text(fixTR(`Ortalama R: ${this.getAverageRRR()}R`), 140, 48);

        // --- Chart Section ---
        try {
            const canvas = document.getElementById('balanceChart');
            if (canvas) {
                const chartImg = canvas.toDataURL('image/png', 1.0);
                // Add chart to PDF (x, y, width, height)
                doc.addImage(chartImg, 'PNG', 14, 55, 182, 60);
            }
        } catch (chartErr) {
            console.warn('Could not add chart to PDF:', chartErr);
        }

        const tableColumn = ["#", "Tarih", "Parite", "Yon", "Sonuc", "Kar/Zarar", "Bakiye", "Grafik Linki"];
        const tableRows = [];

        // Sort descending (newest first)
        const sorted = [...this.trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        sorted.forEach((t, index) => {
            tableRows.push([
                sorted.length - index,
                this.formatDate(t.timestamp),
                fixTR(t.pair || "-"),
                fixTR((t.direction || "-").toUpperCase()),
                fixTR(t.result.toUpperCase()),
                fixTR(this.formatCurrency(t.profitLoss).replace('₺', 'TL')),
                fixTR(this.formatCurrency(t.balance).replace('₺', 'TL')),
                t.chartUrl || "-"
            ]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 120, // Start after the chart
            theme: 'striped',
            headStyles: { fillColor: [88, 166, 255], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { font: "helvetica", fontSize: 8 },
            columnStyles: {
                7: { cellWidth: 50 }
            },
            didDrawCell: (data) => {
                // Sadece gövde kısmındaki 7. sütun (Grafik Linki) için link oluştur
                if (data.section === 'body' && data.column.index === 7) {
                    const url = data.cell.raw;
                    if (url && url !== "-" && url.startsWith('http')) {
                        // Link komutunu yeni pencere isteğiyle ekle (Viewer desteğine bağlıdır)
                        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: url, target: '_blank' });

                        // Link metni rengini mavi yap
                        doc.setTextColor(0, 82, 204);
                    }
                }
            }
        });

        const fileName = (this.settings.archiveName || 'Runner_Arsiv').replace(/\s+/g, '_');
        doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    // Export to Excel
    exportToExcel() {
        // Sort descending: newest first.
        // We use a combination of timestamp and original index to ensure "last added" is always at the top
        const tradesWithIndex = this.trades.map((t, i) => ({ ...t, originalIndex: i }));
        const sorted = tradesWithIndex.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            if (timeB !== timeA) return timeB - timeA;
            return b.originalIndex - a.originalIndex; // If same time, newer index comes first
        });

        const rows = sorted.map((t, index) => ({
            "No": sorted.length - index,
            "Tarih": this.formatDate(t.timestamp),
            "Parite": t.pair || "-",
            "Yön": (t.direction || "-").toUpperCase(),
            "Sonuç": t.result.toUpperCase(),
            "Kar/Zarar": t.profitLoss,
            "Bakiye": t.balance,
            "Notlar": t.notes || "",
            "Grafik Linki": t.chartUrl || "" // Just providing the URL string is often more reliable for auto-linking
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Add actual hyperlinks to the cells so they are clickable
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: 8 }); // Column I (index 8) is "Grafik Linki"
            const cell = worksheet[cellAddress];
            if (cell && cell.v && cell.v.startsWith('http')) {
                cell.l = { Target: cell.v, Tooltip: "Grafiği Aç" };
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Islem Gecmisi");

        // --- Add Statistics Summary Sheet ---
        const statsData = [
            [(this.settings.archiveName || "PERFORMANS OZETI").toUpperCase(), ""],
            ["Arsiv Tarihi", new Date().toLocaleString('tr-TR')],
            ["Hesap Modu", this.settings.accountMode.toUpperCase()],
            ["", ""],
            ["Baslangic Sermayesi", this.settings.initialCapital],
            ["Final Bakiyesi", this.getCurrentBalance()],
            ["Net Kar/Zarar", this.getNetProfit()],
            ["Win Rate", `%${this.getWinRate()}`],
            ["Max Drawdown", `%${this.calculateMaxDrawdown()}`],
            ["Ortalama R", this.getAverageRRR()],
            ["Toplam Islem", this.trades.length]
        ];
        const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsSheet, "Ozet");

        worksheet['!cols'] = [
            { wch: 5 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 45 }
        ];

        const fileName = (this.settings.archiveName || 'Runner_Arsiv').replace(/\s+/g, '_');
        XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    // Generate Share Link
    generateShareLink() {
        // SUPER COMPACTION: Map everything to single letters/numbers
        const s = this.settings;
        const compactSettings = {
            a: s.accountMode === 'free' ? 1 : 0,
            c: s.initialCapital,
            b: s.targetBaseCapital || s.initialCapital,
            g: s.targetGrowth,
            r: s.riskPerTrade,
            l: s.rLevel,
            p: s.lockPercentage,
            m: s.manualMode ? 1 : 0,
            n: s.archiveName || '' // Add archiveName to compact settings
        };

        const compactTrades = this.trades.map(t => {
            const entry = [
                t.pair,
                t.result === 'win' ? 1 : (t.result === 'be' ? 2 : 0),
                Math.round(t.profitLoss * 100) / 100,
                Math.round(new Date(t.timestamp).getTime() / 1000), // Unix timestamp
                t.strategyCompliant ? 1 : 0
            ];

            if (t.breakdown) {
                const b = t.breakdown;
                const compactB = b.isMultiTP ?
                    { m: 1, c: b.closes.map(row => [row.rrr, row.percent, Math.round(row.profit || 0)]) } :
                    { m: 0, r: b.firstCloseRRR, p: b.firstClosePercent, rc: b.runnerCloseRRR || 0 };
                entry.push(compactB);
            } else {
                entry.push(0);
            }

            // Extended Fields
            entry.push(t.notes || ""); // Index 6
            entry.push(t.chartUrl || ""); // Index 7
            entry.push(t.direction === 'long' ? 1 : (t.direction === 'short' ? 2 : 0)); // Index 8

            return entry;
        });

        const finalData = { s: compactSettings, t: compactTrades, v: 2 }; // Version 2
        const jsonString = JSON.stringify(finalData);

        let encoded;
        if (typeof LZString !== 'undefined') {
            encoded = LZString.compressToEncodedURIComponent(jsonString);
        } else {
            encoded = btoa(unescape(encodeURIComponent(jsonString)));
        }

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
        const canvas = document.getElementById('balanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart to allow reconstruction
        if (this.chart) {
            this.chart.destroy();
        }

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
        const card1 = document.querySelector('.target-card.primary');
        const card2 = document.querySelector('.target-card.success');
        const card3 = document.querySelector('.target-card.warning');
        const targetGrid = document.querySelector('.target-grid');

        if (isFreeMode) {
            // FREE MODE - Simplified View
            document.getElementById('targetBadge').textContent = 'Serbest Mod';

            // Hide other cards, show only relevant info
            if (card1) card1.style.display = 'none';
            if (card3) card3.style.display = 'none';

            // Adjust Grid to single column centered
            if (targetGrid) {
                targetGrid.style.gridTemplateColumns = '1fr';
                targetGrid.style.maxWidth = '400px';
                targetGrid.style.margin = '0 auto 2rem auto';
            }

            // Card 2: Growth Focus
            if (card2) {
                card2.style.display = 'flex';
                // Change label to differentiate
                document.getElementById('currentProfit').previousElementSibling.textContent = 'Net Büyüme';
                // Update value
                document.getElementById('currentProfit').textContent = this.formatCurrency(this.getNetProfit());
                // Update sublabel
                const progress = this.settings.initialCapital > 0
                    ? (this.getNetProfit() / this.settings.initialCapital) * 100
                    : 0;
                document.getElementById('profitChange').textContent = `%${progress.toFixed(2)} Büyüme`;
                document.getElementById('profitChange').className = progress >= 0 ? 'card-sublabel text-success' : 'card-sublabel text-danger';
            }

            document.getElementById('progressLabel').textContent = 'Büyüme İlerlemesi';

        } else {
            // CHALLENGE MODE - Restore Standard View
            if (card1) card1.style.display = 'flex';
            if (card3) card3.style.display = 'flex';
            if (card2) {
                card2.style.display = 'flex';
                document.getElementById('currentProfit').previousElementSibling.textContent = 'Güncel Net Kâr';
            }

            // Restore Grid
            if (targetGrid) {
                targetGrid.style.gridTemplateColumns = ''; // Reset to css default
                targetGrid.style.maxWidth = '';
                targetGrid.style.margin = '';
            }

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

        // Progress Container
        const progressContainer = document.querySelector('.progress-container');

        if (isFreeMode) {
            if (progressContainer) progressContainer.style.display = 'none';
        } else {
            if (progressContainer) progressContainer.style.display = 'block';
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

        // Target Badge & Share Button Logic
        const targetBadge = document.getElementById('targetBadge');

        if (isFreeMode) {
            // Free Mode: No "completion", always active. No share button for completion.
            targetBadge.textContent = 'Serbest Mod';
            targetBadge.style.background = 'rgba(88, 166, 255, 0.15)';
            targetBadge.style.borderColor = 'var(--accent-primary)';
            targetBadge.style.color = 'var(--accent-primary)';

            // Ensure share button is removed
            const shareBtn = document.getElementById('shareChallengeBtn');
            if (shareBtn) shareBtn.remove();

        } else {
            // Challenge Mode Logic
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
                        if (progressContainer && !progressContainer.nextElementSibling?.id === 'shareChallengeBtn') {
                            progressContainer.parentNode.insertBefore(shareBtn, progressContainer.nextSibling);
                        } else if (progressContainer) {
                            // Check if already exists to avoid dupes
                            if (!document.getElementById('shareChallengeBtn')) {
                                progressContainer.insertAdjacentElement('afterend', shareBtn);
                            }
                        }

                        // Add listener
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
                // Remove share button if exists
                const shareBtn = document.getElementById('shareChallengeBtn');
                if (shareBtn) shareBtn.remove();
            }
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
                            ${trade.chartUrl ? `<a href="${trade.chartUrl}" target="_blank" class="chart-btn" title="İşlem Grafiğini Gör">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </a>` : ''}
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

        // Profile Switcher
        const profileBtn = document.getElementById('currentProfileTitle');
        const profileDropdown = document.getElementById('profileDropdown');
        const addProfileBtn = document.getElementById('addProfileBtn');

        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });
        }

        if (addProfileBtn) {
            addProfileBtn.addEventListener('click', () => {
                this.addNewProfile();
                profileDropdown.classList.remove('active');
            });
        }

        // Close dropdown when clicking outside
        window.addEventListener('click', () => {
            if (profileDropdown) profileDropdown.classList.remove('active');
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

        // Account Mode Toggle Listener
        document.getElementsByName('accountMode').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateSettingsVisibility();
            });
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

        // Close Account & Archive
        const closeAccountBtn = document.getElementById('closeAccountBtn');
        if (closeAccountBtn) {
            closeAccountBtn.addEventListener('click', () => {
                this.handleCloseAccount();
            });
        }

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

        const chartUrl = document.getElementById('chartUrl').value.trim();

        // Validation
        if (!pair || !direction || !result) {
            alert('Lütfen parite, yön ve işlem sonucunu doldurun');
            return;
        }

        let tradeData = {
            pair: pair,
            direction: direction,
            result: result,
            chartUrl: chartUrl,
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
        document.getElementById('archiveName').value = this.settings.archiveName || 'RUNNER TRADER JOURNAL';
        document.getElementById('initialCapital').value = this.settings.initialCapital;
        document.getElementById('targetGrowth').value = this.settings.targetGrowth;
        document.getElementById('riskPerTrade').value = this.settings.riskPerTrade;
        document.getElementById('rLevel').value = this.settings.rLevel;
        document.getElementById('lockPercentage').value = this.settings.lockPercentage;
        document.getElementById('manualMode').checked = this.settings.manualMode;

        // Add listener for manual mode toggle in settings
        document.getElementById('manualMode').onchange = () => this.updateSettingsVisibility();

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

        // Trigger visibility update
        this.updateSettingsVisibility();

        document.getElementById('settingsModal').classList.add('active');
    }

    updateSettingsVisibility() {
        const isFreeMode = document.querySelector('input[name="accountMode"][value="free"]').checked;
        const isManual = document.getElementById('manualMode').checked;

        // Elements and Sections to toggle
        const targetBase = document.getElementById('targetBaseGroup');
        const targetGrowth = document.getElementById('targetGrowthGroup');
        const manualGroup = document.getElementById('manualModeGroup');
        const riskSection = document.getElementById('riskManagementSection');

        // Update the main mode description dynamically
        const modeDesc = document.getElementById('modeDescription');
        if (modeDesc) {
            if (isFreeMode) {
                modeDesc.textContent = '📈 Serbest modda büyüme sınırsızdır. Sadece sermayenizi büyütmeye odaklanırsınız.';
                modeDesc.style.color = '#2ea043';
            } else {
                modeDesc.textContent = '🎯 Challenge modunda belirli bir kâr hedefine ulaşmaya çalışırsınız.';
                modeDesc.style.color = '#58a6ff';
            }
        }

        if (isFreeMode) {
            // Free Mode UI
            if (targetBase) targetBase.style.display = 'none';
            if (targetGrowth) targetGrowth.style.display = 'none';
            if (riskSection) riskSection.style.display = 'none';
            if (manualGroup) manualGroup.style.display = 'none';

            document.getElementById('manualMode').checked = true;
        } else {
            // Challenge Mode UI
            if (targetBase) targetBase.style.display = 'block';
            if (targetGrowth) targetGrowth.style.display = 'block';
            if (manualGroup) manualGroup.style.display = 'block';

            // Handle Risk Management Section Visibility
            if (riskSection) {
                riskSection.style.display = isManual ? 'none' : 'block';
            }

            // Ensure descriptions are visible in challenge mode
            document.querySelectorAll('.settings-section .form-group small').forEach(s => s.style.display = 'block');
        }
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

        // In Free Mode, always sync Base with Initial to avoid "negative growth" ghosting
        if (accountMode === 'free') {
            targetBaseCapital = initialCapital;
        }

        const newSettings = {
            archiveName: document.getElementById('archiveName').value || 'RUNNER TRADER JOURNAL',
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
            // Force manual mode as true in Free Mode
            newSettings.manualMode = true;
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
            document.getElementById('archiveName').value = this.settings.archiveName;
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
        document.getElementById('archiveName').value = this.settings.archiveName;
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

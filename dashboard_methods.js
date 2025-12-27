// Performance Calculation Methods
getWinRate() {
    if (this.trades.length === 0) return 0;
    const wins = this.trades.filter(t => t.result === 'win').length;
    return (wins / this.trades.length) * 100;
}

getAvgRRR() {
    const winningTrades = this.trades.filter(t => t.result === 'win');
    if (winningTrades.length === 0) return 0;
    let totalR = 0;
    winningTrades.forEach(t => {
        let r = 0;
        if (t.breakdown && t.breakdown.runnerCloseRRR) {
            r = parseFloat(t.breakdown.runnerCloseRRR);
        } else if (t.rMultiples) {
            r = parseFloat(t.rMultiples);
        }
        if (!isNaN(r)) totalR += r;
    });
    return (totalR / winningTrades.length).toFixed(2);
}

getMaxDrawdown() {
    if (this.trades.length === 0) return 0;
    const balances = [];
    let runningBalance = this.settings.initialCapital;
    balances.push(runningBalance);
    const sortedTrades = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    sortedTrades.forEach(t => {
        runningBalance += t.profitLoss;
        balances.push(runningBalance);
    });
    let peak = balances[0];
    let maxDrawdown = 0;
    balances.forEach(balance => {
        if (balance > peak) peak = balance;
        const drawdown = (peak - balance) / peak * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    return -maxDrawdown;
}

updateDashboard() {
    const netProfitValue = this.getNetProfit();
    const currentBalance = this.getCurrentBalance();
    const progress = this.getProgressPercentage();
    const isCompleted = progress >= 100;

    const heroBalance = document.getElementById('heroTotalEquity');
    if (heroBalance) heroBalance.textContent = this.formatCurrency(currentBalance);
    const pnlPercent = document.getElementById('pnlPercent');
    if (pnlPercent) {
        pnlPercent.textContent = (netProfitValue >= 0 ? '+' : '') + progress.toFixed(1) + '%';
        pnlPercent.closest('.stats-trend').className = `stats-trend ${netProfitValue >= 0 ? 'positive' : 'negative'}`;
    }

    const winRate = this.getWinRate();
    const avgRRR = this.getAvgRRR();
    const maxDD = this.getMaxDrawdown();
    const totalTrades = this.trades.length;
    const winningTrades = this.trades.filter(t => t.result === 'win').length;

    const winRateDetail = document.getElementById('winRateDetail');
    if (winRateDetail) winRateDetail.textContent = winRate.toFixed(1) + '%';
    const totalTradesDetail = document.getElementById('totalTradesDetail');
    if (totalTradesDetail) totalTradesDetail.textContent = totalTrades + ' işlem';

    const avgRRRDetail = document.getElementById('avgRRRDetail');
    if (avgRRRDetail) avgRRRDetail.textContent = avgRRR + 'R';
    const winningTradesDetail = document.getElementById('winningTradesDetail');
    if (winningTradesDetail) winningTradesDetail.textContent = winningTrades + ' kazançlı';

    const currentProfitDetail = document.getElementById('currentProfitDetail');
    if (currentProfitDetail) {
        currentProfitDetail.textContent = (netProfitValue >= 0 ? '+' : '') + this.formatCurrency(netProfitValue);
        currentProfitDetail.className = `card-value ${netProfitValue >= 0 ? 'positive' : 'negative'}`;
    }
    const profitChangeDetail = document.getElementById('profitChangeDetail');
    if (profitChangeDetail) {
        profitChangeDetail.textContent = (netProfitValue >= 0 ? '↑ ' : '↓ ') + Math.abs(progress).toFixed(1) + '%';
        profitChangeDetail.className = `card-subvalue ${netProfitValue >= 0 ? 'positive' : 'negative'}`;
    }

    const maxDDDetail = document.getElementById('maxDDDetail');
    if (maxDDDetail) {
        maxDDDetail.textContent = maxDD.toFixed(2) + '%';
        maxDDDetail.style.color = 'var(--neon-red)';
    }

    const mainProgressBarFill = document.getElementById('mainProgressBarFill');
    if (mainProgressBarFill) {
        mainProgressBarFill.style.width = Math.min(100, Math.max(0, progress)) + '%';
        if (isCompleted) {
            mainProgressBarFill.style.background = 'var(--neon-red)';
            mainProgressBarFill.style.boxShadow = '0 0 15px var(--neon-red-glow)';
        } else {
            mainProgressBarFill.style.background = 'linear-gradient(90deg, var(--neon-green-glow), var(--neon-green))';
            mainProgressBarFill.style.boxShadow = '0 0 15px var(--neon-green-glow)';
        }
    }
    const mainCompletionPercent = document.getElementById('mainCompletionPercent');
    if (mainCompletionPercent) {
        mainCompletionPercent.textContent = progress.toFixed(1) + '%';
        if (isCompleted) mainCompletionPercent.style.color = 'var(--neon-red)';
        else mainCompletionPercent.style.color = 'inherit';
    }

    this.updateCircularProgress(progress);
    this.updateChart();
}

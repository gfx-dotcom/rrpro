// Periyodik değişim hesaplama fonksiyonu
getProgressByPeriod(period) {
    if (this.trades.length === 0) return 0;

    const now = new Date();
    let startDate;

    switch (period) {
        case '1d':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '1w':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '1m':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '3m':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'ytd':
            startDate = new Date(now.getFullYear(), 0, 1); // Jan 1
            break;
        case 'all':
        default:
            // Başlangıçtan beri
            const firstTrade = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];
            if (!firstTrade) return 0;
            startDate = new Date(firstTrade.timestamp);
            break;
    }

    // Bu periyottaki işlemleri filtrele
    const periodTrades = this.trades.filter(t => new Date(t.timestamp) >= startDate);

    if (periodTrades.length === 0) return 0;

    // Başlangıç bakiyesi: Bu periyottan önceki toplam kâr/zarar + initial capital
    const tradesBeforePeriod = this.trades.filter(t => new Date(t.timestamp) < startDate);
    const profitBeforePeriod = tradesBeforePeriod.reduce((sum, t) => sum + t.profitLoss, 0);
    const startingBalance = this.settings.initialCapital + profitBeforePeriod;

    // Şu anki bakiye
    const currentBalance = this.getCurrentBalance();

    // Değişim yüzdesi
    const change = ((currentBalance - startingBalance) / startingBalance) * 100;

    return change;
}

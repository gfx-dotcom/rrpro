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
        this.currentCalendarDate = new Date(); // Kâr/Zarar takvimi tarihi

        // Initialize Core Systems
        // Check for shared URL data
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
            archiveName: 'RUNNER TRADER JOURNAL',
            language: 'tr',
            currency: 'TRY'
        };
    }

    // Translation Dictionary
    i18n = {
        tr: {
            current_balance: "Güncel Bakiye",
            win_rate: "Kazanma Oranı",
            avg_rrr: "Ortalama Runner RRR",
            net_profit_loss: "Net Kar/Kayıp",
            max_drawdown: "Max Drawdown",
            trades: "işlem",
            winning_trades: "Kazanan işlemler",
            total_trades_result: "Toplam işlem sonucu",
            drawdown_detail: "Zirveden düşüş",
            active: "Aktif",
            completed: "Tamamlandı ✓",
            free_mode: "Serbest Mod",
            target_growth: "Büyüme Hedefi",
            net_growth: "Net Büyüme",
            growth_progress: "Büyüme İlerlemesi",
            completion_rate: "Tamamlanma Oranı",
            targeted_profit: "Hedeflenen Kâr",
            remaining_to_target: "Hedefe Kalan",
            trades_needed: "işlem gerekli",
            target_completed: "Hedef tamamlandı!",
            account_mode: "Hesap Modu",
            start_new_challenge: "Yeni Challenge Başlat",
            share_challenge: "🏆 Hesabı Tamamla ve Paylaş",
            feedback_title: "Akıllı Geri Bildirim",
            strategy_compliant: "Stratejiye Uygun",
            strategy_deviated: "Strateji Dışı",
            be_trade: "Başa Baş",
            win_trade: "Kazanç",
            loss_trade: "Kayıp",
            long: "Long",
            short: "Short",
            pair: "Parite",
            direction: "Yön",
            result: "Sonuç",
            date: "Tarih",
            notes: "Notlar",
            no_trades: "Henüz işlem kaydı bulunmuyor.",
            add_first_trade: "İlk işlemini yukarıdaki formdan ekleyebilirsin.",
            delete: "Sil",
            save: "Kaydet",
            reset: "Sıfırla",
            settings: "Ayarlar",
            currency_symbol: "₺",
            new_trade: "YENİ İŞLEM GİRİŞİ",
            calculator: "Hesap Makinesi",
            chart_url: "TradingView Link (Opsiyonel)",
            trade_result: "İşlem Sonucu",
            multi_tp: "Çoklu TP?",
            tp_levels: "TP Seviyeleri",
            add_tp: "+ Yeni Seviye Ekle",
            submit_trade: "İŞLEMİ KAYDET",
            clear_history: "Geçmişi Temizle",
            export_pdf: "PDF Olarak Dışa Aktar",
            export_excel: "Excel Olarak Dışa Aktar",
            initial_capital: "Başlangıç Sermayesi",
            target_growth_rate: "Hedef Büyüme Oranı",
            risk_per_trade: "İşlem Başına Maks Risk",
            manual_mode: "Manuel Giriş Modu",
            close_account: "Hesabı Kapat ve Arşivle",
            confirm_reset: "Tüm verileri sıfırlamak istediğinizden emin misiniz?",
            confirm_delete: "Bu işlemi silmek istediğinizden emin misiniz?",
            page: "Sayfa",
            starting: "Başlangıç",
            gain: "kazanç",
            loss_small: "kayıp",
            balance_history: "BAKİYE İLERLEYİŞİ",
            free_mode_desc: "📈 Serbest modda büyüme sınırsızdır. Sadece sermayenizi büyütmeye odaklanırsınız.",
            challenge_mode_desc: "🎯 Challenge modunda belirli bir kâr hedefine ulaşmaya çalışırsınız.",
            no_trades_yet: "Henüz işlem yok",
            calculating: "Hesaplanıyor...",
            total_trades: "toplam işlem",
            total_win_rate: "Kazanma Oranı",
            win_count: "kazanç",
            loss_count: "kayıp",
            early_close_title: "ERKEN KAPANIŞ UYARISI!",
            aggressive_trade_title: "AGRESİF STRATEJİ!",
            runner_potential_title: "RUNNER POTANSİYELİ ARTTI",
            more_guarantee_title: "DAHA FAZLA GARANTİ",
            discipline_title: "DİSİPLİNİ SÜRDÜRÜN",
            increase_runner_title: "RUNNER POTANSİYELİNİ ARTIRIN",
            success_target_title: "HEDEF TAMAMLANDI!",
            super_runner_title: "SÜPER RUNNER!",
            consecutive_loss_msg: "ardışık kayıp yaşadınız. Runner Modelinin doğasında kayıp serileri vardır. Risk kuralınızı değiştirmeden en yüksek olasılıklı kurulumunuzu bekleyin. Sabır anahtardır.",
            be_shield_msg: "Risk Yönetimi Mükemmel. Ancak Runner potansiyelinizi artırmalısınız. Daha geniş zaman dilimlerinde veya ana trend yönünde işlem aramayı deneyin.",
            super_runner_msg: "HARİKA! Bu koşucu kaybın maliyetini tek başına çıkardı. Hedefinize büyük bir adım attınız!",
            target_growth_msg: "TEBRİKLER! Büyüme Hedefinize Ulaştınız. Yeni hedefinizi belirleyin veya kârınızı çekin.",
            copy_success: "Kopyalandı!",
            share_title: "📈 Profil Paylaşımı",
            share_heading: "İstatistiklerini Paylaş",
            share_msg: "Mevcut performansını ve işlem geçmişini görüntülemek için bu bağlantıyı paylaşabilirsin.",
            confirm_new_challenge: "Yeni challenge başlatılacak. Mevcut bakiye başlangıç olarak ayarlanıp işlem geçmişi temizlenecek. Onaylıyor musunuz?",
            new_challenge_success: "Yeni challenge başlatıldı! Bol kazançlar 🚀",
            confirm_clear_trades: "Tüm işlem geçmişini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
            trades_cleared_notification: "İşlem geçmişi temizlendi",
            confirm_delete_trade: "Bu işlemi silmek istediğinizden emin misiniz?",
            gain_amount: "+{amount} kazanç",
            loss_amount: "{amount} kayıp",
            target_growth_percentage: "%{progress} Büyüme",
            target_growth_percentage_full: "%{targetGrowth} Büyüme Hedefi",
            win_rate_detail: "{wins}/{totalTrades} işlem",
            winning_trades_detail: "{wins} kazançlı işlem",
            total_trades_detail: "{count} toplam işlem",
            trades_count: "{count} işlem",
            runner_performance: "RUNNER PERFORMANS",
            r_based_journal: "R-Tabanlı İşlem Günlüğü",
            performance_analysis: "PERFORMANS ANALİZİ",
            new_trade_entry: "YENİ İŞLEM KAYDI",
            trade_history: "İŞLEM GEÇMİŞİ",
            select_option: "Seçiniz...",
            long_option: "Long (Alış) 🔼",
            short_option: "Short (Satış) 🔻",
            loss_sl: "❌ Kayıp (SL)",
            be_emoji: "⚖️ Başa Baş (BE)",
            win_emoji: "✅ Kazanç (Win)",
            manual_loss_label: "Kayıp Miktarı ({symbol})",
            manual_loss_help: "Toplam zarar miktarını negatif olarak girin",
            multi_tp_question: "Çoklu Kar Alımı?",
            yes_standard: "Evet (Gelişmiş)",
            no_standard: "Hayır (Standart)",
            tp_levels_title: "Kar Alım Seviyeleri",
            add_tp_level: "+ Yeni Seviye Ekle",
            first_close_rrr_label: "İlk Kapanış RRR Seviyesi",
            first_close_percent_label: "İlk Kapanış Yüzdesi (%)",
            runner_close_rrr_label: "Kalan Kısmın Kapandığı RRR",
            be_first_close_rrr: "Kâr kilitleme yaptığınız R seviyesi",
            be_first_close_percent: "Kâr kilitlediğiniz pozisyon yüzdesi",
            pnl_calendar: "📅 KÂR/ZARAR TAKVİMİ",
            pair_stats_title: "📊 EN BAŞARILI PARİTELER",
            most_traded: "En Çok İşlem",
            top_profit: "En Yüksek Kâr",
            top_winrate: "En İyi Oran",
            pair_label: "Parite",
            trades_label: "İşlem",
            winrate_label: "Başarı",
            trade_notes_label: "İşlem Notları (Opsiyonel)",
            trade_notes_placeholder: "Kapanış dağılımı veya diğer notlar...",
            trade_pair_placeholder: "Örn: USDJPY",
            manual_loss_placeholder: "Örn: -500",
            chart_link_placeholder: "https://www.tradingview.com/x/...",
            rrr_placeholder: "R Seviyesi (Örn: 2.5)",
            percent_placeholder: "Kapanan % (Örn: 25)",
            profit_placeholder: "Elde Edilen Kâr ({symbol})",
            total_tp_percent: "Toplam Yüzde",
            trade_item_label: "İşlem {count}",
            balance_text: "Bakiye",
            profit_distribution_title: "💰 Kar Dağılımı:",
            partial_profit_be_title: "⚖️ Kısmi Kazanç + BE:",
            loss_title: "❌ Kayıp:",
            total_profit_label: "Toplam Kar:",
            net_result_label: "Net Sonuç:",
            shared_profile_msg: "👁️ Bu paylaşılan bir profildir. Sadece görüntüleme modundasınız.",
            start_own_tracker: "Kendi Takibini Başlat",
            confirm_clear_all: "Tüm verileri sıfırlamak istediğinizden emin misiniz?",
            confirm_reset_settings: "Tüm ayarları varsayılan değerlere döndürmek istiyor musunuz?",
            settings_reset_success: "✅ Ayarlar varsayılan değerlere döndürüldü",
            system_reset_success: "✅ Sistem başarıyla sıfırlandı!",
            validation_capital_negative: "Başlangıç sermayesi negatif olamaz",
            validation_growth_range: "Hedef büyüme oranı 1-1000 arasında olmalıdır",
            validation_risk_range: "Risk oranı 0.1-5 arasında olmalıdır",
            validation_capital_change: "Başlangıç sermayesini değiştirmek mevcut işlem geçmişinizi etkileyebilir. Devam etmek istiyor musunuz?",
            notification_settings_saved: "Ayarlar kaydedildi",
            are_you_sure: "⚠️ Emin misin?",
            reset_all_data: "Tüm Verileri Sıfırla",
            calculate: "Hesapla",
            calculator: "Hesap Makinesi",
            calc_risk_label: "Risk Miktarı ({symbol})",
            calc_rrr_label: "Hedef RRR",
            calc_percent_label: "Kapanış %",
            calc_lot_label: "Lot Büyüklüğü (İsteğe bağlı)",
            calc_result_label: "Potansiyel Kâr:",
            calc_lot_result: "Kapatılacak Lot:",
            calc_lot_result: "Kapatılacak Lot:",
            copy: "Kopyala",
            share_link_label: "Paylaşılabilir Link",
            date_label: "Tarih",
            final_balance: "Nihai Bakiye",
            multi_tp_title: "🔄 Çoklu Kar Alımı:",
            partial_profit_title: "⚖️ Kısmi Kazanç + BE:",
            net_result: "Net Sonuç:",
            stop_loss: "Stop Loss:",
            delete_trade_title: "İşlemi Sil",
            view_chart_title: "İşlem Grafiğini Gör",
            settings_modal_title: "⚙️ Sistem Ayarları",
            account_mode_title: "⚖️ Hesap Modu Seçimi",
            mode_challenge: "🎯 Challenge (Hedefli)",
            mode_free: "📈 Serbest (Bakiye)",
            mode_desc_challenge: "Challenge modunda belirli bir kâr hedefine ulaşmaya çalışırsınız.",
            capital_settings_title: "💰 Sermaye ve Hedef Ayarları",
            archive_name_label: "Günlük / Arşiv İsmi",
            archive_name_help: "Rapor başlıklarında ve dosya isminde kullanılacak isim.",
            initial_capital_label: "Başlangıç Sermayesi ({symbol})",
            initial_capital_help: "Hesabınızın şu anki mevcut bakiyesi",
            target_base_label: "Hedef Baz Sermayesi ({symbol})",
            target_base_help: "Hedefin hesaplandığı ana para (Kâr bu tutar üzerinden hesaplanır)",
            target_growth_label: "Hedef Büyüme Oranı (%)",
            target_growth_help: "Challenge modunda ulaşmak istediğiniz toplam kâr yüzdesi",
            risk_settings_title: "🛡️ Risk ve Strateji Yönetimi",
            risk_per_trade_label: "İşlem Başına Maksimum Risk (%)",
            risk_per_trade_help: "Her işlemde kasanızın yüzde kaçını riske atacaksınız?",
            r_level_label: "Kâr Kilitleme R Seviyesi",
            r_level_help: "İşlem bu R seviyesine ulaştığında kârın bir kısmı kilitlenir.",
            lock_percent_label: "Kilitlenen Pozisyon Yüzdesi (%)",
            lock_percent_help: "Kâr kilitlendiğinde pozisyonun yüzde kaçı kapatılacak?",
            extra_settings_title: "⚙️ Ek Özellikler / Language",
            manual_mode_label: "Manuel Giriş Modu",
            manual_mode_help: "Kazanç miktarlarını Runner sisteminin otomatik hesaplaması yerine manuel girmek için kullanın.",
            language_label: "Dil / Language",
            currency_label: "Para Birimi / Currency",
            close_account_title: "📂 Hesabı Kapat ve Arşivle",
            close_account_desc: "Mevcut challenge veya serbest dönemi sonlandırın. Tüm işlem geçmişiniz profesyonel formatta PDF ve Excel olarak dışa aktarılır, ardından hesabınız yeni bir dönem için sıfırlanır.",
            close_account_btn: "🏆 Hesabı Kapat ve Verileri İndir",
            snapshot_warning: "⚠️ Bu link anlık görüntüdür. Yeni trade eklediğinizde veya sildiğinizde tekrar 'Paylaş' butonuna basarak yeni link oluşturmalısınız.",
            generated_new_link: "Yeni link oluşturuldu!",
            calc_modal_title: "🧮 Kâr Hesaplayıcı",
            calc_risk_help: "İşlem başına riske edilen tutar",
            calc_rrr_help: "Kâr almayı planladığınız R seviyesi",
            calc_percent_help: "Bu seviyede kapatılacak pozisyon oranı",
            calc_lot_help: "Elinizdeki toplam lot miktarı",
            calc_estimate_label: "Tahmini Kâr",
            calc_mt5_label: "MT5 Mobil İçin",
            calc_mt5_help: "Bu RR seviyesinde kapatılacak lot miktarı",
            calc_risk_placeholder: "Örn: 250",
            calc_lot_placeholder: "Örn: 0.5",
            new_trade_entry: "➞ YENİ İŞLEM KAYDI",
            starting: "Başlangıç",
            snapshot_title: "📸 Bu Link Anlık Görüntü İçerir",
            snapshot_desc: "Bu link paylaşıldığı andaki trade'leri gösterir. Daha sonra eklenen veya silinen trade'leri görmek için hesap sahibinden güncel linki isteyiniz.",
            start_your_own: "Kendi Takibini Başlat",
            economic_calendar_title: "📅 EKONOMİK TAKVİM"
        },
        en: {
            current_balance: "Current Balance",
            win_rate: "Win Rate",
            avg_rrr: "Avg Runner RRR",
            net_profit_loss: "Net Profit/Loss",
            max_drawdown: "Max Drawdown",
            trades: "trades",
            winning_trades: "Winning trades",
            total_trades_result: "Total trades result",
            drawdown_detail: "Peak to trough",
            active: "Active",
            completed: "Completed ✓",
            free_mode: "Free Mode",
            target_growth: "Growth Target",
            net_growth: "Net Growth",
            growth_progress: "Growth Progress",
            completion_rate: "Completion Rate",
            targeted_profit: "Targeted Profit",
            remaining_to_target: "Remaining",
            trades_needed: "{count} trades needed",
            target_completed: "Target completed!",
            account_mode: "Account Mode",
            start_new_challenge: "Start New Challenge",
            share_challenge: "🏆 Complete & Share Account",
            feedback_title: "Smart Feedback",
            strategy_compliant: "Strategy Compliant",
            strategy_deviated: "Strategy Deviation",
            be_trade: "Break Even",
            win_trade: "Win",
            loss_trade: "Loss",
            long: "Long",
            short: "Short",
            pair: "Pair",
            direction: "Direction",
            result: "Result",
            date: "Date",
            notes: "Notes",
            no_trades: "No trade records yet.",
            add_first_trade: "Add your first trade using the form above.",
            delete: "Delete",
            save: "Save",
            reset: "Reset",
            settings: "Settings",
            currency_symbol: "$",
            new_trade: "NEW TRADE ENTRY",
            calculator: "Calculator",
            chart_url: "TradingView Link (Optional)",
            trade_result: "Trade Result",
            multi_tp: "Multi-TP?",
            tp_levels: "TP Levels",
            add_tp: "+ Add New Level",
            submit_trade: "RECORD TRADE",
            clear_history: "Clear History",
            export_pdf: "Export to PDF",
            export_excel: "Export to Excel",
            initial_capital: "Starting Capital",
            target_growth_rate: "Target Growth Rate",
            risk_per_trade: "Max Risk Per Trade",
            manual_mode: "Manual Input Mode",
            close_account: "Close Account & Archive",
            confirm_reset: "Are you sure you want to reset all data?",
            confirm_delete: "Delete this trade?",
            page: "Page",
            starting: "Starting",
            gain: "gain",
            loss_small: "loss",
            balance_history: "BALANCE PROGRESSION",
            free_mode_desc: "📈 In Free Mode, growth is unlimited. You focus solely on growing your capital.",
            challenge_mode_desc: "🎯 In Challenge Mode, you aim to reach a specific profit target.",
            no_trades_yet: "No trades yet",
            calculating: "Calculating...",
            total_trades: "total trades",
            total_win_rate: "Win Rate",
            win_count: "wins",
            loss_count: "losses",
            early_close_title: "EARLY CLOSE WARNING!",
            aggressive_trade_title: "AGGRESSIVE STRATEGY!",
            runner_potential_title: "RUNNER POTENTIAL INCREASED",
            more_guarantee_title: "MORE GUARANTEE",
            discipline_title: "MAINTAIN DISCIPLINE",
            increase_runner_title: "INCREASE RUNNER POTENTIAL",
            success_target_title: "TARGET COMPLETED!",
            super_runner_title: "SUPER RUNNER!",
            consecutive_loss_msg: "consecutive losses recorded. Drawdown periods are natural in the Runner Model. Wait for your high-probability setup without breaking your risk rules. Patience is key.",
            be_shield_msg: "Excellent Risk Management. However, you should aim to increase your Runner potential. Try looking for trades in higher timeframes or main trend direction.",
            super_runner_msg: "AMAZING! This {maxRRR}R runner single-handedly covered the cost of {lossesCompensated} previous losses. A huge step towards your target! (+{profitLoss})",
            target_growth_msg: "CONGRATULATIONS! You reached your {targetGrowth}% Growth Target. Set a new target or withdraw your profits. ({netProfit})",
            copy_success: "Copied!",
            share_title: "📈 Profile Sharing",
            share_heading: "Share Your Stats",
            share_msg: "You can share this link to show your current performance and trade history.",
            confirm_new_challenge: "A new challenge will start. Current balance will be set as starting capital and trade history will be cleared. Do you confirm?",
            new_challenge_success: "New challenge started! Good luck 🚀",
            confirm_clear_trades: "Are you sure you want to clear all trade history? This cannot be undone.",
            trades_cleared_notification: "Trade history cleared",
            confirm_delete_trade: "Are you sure you want to delete this trade?",
            gain_amount: "+{amount} gain",
            loss_amount: "{amount} loss",
            target_growth_percentage: "{progress}% Growth",
            target_growth_percentage_full: "{targetGrowth}% Growth Target",
            win_rate_detail: "{wins}/{totalTrades} trades",
            winning_trades_detail: "{wins} winning trades",
            total_trades_detail: "{count} total trades",
            trades_count: "{count} trades",
            runner_performance: "RUNNER PERFORMANCE",
            r_based_journal: "R-Based Trading Journal",
            performance_analysis: "PERFORMANCE ANALYSIS",
            new_trade_entry: "NEW TRADE ENTRY",
            trade_history: "TRADE HISTORY",
            select_option: "Select...",
            long_option: "Long 🔼",
            short_option: "Short 🔻",
            loss_sl: "❌ Loss (SL)",
            be_emoji: "⚖️ Break Even (BE)",
            win_emoji: "✅ Win",
            manual_loss_label: "Loss Amount ({symbol})",
            manual_loss_help: "Enter total loss amount as a negative value",
            multi_tp_question: "Multi-TP?",
            yes_standard: "Yes (Advanced)",
            no_standard: "No (Standard)",
            tp_levels_title: "Take Profit Levels",
            add_tp_level: "+ Add New Level",
            first_close_rrr_label: "First Close RRR Level",
            first_close_percent_label: "First Close Percent (%)",
            runner_close_rrr_label: "Runner Close RRR Level",
            be_first_close_rrr: "R level where you locked profit",
            be_first_close_percent: "Percentage of position locked",
            trade_notes_label: "Trade Notes (Optional)",
            trade_notes_placeholder: "Closing distribution or other notes...",
            trade_pair_placeholder: "e.g. USDJPY",
            manual_loss_placeholder: "e.g. -500",
            chart_link_placeholder: "https://www.tradingview.com/x/...",
            rrr_placeholder: "R Level (e.g. 2.5)",
            percent_placeholder: "Close % (e.g. 25)",
            profit_placeholder: "Profit Realized ({symbol})",
            total_tp_percent: "Total Percent",
            trade_item_label: "Trade {count}",
            balance_text: "Balance",
            profit_distribution_title: "💰 Profit Distribution:",
            partial_profit_be_title: "⚖️ Partial Profit + BE:",
            loss_title: "❌ Loss:",
            total_profit_label: "Total Profit:",
            net_result_label: "Net Result:",
            shared_profile_msg: "👁️ This is a shared profile. You are in read-only mode.",
            start_own_tracker: "Start Your Own Tracker",
            confirm_clear_all: "Are you sure you want to reset all data?",
            confirm_reset_settings: "Are you sure you want to reset all settings to default?",
            settings_reset_success: "✅ Settings reset to default",
            system_reset_success: "✅ System reset successfully!",
            validation_capital_negative: "Starting capital cannot be negative",
            validation_growth_range: "Target growth rate must be between 1-1000",
            validation_risk_range: "Risk rate must be between 0.1-5",
            validation_capital_change: "Changing starting capital may affect trade history. Do you want to continue?",
            notification_settings_saved: "Settings saved",
            are_you_sure: "⚠️ Are you sure?",
            reset_all_data: "Reset All Data",
            calculate: "Calculate",
            calculator: "Calculator",
            calc_risk_label: "Risk Amount ({symbol})",
            calc_rrr_label: "Target RRR",
            calc_percent_label: "Close %",
            calc_lot_label: "Lot Size (Optional)",
            calc_result_label: "Potential Profit:",
            calc_lot_result: "Lot to Close:",
            calc_lot_result: "Lot to Close:",
            copy: "Copy",
            share_link_label: "Shareable Link",
            date_label: "Date",
            final_balance: "Final Balance",
            multi_tp_title: "🔄 Multi-TP Profit:",
            partial_profit_title: "⚖️ Partial Profit + BE:",
            net_result: "Net Result:",
            stop_loss: "Stop Loss:",
            delete_trade_title: "Delete Trade",
            view_chart_title: "View Chart",
            settings_modal_title: "⚙️ System Settings",
            account_mode_title: "⚖️ Account Mode Selection",
            mode_challenge: "🎯 Challenge (Targeted)",
            mode_free: "📈 Free Mode (Balance)",
            mode_desc_challenge: "In Challenge Mode, you aim to reach a specific profit target.",
            capital_settings_title: "💰 Capital & Target Settings",
            archive_name_label: "Journal / Archive Name",
            archive_name_help: "Name used in report titles and filenames.",
            initial_capital_label: "Starting Capital ({symbol})",
            initial_capital_help: "Your current account balance.",
            target_base_label: "Target Base Capital ({symbol})",
            target_base_help: "Capital used for target calculation (Profit is calculated over this).",
            target_growth_label: "Target Growth Rate (%)",
            target_growth_help: "Total profit percentage you want to reach in Challenge mode.",
            risk_settings_title: "🛡️ Risk & Strategy Management",
            risk_per_trade_label: "Max Risk Per Trade (%)",
            risk_per_trade_help: "What percentage of your capital will you risk per trade?",
            r_level_label: "Profit Lock R Level",
            r_level_help: "At this R level, part of the profit will be locked.",
            lock_percent_label: "Locked Position Percentage (%)",
            lock_percent_help: "What percentage of the position will be closed when profit is locked?",
            extra_settings_title: "⚙️ Extra Features / Language",
            manual_mode_label: "Manual Input Mode",
            manual_mode_help: "Use this to enter profit amounts manually instead of auto-calculation.",
            language_label: "Dil / Language",
            currency_label: "Para Birimi / Currency",
            close_account_title: "📂 Close Account & Archive",
            close_account_desc: "End the current challenge or free period. Your entire trade history will be exported as PDF and Excel, then your account will be reset for a new period.",
            close_account_btn: "🏆 Close Account & Download Data",
            snapshot_warning: "⚠️ This link is a snapshot. You must generate a new link when you add or remove trades.",
            generated_new_link: "New link generated!",
            calc_modal_title: "🧮 Profit Calculator",
            calc_risk_help: "Amount risked per trade",
            calc_rrr_help: "Target R level for profit taking",
            calc_percent_help: "Percentage of position to close at this level",
            calc_lot_help: "Total lot size you hold",
            calc_estimate_label: "Estimated Profit",
            calc_mt5_label: "For MT5 Mobile",
            calc_mt5_help: "Lot size to close at this RR level",
            calc_risk_placeholder: "e.g. 250",
            calc_lot_placeholder: "e.g. 0.5",
            new_trade_entry: "➞ NEW TRADE ENTRY",
            starting: "Starting",
            snapshot_title: "📸 This Link Contains a Snapshot",
            snapshot_desc: "This link displays trades at the time of sharing. To see subsequently added or deleted trades, request an updated link from the account owner.",
            start_your_own: "Start Your Own Tracker",
            pnl_calendar: "📅 P\u0026L CALENDAR",
            pair_stats_title: "📊 TOP PERFORMANCE",
            most_traded: "Most Traded",
            top_profit: "Top Profit",
            top_winrate: "Top Win Rate",
            pair_label: "Pair",
            trades_label: "Trades",
            winrate_label: "Success",
            economic_calendar_title: "📅 ECONOMIC CALENDAR"
        }
    };

    t(key, params = {}) {
        const lang = this.settings.language || 'tr';
        let text = this.i18n[lang][key] || key;

        // Handle template parameters
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });
        return text;
    }

    updateStaticTranslations() {
        const lang = this.settings.language || 'tr';
        const isEN = lang === 'en';
        const symbol = this.settings.currency === 'USD' ? '$' : '₺';

        // 1. Robust Translation via data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            let text = this.t(key, { symbol: symbol });

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else if (el.tagName === 'OPTION') {
                // For option elements, preserve the value attribute
                el.textContent = text;
            } else {
                el.textContent = text;
            }
        });

        // Update logo and titles
        const logoTitle = document.querySelector('.logo-text h1');
        if (logoTitle) logoTitle.textContent = this.t('runner_performance');
        const logoSub = document.querySelector('.logo-text p');
        if (logoSub) logoSub.textContent = this.t('r_based_journal');

        // Read-only banner
        const banner = document.getElementById('readOnlyBanner');
        if (banner) {
            const span = banner.querySelector('span');
            if (span) span.textContent = this.t('shared_profile_msg');
            const a = banner.querySelector('a');
            if (a) a.textContent = this.t('start_own_tracker');
        }

        // Settings / Share / Profile buttons
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            const nodes = settingsBtn.childNodes;
            nodes[nodes.length - 1].textContent = ' ' + this.t('settings');
        }

        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            const nodes = shareBtn.childNodes;
            nodes[nodes.length - 1].textContent = ' ' + this.t('share_challenge').split(' ')[1] || ' Share';
        }

        // Section Headers
        const targetH2 = document.querySelector('.target-section .section-header h2');
        if (targetH2) targetH2.textContent = `🎯 ${this.t('account_mode').toUpperCase()}`;

        const entryH2 = document.querySelector('.entry-section .section-header h2');
        if (entryH2) entryH2.textContent = `➕ ${this.t('new_trade_entry')}`;

        const chartH2 = document.querySelector('.chart-section h2');
        if (chartH2) chartH2.textContent = `📊 ${this.t('balance_history')}`;

        const historyH2 = document.querySelector('.history-section .section-header h2');
        if (historyH2) historyH2.textContent = `📜 ${this.t('trade_history')}`;

        const metricsH2 = document.querySelector('.metrics-section .section-header h2');
        if (metricsH2) metricsH2.textContent = `📈 ${this.t('performance_analysis')}`;

        // Metric Card Labels
        const metricLabels = document.querySelectorAll('.metric-label');
        if (metricLabels.length >= 5) {
            metricLabels[0].textContent = this.t('current_balance');
            metricLabels[1].textContent = this.t('win_rate');
            metricLabels[2].textContent = this.t('avg_rrr');
            metricLabels[3].textContent = this.t('net_profit_loss');
            metricLabels[4].textContent = this.t('max_drawdown');
        }

        const drawdownDetail = document.getElementById('drawdownDetail');
        if (drawdownDetail) drawdownDetail.textContent = this.t('drawdown_detail');

        // Form Labels & Placeholders

        const labelPair = document.querySelector('label[for="tradePair"]');
        if (labelPair) labelPair.textContent = this.t('pair');
        const inputPair = document.getElementById('tradePair');
        if (inputPair) inputPair.placeholder = this.t('trade_pair_placeholder');

        const labelDir = document.querySelector('label[for="tradeDirection"]');
        if (labelDir) labelDir.textContent = this.t('direction');

        // Select Options
        const dirSelect = document.getElementById('tradeDirection');
        if (dirSelect) {
            dirSelect.options[0].textContent = this.t('select_option');
            dirSelect.options[1].textContent = this.t('long_option');
            dirSelect.options[2].textContent = this.t('short_option');
        }

        const labelChart = document.querySelector('label[for="chartUrl"]');
        if (labelChart) labelChart.textContent = this.t('chart_url');
        const inputChart = document.getElementById('chartUrl');
        if (inputChart) inputChart.placeholder = this.t('chart_link_placeholder');

        const labelResult = document.querySelector('label[for="tradeResult"]');
        if (labelResult) labelResult.textContent = this.t('trade_result');
        const resSelect = document.getElementById('tradeResult');
        if (resSelect) {
            resSelect.options[0].textContent = this.t('select_option');
            resSelect.options[1].textContent = this.t('loss_sl');
            resSelect.options[2].textContent = this.t('be_emoji');
            resSelect.options[3].textContent = this.t('win_emoji');
        }

        const labelLoss = document.querySelector('label[for="manualLossAmount"]');
        if (labelLoss) labelLoss.textContent = this.t('manual_loss_label', { symbol: symbol });
        const inputLoss = document.getElementById('manualLossAmount');
        if (inputLoss) inputLoss.placeholder = this.t('manual_loss_placeholder');
        const smallLoss = document.querySelector('#manualLossGroup small');
        if (smallLoss) smallLoss.textContent = this.t('manual_loss_help');

        const labelMultiTP = document.querySelector('label[for="multiTPToggle"]');
        if (labelMultiTP) labelMultiTP.textContent = this.t('multi_tp_question');
        const multiSelect = document.getElementById('multiTPToggle');
        if (multiSelect) {
            multiSelect.options[0].textContent = this.t('no_standard');
            multiSelect.options[1].textContent = this.t('yes_standard');
        }

        const tpLabel = document.querySelector('#multiTPContainer .form-header-row label');
        if (tpLabel) tpLabel.textContent = this.t('tp_levels_title');
        const addTPBtn = document.getElementById('addTPRowBtn');
        if (addTPBtn) addTPBtn.textContent = this.t('add_tp_level');
        const totalTPLabel = document.querySelector('#multiTPContainer small');
        if (totalTPLabel) {
            const nodes = totalTPLabel.childNodes;
            nodes[0].textContent = this.t('total_tp_percent') + ': ';
        }

        const labelFirstRRR = document.querySelector('label[for="firstCloseRRR"]');
        if (labelFirstRRR) labelFirstRRR.textContent = this.t('first_close_rrr_label');
        const labelFirstPerc = document.querySelector('label[for="firstClosePercent"]');
        if (labelFirstPerc) labelFirstPerc.textContent = this.t('first_close_percent_label');
        const labelRunnerRRR = document.querySelector('label[for="runnerCloseRRR"]');
        if (labelRunnerRRR) labelRunnerRRR.textContent = this.t('runner_close_rrr_label');

        const labelBeRRR = document.querySelector('label[for="beCloseRRR"]');
        if (labelBeRRR) labelBeRRR.textContent = this.t('first_close_rrr_label');
        const labelBePerc = document.querySelector('label[for="beClosePercent"]');
        if (labelBePerc) labelBePerc.textContent = this.t('first_close_percent_label');

        const labelNotes = document.querySelector('label[for="tradeNotes"]');
        if (labelNotes) labelNotes.textContent = this.t('trade_notes_label');
        const inputNotes = document.getElementById('tradeNotes');
        if (inputNotes) inputNotes.placeholder = this.t('trade_notes_placeholder');

        const submitBtn = document.getElementById('submitTradeBtn');
        if (submitBtn) {
            const span = submitBtn.querySelector('span');
            if (span) span.textContent = this.t('submit_trade');
        }

        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            const nodes = clearHistoryBtn.childNodes;
            nodes[nodes.length - 1].textContent = ' ' + this.t('clear_history');
        }

        // Calculator Modal
        const calcTitle = document.querySelector('#calcModal .modal-header h3');
        if (calcTitle) calcTitle.textContent = this.t('calculator');
        const labelCalcRisk = document.querySelector('label[for="calcRiskAmount"]');
        if (labelCalcRisk) labelCalcRisk.textContent = this.t('calc_risk_label', { symbol: symbol });
        const labelCalcRRR = document.querySelector('label[for="calcRRR"]');
        if (labelCalcRRR) labelCalcRRR.textContent = this.t('calc_rrr_label');
        const labelCalcPerc = document.querySelector('label[for="calcPercent"]');
        if (labelCalcPerc) labelCalcPerc.textContent = this.t('calc_percent_label');
        const labelCalcLot = document.querySelector('label[for="calcLotSize"]');
        if (labelCalcLot) labelCalcLot.textContent = this.t('calc_lot_label');
        const calcBtn = document.getElementById('calculateBtn');
        if (calcBtn) calcBtn.textContent = this.t('calculate');
        const resLabel = document.querySelector('.results-grid .result-box:first-child .result-label');
        if (resLabel) resLabel.textContent = this.t('calc_result_label');
        const lotResLabel = document.querySelector('#lotResultBox .result-label');
        if (lotResLabel) lotResLabel.textContent = this.t('calc_lot_result');

        // Share Modal
        const shareTitle = document.getElementById('shareModalTitle');
        if (shareTitle) shareTitle.textContent = this.t('share_title');
        const shareLabel = document.querySelector('#shareModal .form-group label');
        if (shareLabel) shareLabel.textContent = this.t('share_link_label');
        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) copyBtn.textContent = this.t('copy');

        // Settings Modal
        const setHeader = document.querySelector('#settingsModal .modal-header h3');
        if (setHeader) setHeader.textContent = this.t('settings');
        const labels = document.querySelectorAll('#settingsModal label');
        if (labels.length > 0) {
            // This is a bit fragile but better than nothing
            labels.forEach(l => {
                if (l.htmlFor === 'archiveName') l.textContent = this.t('archive_name') || 'Profile Name';
                if (l.htmlFor === 'initialCapital') l.textContent = this.t('initial_capital');
                if (l.htmlFor === 'targetGrowth') l.textContent = this.t('target_growth_rate');
                if (l.htmlFor === 'riskPerTrade') l.textContent = this.t('risk_per_trade');
                if (l.htmlFor === 'rLevel') l.textContent = this.t('lock_rrr_label') || 'R Level';
                if (l.htmlFor === 'lockPercentage') l.textContent = this.t('lock_percent_label') || 'Lock %';
                if (l.htmlFor === 'appLanguage') l.textContent = isEN ? 'Language' : 'Dil';
                if (l.htmlFor === 'appCurrency') l.textContent = isEN ? 'Currency' : 'Para Birimi';
            });
        }
        const resetSetsBtn = document.getElementById('resetSettings');
        if (resetSetsBtn) resetSetsBtn.textContent = this.t('reset');
        const clearDataBtn = document.getElementById('clearAllData');
        if (clearDataBtn) clearDataBtn.textContent = this.t('reset_all_data');
    }

    formatCurrency(amount) {
        const currency = this.settings.currency || 'TRY';
        const lang = this.settings.language || 'tr';
        const locale = lang === 'en' ? 'en-US' : 'tr-TR';

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace('TRY', '₺');
        } catch (e) {
            return (currency === 'USD' ? '$' : '₺') + (amount || 0).toLocaleString();
        }
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
        this.updateStaticTranslations();
        this.initChart();
        this.updateDashboard();
        this.renderTradeHistory();
        this.renderProfileList();
        this.renderTradeCalendar(); // Takvimi güncelle
        this.renderPairStats(); // Parite istatistiklerini güncelle
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
                        manualMode: s.m === 1,
                        archiveName: s.n || '',
                        language: s.lang || 'tr',
                        currency: s.curr || 'TRY'
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
                            const firstCloseRRR = Number(b.r) || 0;
                            const firstClosePercent = Number(b.p) || 0;
                            const runnerCloseRRR = Number(b.rc) || 0;

                            // Re-calculate monetary values for display
                            const riskAmount = (s.c * s.r) / 100;
                            const firstCloseProfit = (firstClosePercent / 100) * firstCloseRRR * riskAmount;
                            // Runner % is remaining
                            const runnerPercent = 100 - firstClosePercent;
                            const runnerCloseProfit = (runnerPercent / 100) * runnerCloseRRR * riskAmount;

                            trade.breakdown = b.m === 1 ?
                                { isMultiTP: true, totalPercent: 100, closes: b.c.map(r => ({ rrr: Number(r[0]) || 0, percent: Number(r[1]) || 0, profit: Number(r[2]) || 0 })) } :
                                {
                                    firstCloseRRR: firstCloseRRR,
                                    firstClosePercent: firstClosePercent,
                                    runnerCloseRRR: runnerCloseRRR,
                                    // Add these calculated fields
                                    firstClose: firstCloseProfit,
                                    runnerClose: runnerCloseProfit,
                                    runnerPercent: runnerPercent
                                };
                        }

                        if (t[6]) trade.notes = t[6];
                        if (t[7]) trade.chartUrl = t[7];
                        if (t[8]) trade.direction = t[8] === 1 ? 'long' : 'short';

                        return trade;
                    });

                    this.isReadOnly = true;
                    this.recalculateBalances();
                    const banner = document.getElementById('readOnlyBanner');
                    if (banner) banner.style.display = 'block';
                    const style = document.createElement('style');
                    style.innerHTML = `.entry-section, .header-actions, #clearHistoryBtn, .delete-trade-btn, #openCalcBtn { display: none !important; }`;
                    document.head.appendChild(style);

                    const profileName = s.n || urlParams.get('profile') || 'Shared Profile';
                    document.title = `${profileName} | Runner Tracker`;
                }
                // Handle Version 1 (Compact Keys Format)
                else if (data.s && data.t) {
                    const s = data.s;
                    this.settings = {
                        accountMode: s.a === 1 ? 'free' : 'challenge',
                        initialCapital: s.c,
                        targetBaseCapital: s.b,
                        targetGrowth: s.g,
                        riskPerTrade: s.r,
                        rLevel: s.l,
                        lockPercentage: s.p,
                        manualMode: s.m === 1,
                        archiveName: s.n || '',
                        language: s.lang || 'tr',
                        currency: s.curr || 'TRY'
                    };

                    this.trades = data.t.map(t => ({
                        pair: t.p, result: t.r, profitLoss: t.pl, timestamp: t.ts,
                        breakdown: t.b, notes: t.n || t.notes || t.note || "",
                        chartUrl: t.cu || t.chartUrl || "",
                        direction: t.d || t.direction || "",
                        strategyCompliant: t.sc, balance: 0
                    }));

                    this.isReadOnly = true;
                    this.recalculateBalances();
                    const banner = document.getElementById('readOnlyBanner');
                    if (banner) banner.style.display = 'block';
                    const style = document.createElement('style');
                    style.innerHTML = `.entry-section, .header-actions, #clearHistoryBtn, .delete-trade-btn, #openCalcBtn { display: none !important; }`;
                    document.head.appendChild(style);

                    // Set title with profile name
                    const profileName = s.n || urlParams.get('profile') || 'Shared Profile';
                    document.title = `${profileName} | Runner Tracker`;
                }
                // Legacy Format
                else if (data.trades && data.settings) {
                    this.trades = data.trades;
                    this.settings = data.settings;
                    if (this.settings.archiveName === undefined) {
                        this.settings.archiveName = '';
                    }
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

    // Generate Share Link (URL-based, no external API)
    generateShareLink() {
        const data = this.prepareShareData();
        const jsonString = JSON.stringify(data);

        let encoded;
        if (typeof LZString !== 'undefined') {
            encoded = LZString.compressToEncodedURIComponent(jsonString);
        } else {
            encoded = btoa(unescape(encodeURIComponent(jsonString)));
        }

        const baseUrl = window.location.href.split('?')[0];
        // Add profile info to URL for clarity
        const profileName = this.getActiveProfileName().replace(/\s+/g, '_');
        return `${baseUrl}?data=${encoded}&profile=${encodeURIComponent(profileName)}`;
    }

    // Prepare data for sharing
    prepareShareData() {
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
            n: s.archiveName || '',
            lang: s.language || 'tr',
            curr: s.currency || 'TRY',
            pid: this.activeProfileId // Profile ID
        };

        const compactTrades = this.trades.map(t => {
            const entry = [
                t.pair,
                t.result === 'win' ? 1 : (t.result === 'be' ? 2 : 0),
                Math.round(t.profitLoss * 100) / 100,
                Math.round(new Date(t.timestamp).getTime() / 1000),
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

            entry.push(t.notes || "");
            entry.push(t.chartUrl || "");
            entry.push(t.direction === 'long' ? 1 : (t.direction === 'short' ? 2 : 0));

            return entry;
        });

        return { s: compactSettings, t: compactTrades, v: 2 };
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

        const labels = [this.t('starting'), ...sortedTrades.map((_, i) => this.t('trade_item_label', { count: i + 1 }))];
        const data = [this.settings.initialCapital, ...sortedTrades.map(t => t.balance)];

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].label = this.t('balance_text');
        this.chart.data.datasets[0].data = data;

        // Update tooltips if needed
        this.chart.options.plugins.tooltip.callbacks.label = (context) => {
            return `${this.t('balance_text')}: ${this.formatCurrency(context.parsed.y)}`;
        };

        this.chart.update();
    }

    // ===================================
    // CALCULATIONS
    // ===================================

    // Calculate Average Profit from Winning Trades
    getAverageProfit() {
        if (!this.trades || this.trades.length === 0) return 0;
        const winningTrades = this.trades.filter(t => t.profitLoss > 0);
        if (winningTrades.length === 0) return 0;

        const totalProfit = winningTrades.reduce((sum, t) => sum + t.profitLoss, 0);
        return totalProfit / winningTrades.length;
    }

    // Estimate trades needed to reach target
    getEstimatedTradesNeeded() {
        const remaining = this.getRemainingProfit();
        if (remaining <= 0) return 0;

        const avgProfit = this.getAverageProfit();
        if (avgProfit <= 0) return 0; // Avoid division by zero

        return Math.ceil(remaining / avgProfit);
    }

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
                    title: this.t('early_close_title'),
                    message: this.settings.language === 'en'
                        ? `You closed first part at ${firstCloseRRR.toFixed(1)}R (target: ${targetRRR}R). This weakens your risk management.\n\nNext loss:\n• Current: ${this.formatCurrency(actualProfit)} gain - ${this.formatCurrency(riskAmount)} loss = ${this.formatCurrency(actualProfit - riskAmount)} net\n• Target: ${this.formatCurrency(targetProfit)} gain - ${this.formatCurrency(riskAmount)} loss = ${this.formatCurrency(targetProfit - riskAmount)} net\n\n⚠️ Diff: ${this.formatCurrency(difference)} less protection!`
                        : `İlk kapanışı ${firstCloseRRR.toFixed(1)}R'de yaptınız (hedef: ${targetRRR}R). Bu, risk yönetiminizi zayıflatır.\n\nBir sonraki işlem SL olursa:\n• Mevcut strateji: ${this.formatCurrency(actualProfit)} kâr - ${this.formatCurrency(riskAmount)} kayıp = ${this.formatCurrency(actualProfit - riskAmount)} net\n• Hedef strateji: ${this.formatCurrency(targetProfit)} kâr - ${this.formatCurrency(riskAmount)} kayıp = ${this.formatCurrency(targetProfit - riskAmount)} net\n\n⚠️ Fark: ${this.formatCurrency(difference)} daha az koruma!`
                });
            } else {
                // Aggressive close
                warnings.push({
                    type: 'warning',
                    icon: '🔥',
                    title: this.t('aggressive_trade_title'),
                    message: this.settings.language === 'en'
                        ? `You closed first part at ${firstCloseRRR.toFixed(1)}R (target: ${targetRRR}R). This provides more profit but increases risk.\n\n✅ Advantage: Faster growth\n⚠️ Risk: More gain reversal if price pulls back\n\n💡 Consistency is key. Can you sustain this?`
                        : `İlk kapanışı ${firstCloseRRR.toFixed(1)}R'de yaptınız (hedef: ${targetRRR}R). Bu daha fazla kâr sağlar ancak riski artırır.\n\n✅ Avantaj: Daha hızlı hesap büyümesi\n⚠️ Risk: Fiyat geri dönerse daha fazla kazanç kaybı\n\n💡 Tutarlılık önemlidir. Bu stratejiyi sürdürebilir misiniz?`
                });
            }
        }

        // Percent Deviation Check
        if (Math.abs(percentDeviation) > 10) {
            if (percentDeviation < 0) {
                warnings.push({
                    type: 'info',
                    icon: '📊',
                    title: this.t('runner_potential_title'),
                    message: this.settings.language === 'en'
                        ? `You closed ${firstClosePercent}% (target: ${targetPercent}%). With remaining ${100 - firstClosePercent}% larger runner gains are possible, but there is more risk if BE/SL is hit.\n\n💡 Be consistent: Use the same ratio for every trade.`
                        : `Pozisyonun %${firstClosePercent}'ini kapattınız (hedef: %${targetPercent}). Kalan %${100 - firstClosePercent} ile daha büyük runner kazançları mümkün, ama BE/SL gelirse daha fazla kayıp riski var.\n\n💡 Tutarlı olun: Her işlemde aynı oranı kullanın.`
                });
            } else {
                warnings.push({
                    type: 'info',
                    icon: '🛡️',
                    title: this.t('more_guarantee_title'),
                    message: this.settings.language === 'en'
                        ? `You closed ${firstClosePercent}% (target: ${targetPercent}%). You took more guaranteed profit but reduced your runner potential.\n\n💡 Consistency is key!`
                        : `Pozisyonun %${firstClosePercent}'ini kapattınız (hedef: %${targetPercent}). Daha fazla garantili kâr aldınız ama runner potansiyelinizi azalttınız.\n\n💡 Tutarlılık anahtardır!`
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
                title: this.t('success_target_title'),
                message: this.t('target_growth_msg', {
                    targetGrowth: this.settings.targetGrowth,
                    netProfit: this.formatCurrency(netProfit)
                })
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
                    title: this.t('super_runner_title'),
                    message: this.t('super_runner_msg', {
                        maxRRR: maxRRR.toFixed(1),
                        lossesCompensated: lossesCompensated,
                        profitLoss: this.formatCurrency(trade.profitLoss)
                    })
                };
            }
        }

        // Consecutive Losses
        if (consecutiveLosses >= 3) {
            return {
                type: 'warning',
                icon: '⚠️',
                title: this.t('discipline_title'),
                message: this.t('consecutive_loss_msg', { consecutiveLosses: consecutiveLosses })
            };
        }

        // Too Many BE/Low RRR
        if (beCount >= 3 && this.getAverageRRR() < 2.5) {
            return {
                type: 'info',
                icon: '💡',
                title: this.t('increase_runner_title'),
                message: this.t('be_shield_msg', {
                    beCount: beCount,
                    avgRRR: this.getAverageRRR().toFixed(2)
                })
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

    async addTrade(tradeData) {
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

    async clearAllTrades() {
        if (confirm(this.t('confirm_clear_trades'))) {
            this.trades = [];
            this.saveTrades();

            this.refreshUI();
            this.showNotification(this.t('trades_cleared_notification'), 'info');
        }
    }

    async deleteTrade(tradeId) {
        if (confirm(this.t('confirm_delete_trade'))) {
            this.trades = this.trades.filter(t => t.id !== tradeId);
            this.recalculateBalances();
            this.saveTrades();

            this.refreshUI();
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
            document.getElementById('targetBadge').textContent = this.t('free_mode');

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
                document.getElementById('currentProfit').previousElementSibling.textContent = this.t('net_growth');
                // Update value
                document.getElementById('currentProfit').textContent = this.formatCurrency(this.getNetProfit());
                // Update sublabel
                const progress = this.settings.initialCapital > 0
                    ? (this.getNetProfit() / this.settings.initialCapital) * 100
                    : 0;
                document.getElementById('profitChange').textContent = this.t('target_growth_percentage', { progress: progress.toFixed(2) });
                document.getElementById('profitChange').className = progress >= 0 ? 'card-sublabel text-success' : 'card-sublabel text-danger';
            }

            document.getElementById('progressLabel').textContent = this.t('growth_progress');

        } else {
            // CHALLENGE MODE - Restore Standard View
            if (card1) card1.style.display = 'flex';
            if (card3) card3.style.display = 'flex';
            if (card2) {
                card2.style.display = 'flex';
                document.getElementById('currentProfit').previousElementSibling.textContent = this.t('net_profit_loss');
            }

            // Restore Grid
            if (targetGrid) {
                targetGrid.style.gridTemplateColumns = ''; // Reset to css default
                targetGrid.style.maxWidth = '';
                targetGrid.style.margin = '';
            }

            document.getElementById('targetBadge').textContent = this.getProgressPercentage() >= 100 ? this.t('completed') : this.t('active');

            // Card 1: Target
            document.getElementById('cardLabel1').textContent = this.t('targeted_profit');
            document.getElementById('targetProfit').textContent = this.formatCurrency(this.getTargetProfit());
            document.getElementById('cardSub1').textContent = this.t('target_growth_percentage_full', { targetGrowth: this.settings.targetGrowth });

            // Card 3: Remaining
            document.getElementById('cardLabel3').textContent = this.t('remaining_to_target');
            document.getElementById('remainingProfit').textContent = this.formatCurrency(this.getRemainingProfit());

            const estimatedTrades = typeof this.getEstimatedTradesNeeded === 'function' ? this.getEstimatedTradesNeeded() : null;
            if (this.trades.length === 0) {
                document.getElementById('remainingTrades').textContent = this.t('no_trades_yet');
            } else if (this.getRemainingProfit() <= 0) {
                document.getElementById('remainingTrades').textContent = this.t('target_completed');
            } else if (!estimatedTrades || estimatedTrades <= 0) {
                // Show remaining amount instead of "calculating"
                const remaining = this.getRemainingProfit();
                const avgProfit = this.getAverageProfit();
                if (avgProfit > 0) {
                    const needed = Math.ceil(remaining / avgProfit);
                    document.getElementById('remainingTrades').textContent = this.t('trades_needed', { count: needed });
                } else {
                    document.getElementById('remainingTrades').textContent = this.formatCurrency(remaining) + ' ' + this.t('remaining_to_target').toLowerCase();
                }
            } else {
                document.getElementById('remainingTrades').textContent = this.t('trades_needed', { count: estimatedTrades });
            }

            document.getElementById('progressLabel').textContent = this.t('completion_rate');
        }

        // Progress Container
        const progressContainer = document.querySelector('.progress-container');

        if (isFreeMode) {
            if (progressContainer) progressContainer.style.display = 'none';
        } else {
            if (progressContainer) progressContainer.style.display = 'block';
        }

        // Card 2: Current Net Profit (Common)
        const netProfitValue = this.getNetProfit();
        document.getElementById('currentProfit').textContent = this.formatCurrency(netProfitValue);


        // Progress Calculation
        let progress = 0;
        if (isFreeMode) {
            // Growth Percentage (Unlimited)
            if (this.settings.initialCapital > 0) {
                progress = (netProfitValue / this.settings.initialCapital) * 100;
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
        const profitChangeEl = document.getElementById('profitChange');
        if (netProfitValue > 0) {
            profitChangeEl.textContent = this.t('gain_amount', { amount: this.formatCurrency(netProfitValue) });
            profitChangeEl.className = 'card-sublabel text-success';
        } else if (netProfitValue < 0) {
            profitChangeEl.textContent = this.t('loss_amount', { amount: this.formatCurrency(netProfitValue) });
            profitChangeEl.className = 'card-sublabel text-danger';
        } else {
            profitChangeEl.textContent = this.t('starting');
            profitChangeEl.className = 'card-sublabel';
        }

        // Target Badge & Share Button Logic
        const targetBadge = document.getElementById('targetBadge');

        if (isFreeMode) {
            // Free Mode: No "completion", always active. No share button for completion.
            targetBadge.textContent = this.t('free_mode');
            targetBadge.style.background = 'rgba(88, 166, 255, 0.15)';
            targetBadge.style.borderColor = 'var(--accent-primary)';
            targetBadge.style.color = 'var(--accent-primary)';

            // Ensure share button is removed
            const shareBtn = document.getElementById('shareChallengeBtn');
            if (shareBtn) shareBtn.remove();

        } else {
            // Challenge Mode Logic
            if (progress >= 100) {
                targetBadge.textContent = this.t('completed');
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
                        shareBtn.innerHTML = this.t('share_challenge');

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
                targetBadge.textContent = this.t('active');
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
        document.getElementById('winRateDetail').textContent = this.t('win_rate_detail', { wins: wins, totalTrades: this.trades.length });

        const avgRRR = this.getAverageRRR();
        document.getElementById('avgRRR').textContent = `${avgRRR.toFixed(2)}R`;
        document.getElementById('rrrDetail').textContent = this.t('winning_trades_detail', { wins: wins });

        document.getElementById('netProfitLoss').textContent = this.formatCurrency(netProfitValue);
        const profitDetailEl = document.getElementById('profitDetail');
        profitDetailEl.textContent = this.t('total_trades_detail', { count: this.trades.length });
        if (netProfitValue > 0) {
            profitDetailEl.parentElement.querySelector('.metric-value').classList.add('positive');
            profitDetailEl.parentElement.querySelector('.metric-value').classList.remove('negative');
        } else if (netProfitValue < 0) {
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
                    <p>${this.t('no_trades')}</p>
                    <small>${this.t('add_first_trade')}</small>
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
        document.getElementById('paginationInfo').textContent = `${this.t('page')} ${this.currentPage} / ${totalPages}`;
        document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
        document.getElementById('nextPageBtn').disabled = this.currentPage === totalPages;

        container.innerHTML = pageTrades.map((trade, index) => {
            const tradeNumber = sortedTrades.length - (start + index);

            const resultTranslate = {
                'win': this.t('win_trade'),
                'loss': this.t('loss_trade'),
                'be': this.t('be_trade')
            };
            const resultEmoji = {
                'win': '✅',
                'loss': '❌',
                'be': '⚖️'
            };
            const resultText = `${resultEmoji[trade.result]} ${resultTranslate[trade.result]}`;

            const resultClass = trade.result;

            // Strategy compliance badge
            let strategyBadge = '';
            if (!trade.breakdown?.isMultiTP && (trade.result === 'win' || trade.result === 'be') && trade.breakdown) {
                const rrrDiff = Math.abs((trade.breakdown.firstCloseRRR || 0) - this.settings.rLevel);
                const percentDiff = Math.abs((trade.breakdown.firstClosePercent || 0) - this.settings.lockPercentage);

                if (rrrDiff <= 0.1 && percentDiff <= 5) {
                    strategyBadge = `<span class="strategy-badge compliant">✅ ${this.t('strategy_compliant')}</span>`;
                } else {
                    strategyBadge = `<span class="strategy-badge deviated">⚠️ ${this.t('strategy_deviated')}</span>`;
                }
            } else if (trade.breakdown?.isMultiTP) {
                strategyBadge = `<span class="strategy-badge compliant">🔄 Multi-TP</span>`;
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
                        <div class="breakdown-title">${this.t('multi_tp_title')}</div>
                        ${rowsHTML}
                        <div class="breakdown-total">
                            <span>${this.t('total_profit_label')} (%${trade.breakdown.totalPercent}):</span>
                            <span class="positive">+${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            } else if (trade.result === 'win' && trade.breakdown) {
                breakdownHTML = `
                    <div class="trade-breakdown">
                        <div class="breakdown-title">${this.t('profit_distribution_title')}</div>
                        <div class="breakdown-item">
                            <span>${this.t('starting')} (${trade.breakdown.firstCloseRRR.toFixed(1)}R @ %${trade.breakdown.firstClosePercent}):</span>
                            <span class="positive">+${this.formatCurrency(trade.breakdown.firstClose)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Runner (${trade.breakdown.runnerCloseRRR.toFixed(1)}R @ %${trade.breakdown.runnerPercent.toFixed(0)}):</span>
                            <span class="positive">+${this.formatCurrency(trade.breakdown.runnerClose)}</span>
                        </div>
                        <div class="breakdown-total">
                            <span>${this.t('total_profit_label')}</span>
                            <span class="positive">+${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            } else if (trade.result === 'be' && trade.breakdown) {
                breakdownHTML = `
                    <div class="trade-breakdown">
                        <div class="breakdown-title">${this.t('partial_profit_title')}</div>
                        <div class="breakdown-item">
                            <span>${this.t('starting')} (${trade.breakdown.firstCloseRRR.toFixed(1)}R @ %${trade.breakdown.firstClosePercent}):</span>
                            <span class="positive">+${this.formatCurrency(trade.breakdown.firstClose)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Runner (Entry):</span>
                            <span>${this.formatCurrency(trade.breakdown.runnerClose)}</span>
                        </div>
                        <div class="breakdown-total">
                            <span>${this.t('net_result')}</span>
                            <span class="positive">+${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            } else if (trade.result === 'loss') {
                breakdownHTML = `
                    <div class="trade-breakdown">
                        <div class="breakdown-title">${this.t('loss_title')}</div>
                        <div class="breakdown-item">
                            <span>${this.t('stop_loss')}</span>
                            <span class="negative">${this.formatCurrency(trade.profitLoss)}</span>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="trade-item ${trade.result}">
                    <div class="trade-main-info">
                        <div class="trade-id-row">
                            <span class="trade-number">#${tradeNumber} ${trade.pair ? `• ${trade.pair}` : ''}</span>
                        </div>
                        ${trade.direction ? `
                        <div class="trade-direction-row">
                            <span class="direction-text ${trade.direction}">${trade.direction === 'long' ? this.t('long_option') : this.t('short_option')}</span>
                        </div>` : ''}
                        
                        <div class="trade-action-bar">
                            <div class="trade-badges">
                                <span class="trade-result-badge ${resultClass}">${resultText}</span>
                                ${strategyBadge}
                            </div>
                            <div class="trade-quick-actions">
                                ${trade.chartUrl ? `<a href="${trade.chartUrl}" target="_blank" class="chart-btn" title="${this.t('view_chart_title')}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </a>` : ''}
                                ${!this.isReadOnly ? `
                                <button class="delete-icon-btn" onclick="tradingSystem.deleteTrade(${trade.id})" title="${this.t('delete_trade_title')}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="trade-divider"></div>

                    <div class="trade-details-v2">
                        <div class="detail-group">
                            <span class="detail-label">${this.t('date_label')}</span>
                            <span class="detail-value">${this.formatDate(trade.timestamp)}</span>
                        </div>
                        <div class="detail-group">
                            <span class="detail-label">${this.t('final_balance')}</span>
                            <span class="detail-value highlight">${this.formatCurrency(trade.balance)}</span>
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

        // Calendar Navigation
        const prevMonthBtn = document.getElementById('prevMonth');
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
                this.renderTradeCalendar();
            });
        }

        const nextMonthBtn = document.getElementById('nextMonth');
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
                this.renderTradeCalendar();
            });
        }

        // Calendar Expand/Collapse Toggle
        const toggleCalendar = document.getElementById('toggleCalendar');
        const calendarSection = document.getElementById('tradeCalendarSection');
        if (toggleCalendar && calendarSection) {
            toggleCalendar.addEventListener('click', () => {
                calendarSection.classList.toggle('calendar-section-collapsed');
            });
        }
    }

    openShareModal(mode = 'share') {
        const link = this.generateShareLink();
        document.getElementById('shareLinkInput').value = link;

        const titleEl = document.getElementById('shareModalTitle');
        const iconEl = document.getElementById('shareModalIcon');
        const headingEl = document.getElementById('shareModalHeading');
        const msgEl = document.getElementById('shareModalMessage');
        const newChallengeSection = document.getElementById('newChallengeSection');

        if (mode === 'win') {
            titleEl.textContent = this.t('success_target_title');
            iconEl.textContent = '🎉';
            headingEl.textContent = this.t('target_growth_msg').split('.')[0];
            msgEl.innerHTML = `${this.t('share_msg')}<br><br><small class="text-warning">${this.t('snapshot_warning')}</small>`;

            if (newChallengeSection) newChallengeSection.style.display = 'block';
        } else {
            titleEl.textContent = this.t('share_title');
            iconEl.textContent = '📈';
            headingEl.textContent = this.t('share_heading');
            msgEl.innerHTML = `${this.t('share_msg')}<br><br><small class="text-warning">${this.t('snapshot_warning')}</small>`;

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

        const symbol = this.settings.currency === 'USD' ? '$' : '₺';
        row.innerHTML = `
            <div class="form-group">
                <input type="number" class="tp-rrr" placeholder="${this.t('rrr_placeholder')}" step="0.1" required>
            </div>
            <div class="form-group">
                <input type="number" class="tp-percent" placeholder="${this.t('percent_placeholder')}" max="100" required>
            </div>
            ${isManualMode ? `
            <div class="form-group" style="flex: 1.5;">
                <input type="number" class="tp-profit" placeholder="${this.t('profit_placeholder', { symbol: symbol })}" step="0.01" required>
            </div>` : ''}
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
        this.refreshUI();

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

        // Language and Currency
        if (document.getElementById('appLanguage')) {
            document.getElementById('appLanguage').value = this.settings.language || 'tr';
        }
        if (document.getElementById('appCurrency')) {
            document.getElementById('appCurrency').value = this.settings.currency || 'TRY';
        }

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
                modeDesc.textContent = this.t('free_mode_desc');
                modeDesc.style.color = '#2ea043';
            } else {
                modeDesc.textContent = this.t('challenge_mode_desc');
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
            accountMode: accountMode,
            language: document.getElementById('appLanguage').value,
            currency: document.getElementById('appCurrency').value
        };

        // Validation (Allow 0 or more)
        if (newSettings.initialCapital < 0) {
            alert(this.t('validation_capital_negative'));
            return;
        }

        if (accountMode === 'challenge') {
            if (newSettings.targetGrowth < 1 || newSettings.targetGrowth > 1000) {
                alert(this.t('validation_growth_range'));
                return;
            }
        } else {
            // Free mode default target (needed for calculations not to break)
            newSettings.targetGrowth = 100;
            // Force manual mode as true in Free Mode
            newSettings.manualMode = true;
        }

        if (newSettings.riskPerTrade < 0.1 || newSettings.riskPerTrade > 5) {
            alert(this.t('validation_risk_range'));
            return;
        }

        // Check if initial capital changed
        if (newSettings.initialCapital !== this.settings.initialCapital && this.trades.length > 0) {
            if (!confirm(this.t('validation_capital_change'))) {
                return;
            }
        }

        this.settings = newSettings;
        this.saveSettings();
        this.updateStaticTranslations();
        this.refreshUI();
        this.closeSettingsModal();
        this.showNotification(this.t('notification_settings_saved'), 'success');
    }

    resetSettings() {
        if (confirm(this.t('confirm_reset_settings'))) {
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

            this.updateStaticTranslations();
            this.updateDashboard();
            this.renderTradeHistory();
            this.showNotification(this.t('settings_reset_success'), 'success');
        }
    }

    performFullReset() {
        const btn = document.getElementById('clearAllData');
        const isConfirming = btn.getAttribute('data-confirming') === 'true';

        // Check if already in confirmation state
        if (!isConfirming) {
            // First click: Ask for confirmation
            const originalText = btn.innerText;
            btn.innerText = this.t('are_you_sure');
            btn.setAttribute('data-confirming', 'true');
            btn.classList.add('confirm-state');

            // Reset button text after 3 seconds if not clicked again
            setTimeout(() => {
                if (document.getElementById('clearAllData')) { // Check if element still exists
                    btn.innerText = this.t('reset_all_data');
                    btn.setAttribute('data-confirming', 'false');
                    btn.classList.remove('confirm-state');
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
        this.refreshUI();
        this.closeSettingsModal();

        // Reset button text
        btn.innerText = this.t('reset_all_data');
        btn.setAttribute('data-confirming', 'false');
        btn.classList.remove('confirm-state');

        this.showNotification(this.t('system_reset_success'), 'success');
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



    // ===================================
    // TRADE CALENDAR SYSTEM
    // ===================================

    calculateDailyPnL() {
        const dailyPnL = {};
        this.trades.forEach(trade => {
            const date = new Date(trade.timestamp);
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            if (!dailyPnL[dateKey]) dailyPnL[dateKey] = 0;
            dailyPnL[dateKey] += trade.profitLoss;
        });
        return dailyPnL;
    }

    renderTradeCalendar() {
        const container = document.getElementById('pnlCalendar');
        const monthYearLabel = document.getElementById('currentMonthYear');
        if (!container || !monthYearLabel) return;

        const date = this.currentCalendarDate;
        const year = date.getFullYear();
        const month = date.getMonth();

        // Label update
        const monthName = date.toLocaleString(this.settings.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' });
        monthYearLabel.textContent = `${monthName} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyPnL = this.calculateDailyPnL();

        const dayNames = this.settings.language === 'tr'
            ? ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ']
            : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        // Adjust for Monday start (0=Sun, 1=Mon... -> 0=Mon, 6=Sun)
        let firstDayIndex = (firstDay === 0) ? 6 : firstDay - 1;

        let html = '<div class="calendar-grid">';

        // Headers
        dayNames.forEach(day => {
            html += `<div class="calendar-header-day">${day}</div>`;
        });

        // Empty cells for first week
        for (let i = 0; i < firstDayIndex; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        const today = new Date();
        const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${month}-${day}`;
            const pnl = dailyPnL[dateKey] || 0;
            const isToday = todayKey === dateKey;

            let statusClass = '';
            if (pnl > 0) statusClass = 'profit';
            else if (pnl < 0) statusClass = 'loss';

            // Format PnL text (e.g. +500 or -500, but use formatCurrency)
            let pnlText = '';
            if (pnl !== 0) {
                const formatted = this.formatCurrency(Math.abs(pnl));
                pnlText = (pnl > 0 ? '+' : '-') + formatted;
            }

            html += `
                <div class="calendar-day ${statusClass} ${isToday ? 'today' : ''}">
                    <div class="day-number">${day}</div>
                    <div class="day-profit">${pnlText}</div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    renderPairStats() {
        const container = document.getElementById('pairStatsContainer');
        if (!container) return;

        if (this.trades.length === 0) {
            container.innerHTML = `<div class="empty-stats">${this.t('no_trades')}</div>`;
            return;
        }

        const stats = {};
        this.trades.forEach(t => {
            const pair = (t.pair || "OTH").toUpperCase();
            if (!stats[pair]) stats[pair] = { count: 0, profit: 0, wins: 0 };
            stats[pair].count++;
            stats[pair].profit += t.profitLoss;
            if (t.result === 'win') stats[pair].wins++;
        });

        const sortedByCount = Object.entries(stats).sort((a, b) => b[1].count - a[1].count).slice(0, 3);
        const sortedByProfit = Object.entries(stats).sort((a, b) => b[1].profit - a[1].profit).slice(0, 3);
        const sortedByWinRate = Object.entries(stats)
            .filter(a => a[1].count >= 2) // En az 2 işlem
            .sort((a, b) => (b[1].wins / b[1].count) - (a[1].wins / a[1].count))
            .slice(0, 3);

        let html = `
            <div class="stats-sidebar-inner">
                <div class="stats-group">
                    <div class="stats-group-title">${this.t('most_traded')}</div>
                    ${sortedByCount.map(([pair, s]) => `
                        <div class="stats-row">
                            <span class="stats-pair">${pair}</span>
                            <span class="stats-value">${s.count} ${this.t('trades_label')}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="stats-group">
                    <div class="stats-group-title">${this.t('top_profit')}</div>
                    ${sortedByProfit.map(([pair, s]) => `
                        <div class="stats-row">
                            <span class="stats-pair">${pair}</span>
                            <span class="stats-value ${s.profit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(s.profit)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="stats-group">
                    <div class="stats-group-title">${this.t('top_winrate')}</div>
                    ${sortedByWinRate.map(([pair, s]) => `
                        <div class="stats-row">
                            <span class="stats-pair">${pair}</span>
                            <span class="stats-value">${((s.wins / s.count) * 100).toFixed(0)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const locale = this.settings.language === 'en' ? 'en-US' : 'tr-TR';
        return new Intl.DateTimeFormat(locale, {
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

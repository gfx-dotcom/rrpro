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
        this.currentChartPeriod = '1m'; // Default period filter

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
            targetBaseCapital: 54000, // Varsayılan hedef baz sermaye
            targetGrowth: 8,
            riskPerTrade: 0.5,
            rLevel: 1.2,
            lockPercentage: 70,
            manualMode: true, // Manuel mod varsayılan açık
            accountMode: 'challenge',
            archiveName: 'RUNNER TRADER JOURNAL',
            language: 'en',
            currency: 'USD'
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
            trade_item_label: "{count}. İşlem",
            select_option: "Seçiniz...",
            long_option: "Long (+)",
            short_option: "Short (-)",
            loss_sl: "Stop Loss (-)",
            be_emoji: "Break Even (0)",
            win_emoji: "Take Profit (+)",
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
            performance_analysis: "PERFORMANCE ANALYSIS",
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
            rrr_placeholder: "R",
            percent_placeholder: "%",
            profit_placeholder: "Kar ({symbol})",
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
            close_account_confirm: "DİKKAT: Mevcut dönemi kapatmak üzeresiniz.\n\n1. Tüm işlemleriniz PDF ve EXCEL olarak indirilecek.\n2. İşlem geçmişiniz sıfırlanacak.\n3. Mevcut bakiyeniz yeni dönemin başlangıç sermayesi olacak.\n\nOnaylıyor musunuz?",
            restore_backup_confirm: "⚠️ DİKKAT!\n\nMevcut tüm verileriniz (trade'ler, ayarlar, profiller) yedeğe göre değiştirilecektir.\n\nYedek Tarihi: {date}\n\nDevam etmek istiyor musunuz?",
            restore_backup_success: "✅ Yedek başarıyla geri yüklendi! Tüm trade'ler, ayarlar ve profiller geri geldi. Sayfa yenileniyor...",
            restore_backup_error: "❌ Yedek dosyası geçersiz veya bozuk! Geri yükleme başarısız.",
            backup_restore_title: "Yedekleme & Geri Yükleme",
            backup_restore_desc: "Tüm trade verilerinizi, ayarlarınızı ve profillerinizi JSON dosyası olarak yedekleyip geri yükleyebilirsiniz.",
            backup_download: "Yedeği İndir (JSON)",
            backup_restore: "Yedeği Geri Yükle",
            reset_settings: "Varsayılan Ayarlar",
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
            economic_calendar_title: "📅 EKONOMİK TAKVİM",
            welcome_modal_title: "🎯 RR Pro'ya Hoşgeldiniz!",
            welcome_intro: "Profesyonel Trading Performans Takip Sistemine sadece birkaç adımda başlayın.",
            welcome_account_mode: "⚖️ Hesap Modunu Seçin",
            welcome_challenge_desc: "Prop firmalarının kurallarına göre hedeflenen karı belirli bir sürede yapmaya çalışın.",
            welcome_free_desc: "Hedef olmadan sadece performansınızı ve büyümenizi takip edin.",
            welcome_settings: "⚙️ Başlangıç Ayarlarını Yapın",
            welcome_scenario: "📝 Örnek Senaryo",
            welcome_dont_show: "Bir daha gösterme",
            welcome_start_btn: "Jurnale Başla 🚀",
            welcome_step1_desc: "Ayarlar kısmında <strong>2 çeşit hesap türü</strong> bulunmaktadır:",
            welcome_step2_desc: "<strong>Challenge modu</strong> için başlangıç sermaye ve hedef büyüme oranını girin:",
            welcome_step3_header: "Journal Tutmaya Başlayın",
            welcome_step3_desc: "Ayarlarınızı yaptıktan sonra <strong>'Kaydet'</strong> butonuna tıklayarak journal tutmaya başlayabilirsiniz!",
            welcome_example_status: "<strong>Durum:</strong> 50K hesabınız var ama siteyi 51K'da buldunuz.",
            welcome_solution: "💡 <strong>Örnek:</strong> 50K Phase 1 hesabınız var ve 51,000'desiniz. Geçmek için 54,000 yani %8 büyüme gerek.<br><strong>Ayarlar:</strong> Başlangıç Sermayesi: 51,000 → Hedeflenen Sermaye: 54,000 → Büyüme Oranı: %8<br><br>👉 En özgür şekilde ilerlemek için manuel modu aktif ediniz.",
            welcome_card_challenge_title: "Challenge (Hedef Odaklı)",
            welcome_card_challenge_desc: "Prop firm challenge veya hedef odaklı trading için idealdir.",
            welcome_card_free_title: "Serbest (Sadece Takip)",
            welcome_card_free_desc: "Broker veya live hesap takibi için idealdir.",
            welcome_example_list_start: "<strong>Başlangıç Sermayesi:</strong> 51,000 ₺ (Mevcut Bakiye)",
            welcome_example_list_target: "<strong>Hedef:</strong> 54,000 ₺ - Büyüme Oranı %8 (Aşama % kaçta geçiliyorsa)",
            welcome_feature_1: "Real-time performans takibi",
            welcome_feature_2: "Otomatik risk/ödül hesaplama",
            welcome_feature_3: "Takvim ve analiz araçları",
            welcome_feature_4: "Hedef takibi ve raporlama",
            win_rate_label: "Kazanma Oranı",
            winrate_final_label: "Winrate",
            target_label: "Hedef",
            net_pnl_label: "Net Kar/Zarar",
            max_dd_label: "Düşüş",
            remaining_suffix: "kaldı",
            max_dd_sublabel: "Zirveden düşüş",
            backup_download: "⬇️ Yedeği İndir",
            backup_upload: "⬆️ Yedeği Yükle",
            nav_home: "Ana Sayfa",
            nav_journal: "Günlük",
            nav_analysis: "Analiz",
            nav_settings: "Ayarlar",
            welcome_dont_show_label: "Bir daha gösterme",
            target_base_help_text: "⚠️ Hesaplama <strong>Hedeflenen Sermaye'ye</strong> göre yapılır. Hedef Büyüme Oranı ile uyumlu olmalıdır.<br>Örn: 50K hesap ve %8 hedef için → Hedeflenen Sermaye: 54,000, Büyüme: %8.<br><br><a href='#' onclick='document.getElementById(\"helpBtn\").click(); return false;' style='color: var(--neon-green); text-decoration: underline; font-weight: bold;'>👉 Detaylı bilgi ve örnek senaryo için buraya tıklayın.</a>",
            seo_h1_title: "TradeJournal - Profesyonel Trading Performans ve Analiz Günlüğü",
            total_balance: "Toplam Bakiye",
            period_1d: "1G",
            period_1w: "1H",
            period_1m: "1A",
            period_3m: "3A",
            period_ytd: "YTD",
            period_all: "HEPSİ",
            completion_rate: "Tamamlanma Oranı",
            chart_target_series: "Hedef",
            chart_balance_series: "Bakiye",
            chart_tooltip_starting: "Başlangıç",
            trade_item_label: "İşlem {count}"
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
            target_growth_msg: "CONGRATS! You have reached your growth target. Set a new target or withdraw your profit.",
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
            rrr_placeholder: "R",
            percent_placeholder: "%",
            profit_placeholder: "Profit ({symbol})",
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
            economic_calendar_title: "📅 ECONOMIC CALENDAR",
            welcome_modal_title: "🎯 Welcome to RR Pro!",
            welcome_intro: "Start using the Professional Trading Performance Tracker in just a few steps.",
            welcome_account_mode: "⚖️ Select Account Mode",
            welcome_challenge_desc: "Try to reach a specific profit target within a certain time according to prop firm rules.",
            welcome_free_desc: "Track your performance and growth without any targets.",
            welcome_settings: "⚙️ Configure Initial Settings",
            welcome_scenario: "📝 Example Scenario",
            welcome_dont_show: "Don't show again",
            welcome_start_btn: "Start Journal 🚀",
            welcome_step1_desc: "There are <strong>2 account types</strong> in the settings:",
            welcome_step2_desc: "Enter starting capital and target growth rate for <strong>Challenge mode</strong>:",
            welcome_step3_desc: "After configuring settings, click <strong>'Save'</strong> to start journaling!",
            welcome_step3_header: "Start Journaling",
            welcome_example_status: "<strong>Scenario:</strong> You have a 50K account but found this site at 51K.",
            welcome_solution: "💡 <strong>Example:</strong> You have a 50K Phase 1 account at 51,000. To pass, you need 54,000 (8% growth).<br><strong>Settings:</strong> Initial Capital: 51,000 → Target Base Capital: 54,000 → Growth Rate: 8%<br><br>👉 Activate Manual Mode for the most flexible experience.",
            welcome_card_challenge_title: "Challenge (Target Based)",
            welcome_card_challenge_desc: "Ideal for prop firm challenges or goal-oriented trading.",
            welcome_card_free_title: "Free (Tracking Only)",
            welcome_card_free_desc: "Ideal for broker or live account tracking.",
            welcome_example_list_start: "<strong>Starting Capital:</strong> 51,000 ₺ (Current Balance)",
            welcome_example_list_target: "<strong>Target:</strong> 54,000 ₺ - Growth Rate 8% (Depending on passing requirement)",
            welcome_feature_1: "Real-time performance tracking",
            welcome_feature_2: "Automatic risk/reward calculation",
            welcome_feature_3: "Calendar and analysis tools",
            welcome_feature_4: "Goal tracking and reporting",
            win_rate_label: "Win Rate",
            winrate_final_label: "Winrate",
            target_label: "Target",
            net_pnl_label: "Net P&L",
            max_dd_label: "Max Drawdown",
            remaining_suffix: "remain",
            max_dd_sublabel: "Max DD",
            backup_download: "⬇️ Download Backup",
            backup_upload: "⬆️ Upload Backup",
            nav_home: "Home",
            nav_journal: "Journal",
            nav_analysis: "Analysis",
            nav_settings: "Settings",
            welcome_dont_show_label: "Don't show again",
            target_base_help_text: "⚠️ Calculations are based on <strong>Target Base Capital</strong>. It must be consistent with the Target Growth Rate.<br>Ex: For 50K account & 8% target → Base Capital: 54,000, Growth: 8%.<br><br><a href='#' onclick='document.getElementById(\"helpBtn\").click(); return false;' style='color: var(--neon-green); text-decoration: underline; font-weight: bold;'>👉 Click here for detailed info and example scenario.</a>",
            seo_h1_title: "TradeJournal - Professional Trading Performance and Analysis Journal",
            total_balance: "Total Balance",
            period_1d: "1D",
            period_1w: "1W",
            period_1m: "1M",
            period_3m: "3M",
            period_ytd: "YTD",
            period_all: "ALL",
            completion_rate: "Completion Rate",
            chart_target_series: "Target",
            chart_balance_series: "Balance",
            chart_tooltip_starting: "Starting",
            trade_item_label: "Trade {count}",
            backup_restore_title: "Backup & Restore",
            backup_restore_desc: "You can backup and restore all your trade data, settings, and profiles as JSON file.",
            backup_download: "Download Backup (JSON)",
            backup_restore: "Restore Backup",
            reset_settings: "Default Settings",
            close_account_desc: "Resets the account and downloads the journal as Excel/PDF.",
            close_account: "Close Account & Archive",
            close_account_confirm: "WARNING: You are about to close the current period.\n\n1. All your trades will be downloaded as PDF and EXCEL.\n2. Your trade history will be reset.\n3. Your current balance will become the initial capital for the new period.\n\nDo you confirm?",
            restore_backup_confirm: "⚠️ WARNING!\n\nAll your current data (trades, settings, profiles) will be replaced with the backup data.\n\nBackup Date: {date}\n\nDo you want to continue?",
            restore_backup_success: "✅ Backup restored successfully! All trades, settings, and profiles are back. Page reloading...",
            restore_backup_error: "❌ Backup file is invalid or corrupted! Restore failed."
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
                el.textContent = text;
            } else {
                el.innerHTML = text;
            }
        });

        // 2. Tab Navigation Translations
        const tabs = document.querySelectorAll('.tab-item');
        if (tabs.length >= 4) {
            tabs[0].textContent = isEN ? 'Dashboard' : 'Panel';
            tabs[1].textContent = isEN ? 'Journal' : 'Günlük';
            tabs[2].textContent = isEN ? 'Calendar' : 'Takvim';
            tabs[3].textContent = isEN ? 'Tools' : 'Araçlar';
        }

        // 3. Section Headers (More robust selection)
        const headers = {
            '#heroSection .hero-label': isEN ? 'Total Balance' : 'Toplam Bakiye',
            '.analytics-section .section-header h2': this.t('performance_analysis'),
            '.entry-section .section-header h2': '➕ ' + (isEN ? 'NEW TRADE' : 'YENİ İŞLEM'),
            '#tradeCalendarSection h2': '📅 ' + (isEN ? 'CALENDAR' : 'TAKVİM VE İSTATİSTİKLER'),
            '#tradeHistorySection h2': '📜 ' + (isEN ? 'HISTORY' : 'TÜM İŞLEMLER'),
            '#clearHistoryBtn': isEN ? 'Clear History' : 'Geçmişi Temizle',
            '#openCalcBtn': '🧮 ' + (isEN ? 'Calculator' : 'Hesaplayıcı'),
            '#submitTradeBtn span': isEN ? 'Save Trade' : 'İşlemi Kaydet'
        };

        Object.keys(headers).forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.textContent = headers[selector];
        });

        // Metrics Labels
        const metrics = {
            'pnl': isEN ? 'Net P&L' : 'Net P&L',
            'target': isEN ? 'Target' : 'Hedef',
            'remaining': isEN ? 'Remaining' : 'Kalan',
            'completion': isEN ? 'Completion' : 'Tamamlanma'
        };
        document.querySelectorAll('.analytic-card').forEach(card => {
            const label = card.querySelector('.card-label');
            const icon = card.querySelector('.card-icon');
            if (label && icon) {
                if (icon.classList.contains('pnl')) label.textContent = metrics.pnl;
                if (icon.classList.contains('target')) label.textContent = metrics.target;
                if (icon.classList.contains('remaining')) label.textContent = metrics.remaining;
                if (icon.classList.contains('completion')) label.textContent = metrics.completion;
            }
        });

        // Dashboard specific labels
        const compLabel = document.querySelector('.completion-label');
        if (compLabel) compLabel.textContent = isEN ? 'Completion Rate' : 'Tamamlanma Oranı';

        const chartTitle = document.querySelector('.chart-section-large h2');
        if (chartTitle) chartTitle.innerHTML = `<span style="font-size: 1.2rem;">📈</span> ` + (isEN ? 'BALANCE PROGRESSION' : 'BAKİYE İLERLEYİŞİ');

        const profileWelcome = document.querySelector('.welcome-text');
        if (profileWelcome) profileWelcome.textContent = isEN ? 'Welcome,' : 'Hoş geldin,';

        // Calculator placeholders and labels
        const calcLabels = {
            'calcRiskLabel': isEN ? `Risk Amount (${symbol})` : `Risk Miktarı (${symbol})`,
            'calcRiskHelp': isEN ? 'Amount risked per trade' : 'İşlem başına riske edilen tutar',
            'calcRRRLabel': isEN ? 'Target RRR' : 'Hedef RRR',
            'calcRRRHelp': isEN ? 'R level where you plan to take profit' : 'Kâr almayı planladığınız R seviyesi',
            'calcPercLabel': isEN ? 'Close %' : 'Kapanış %',
            'calcPercHelp': isEN ? 'Position ratio to be closed at this level' : 'Bu seviyede kapatılacak pozisyon oranı',
            'calcLotLabel': isEN ? 'Lot Size (Optional)' : 'Lot Büyüklüğü (İsteğe bağlı)',
            'calcLotHelp': isEN ? 'Total lot size in your hand' : 'Elinizdeki toplam lot miktarı',
            'calcEstimateLabel': isEN ? 'Estimated Profit' : 'Tahmini Kâr',
            'calcMt5Label': isEN ? 'For MT5 Mobile' : 'MT5 Mobil İçin',
            'calcMt5Help': isEN ? 'Lot size to be closed at this RR level' : 'Bu RR seviyesinde kapatılacak lot miktarı',
            'calculateBtn': isEN ? 'CALCULATE' : 'HESAPLA'
        };

        Object.keys(calcLabels).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = calcLabels[id];
        });

        // Update modal titles
        const modalTitles = {
            'settingsModalTitle': isEN ? '⚙️ System Settings' : '⚙️ Sistem Ayarları',
            'calcModalTitle': isEN ? '🧮 Profit Calculator' : '🧮 Hesap Makinesi',
            'shareModalTitle': isEN ? '🔗 Share Profile' : '🔗 Profili Paylaş'
        };

        Object.keys(modalTitles).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = modalTitles[id];
        });

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

        const labelChart = document.querySelector('label[for="chartUrl"]');
        if (labelChart) labelChart.textContent = this.t('chart_url');
        const inputChart = document.getElementById('chartUrl');
        if (inputChart) inputChart.placeholder = this.t('chart_link_placeholder');

        const labelResult = document.querySelector('label[for="tradeResult"]');
        if (labelResult) labelResult.textContent = this.t('trade_result');

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
                if (l.getAttribute('data-i18n')) {
                    const key = l.getAttribute('data-i18n');
                    l.textContent = this.t(key, { symbol: symbol });
                } else {
                    // Fallback for hardcoded htmlFor checks
                    if (l.htmlFor === 'archiveName') l.textContent = this.t('archive_name_label');
                    if (l.htmlFor === 'initialCapital') l.textContent = this.t('initial_capital_label', { symbol: symbol });
                    if (l.htmlFor === 'targetBaseCapital') l.textContent = this.t('target_base_label', { symbol: symbol });
                    if (l.htmlFor === 'targetGrowth') l.textContent = this.t('target_growth_label');
                    if (l.htmlFor === 'riskPerTrade') l.textContent = this.t('risk_per_trade_label');
                    if (l.htmlFor === 'rLevel') l.textContent = this.t('r_level_label');
                    if (l.htmlFor === 'lockPercentage') l.textContent = this.t('lock_percent_label');
                    if (l.htmlFor === 'appLanguage') l.textContent = this.t('language_label');
                    if (l.htmlFor === 'appCurrency') l.textContent = this.t('currency_label');
                }
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
        const activeNameSpan = document.getElementById('activeProfileNameDetail');
        if (!profileList) return;

        if (activeNameSpan) activeNameSpan.textContent = this.getActiveProfileName();
        profileList.innerHTML = '';

        this.profiles.forEach(p => {
            const item = document.createElement('div');
            item.className = `profile-item ${p.id === this.activeProfileId ? 'active' : ''}`;

            // Disable switching in read-only mode
            if (!this.isReadOnly) {
                item.onclick = () => this.switchProfile(p.id);
            } else {
                item.style.cursor = 'default';
            }

            item.innerHTML = `
                <span class="profile-item-name">📁 ${p.name}</span>
                ${(p.id !== 'default' && !this.isReadOnly) ? `
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
        this.renderRecentActivity(); // New: Recent trades list
        this.renderTradeHistory();
        this.renderProfileList();
        this.renderTradeCalendar();
        this.renderPairStats();

        // Ensure trade entry form state matches current selection
        const tradeRes = document.getElementById('tradeResult');
        if (tradeRes) {
            this.toggleTradeInputs(tradeRes.value);
        }
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
                    if (banner) banner.style.display = 'flex';
                    const style = document.createElement('style');
                    style.innerHTML = `
                        .entry-section, 
                        #shareBtn, 
                        #settingsBtn, 
                        #clearHistoryBtn, 
                        .delete-trade-btn, 
                        .delete-icon-btn, 
                        #openCalcBtn, 
                        #addProfileBtn, 
                        .delete-profile-btn, 
                        #fabAddBtn,
                        [data-tab="tools"],
                        #navStats,
                        #navJournal,
                        #navSettings { display: none !important; }
                        .user-profile { cursor: default !important; pointer-events: none !important; }
                    `;
                    document.head.appendChild(style);

                    const profileName = s.n || urlParams.get('profile') || 'Shared Profile';
                    document.title = `${profileName} | Runner Tracker`;
                    const nameEl = document.getElementById('activeProfileNameDetail');
                    if (nameEl) nameEl.textContent = profileName;
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
                    if (banner) banner.style.display = 'flex';
                    const style = document.createElement('style');
                    style.innerHTML = `
                        .entry-section, 
                        #shareBtn, 
                        #settingsBtn, 
                        #clearHistoryBtn, 
                        .delete-trade-btn, 
                        .delete-icon-btn, 
                        #openCalcBtn, 
                        #addProfileBtn, 
                        .delete-profile-btn, 
                        #fabAddBtn,
                        [data-tab="tools"],
                        #navStats,
                        #navJournal,
                        #navSettings { display: none !important; }
                        .user-profile { cursor: default !important; pointer-events: none !important; }
                    `;
                    document.head.appendChild(style);

                    // Set title with profile name
                    const profileName = s.n || urlParams.get('profile') || 'Shared Profile';
                    document.title = `${profileName} | Runner Tracker`;
                    const nameEl = document.getElementById('activeProfileNameDetail');
                    if (nameEl) nameEl.textContent = profileName;
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

        const confirmReset = confirm(this.t('close_account_confirm'));

        if (!confirmReset) return;

        try {
            this.showNotification('PDF indiriliyor...', 'info');

            // Export to PDF first
            this.exportToPDF();

            // Wait 2.5 seconds before Excel export to avoid browser blocking
            setTimeout(() => {
                this.showNotification('Excel indiriliyor...', 'info');
                this.exportToExcel();

                // Complete reset after both exports (wait another second)
                setTimeout(() => {
                    this.completeAccountReset();
                }, 1000);
            }, 2500);

        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Hata oluştu, veriler dışa aktarılamadı.', 'error');
        }
    }

    completeAccountReset() {
        // Complete Account Reset (Back to Initial Settings)
        this.settings = this.getDefaultSettings();
        this.trades = [];

        this.saveSettings();
        this.saveTrades();

        this.updateDashboard();
        this.renderTradeHistory();
        this.closeSettingsModal();

        // Reload page to reflect changes
        setTimeout(() => {
            window.location.reload();
        }, 500);
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

        // Language support
        const isEN = this.settings.language === 'en';
        const dateLocale = isEN ? 'en-US' : 'tr-TR';

        // Title and Header
        doc.setFontSize(22);
        doc.setTextColor(88, 166, 255);
        doc.text(fixTR(this.settings.archiveName || 'RUNNER TRADER JOURNAL'), 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(fixTR(isEN ? `Archive Date: ${new Date().toLocaleString(dateLocale)}` : `Arsiv Tarihi: ${new Date().toLocaleString(dateLocale)}`), 14, 28);
        doc.text(fixTR(isEN ? `Mode: ${this.settings.accountMode === 'challenge' ? 'Challenge' : 'Free'}` : `Mod: ${this.settings.accountMode === 'challenge' ? 'Challenge' : 'Serbest'}`), 14, 33);
        doc.text(fixTR(isEN ? `Initial Capital: ${this.formatCurrency(this.settings.initialCapital).replace('₺', 'TL')}` : `Baslangic Sermayesi: ${this.formatCurrency(this.settings.initialCapital).replace('₺', 'TL')}`), 14, 38);
        doc.text(fixTR(isEN ? `Final Balance: ${this.formatCurrency(this.getCurrentBalance()).replace('₺', 'TL')}` : `Final Bakiyesi: ${this.formatCurrency(this.getCurrentBalance()).replace('₺', 'TL')}`), 14, 43);

        // --- Performance Statistics Section ---
        doc.setFontSize(14);
        doc.setTextColor(88, 166, 255);
        doc.text(fixTR(isEN ? 'Performance Summary' : 'Performans Ozeti'), 140, 20);

        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(fixTR(isEN ? `Total Trades: ${this.trades.length}` : `Toplam Islem: ${this.trades.length}`), 140, 28);
        doc.text(fixTR(`Win Rate: %${this.getWinRate()}`), 140, 33);
        doc.text(fixTR(isEN ? `Net Profit: ${this.formatCurrency(this.getNetProfit()).replace('₺', 'TL')}` : `Net Kar: ${this.formatCurrency(this.getNetProfit()).replace('₺', 'TL')}`), 140, 38);
        doc.text(fixTR(`Max Drawdown: -%${Math.abs(this.calculateMaxDrawdown()).toFixed(2)}`), 140, 43);
        doc.text(fixTR(isEN ? `Average R: ${this.getAverageRRR()}R` : `Ortalama R: ${this.getAverageRRR()}R`), 140, 48);

        // --- Chart Section (Enhanced) ---
        try {
            const chartX = 14, chartY = 55, chartW = 182, chartH = 60, padding = 10;
            doc.setFillColor(22, 27, 34); doc.rect(chartX, chartY, chartW, chartH, 'F');

            const tradesAsc = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const dataPoints = [this.settings.initialCapital];
            let currentBal = this.settings.initialCapital;
            tradesAsc.forEach(t => { currentBal += t.profitLoss; dataPoints.push(currentBal); });

            if (dataPoints.length > 0) {
                const minVal = Math.min(...dataPoints);
                const maxVal = Math.max(...dataPoints);
                const range = maxVal - minVal || 1;

                doc.setFontSize(8); doc.setTextColor(139, 148, 158); doc.setDrawColor(48, 54, 61); doc.setLineWidth(0.1);
                const dl = (v, p) => {
                    const y = (chartY + chartH - padding) - (p * (chartH - 2 * padding));
                    doc.line(chartX, y, chartX + chartW, y);
                    doc.text(this.formatCurrency(v).replace('₺', 'TL'), chartX + 2, y - 2);
                };
                dl(maxVal, 1); dl(minVal, 0); if (range > 0) dl(minVal + range / 2, 0.5);

                if (dataPoints.length > 1) {
                    doc.setDrawColor(0, 255, 136); doc.setLineWidth(0.8);
                    for (let i = 0; i < dataPoints.length - 1; i++) {
                        const x1 = chartX + (i / (dataPoints.length - 1)) * chartW;
                        const y1 = (chartY + chartH - padding) - ((dataPoints[i] - minVal) / range) * (chartH - 2 * padding);
                        const x2 = chartX + ((i + 1) / (dataPoints.length - 1)) * chartW;
                        const y2 = (chartY + chartH - padding) - ((dataPoints[i + 1] - minVal) / range) * (chartH - 2 * padding);
                        doc.line(x1, y1, x2, y2);
                    }
                    doc.setFillColor(0, 255, 136);
                    doc.circle(chartX, (chartY + chartH - padding) - ((dataPoints[0] - minVal) / range) * (chartH - 2 * padding), 1.5, 'F');
                    doc.circle(chartX + chartW, (chartY + chartH - padding) - ((dataPoints[dataPoints.length - 1] - minVal) / range) * (chartH - 2 * padding), 1.5, 'F');
                }
            }
            /*
            // Draw Chart Background Box
            doc.setFillColor(22, 27, 34); // #161b22 - Dark App Background
            doc.rect(14, 55, 182, 60, 'F'); // x, y, w, h, style=Fill
    
            // Get Balance Data (Ascending)
            const tradesAsc = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            // Start with initial capital
            const balances = [this.settings.initialCapital];
            let currentBal = this.settings.initialCapital;
    
            tradesAsc.forEach(t => {
                currentBal += t.profitLoss;
                balances.push(currentBal);
            });
    
            // Draw Vector Line
            if (balances.length > 1) {
                const minVal = Math.min(...balances);
                const maxVal = Math.max(...balances);
                const range = maxVal - minVal || 1;
    
                // Styling
                doc.setDrawColor(0, 255, 136); // Neon Green
                doc.setLineWidth(0.8);
    
                const chartX = 14;
                const chartY = 55;
                const chartW = 182;
                const chartH = 60;
                const padding = 5;
    
                for (let i = 0; i < balances.length - 1; i++) {
                    // Calculate normalized coordinates
                    const x1_norm = i / (balances.length - 1);
                    const y1_norm = (balances[i] - minVal) / range;
    
                    const x2_norm = (i + 1) / (balances.length - 1);
                    const y2_norm = (balances[i + 1] - minVal) / range;
    
                    // Map to PDF coordinates (Y is inverted in PDF/Canvas usually, but here 0 is top)
                    // We want maxVal at top (chartY + padding)
                    // minVal at bottom (chartY + chartH - padding)
    
                    const x1 = chartX + (x1_norm * chartW);
                    const y1 = (chartY + chartH - padding) - (y1_norm * (chartH - 2 * padding));
    
                    const x2 = chartX + (x2_norm * chartW);
                    const y2 = (chartY + chartH - padding) - (y2_norm * (chartH - 2 * padding));
    
                    doc.line(x1, y1, x2, y2);
                }
            }
            */
        } catch (e) {
            console.error('Vector Chart Error:', e);
        }

        const tableColumn = isEN
            ? ["#", "Date", "Pair", "Direction", "Result", "P/L", "Balance", "Chart Link"]
            : ["#", "Tarih", "Parite", "Yon", "Sonuc", "Kar/Zarar", "Bakiye", "Grafik Linki"];
        const tableRows = [];

        // Sort descending (newest first)
        const sorted = [...this.trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        sorted.forEach((t, index) => {
            // Translate direction and result if English
            let direction = (t.direction || "-").toUpperCase();
            let result = t.result.toUpperCase();

            if (!isEN) {
                // Keep Turkish (already saved in Turkish)
                direction = direction;
                result = result;
            }

            tableRows.push([
                sorted.length - index,
                this.formatDate(t.timestamp),
                fixTR(t.pair || "-"),
                fixTR(direction),
                fixTR(result),
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
        // Language support
        const isEN = this.settings.language === 'en';
        const dateLocale = isEN ? 'en-US' : 'tr-TR';

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
            [isEN ? "No" : "No"]: sorted.length - index,
            [isEN ? "Date" : "Tarih"]: this.formatDate(t.timestamp),
            [isEN ? "Pair" : "Parite"]: t.pair || "-",
            [isEN ? "Direction" : "Yön"]: (t.direction || "-").toUpperCase(),
            [isEN ? "Result" : "Sonuç"]: t.result.toUpperCase(),
            [isEN ? "P/L" : "Kar/Zarar"]: t.profitLoss,
            [isEN ? "Balance" : "Bakiye"]: t.balance,
            [isEN ? "Notes" : "Notlar"]: t.notes || "",
            [isEN ? "Chart Link" : "Grafik Linki"]: t.chartUrl || ""
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Add actual hyperlinks to the cells so they are clickable
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: 8 }); // Column I (index 8) is chart link column
            const cell = worksheet[cellAddress];
            if (cell && cell.v && cell.v.startsWith('http')) {
                cell.l = { Target: cell.v, Tooltip: isEN ? "Open Chart" : "Grafiği Aç" };
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, isEN ? "Trade History" : "Islem Gecmisi");

        // --- Add Statistics Summary Sheet ---
        const statsData = [
            [(this.settings.archiveName || (isEN ? "PERFORMANCE SUMMARY" : "PERFORMANS OZETI")).toUpperCase(), ""],
            [isEN ? "Archive Date" : "Arsiv Tarihi", new Date().toLocaleString(dateLocale)],
            [isEN ? "Account Mode" : "Hesap Modu", this.settings.accountMode.toUpperCase()],
            ["", ""],
            [isEN ? "Initial Capital" : "Baslangic Sermayesi", this.settings.initialCapital],
            [isEN ? "Final Balance" : "Final Bakiyesi", this.getCurrentBalance()],
            [isEN ? "Net P/L" : "Net Kar/Zarar", this.getNetProfit()],
            ["Win Rate", `%${this.getWinRate()}`],
            ["Max Drawdown", `%${this.calculateMaxDrawdown()}`],
            [isEN ? "Average R" : "Ortalama R", this.getAverageRRR()],
            [isEN ? "Total Trades" : "Toplam Islem", this.trades.length]
        ];
        const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsSheet, isEN ? "Summary" : "Ozet");

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
        const canvas = document.getElementById('balanceChartLarge');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart to allow reconstruction
        if (this.chart) {
            this.chart.destroy();
        }

        // Chart.js Configuration
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const accentColor = isDark ? '#00ff88' : '#10b981';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = isDark ? '#8b949e' : '#64748b';

        Chart.defaults.color = textColor;
        Chart.defaults.font.family = "'Inter', sans-serif";

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: this.t('chart_balance_series'),
                        data: [],
                        borderColor: accentColor,
                        backgroundColor: (context) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return null;
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, isDark ? 'rgba(0, 255, 136, 0.2)' : 'rgba(16, 185, 129, 0.2)');
                            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                            return gradient;
                        },
                        borderWidth: 3,
                        pointBackgroundColor: accentColor,
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: accentColor,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4,
                        order: 2
                    },
                    {
                        label: this.t('chart_target_series'),
                        data: [],
                        borderColor: isDark ? 'rgba(168, 85, 247, 0.5)' : 'rgba(124, 58, 237, 0.5)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false,
                        tension: 0,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            usePointStyle: true,
                            font: { size: 11, weight: 'bold' }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: isDark ? '#0f141c' : '#ffffff',
                        titleColor: isDark ? '#e6edf3' : '#0f172a',
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 12,
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label;
                                return `${label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: gridColor },
                        border: { display: false },
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
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

        const labels = [this.t('chart_tooltip_starting'), ...sortedTrades.map((_, i) => this.t('trade_item_label', { count: i + 1 }))];
        const data = [this.settings.initialCapital, ...sortedTrades.map(t => t.balance)];

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].label = this.t('chart_balance_series');
        this.chart.data.datasets[0].data = data;

        // Challenge Mode Target Line
        if (this.settings.accountMode === 'challenge') {
            this.chart.data.datasets[1].label = this.t('chart_target_series');
            const targetBalance = this.getTargetProfit();
            const targetData = new Array(labels.length).fill(targetBalance);
            this.chart.data.datasets[1].data = targetData;
            this.chart.data.datasets[1].hidden = false;
        } else {
            this.chart.data.datasets[1].data = [];
            this.chart.data.datasets[1].hidden = true;
        }

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

    // Obsolete Duplicate Methods Removed to fix calculation logic

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
        // Simply sum all trade profits/losses
        return this.trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
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
        // Feedback system disabled by user request.
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

    getTargetProfit() {
        // If Target Base Capital is set (which acts as the explicit target amount now), use it.
        // This solves the issue where Initial Capital (51k) overrides the true target (54k).
        if (this.settings.targetBaseCapital && this.settings.targetBaseCapital > 0) {
            return this.settings.targetBaseCapital;
        }
        // Fallback
        const targetAmount = this.settings.initialCapital * (1 + this.settings.targetGrowth / 100);
        return targetAmount;
    }

    getRemainingProfit() {
        const currentBalance = this.getCurrentBalance();
        const targetProfit = this.getTargetProfit();
        return targetProfit - currentBalance;
    }

    getProgressByPeriod(period = '1m') {
        const now = new Date();
        let startDate = new Date();

        // Calculate start date based on period
        switch (period) {
            case '1d':
                startDate.setDate(now.getDate() - 1);
                break;
            case '1w':
                startDate.setDate(now.getDate() - 7);
                break;
            case '1m':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3m':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'ytd':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all':
                // Get account creation date (first trade or initial capital date)
                if (this.trades.length > 0) {
                    const sortedTrades = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    startDate = new Date(sortedTrades[0].timestamp);
                } else {
                    startDate = new Date(0); // Beginning of time if no trades
                }
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }

        // Filter trades within the period
        const periodTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.timestamp);
            return tradeDate >= startDate && tradeDate <= now;
        });

        // Calculate profit/loss for this period
        const periodProfit = periodTrades.reduce((sum, t) => sum + t.profitLoss, 0);

        // Calculate starting balance for this period
        const allTradesBeforePeriod = this.trades.filter(t => {
            const tradeDate = new Date(t.timestamp);
            return tradeDate < startDate;
        });
        const startingBalance = this.settings.initialCapital +
            allTradesBeforePeriod.reduce((sum, t) => sum + t.profitLoss, 0);

        // Calculate percentage
        if (startingBalance === 0) return 0;
        return (periodProfit / startingBalance) * 100;
    }

    triggerMatrixEffect() {
        if (typeof confetti === 'undefined') return;

        const duration = 4000;
        const end = Date.now() + duration;
        // Matrix Green Palette
        const colors = ['#00ff00', '#00cc00', '#10b981', '#34d399', '#059669'];

        (function frame() {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
                shapes: ['square'], // Matrix blocks
                scalar: 1.3,
                drift: 0,
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
                shapes: ['square'],
                scalar: 1.3,
                drift: 0,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    updateDashboard() {
        const netProfitValue = this.getNetProfit();
        const currentBalance = this.getCurrentBalance();
        const currentPeriod = this.currentChartPeriod || '1m';
        const progress = this.getProgressByPeriod(currentPeriod);
        const isCompleted = progress >= 100;

        const heroBalance = document.getElementById('heroTotalEquity');
        if (heroBalance) {
            heroBalance.textContent = this.formatCurrency(currentBalance);
            // Add color based on profit/loss
            if (netProfitValue < 0) {
                heroBalance.style.color = 'var(--neon-red)';
            } else if (netProfitValue > 0) {
                heroBalance.style.color = 'var(--neon-green)';
            } else {
                heroBalance.style.color = 'var(--text-main)';
            }
        }

        // Update period text
        const statsPeriod = document.getElementById('statsPeriod');
        const isEn = this.settings.language === 'en';
        const periodTexts = isEn ? {
            '1d': 'last 1 day',
            '1w': 'last 1 week',
            '1m': 'last 1 month',
            '3m': 'last 3 months',
            'ytd': 'this year',
            'all': 'all time'
        } : {
            '1d': 'son 1 günde',
            '1w': 'son 1 haftada',
            '1m': 'son 1 ayda',
            '3m': 'son 3 ayda',
            'ytd': 'bu yıl',
            'all': 'başlangıçtan beri'
        };
        if (statsPeriod) {
            statsPeriod.textContent = periodTexts[currentPeriod] || 'başlangıçtan beri';
        }

        const pnlPercent = document.getElementById('pnlPercent');
        if (pnlPercent) {
            pnlPercent.textContent = (progress >= 0 ? '+' : '') + progress.toFixed(1) + '%';
            const statsTrend = pnlPercent.closest('.stats-trend');
            statsTrend.className = `stats-trend ${progress >= 0 ? 'positive' : 'negative'}`;

            // Update SVG icon direction
            const svg = statsTrend.querySelector('svg polyline');
            if (svg && progress < 0) {
                // Downward arrow for loss
                svg.setAttribute('points', '23 18 13.5 8.5 8.5 13.5 1 6');
            } else if (svg) {
                // Upward arrow for profit
                svg.setAttribute('points', '23 6 13.5 15.5 8.5 10.5 1 18');
            }
        }

        const winRate = this.getWinRate();
        const maxDD = this.getMaxDrawdown();
        const totalTrades = this.trades.length;
        const winningTrades = this.trades.filter(t => t.result === 'win').length;
        const targetProfit = this.getTargetProfit();
        const remainingProfit = this.getRemainingProfit();

        const winRatioDetail = document.getElementById('winRatioDetail');
        if (winRatioDetail) winRatioDetail.textContent = `${winningTrades}/${totalTrades}`;
        const winRatePercentDetail = document.getElementById('winRatePercentDetail');
        if (winRatePercentDetail) {
            winRatePercentDetail.textContent = winRate.toFixed(1) + '%';
            winRatePercentDetail.className = `card-subvalue ${winRate >= 50 ? 'positive' : 'negative'}`;
        }

        const targetProfitDetail = document.getElementById('targetProfitDetail');
        const remainingProfitDetail = document.getElementById('remainingProfitDetail');

        if (this.settings.accountMode === 'free') {
            // Free Mode Configuration
            if (targetProfitDetail) targetProfitDetail.textContent = '∞';
            if (remainingProfitDetail) {
                remainingProfitDetail.textContent = 'Serbest Büyüme 📈';
                remainingProfitDetail.style.color = 'var(--neon-blue)';
            }
        } else {
            // Challenge Mode Configuration
            if (targetProfitDetail) targetProfitDetail.textContent = this.formatCurrency(targetProfit);

            if (remainingProfitDetail) {
                if (remainingProfit <= 0) {
                    remainingProfitDetail.textContent = 'Hedefe ulaşıldı! 🎯';
                    remainingProfitDetail.style.color = 'var(--neon-green)';
                } else {
                    remainingProfitDetail.textContent = this.formatCurrency(remainingProfit) + ' ' + this.t('remaining_suffix');
                    remainingProfitDetail.style.color = '';
                }
            }
        }

        const currentProfitDetail = document.getElementById('currentProfitDetail');
        if (currentProfitDetail) {
            currentProfitDetail.textContent = (netProfitValue >= 0 ? '+' : '') + this.formatCurrency(netProfitValue);
            currentProfitDetail.className = `card-value ${netProfitValue >= 0 ? 'positive' : 'negative'}`;
        }
        const profitChangeDetail = document.getElementById('profitChangeDetail');
        if (profitChangeDetail) {
            const totalProfitPercent = this.settings.initialCapital > 0
                ? (netProfitValue / this.settings.initialCapital) * 100
                : 0;
            profitChangeDetail.textContent = (netProfitValue >= 0 ? '↑ ' : '↓ ') + Math.abs(totalProfitPercent).toFixed(1) + '%';
            profitChangeDetail.className = `card-subvalue ${netProfitValue >= 0 ? 'positive' : 'negative'}`;
        }

        const maxDDDetail = document.getElementById('maxDDDetail');
        if (maxDDDetail) {
            maxDDDetail.textContent = maxDD.toFixed(2) + '%';
            maxDDDetail.style.color = 'var(--neon-red)';
        }

        // Calculate completion percentage for progress bar
        const targetAmount = this.getTargetProfit();
        let baseCapital = this.settings.initialCapital;

        // Advanced Calculation for Challenge Mode:
        // If the user entered a Target Base Capital (e.g. 54k) and a Growth Rate (e.g. 8%),
        // but started tracking at a higher balance (e.g. 51k), we should calculate progress 
        // based on the IMPLIED base capital (50k), not the tracking start price (51k).
        // Formula: ImpliedBase = Target / (1 + GrowthRate)
        if (this.settings.accountMode === 'challenge' && this.settings.targetGrowth > 0) {
            const impliedBase = targetAmount / (1 + (this.settings.targetGrowth / 100));

            // If implied base is smaller than initial (tracking started late), use implied base
            // e.g. 50000 < 51000 -> Use 50000 as the start point for progress bar
            if (impliedBase < baseCapital) {
                baseCapital = impliedBase;
            }
        }

        const targetGrowth = targetAmount - baseCapital;
        const currentGrowth = currentBalance - baseCapital;

        // If there's a loss relative to base, completion is 0%
        const completionPercentage = targetGrowth > 0
            ? Math.max(0, (currentGrowth / targetGrowth) * 100)
            : 0;

        const mainProgressBarFill = document.getElementById('mainProgressBarFill');
        if (mainProgressBarFill) {
            mainProgressBarFill.style.width = Math.min(100, Math.max(0, completionPercentage)) + '%';
            if (completionPercentage >= 100) {
                mainProgressBarFill.classList.add('completed');
                mainProgressBarFill.style.background = ''; // Allow CSS gradient to take over
                mainProgressBarFill.style.boxShadow = '';

                // Trigger Matrix Effect if not already celebrated
                if (!this.hasCelebrated) {
                    this.triggerMatrixEffect();
                    this.hasCelebrated = true;
                    this.showNotification(this.settings.language === 'en' ? 'CONGRATULATIONS! Target Reached! 🚀' : 'TEBRİKLER! Hedefe Ulaştınız! 🚀', 'success');
                }
            } else {
                mainProgressBarFill.classList.remove('completed');
                this.hasCelebrated = false; // Reset
                mainProgressBarFill.style.background = 'linear-gradient(90deg, var(--neon-green-glow), var(--neon-green))';
                mainProgressBarFill.style.boxShadow = '0 0 15px var(--neon-green-glow)';
            }
        }
        const mainCompletionPercent = document.getElementById('mainCompletionPercent');
        if (mainCompletionPercent) {
            mainCompletionPercent.textContent = completionPercentage.toFixed(1) + '%';
            if (completionPercentage >= 100) mainCompletionPercent.style.color = 'var(--neon-green)';
            else mainCompletionPercent.style.color = 'inherit';
        }

        this.updateCircularProgress(completionPercentage);
        this.updateChart();

        // FORCE FIX: Ensure Win Rate Label is correct
        setTimeout(() => {
            const lang = this.settings.language || 'tr';
            const correctLabel = lang === 'tr' ? "Kazanma Oranı" : "Win Rate";

            const winLabels = document.querySelectorAll('[data-i18n="winrate_final_label"]');
            winLabels.forEach(el => {
                if (el.innerHTML !== correctLabel) {
                    el.innerHTML = correctLabel;
                    el.style.visibility = "visible";
                }
            });

            // Force Fix for Max DD Label ('TAMAMLANMA' -> 'Düşüş')
            const ddLabelCorrect = lang === 'tr' ? "Düşüş" : "Max Drawdown";
            const ddLabels = document.querySelectorAll('[data-i18n="max_dd_label"]');
            ddLabels.forEach(el => {
                if (el.innerHTML !== ddLabelCorrect) {
                    el.innerHTML = ddLabelCorrect;
                }
            });
        }, 50);
    }

    // Calculate balance change percentage for a given period
    getProgressByPeriod(period) {
        if (this.trades.length === 0) return 0;

        const now = new Date();
        let startDate;

        switch (period) {
            case '1d':
                // Today from midnight (00:00:00)
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                break;
            case '1w':
                // 7 days ago from midnight
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0);
                break;
            case '1m':
                // 30 days ago from midnight
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0);
                break;
            case '3m':
                // 90 days ago from midnight
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90, 0, 0, 0);
                break;
            case 'ytd':
                startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0); // Jan 1 midnight
                break;
            case 'all':
            default:
                // All time - from first trade
                const firstTrade = [...this.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];
                if (!firstTrade) return 0;
                startDate = new Date(firstTrade.timestamp);
                break;
        }

        // Filter trades in this period
        const periodTrades = this.trades.filter(t => new Date(t.timestamp) >= startDate);

        if (periodTrades.length === 0) return 0;

        // Starting balance: total P/L before period + initial capital
        const tradesBeforePeriod = this.trades.filter(t => new Date(t.timestamp) < startDate);
        const profitBeforePeriod = tradesBeforePeriod.reduce((sum, t) => sum + t.profitLoss, 0);
        const startingBalance = this.settings.initialCapital + profitBeforePeriod;

        // Current balance
        const currentBalance = this.getCurrentBalance();

        // Change percentage
        if (startingBalance === 0) return 0;
        const change = ((currentBalance - startingBalance) / startingBalance) * 100;

        return change;
    }

    updateCircularProgress(progress) {
        const circle = document.getElementById('circleProgress');
        const text = document.getElementById('circlePercent');
        if (!circle || !text) return;

        const isCompleted = progress >= 100;
        const p = Math.min(100, Math.max(0, progress));

        circle.style.strokeDasharray = `${p}, 100`;
        circle.style.stroke = isCompleted ? 'var(--neon-red)' : 'var(--neon-green)';

        text.textContent = progress.toFixed(1) + '%';
        if (isCompleted) text.style.fill = 'var(--neon-red)';
        else text.style.fill = 'var(--text-main)';
    }

    // ==========================================
    // BACKUP & RESTORE SYSTEM
    // ==========================================

    backupAllData() {
        try {
            const backup = {
                version: '2.1',
                timestamp: new Date().toISOString(),
                data: {
                    activeProfileId: localStorage.getItem('activeProfileId'),
                    profiles: localStorage.getItem('runnerProfiles'),
                    settings: {},
                    trades: {}
                }
            };

            const profiles = JSON.parse(localStorage.getItem('runnerProfiles') || '[]');

            profiles.forEach(profile => {
                const settingsKey = `runnerSettings_${profile.id}`;
                const tradesKey = `runnerTrades_${profile.id}`;

                if (localStorage.getItem(settingsKey)) {
                    backup.data.settings[profile.id] = localStorage.getItem(settingsKey);
                }

                if (localStorage.getItem(tradesKey)) {
                    backup.data.trades[profile.id] = localStorage.getItem(tradesKey);
                }
            });

            const jsonString = JSON.stringify(backup, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TradeJournal_Backup_${new Date().toISOString().split('T')[0]}.json`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('✅ Yedek başarıyla indirildi!', 'success');

        } catch (error) {
            console.error('Backup error:', error);
            this.showNotification('❌ Yedekleme sırasında hata oluştu!', 'error');
        }
    }

    restoreAllData(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);

                if (!backup.version || !backup.data) {
                    throw new Error('Invalid backup file format');
                }

                // Get current language (use browser language if settings not loaded yet)
                const currentLang = this.settings?.language ||
                    (navigator.language.startsWith('tr') ? 'tr' : 'en');

                const backupDate = new Date(backup.timestamp).toLocaleString(
                    currentLang === 'en' ? 'en-US' : 'tr-TR'
                );

                const confirmed = confirm(
                    this.t('restore_backup_confirm', { date: backupDate })
                );

                if (!confirmed) return;

                localStorage.clear();

                if (backup.data.activeProfileId) {
                    localStorage.setItem('activeProfileId', backup.data.activeProfileId);
                }

                if (backup.data.profiles) {
                    localStorage.setItem('runnerProfiles', backup.data.profiles);
                }

                Object.keys(backup.data.settings || {}).forEach(profileId => {
                    localStorage.setItem(`runnerSettings_${profileId}`, backup.data.settings[profileId]);
                });

                Object.keys(backup.data.trades || {}).forEach(profileId => {
                    localStorage.setItem(`runnerTrades_${profileId}`, backup.data.trades[profileId]);
                });

                this.showNotification(this.t('restore_backup_success'), 'success');

                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } catch (error) {
                console.error('Restore error:', error);
                this.showNotification(this.t('restore_backup_error'), 'error');
            }
        };

        reader.onerror = () => {
            this.showNotification('❌ Dosya okunurken hata oluştu!', 'error');
        };

        reader.readAsText(file);
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivityList');
        if (!container) return;

        if (this.trades.length === 0) {
            container.innerHTML = `<div class="empty-state"><span style="opacity: 0.5;">${this.t('no_trades')}</span></div>`;
            return;
        }

        // Last 4 trades
        const recent = [...this.trades]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 4);

        container.innerHTML = recent.map(trade => {
            const isWin = trade.result === 'win';
            const isLoss = trade.result === 'loss';
            const date = new Date(trade.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="activity-item">
                    <div class="activity-left">
                        <div class="activity-icon-box ${trade.result}">
                            ${isWin ? '📈' : isLoss ? '📉' : '⚖️'}
                        </div>
                        <div class="activity-info">
                            <span class="activity-pair">${trade.pair.toUpperCase()}</span>
                            <span class="activity-meta">${trade.direction === 'long' ? 'Long' : 'Short'} • ${trade.strategyCompliant ? 'Runner' : 'Manual'}</span>
                        </div>
                    </div>
                    <div class="activity-right">
                        <span class="activity-amount ${trade.profitLoss >= 0 ? 'positive' : 'negative'}">
                            ${trade.profitLoss >= 0 ? '+' : ''}${this.formatCurrency(trade.profitLoss)}
                        </span>
                        <span class="activity-time">${timeStr}</span>
                    </div>
                </div>
            `;
        }).join('');
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

        section.style.display = 'block';
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

        container.innerHTML = pageTrades.map((trade) => {
            const isWin = trade.result === 'win';
            const isLoss = trade.result === 'loss';
            const isLong = trade.direction === 'long';

            const amountDisplay = (trade.profitLoss >= 0 ? '+' : '') + this.formatCurrency(trade.profitLoss);
            const dateObj = new Date(trade.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dayStr = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });

            // Chart Link HTML
            const chartHtml = trade.chartUrl ? `
                <a href="${trade.chartUrl}" target="_blank" class="trade-chart-link" title="${this.t('view_chart_title')}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Grafik
                </a>` : '';

            // Breakdown HTML (Multi-TP or Auto Mode Closes)
            let breakdownHtml = '';
            if (trade.breakdown) {
                if (trade.breakdown.isMultiTP && trade.breakdown.closes && trade.breakdown.closes.length > 0) {
                    breakdownHtml = `
                        <div class="trade-breakdown">
                            <div class="breakdown-header">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                Çoklu Kar Alımı:
                            </div>
                            ${trade.breakdown.closes.map((c, i) => `
                                <div class="breakdown-row">
                                    <span>TP ${i + 1} (${c.rrr.toFixed(1)}R @ %${c.percent}):</span>
                                    <span class="positive">+${this.formatCurrency(c.profit)}</span>
                                </div>
                            `).join('')}
                            <div class="breakdown-row total">
                                <span>Toplam Kar: (%${trade.breakdown.totalPercent}):</span>
                                <span class="positive">+${this.formatCurrency(trade.profitLoss)}</span>
                            </div>
                            ${trade.notes ? `
                                <div class="breakdown-row notes-row">
                                    <span class="notes-label">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                        Not:
                                    </span>
                                    <span class="notes-content">${trade.notes}</span>
                                </div>
                            ` : ''}
                        </div>
                    `;
                } else if (trade.breakdown.firstClose) {
                    // Standard Auto-Mode breakdown
                    breakdownHtml = `
                        <div class="trade-breakdown">
                            <div class="breakdown-header">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                Kâr Kilitleme (Runner):
                            </div>
                            <div class="breakdown-row">
                                <span>1. Kapanış (${trade.breakdown.firstCloseRRR.toFixed(1)}R @ %${trade.breakdown.firstClosePercent}):</span>
                                <span class="positive">+${this.formatCurrency(trade.breakdown.firstClose)}</span>
                            </div>
                            <div class="breakdown-row">
                                <span>Runner (${trade.breakdown.runnerCloseRRR.toFixed(1)}R @ %${trade.breakdown.runnerPercent}):</span>
                                <span class="${trade.breakdown.runnerClose >= 0 ? 'positive' : 'negative'}">
                                    ${trade.breakdown.runnerClose >= 0 ? '+' : ''}${this.formatCurrency(trade.breakdown.runnerClose)}
                                </span>
                            </div>
                            <div class="breakdown-row total">
                                <span>Toplam Kar:</span>
                                <span class="${trade.profitLoss >= 0 ? 'positive' : 'negative'}">
                                    ${trade.profitLoss >= 0 ? '+' : ''}${this.formatCurrency(trade.profitLoss)}
                                </span>
                            </div>
                            ${trade.notes ? `
                                <div class="breakdown-row notes-row">
                                    <span class="notes-label">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                        Not:
                                    </span>
                                    <span class="notes-content">${trade.notes}</span>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }
            }

            return `
                <div class="trade-item ${trade.result}" onclick="this.classList.toggle('expanded')">
                    <div class="trade-main-row">
                        <div class="trade-pair-info">
                            <div class="trade-type-icon ${trade.direction} ${trade.result}-icon">
                                ${trade.result === 'be' ? '⚖️' : (trade.result === 'loss' ? '🛑' : (isLong ? '🔼' : '🔻'))}
                            </div>
                            <div class="pair-details">
                                <div class="pair-name-row">
                                    <span class="trade-pair-name">${trade.pair.toUpperCase()}</span>
                                    ${chartHtml}
                                </div>
                                <div class="trade-meta">
                                    <span class="direction-badge ${trade.direction}">${trade.direction === 'long' ? 'LONG' : 'SHORT'}</span>
                                    <span class="meta-dot"></span>
                                    <span class="trade-date">${dayStr}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="trade-right">
                            <div class="trade-value-group">
                                <div class="result-amount ${trade.profitLoss >= 0 ? 'positive' : 'negative'}">${amountDisplay}</div>
                                <div class="trade-time">${timeStr}</div>
                            </div>
                            <div class="expand-chevron">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <path d="M6 9l6 6 6-6"></path>
                                </svg>
                            </div>
                            ${!this.isReadOnly ? `
                            <button class="delete-icon-btn" onclick="event.stopPropagation(); tradingSystem.deleteTrade(${trade.id})" title="${this.t('delete_trade_title')}">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                    ${breakdownHtml}
                    ${!breakdownHtml && trade.notes ? `
                        <div class="trade-breakdown">
                            <div class="breakdown-row notes-row">
                                <span class="notes-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    Not:
                                </span>
                                <span class="notes-content">${trade.notes}</span>
                            </div>
                        </div>
                    ` : ''}
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
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // NEW PROFILE SWITCHER (Header Avatar)
        const profileTrigger = document.getElementById('profileSwitcherTrigger');
        const profileDropdown = document.getElementById('profileDropdown');
        const addProfileBtn = document.getElementById('addProfileBtn');

        if (profileTrigger && profileDropdown) {
            profileTrigger.addEventListener('click', (e) => {
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

        // TAB NAVIGATION
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const targetId = tab.getAttribute('href');
                if (targetId && targetId !== '#') {
                    // Smooth scroll to target if it exists
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else if (tab.dataset.tab === 'dashboard') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        // Settings Modal
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }

        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeSettingsModal();
            });
        }

        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.closeSettingsModal();
            });
        }

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
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettingsFromForm();
            });
        }

        // Account Mode Toggle Listener
        document.getElementsByName('accountMode').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateSettingsVisibility();
            });
        });

        // Segmented Controls
        const setupSegment = (containerId, inputId, onToggle = null) => {
            const container = document.getElementById(containerId);
            const input = document.getElementById(inputId);
            if (!container || !input) return;

            container.querySelectorAll('.segmented-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    container.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    input.value = btn.dataset.value;
                    if (onToggle) onToggle(btn.dataset.value);
                });
            });
        };

        setupSegment('directionSegment', 'tradeDirection');
        setupSegment('resultSegment', 'tradeResult', (val) => this.toggleTradeInputs(val));

        // FAB Button
        const fabBtn = document.getElementById('fabAddBtn');
        if (fabBtn) {
            fabBtn.addEventListener('click', () => {
                document.querySelector('.entry-section').scrollIntoView({ behavior: 'smooth' });
                document.getElementById('tradePair').focus();
            });
        }

        // Bottom Nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                if (item.id === 'navStats' || item.getAttribute('href') === '#navStats') {
                    e.preventDefault();
                    document.getElementById('tradeCalendarSection').scrollIntoView({ behavior: 'smooth' });
                } else if (item.id === 'navSettings') {
                    e.preventDefault();
                    this.openSettingsModal();
                } else if (item.id === 'navJournal' || item.getAttribute('href') === '#historyContainer') {
                    const historyEl = document.getElementById('historyContainer');
                    if (historyEl) {
                        e.preventDefault();
                        historyEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('clearAllData').addEventListener('click', () => {
            this.performFullReset();
        });

        // Clear History ONLY
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearAllTrades();
            });
        }

        // Calendar Navigation
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        if (prevMonth) {
            prevMonth.addEventListener('click', () => this.changeMonth(-1));
        }
        if (nextMonth) {
            nextMonth.addEventListener('click', () => this.changeMonth(1));
        }

        // Trade Form
        const tradeForm = document.getElementById('tradeForm');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitTrade();
            });
        }

        const multiTPToggle = document.getElementById('multiTPToggle');
        if (multiTPToggle) {
            multiTPToggle.addEventListener('change', (e) => {
                this.toggleMultiTP(e.target.value);
            });
        }

        const addTPRowBtn = document.getElementById('addTPRowBtn');
        if (addTPRowBtn) {
            addTPRowBtn.addEventListener('click', () => {
                this.addTPRow();
            });
        }


        // Close Account & Archive
        const closeAccountBtn = document.getElementById('closeAccountBtn');
        if (closeAccountBtn) {
            closeAccountBtn.addEventListener('click', () => {
                this.handleCloseAccount();
            });
        }

        // Pagination
        const prevPageBtn = document.getElementById('prevPageBtn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                this.changePage(-1);
            });
        }

        const nextPageBtn = document.getElementById('nextPageBtn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                this.changePage(1);
            });
        }

        // App Share Button (Header)
        const headerShareBtn = document.getElementById('shareBtn');
        if (headerShareBtn) {
            headerShareBtn.addEventListener('click', () => {
                this.openShareModal('share');
            });
        }

        // Calendar Clickable Toggle
        const toggleCalendar = document.getElementById('toggleCalendar');
        if (toggleCalendar) {
            toggleCalendar.addEventListener('click', (e) => {
                // Prevent toggle when clicking navigation buttons
                if (e.target.closest('.nav-btn')) return;
                const section = document.getElementById('tradeCalendarSection');
                if (section) section.classList.toggle('calendar-section-collapsed');
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

        // Backup & Restore Listeners
        const backupDataBtn = document.getElementById('backupDataBtn');
        if (backupDataBtn) {
            backupDataBtn.addEventListener('click', () => {
                this.backupAllData();
            });
        }

        const restoreDataBtn = document.getElementById('restoreDataBtn');
        const restoreFileInput = document.getElementById('restoreFileInput');
        if (restoreDataBtn && restoreFileInput) {
            restoreDataBtn.addEventListener('click', () => {
                restoreFileInput.click();
            });

            restoreFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.restoreAllData(file);
                    e.target.value = ''; // Reset input
                }
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

    // Share Logic
    generateShareLink() {
        const baseUrl = window.location.origin + window.location.pathname;
        const data = this.exportTradeData();
        // Use LZString if available for compression
        let finalData = data;
        if (typeof LZString !== 'undefined') {
            finalData = LZString.compressToEncodedURIComponent(data);
        } else {
            finalData = btoa(unescape(encodeURIComponent(data)));
        }
        return `${baseUrl}?data=${finalData}&profile=${encodeURIComponent(this.getActiveProfileName())}`;
    }

    exportTradeData() {
        const s = this.settings;
        const trades = this.trades.map(t => {
            let breakdownData = 0;
            if (t.breakdown) {
                if (t.breakdown.isMultiTP) {
                    breakdownData = {
                        m: 1,
                        c: t.breakdown.closes.map(c => [c.rrr, c.percent, c.profit])
                    };
                } else {
                    breakdownData = {
                        r: t.breakdown.firstCloseRRR,
                        p: t.breakdown.firstClosePercent,
                        rc: t.breakdown.runnerCloseRRR
                    };
                }
            }

            return [
                t.pair,
                t.result === 'win' ? 1 : (t.result === 'be' ? 2 : 0),
                t.profitLoss,
                Math.floor(new Date(t.timestamp).getTime() / 1000),
                t.strategyCompliant ? 1 : 0,
                breakdownData,
                t.notes || "",
                t.chartUrl || "",
                t.direction === 'long' ? 1 : 0
            ];
        });

        const exportData = {
            v: 2, // Version 2 (Ultra-Compact)
            s: {
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
                curr: s.currency || 'TRY'
            },
            t: trades
        };

        return JSON.stringify(exportData);
    }

    startNewChallenge() {
        if (confirm(this.t('confirm_new_challenge_msg') || 'Yeni challenge başlatılacak. Mevcut bakiye başlangıç olarak ayarlanıp işlem geçmişi temizlenecek. Onaylıyor musunuz?')) {
            // Get current balance before clearing
            const newCapital = this.getCurrentBalance();

            // Update settings
            this.settings.initialCapital = newCapital;
            this.settings.targetBaseCapital = newCapital;
            this.saveSettings();

            // Clear trades
            this.trades = [];
            this.saveTrades();

            // Update UI
            const shareModal = document.getElementById('shareModal');
            if (shareModal) shareModal.classList.remove('active');

            this.updateDashboard();
            this.renderTradeHistory();

            // Update form input visual
            const initialCapInput = document.getElementById('initialCapital');
            if (initialCapInput) initialCapInput.value = newCapital;

            this.showNotification(this.t('challenge_started_notification') || 'Yeni challenge başlatıldı! Bol kazançlar 🚀', 'success');
        }
    }


    // Calculator Logic
    calculateProfit() {
        const risk = parseFloat(document.getElementById('calcRiskAmount').value) || 0;
        const r = parseFloat(document.getElementById('calcRRR').value) || 0;
        const p = parseFloat(document.getElementById('calcPercent').value) || 0;
        const lotSize = parseFloat(document.getElementById('calcLotSize').value) || 0;

        const profit = risk * r * (p / 100);

        // Show only numeric value, the currency span in HTML will handle the symbol or we can use formatCurrency if we remove symbol from HTML
        const resultEl = document.getElementById('calcResult');
        if (resultEl) {
            resultEl.textContent = this.formatCurrency(profit).replace(/[₺$]/g, '').trim();
        }

        // Lot calculation
        const lotResultEl = document.getElementById('lotResult');
        const lotResultBox = document.getElementById('lotResultBox');

        if (lotSize > 0 && p > 0) {
            const lotsToClose = (lotSize * p / 100).toFixed(2);
            if (lotResultEl) lotResultEl.textContent = `${lotsToClose} lot`;
            if (lotResultBox) lotResultBox.style.display = 'block';
        } else {
            if (lotResultBox) lotResultBox.style.display = 'none';
        }
    }

    toggleTradeInputs(result) {
        // Hide all conditional inputs
        if (document.getElementById('firstCloseRRRGroup')) document.getElementById('firstCloseRRRGroup').style.display = 'none';
        if (document.getElementById('firstClosePercentGroup')) document.getElementById('firstClosePercentGroup').style.display = 'none';
        if (document.getElementById('runnerCloseRRRGroup')) document.getElementById('runnerCloseRRRGroup').style.display = 'none';
        if (document.getElementById('beCloseRRRGroup')) document.getElementById('beCloseRRRGroup').style.display = 'none';
        if (document.getElementById('beClosePercentGroup')) document.getElementById('beClosePercentGroup').style.display = 'none';
        if (document.getElementById('multiTPToggleGroup')) document.getElementById('multiTPToggleGroup').style.display = 'none';
        if (document.getElementById('multiTPContainer')) document.getElementById('multiTPContainer').style.display = 'none';
        if (document.getElementById('manualLossGroup')) document.getElementById('manualLossGroup').style.display = 'none';

        // Clear required attributes
        if (document.getElementById('firstCloseRRR')) document.getElementById('firstCloseRRR').required = false;
        if (document.getElementById('firstClosePercent')) document.getElementById('firstClosePercent').required = false;
        if (document.getElementById('runnerCloseRRR')) document.getElementById('runnerCloseRRR').required = false;
        if (document.getElementById('beCloseRRR')) document.getElementById('beCloseRRR').required = false;
        if (document.getElementById('beClosePercent')) document.getElementById('beClosePercent').required = false;
        if (document.getElementById('manualLossAmount')) document.getElementById('manualLossAmount').required = false;

        // Remove required from any existing TP rows
        document.querySelectorAll('#tpRows input').forEach(input => input.required = false);

        // Clear dynamic rows to avoid hidden required fields issues
        const tpRows = document.getElementById('tpRows');
        if (tpRows) tpRows.innerHTML = '';

        // Reset Multi TP
        const multiTPToggle = document.getElementById('multiTPToggle');
        if (multiTPToggle) multiTPToggle.value = 'no';

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

                if (document.getElementById('beCloseRRR')) document.getElementById('beCloseRRR').required = true;
                if (document.getElementById('beClosePercent')) document.getElementById('beClosePercent').required = true;
            }
        } else if (result === 'loss') {
            if (isManualMode) {
                // Manual Mode Loss: Show amount input
                if (document.getElementById('manualLossGroup')) document.getElementById('manualLossGroup').style.display = 'block';
                if (document.getElementById('manualLossAmount')) document.getElementById('manualLossAmount').required = true;
            }
        }
    }

    toggleMultiTP(value) {
        if (value === 'yes') {
            // Show Multi TP, Hide Standard
            if (document.getElementById('firstCloseRRRGroup')) document.getElementById('firstCloseRRRGroup').style.display = 'none';
            if (document.getElementById('firstClosePercentGroup')) document.getElementById('firstClosePercentGroup').style.display = 'none';
            if (document.getElementById('runnerCloseRRRGroup')) document.getElementById('runnerCloseRRRGroup').style.display = 'none';

            if (document.getElementById('firstCloseRRR')) document.getElementById('firstCloseRRR').required = false;
            if (document.getElementById('firstClosePercent')) document.getElementById('firstClosePercent').required = false;
            if (document.getElementById('runnerCloseRRR')) document.getElementById('runnerCloseRRR').required = false;

            if (document.getElementById('multiTPContainer')) document.getElementById('multiTPContainer').style.display = 'block';

            // Add initial rows if empty
            const container = document.getElementById('tpRows');
            if (container && container.children.length === 0) {
                this.addTPRow();
                this.addTPRow();
            }
        } else {
            // Show Standard, Hide Multi TP
            if (document.getElementById('firstCloseRRRGroup')) document.getElementById('firstCloseRRRGroup').style.display = 'flex';
            if (document.getElementById('firstClosePercentGroup')) document.getElementById('firstClosePercentGroup').style.display = 'flex';
            if (document.getElementById('runnerCloseRRRGroup')) document.getElementById('runnerCloseRRRGroup').style.display = 'flex';

            // Remove required from multi TP rows when hiding
            document.querySelectorAll('#tpRows input').forEach(input => input.required = false);
            const tpRows = document.getElementById('tpRows');
            if (tpRows) tpRows.innerHTML = '';

            if (document.getElementById('firstCloseRRR')) document.getElementById('firstCloseRRR').required = true;
            if (document.getElementById('firstClosePercent')) document.getElementById('firstClosePercent').required = true;
            if (document.getElementById('runnerCloseRRR')) document.getElementById('runnerCloseRRR').required = true;

            if (document.getElementById('multiTPContainer')) document.getElementById('multiTPContainer').style.display = 'none';
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
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        // SAĞLAM RESULT ALMA MANTIĞI (UI Öncelikli)
        let result = getVal('tradeResult');
        const activeResultBtn = document.querySelector('#resultSegment .segmented-btn.active');
        if (activeResultBtn) {
            result = activeResultBtn.getAttribute('data-value');
        }

        const pair = getVal('tradePair').toUpperCase();
        const direction = getVal('tradeDirection');
        const notes = getVal('tradeNotes').trim();
        const isMultiTP = getVal('multiTPToggle') === 'yes';
        const chartUrl = getVal('chartUrl').trim();

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

                    rows.push({ rrr, percent, profit });
                    totalPercent += percent;
                }

                if (totalPercent > 100) {
                    alert('Toplam yüzde 100\'ü geçemez!');
                    return;
                }

                if (isManualMode) {
                    tradeData.profitLoss = manualTotalProfit;
                    tradeData.breakdown = {
                        isMultiTP: true,
                        totalPercent: totalPercent,
                        closes: rows,
                        firstCloseRRR: rows[0].rrr,
                        firstClosePercent: rows[0].percent
                    };
                } else {
                    const calculation = this.calculateMultiTPResult(rows);
                    tradeData.profitLoss = calculation.total;
                    tradeData.breakdown = calculation.breakdown;
                }

            } else {
                const firstCloseRRR = parseFloat(getVal('firstCloseRRR'));
                const firstClosePercent = parseFloat(getVal('firstClosePercent'));
                const runnerCloseRRR = parseFloat(getVal('runnerCloseRRR'));

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
            const isManualMode = this.settings.manualMode;

            if (isManualMode) {
                tradeData.profitLoss = 0;
                tradeData.breakdown = {
                    firstClose: 0, firstCloseRRR: 0, firstClosePercent: 0, runnerClose: 0
                };
            } else {
                const firstCloseRRR = parseFloat(getVal('beCloseRRR'));
                const firstClosePercent = parseFloat(getVal('beClosePercent'));

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
                const lossAmount = parseFloat(getVal('manualLossAmount'));
                if (isNaN(lossAmount)) {
                    alert('Lütfen kayıp miktarını girin');
                    return;
                }
                tradeData.profitLoss = -Math.abs(lossAmount);
                tradeData.breakdown = null;
            } else {
                const calculation = this.calculateTradeResult(result);
                tradeData.profitLoss = calculation.total;
                tradeData.breakdown = calculation.breakdown;
            }
        }

        // Add Trade
        this.addTrade(tradeData);
        this.refreshUI();

        // Feedback system disabled

        // FORM RESET & STAY IN POSITION
        const form = document.getElementById('tradeForm');
        form.reset();

        // Reset Visuals
        document.querySelectorAll('#directionSegment .segmented-btn').forEach(b => b.classList.remove('active'));
        const longBtn = document.querySelector('#directionSegment .segmented-btn[data-value="long"]');
        if (longBtn) longBtn.classList.add('active');

        document.querySelectorAll('#resultSegment .segmented-btn').forEach(b => b.classList.remove('active'));
        const winBtn = document.querySelector('#resultSegment .segmented-btn[data-value="win"]');
        if (winBtn) winBtn.classList.add('active');

        if (document.getElementById('tradeResult')) document.getElementById('tradeResult').value = 'win';

        this.toggleTradeInputs('win');

        // Scroll disabled
    }

    openSettingsModal() {
        // Populate form with current settings
        document.getElementById('archiveName').value = this.settings.archiveName || 'RUNNER TRADER JOURNAL';
        document.getElementById('initialCapital').value = this.settings.initialCapital;
        document.getElementById('targetGrowth').value = this.settings.targetGrowth;
        document.getElementById('riskPerTrade').value = this.settings.riskPerTrade;
        document.getElementById('rLevel').value = this.settings.rLevel;
        document.getElementById('lockPercentage').value = this.settings.lockPercentage;
        document.getElementById('targetBaseCapital').value = this.settings.targetBaseCapital || this.settings.initialCapital;
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

        // Sync Target Growth Rate with Target Base Capital
        const initialCapitalInput = document.getElementById('initialCapital');
        const targetGrowthInput = document.getElementById('targetGrowth');
        const targetBaseCapitalInput = document.getElementById('targetBaseCapital');

        // Auto-sync event listeners removed to allow free editing as requested by user.
        // Users can now set Initial Capital (e.g. 51k), Target Growth (e.g. 8%), and Target Base Capital (e.g. 54k) independently.

        // Account Mode Logic
        const mode = this.settings.accountMode || 'challenge';
        const radios = document.getElementsByName('accountMode');
        radios.forEach(r => {
            if (r.value === mode) r.checked = true;
        });

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
            const year = date.getFullYear();
            const month = String(date.getMonth()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            if (!dailyPnL[dateKey]) dailyPnL[dateKey] = 0;
            dailyPnL[dateKey] += trade.profitLoss;
        });
        return dailyPnL;
    }

    changeMonth(direction) {
        const newDate = new Date(this.currentCalendarDate);
        newDate.setMonth(newDate.getMonth() + direction);
        this.currentCalendarDate = newDate;
        this.renderTradeCalendar();
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
        const todayKey = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const paddedMonth = String(month).padStart(2, '0');
            const paddedDay = String(day).padStart(2, '0');
            const dateKey = `${year}-${paddedMonth}-${paddedDay}`;
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

    // Welcome Modal Methods
    checkWelcomeModal() {
        const welcomeModalSeen = localStorage.getItem('welcomeModalSeen');
        if (!welcomeModalSeen) {
            this.openWelcomeModal();
        }
    }

    openWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    closeWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        const dontShowAgain = document.getElementById('dontShowAgain');

        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling

            if (dontShowAgain && dontShowAgain.checked) {
                localStorage.setItem('welcomeModalSeen', 'true');
            } else {
                // Kullanıcı kutuyu işaretlemese bile, 'Başla' butonuna bastıysa veya kapattıysa
                // varsayılan olarak bir daha göstermeme eğilimindeyiz.
                // Ancak kullanıcı 'x' ile kapattıysa belki sonra tekrar görmek isteyebilir.
                // Fakat 'her siteyi açtığımda çıkıyor' şikayeti üzerine, bunu kalıcı olarak kapatıyoruz.
                localStorage.setItem('welcomeModalSeen', 'true');
            }
        }
    }

    // Backup Reminder Removed
}

// ===================================
// INITIALIZE APPLICATION
// ===================================
let tradingSystem;

document.addEventListener('DOMContentLoaded', () => {
    tradingSystem = new TradingSystem();
    window.tradingSystem = tradingSystem; // Expose globally
    console.log('🚀 Runner R-Performance Tracker V2.1 initialized successfully!');

    // Initialize Welcome Modal
    tradingSystem.checkWelcomeModal();
    // tradingSystem.checkBackupReminder(); // Removed

    // Welcome Modal Event Listeners
    const helpBtn = document.getElementById('helpBtn');
    const welcomeModalClose = document.getElementById('welcomeModalClose');
    const startJournalBtn = document.getElementById('startJournalBtn');

    if (helpBtn) {
        helpBtn.addEventListener('click', () => tradingSystem.openWelcomeModal());
    }

    if (welcomeModalClose) {
        welcomeModalClose.addEventListener('click', () => tradingSystem.closeWelcomeModal());
    }

    if (startJournalBtn) {
        startJournalBtn.addEventListener('click', () => tradingSystem.closeWelcomeModal());
    }

    // Floating Action Button - Scroll to Trade Entry
    const fabButton = document.getElementById('fabAddTrade');
    if (fabButton) {
        fabButton.addEventListener('click', function () {
            const tradeEntrySection = document.getElementById('tradeEntrySection');
            if (tradeEntrySection) {
                tradeEntrySection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Activate the "Araçlar" tab
                const toolsTab = document.querySelector('.tab-item[data-tab="tools"]');
                if (toolsTab) {
                    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                    toolsTab.classList.add('active');
                }
            }
        });
    }

    // Time Selector Buttons
    const timeBtns = document.querySelectorAll('.time-btn');
    if (timeBtns.length > 0) {
        timeBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                timeBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                this.classList.add('active');

                // Get period and update chart AND dashboard
                const period = this.getAttribute('data-period');
                if (tradingSystem) {
                    tradingSystem.currentChartPeriod = period;
                    if (tradingSystem.updateChart) {
                        tradingSystem.updateChart();
                    }
                    if (tradingSystem.updateDashboard) {
                        tradingSystem.updateDashboard();
                    }
                }
            });
        });
    }

    // BUG FIX: Result Segment Logic Check
    // ==========================================
    const resultButtons = document.querySelectorAll('#resultSegment .segmented-btn');
    const resultInput = document.getElementById('tradeResult');
    if (resultButtons.length > 0 && resultInput) {
        // Ensure click listeners are active and forcing update
        resultButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                // Remove active from all
                resultButtons.forEach(b => b.classList.remove('active'));

                // Add to clicked
                this.classList.add('active');

                // Force Update hidden input
                const val = this.getAttribute('data-value');
                resultInput.value = val;

                // Trigger logic
                if (window.tradingSystem) {
                    window.tradingSystem.toggleTradeInputs(val);
                }
            });
        });

        // Initialize correct state on load
        const activeBtn = document.querySelector('#resultSegment .segmented-btn.active');
        if (activeBtn) {
            const val = activeBtn.getAttribute('data-value');
            resultInput.value = val;
            // Delay slightly to ensure system is ready
            setTimeout(() => {
                if (window.tradingSystem) window.tradingSystem.toggleTradeInputs(val);
            }, 500);
        }
    }
});

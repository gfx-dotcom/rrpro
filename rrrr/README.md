# 🚀 Runner R-Performance Tracker

## Profesyonel Trading Performans Takip Sistemi

Runner R-Performance Tracker, Runner stratejisi kullanan traderlar için özel olarak tasarlanmış, gelişmiş bir performans takip ve analiz sistemidir. Gerçek zamanlı hesaplamalar, akıllı geri bildirimler ve detaylı metriklerle trading performansınızı optimize edin.

---

## ✨ Özellikler

### 🎯 Hedef Takibi
- **Gerçek Zamanlı İlerleme**: Hedef kâr miktarınıza ne kadar yaklaştığınızı anlık olarak görün
- **Görsel İlerleme Çubuğu**: Animasyonlu ve parlayan ilerleme göstergesi
- **Tahmini İşlem Sayısı**: Hedefe ulaşmak için gereken işlem sayısı tahmini

### 📊 Performans Metrikleri
- **Güncel Bakiye**: Anlık hesap bakiyeniz
- **Kazanma Oranı (Win Rate)**: Kazanan işlemlerin yüzdesi
- **Ortalama Runner RRR**: Kazanan işlemlerin ortalama Risk/Ödül oranı
- **Net Kar/Zarar**: Toplam kâr veya kayıp miktarı

### 💡 Akıllı Geri Bildirim Sistemi
Sistem, her işlem sonrası otomatik olarak performansınızı analiz eder ve size özel geri bildirimler sunar:

- **🚀 Süper Runner**: 4R ve üzeri kazançlar için özel kutlama mesajı
- **⚠️ Disiplin Uyarısı**: Ardışık kayıplar için motivasyon mesajı
- **💡 Strateji Önerisi**: Runner potansiyelini artırma önerileri
- **🎉 Hedef Tamamlama**: Hedefe ulaştığınızda kutlama mesajı

### 📝 İşlem Kaydı
- **Kolay Giriş**: Basit form ile hızlı işlem kaydı
- **3 İşlem Tipi**: Kazanç (Win), Kayıp (SL), Başa Baş (BE)
- **RRR Takibi**: Her kazanan işlem için nihai RRR değeri
- **İşlem Notları**: Opsiyonel not ekleme özelliği

### 📜 İşlem Geçmişi
- **Detaylı Kayıtlar**: Her işlemin tam detayları
- **Zaman Damgası**: Tarih ve saat bilgisi
- **Kar/Zarar Gösterimi**: Renkli kar/zarar göstergeleri
- **Bakiye Takibi**: Her işlem sonrası bakiye durumu

### ⚙️ Özelleştirilebilir Ayarlar
- **Başlangıç Sermayesi**: Hesap başlangıç bakiyesi (TL)
- **Hedef Büyüme Oranı**: İstenen kâr yüzdesi (%)
- **Risk Oranı**: İşlem başına maksimum risk (%)
- **R Seviyesi**: Kâr kilitleme yapılacağı R değeri
- **Kilitleme Yüzdesi**: R seviyesinde kapatılacak pozisyon oranı (%)

---

## 🎨 Tasarım Özellikleri

### Premium Dark Theme
- Modern ve göz yormayan koyu tema
- Vibrant renkler ve gradyanlar
- Glassmorphism efektleri

### Animasyonlar
- Smooth geçişler ve hover efektleri
- Micro-animasyonlar
- İlerleme çubuğu shimmer efekti
- Logo float animasyonu

### Responsive Tasarım
- Desktop ve mobil uyumlu
- Esnek grid sistemi
- Touch-friendly arayüz

---

## 🧮 Hesaplama Mantığı

### Sabit Risk Miktarı
```
Risk Miktarı (TL) = Başlangıç Sermayesi × (Risk Oranı / 100)
```
**Örnek**: 50,000 TL × 0.5% = 250 TL

### Hedef Kâr
```
Hedef Kâr (TL) = Başlangıç Sermayesi × (Hedef Büyüme / 100)
```
**Örnek**: 50,000 TL × 8% = 4,000 TL

### İşlem Sonuçları

#### ❌ Kayıp (SL)
```
Net Kayıp = -Risk Miktarı
```
**Örnek**: -250 TL

#### ⚖️ Başa Baş (BE)
```
Net Kar/Kayıp = 0 TL
```
Risk 1.2R'de sıfırlanmıştır.

#### ✅ Kazanç (Win)
```
Kısım 1 (Garanti) = (Kilitleme % / 100) × R Seviyesi × Risk Miktarı
Kısım 2 (Runner) = (Runner % / 100) × Nihai RRR × Risk Miktarı
Toplam Kâr = Kısım 1 + Kısım 2
```

**Örnek** (R=1.2, Kilitleme=70%, Nihai RRR=3.5):
- Kısım 1: 0.70 × 1.2 × 250 = 210 TL
- Kısım 2: 0.30 × 3.5 × 250 = 262.5 TL
- **Toplam**: 472.5 TL

---

## 🚀 Kullanım Kılavuzu

### İlk Kurulum
1. **Ayarları Yapılandırın**: Sağ üstteki "Ayarlar" butonuna tıklayın
2. **Sermaye Bilgilerini Girin**: Başlangıç sermayenizi ve hedef büyüme oranınızı belirleyin
3. **Risk Parametrelerini Ayarlayın**: İşlem başına risk oranınızı ve R seviyenizi girin
4. **Kaydedin**: Ayarlarınızı kaydedin

### İşlem Ekleme
1. **İşlem Sonucunu Seçin**: Kazanç, Kayıp veya Başa Baş
2. **RRR Değerini Girin**: (Sadece kazanan işlemler için)
3. **Not Ekleyin**: (Opsiyonel) İşlem detaylarını not edin
4. **Kaydedin**: "İşlemi Kaydet" butonuna tıklayın

### Dashboard İnceleme
- **Hedef Durumu**: Hedefinize ne kadar yaklaştığınızı görün
- **Performans Metrikleri**: Win rate, ortalama RRR ve bakiye bilgilerinizi inceleyin
- **Akıllı Geri Bildirim**: Sistem tarafından üretilen önerileri okuyun
- **İşlem Geçmişi**: Tüm işlemlerinizi detaylı olarak görüntüleyin

---

## 💾 Veri Saklama

Tüm verileriniz tarayıcınızın **LocalStorage**'ında güvenli bir şekilde saklanır:
- ⚙️ **Ayarlar**: `runnerSettings`
- 📊 **İşlem Geçmişi**: `runnerTrades`

**Not**: Tarayıcı verilerini temizlerseniz, tüm kayıtlarınız silinecektir. Düzenli yedekleme yapmanız önerilir.

---

## 🎯 Varsayılan Ayarlar

| Parametre | Varsayılan Değer |
|-----------|------------------|
| Başlangıç Sermayesi | 50,000 TL |
| Hedef Büyüme Oranı | %8 |
| İşlem Başına Risk | %0.5 |
| R Seviyesi | 1.2 |
| Kilitleme Yüzdesi | %70 |

---

## 🔧 Teknik Detaylar

### Teknolojiler
- **HTML5**: Semantik yapı
- **CSS3**: Modern styling, animations, gradients
- **Vanilla JavaScript**: Saf JavaScript, framework yok
- **LocalStorage API**: Veri saklama

### Tarayıcı Desteği
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dosya Yapısı
```
cal/
├── index.html      # Ana HTML dosyası
├── styles.css      # Tüm stiller ve animasyonlar
├── app.js          # Uygulama mantığı ve hesaplamalar
└── README.md       # Dokümantasyon
```

---

## 📱 Mobil Uyumluluk

Uygulama tamamen responsive tasarıma sahiptir:
- 📱 **Mobil**: Tek sütun layout, touch-friendly butonlar
- 💻 **Tablet**: İki sütun grid, optimize edilmiş spacing
- 🖥️ **Desktop**: Üç sütun grid, maksimum veri görünürlüğü

---

## 🎓 Runner Stratejisi Nedir?

Runner stratejisi, pozisyonun bir kısmını belirli bir kâr seviyesinde (örn: 1.2R) kapatarak riski sıfırlayan ve kalan kısmı daha büyük hedefler için açık tutan bir risk yönetimi tekniğidir.

### Avantajları
- ✅ **Risk Yönetimi**: Erken kâr kilitleme ile risk azaltma
- ✅ **Psikolojik Rahatlık**: Garantili kâr ile stressiz trading
- ✅ **Büyük Kazançlar**: Runner ile sınırsız kâr potansiyeli
- ✅ **Tutarlılık**: Düşük win rate ile bile karlı olabilme

---

## 📊 Örnek Senaryo

**Başlangıç Durumu**:
- Sermaye: 50,000 TL
- Hedef: %8 (4,000 TL)
- Risk/İşlem: %0.5 (250 TL)

**İşlem Serisi**:
1. **Kayıp**: -250 TL (Bakiye: 49,750 TL)
2. **Win (3.5R)**: +472.5 TL (Bakiye: 50,222.5 TL)
3. **Win (6.5R)**: +697.5 TL (Bakiye: 50,920 TL)
4. **BE**: 0 TL (Bakiye: 50,920 TL)
5. **Kayıp**: -250 TL (Bakiye: 50,670 TL)

**Sonuç**:
- Net Kâr: 670 TL
- Win Rate: 40% (2/5)
- Ortalama RRR: 5.0R
- Hedefe Kalan: 3,330 TL (%16.75 tamamlandı)

---

## 🆘 Sık Sorulan Sorular

### Verilerim kaybolur mu?
Hayır, tüm veriler tarayıcınızda saklanır. Ancak tarayıcı verilerini temizlerseniz kaybolabilir.

### Birden fazla hesap takip edebilir miyim?
Şu anda tek hesap desteği var. Farklı hesaplar için farklı tarayıcı profilleri kullanabilirsiniz.

### Ayarları değiştirirsem eski işlemler ne olur?
Eski işlemler değişmez, ancak yeni hesaplamalar güncel ayarlara göre yapılır.

### Mobilde kullanabilir miyim?
Evet, uygulama tamamen mobil uyumludur.

---

## 🔮 Gelecek Özellikler

- 📈 **Grafik Analizi**: Performans grafikleri ve trendler
- 📤 **Veri Dışa Aktarma**: CSV/Excel export
- 🔔 **Bildirimler**: Hedef tamamlama bildirimleri
- 📊 **İstatistikler**: Detaylı istatistik raporları
- 🎨 **Tema Seçenekleri**: Light/Dark mode toggle
- 💾 **Cloud Sync**: Bulut senkronizasyonu

---

## 📄 Lisans

Bu proje kişisel kullanım için geliştirilmiştir.

---

## 👨‍💻 Geliştirici

**Runner R-Performance Tracker**  
Version 1.0.0  
© 2025

---

## 🙏 Teşekkürler

Bu uygulamayı kullandığınız için teşekkür ederiz. Başarılı tradeler dileriz! 🚀📈

---

**Not**: Bu uygulama yalnızca eğitim ve takip amaçlıdır. Finansal tavsiye niteliği taşımaz. Trading risklidir ve kayıplar sermayenizi aşabilir.

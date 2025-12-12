# 🎯 Runner Tracker - Hızlı Başlangıç Kılavuzu

## 📋 5 Dakikada Başlayın

### 1️⃣ Ayarları Yapılandırın (İlk Kullanım)
```
1. Sağ üstteki "Ayarlar" butonuna tıklayın
2. Bilgilerinizi girin:
   - Başlangıç Sermayesi: Örn. 50,000 TL
   - Hedef Büyüme: Örn. %8
   - Risk/İşlem: Örn. %0.5
   - R Seviyesi: Örn. 1.2
   - Kilitleme %: Örn. %70
3. "Kaydet" butonuna tıklayın
```

### 2️⃣ İşlem Ekleyin
```
1. "YENİ İŞLEM KAYDI" bölümüne gidin
2. İşlem sonucunu seçin:
   - ❌ Kayıp (SL)
   - ⚖️ Başa Baş (BE)
   - ✅ Kazanç (Win)
3. Kazanç ise RRR değerini girin (Örn: 3.5)
4. İsteğe bağlı not ekleyin
5. "İşlemi Kaydet" butonuna tıklayın
```

### 3️⃣ Performansınızı İzleyin
```
Dashboard'da görebileceğiniz metrikler:
- 🎯 Hedefe ne kadar kaldı
- 💰 Güncel bakiye
- 📊 Kazanma oranı (Win Rate)
- 📈 Ortalama RRR
- 💵 Net kar/zarar
```

---

## 🧮 Hızlı Hesaplama Formülleri

### Risk Miktarı
```
Risk = Sermaye × (Risk % / 100)
Örnek: 50,000 × 0.5% = 250 TL
```

### Hedef Kâr
```
Hedef = Sermaye × (Büyüme % / 100)
Örnek: 50,000 × 8% = 4,000 TL
```

### Kazanç Hesabı (Win)
```
Garanti Kâr = 0.70 × 1.2R × 250 = 210 TL
Runner Kâr = 0.30 × RRR × 250
Toplam = Garanti + Runner

Örnek (3.5R):
- Garanti: 210 TL
- Runner: 0.30 × 3.5 × 250 = 262.5 TL
- TOPLAM: 472.5 TL
```

---

## 💡 Akıllı Geri Bildirimler

| Durum | Mesaj Tipi | Ne Zaman Görünür |
|-------|-----------|------------------|
| 🚀 Süper Runner | Başarı | RRR ≥ 4.0 |
| ⚠️ Disiplin | Uyarı | 3+ ardışık kayıp |
| 💡 Strateji | Bilgi | Çok fazla BE/düşük RRR |
| 🎉 Hedef | Kutlama | Hedef tamamlandı |

---

## 📊 Örnek İşlem Senaryoları

### Senaryo 1: Kayıp İşlem
```
İşlem Tipi: ❌ Kayıp (SL)
Sonuç: -250 TL
Bakiye: 49,750 TL
```

### Senaryo 2: Başa Baş
```
İşlem Tipi: ⚖️ Başa Baş (BE)
Sonuç: 0 TL
Bakiye: Değişmez
Not: Risk 1.2R'de sıfırlandı
```

### Senaryo 3: Küçük Kazanç
```
İşlem Tipi: ✅ Kazanç (Win)
RRR: 2.0R
Hesaplama:
- Garanti: 210 TL
- Runner: 75 TL
Toplam: +285 TL
```

### Senaryo 4: Büyük Runner 🚀
```
İşlem Tipi: ✅ Kazanç (Win)
RRR: 6.5R
Hesaplama:
- Garanti: 210 TL
- Runner: 487.5 TL
Toplam: +697.5 TL
Geri Bildirim: "SÜPER RUNNER!"
```

---

## ⚡ Klavye Kısayolları

| Tuş | Aksiyon |
|-----|---------|
| `Tab` | Formda ileri git |
| `Enter` | Formu gönder |
| `Esc` | Modal'ı kapat |

---

## 🎨 Renk Kodları

| Element | Renk | Anlamı |
|---------|------|--------|
| 🟢 Yeşil | Success | Kazanç, Hedef |
| 🔴 Kırmızı | Danger | Kayıp, Uyarı |
| 🟡 Sarı | Warning | BE, Dikkat |
| 🔵 Mavi | Info | Bilgi, Öneri |
| 🟣 Mor | Primary | Ana vurgu |

---

## 📱 Mobil Kullanım İpuçları

1. **Yatay Mod**: Daha iyi görünüm için yatay kullanın
2. **Zoom**: Gerekirse pinch-to-zoom yapabilirsiniz
3. **Kaydırma**: Yumuşak kaydırma için parmağınızı kullanın
4. **Formlar**: Otomatik klavye açılır

---

## 🔧 Sorun Giderme

### Veriler Görünmüyor
```
✓ Sayfayı yenileyin (F5)
✓ Tarayıcı önbelleğini temizleyin
✓ LocalStorage'ın etkin olduğundan emin olun
```

### Hesaplamalar Yanlış
```
✓ Ayarları kontrol edin
✓ RRR değerini doğru girdiğinizden emin olun
✓ İşlem tipini doğru seçin
```

### Modal Açılmıyor
```
✓ Sayfayı yenileyin
✓ JavaScript'in etkin olduğundan emin olun
✓ Konsol hatalarını kontrol edin (F12)
```

---

## 📈 Başarı İpuçları

### ✅ Yapılması Gerekenler
- Her işlemi hemen kaydedin
- Notlar ekleyerek detay saklayın
- Düzenli olarak metriklerinizi inceleyin
- Akıllı geri bildirimleri dikkate alın
- Ayarlarınızı trading planinize göre yapın

### ❌ Yapılmaması Gerekenler
- İşlemleri unutup sonradan eklemeyin
- Risk oranınızı sık sık değiştirmeyin
- Duygusal kararlar almayın
- Geri bildirimleri görmezden gelmeyin
- Hedefi çok sık değiştirmeyin

---

## 🎯 Hedef Belirleme Önerileri

| Deneyim Seviyesi | Önerilen Hedef | Risk/İşlem |
|------------------|----------------|------------|
| Başlangıç | %5-8 | %0.5 |
| Orta | %8-12 | %0.5-1% |
| İleri | %12-20 | %1-2% |

**Not**: Muhafazakar hedefler daha sürdürülebilirdir.

---

## 📊 Win Rate Beklentileri

Runner stratejisi ile tipik win rate'ler:

| Win Rate | Ortalama RRR | Sonuç |
|----------|--------------|-------|
| 30-40% | 4.0R+ | ✅ Karlı |
| 40-50% | 3.0R+ | ✅ Çok Karlı |
| 50%+ | 2.0R+ | ✅ Mükemmel |

**Önemli**: Düşük win rate bile yüksek RRR ile karlı olabilir!

---

## 🔄 Veri Yedekleme

### Manuel Yedekleme
```
1. F12 tuşuna basın (Developer Tools)
2. Console sekmesine gidin
3. Şunu yazın:
   localStorage.getItem('runnerTrades')
4. Çıktıyı kopyalayıp kaydedin
```

### Geri Yükleme
```
1. F12 tuşuna basın
2. Console sekmesine gidin
3. Şunu yazın:
   localStorage.setItem('runnerTrades', 'BURAYA_YEDEK')
4. Sayfayı yenileyin
```

---

## 📞 Destek

Sorularınız için:
- 📖 README.md dosyasını okuyun
- 🔍 Konsol hatalarını kontrol edin (F12)
- 💾 Verilerinizi yedekleyin

---

## ✨ Pro İpuçları

1. **Sabah Rutini**: Günlük hedeflerinizi gözden geçirin
2. **Akşam Rutini**: Günün işlemlerini kaydedin ve analiz edin
3. **Haftalık İnceleme**: Performans metriklerinizi değerlendirin
4. **Aylık Değerlendirme**: Stratejinizi gözden geçirin

---

**Başarılı Tradeler! 🚀📈**

*Son Güncelleme: 2025*

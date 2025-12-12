# 💡 Runner Tracker - Kullanım Örnekleri

## 🎯 Sistem Nasıl Çalışır?

### Temel Mantık
Runner Tracker, **otomatik hesaplama** sistemi kullanır. Siz sadece **nihai sonucu** girersiniz, sistem tüm ara adımları otomatik hesaplar.

---

## 📊 Detaylı Örnek Senaryo

### Ayarlarınız
```
Başlangıç Sermayesi: 50,000 TL
Risk/İşlem: %0.5 = 250 TL
R Seviyesi: 1.2
Kilitleme Oranı: %70
Runner Oranı: %30
```

---

## ✅ ÖRNEK 1: Kazanan İşlem (Runner 2.5R'de Kapandı)

### İşlem Süreci
1. **Pozisyon Açıldınız**: 250 TL risk
2. **1.2R'ye Ulaştı**: %70'i kapattınız → **210 TL garantili kâr**
3. **Kalan %30'u Taşıdınız**: 2.5R'ye kadar
4. **2.5R'de Kapattınız**: Kalan %30 → **187.5 TL kâr**

### Siteye Girdiğiniz Bilgiler
```
İşlem Sonucu: ✅ Kazanç (Win)
Kalan %30'un Kapandığı RRR: 2.5
Not: (Opsiyonel) "2.5R'de tamamı kapandı"
```

### Sistem Otomatik Hesaplar
```javascript
// Garanti Kâr (%70 @ 1.2R)
Kısım 1 = 0.70 × 1.2 × 250 = 210 TL

// Runner Kâr (%30 @ 2.5R)
Kısım 2 = 0.30 × 2.5 × 250 = 187.5 TL

// TOPLAM KÂR
Toplam = 210 + 187.5 = 397.5 TL ✅
```

### Sonuç
- **Bakiyeniz**: 50,000 + 397.5 = **50,397.5 TL**
- **Görüntülenen RRR**: 2.5R
- **Kar/Zarar**: +397.5 TL

---

## ✅ ÖRNEK 2: Büyük Runner (6.5R'de Kapandı)

### İşlem Süreci
1. Pozisyon açıldı: 250 TL risk
2. 1.2R → %70 kapandı → 210 TL garantili
3. Kalan %30 → 6.5R'ye kadar taşındı
4. 6.5R'de tamamı kapandı

### Siteye Girdiğiniz Bilgiler
```
İşlem Sonucu: ✅ Kazanç (Win)
Kalan %30'un Kapandığı RRR: 6.5
Not: "Güçlü trend, 6.5R'de kapandı"
```

### Sistem Otomatik Hesaplar
```javascript
// Garanti Kâr
Kısım 1 = 0.70 × 1.2 × 250 = 210 TL

// Runner Kâr (BÜYÜK!)
Kısım 2 = 0.30 × 6.5 × 250 = 487.5 TL

// TOPLAM KÂR
Toplam = 210 + 487.5 = 697.5 TL 🚀
```

### Sonuç
- **Bakiyeniz**: 50,000 + 697.5 = **50,697.5 TL**
- **Geri Bildirim**: "🚀 SÜPER RUNNER! Bu 6.5R koşucu, 2 adet kaybın maliyetini tek başına çıkardı!"

---

## ⚖️ ÖRNEK 3: Breakeven (BE)

### İşlem Süreci
1. Pozisyon açıldı: 250 TL risk
2. 1.2R → %70 kapandı → 210 TL garantili
3. Kalan %30 → Stop loss'u breakeven'e çektiniz
4. Fiyat geri geldi ve BE'de kapandı

### Siteye Girdiğiniz Bilgiler
```
İşlem Sonucu: ⚖️ Başa Baş (BE)
Not: "BE'de kapandı, risk sıfırlandı"
```

### Sistem Otomatik Hesaplar
```javascript
// Garanti kâr zaten alındı (%70 @ 1.2R)
Garantili = 210 TL

// Kalan %30 BE'de kapandı (kayıp)
Kayıp = -210 TL

// NET SONUÇ
Toplam = 210 - 210 = 0 TL ⚖️
```

### Sonuç
- **Bakiyeniz**: 50,000 + 0 = **50,000 TL** (değişmedi)
- **Kar/Zarar**: 0 TL
- **Not**: Risk başarıyla yönetildi!

---

## ❌ ÖRNEK 4: Kayıp (Stop Loss)

### İşlem Süreci
1. Pozisyon açıldı: 250 TL risk
2. 1.2R'ye ulaşamadan stop loss'a takıldı
3. Tam kayıp

### Siteye Girdiğiniz Bilgiler
```
İşlem Sonucu: ❌ Kayıp (SL)
Not: "Erken stop, kurulum geçersiz oldu"
```

### Sistem Otomatik Hesaplar
```javascript
// Tam kayıp
Kayıp = -250 TL ❌
```

### Sonuç
- **Bakiyeniz**: 50,000 - 250 = **49,750 TL**
- **Kar/Zarar**: -250 TL

---

## 🔄 ÖRNEK 5: Kısmi Kapanışlar (Farklı Seviyeler)

### Senaryo A: 3R'de %15, 5R'de %15 Kapandı

**İşlem Süreci:**
1. 1.2R → %70 kapandı (210 TL)
2. Kalan %30'u böldünüz:
   - %15 → 3R'de kapandı
   - %15 → 5R'de kapandı

**Ortalama RRR Hesabı:**
```
Ağırlıklı Ortalama = (0.15 × 3) + (0.15 × 5) / 0.30
                   = (0.45 + 0.75) / 0.30
                   = 1.2 / 0.30
                   = 4.0R
```

**Siteye Girdiğiniz Bilgiler:**
```
İşlem Sonucu: ✅ Kazanç (Win)
Kalan %30'un Kapandığı RRR: 4.0
Not: "3R'de %15, 5R'de %15 kapandı"
```

**Sistem Hesaplar:**
```javascript
Garanti = 210 TL
Runner = 0.30 × 4.0 × 250 = 300 TL
Toplam = 510 TL ✅
```

---

## 📈 İşlem Serisi Örneği

### 5 İşlemlik Bir Hafta

| # | Sonuç | RRR | Kâr/Zarar | Bakiye | Notlar |
|---|-------|-----|-----------|--------|--------|
| 1 | ❌ SL | -1.0 | -250 TL | 49,750 TL | Erken stop |
| 2 | ✅ Win | 3.5 | +397.5 TL | 50,147.5 TL | Güzel trend |
| 3 | ✅ Win | 6.5 | +697.5 TL | 50,845 TL | 🚀 SÜPER RUNNER |
| 4 | ⚖️ BE | 0 | 0 TL | 50,845 TL | BE çekildi |
| 5 | ❌ SL | -1.0 | -250 TL | 50,595 TL | Yanlış kurulum |

### Hafta Sonu Analizi
```
Toplam İşlem: 5
Kazanan: 2 (40% Win Rate)
Kayıp: 2
BE: 1

Net Kâr: +595 TL
Ortalama RRR: 5.0R (kazanan işlemler)
Hedef İlerleme: 14.9% (595/4000)
```

---

## 🎓 Önemli Notlar

### ✅ DOĞRU Kullanım
```
1. Pozisyon açtınız
2. 1.2R'de %70 kapattınız (otomatik hesaplanır)
3. Kalan %30 → 4.5R'de kapandı
4. Siteye sadece "4.5" yazın
5. Sistem toplam kârı hesaplar: 210 + 337.5 = 547.5 TL
```

### ❌ YANLIŞ Kullanım
```
1. 1.2R'de %70 kapandı → Siteye 1.2 yazmayın!
2. Sonra 4.5R'de %30 kapandı → Siteye 4.5 yazmayın!
3. İki ayrı işlem olarak eklemeyin!

DOĞRUSU: Sadece son kapanış RRR'sini (4.5) girin
```

---

## 💡 Sık Sorulan Sorular

### S: %70'i 1.2R'de kapattım, bunu siteye girmeli miyim?
**C**: HAYIR! Sistem zaten bunu biliyor (ayarlarınızda tanımlı). Sadece kalan %30'un kapandığı RRR'yi girin.

### S: Kalan %30'u farklı seviyelerde kapattım, ne yapmalıyım?
**C**: Ağırlıklı ortalama RRR hesaplayın ve onu girin. Veya notlar kısmına detay yazın.

### S: Breakeven çektim ama %70 zaten kapanmıştı, ne olur?
**C**: BE seçin. Sistem otomatik olarak garantili kârı ve BE kaybını dengeleyerek 0 TL gösterir.

### S: 1.2R'ye ulaşmadan stop loss'a takıldı, ne yapmalıyım?
**C**: "Kayıp (SL)" seçin. Tam -250 TL kayıp olarak kaydedilir.

---

## 🚀 Pro İpuçları

### 1. Notları Kullanın
```
Örnek Notlar:
- "Güçlü trend, 6R'de kapandı"
- "3R'de %15, 5R'de %15"
- "Haber sonrası volatilite"
- "BE çekildi, risk yönetimi"
```

### 2. RRR Hesaplama
Kısmi kapanışlarda:
```
%15 @ 3R + %15 @ 5R = ?

Toplam Kâr = (0.15 × 3 × 250) + (0.15 × 5 × 250)
           = 112.5 + 187.5
           = 300 TL

Eşdeğer RRR = 300 / (0.30 × 250) = 4.0R
```

### 3. Gerçek Zamanlı Takip
İşlemi kapattığınız anda siteye girin. Hafızaya güvenmeyin!

---

**Başarılı Tradeler! 🎯📈**

*Bu örnekler, Runner Tracker sisteminin nasıl çalıştığını gösterir. Sorularınız için README.md dosyasına bakın.*

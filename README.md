# XML Field Mapper (Public)

Sadeleştirilmiş XML Field Mapper: sadece **kaynak** ve **hedef** XML yükleme, alan eşleme (map) ve dönüştürülmüş XML export.

## Özellikler

- **Adım 1: XML Yükle** — Kaynak (dönüştürülecek) ve hedef (çıktı şablonu) XML dosyalarını yükle
- **Adım 2: Alan Eşleme** — Kaynak alanları hedef alanlara eşle, isteğe bağlı dönüşümler uygula
- **Adım 3: Çıktı** — Oluşan XML’i önizle, panoya kopyala veya indir

Kategori ağacı / kategori XML eşleme gibi özelleştirmeler bu sürümde **yoktur**.

## Gereksinimler

- Node.js 18+ ve npm

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Uygulama `http://localhost:5173/` adresinde açılır.

## Build

```bash
npm run build
```

## Kullanım

1. **Yükle**: Kaynak XML ve hedef (şablon) XML dosyalarını sürükle-bırak veya seç.
2. **Eşle**: Her hedef alan için kaynak alanı seç; gerekirse split, substring, replace vb. dönüşüm ekle.
3. **Çıktı**: Oluşan XML’i kopyala veya `output.xml` olarak indir.

## Proje Yapısı

```
src/
├── App.tsx
├── components/
│   ├── StepIndicator.tsx
│   ├── UploadStep.tsx      # Kaynak + hedef XML yükleme
│   ├── MappingStep.tsx      # Alan eşleme (kategori yok)
│   ├── OutputStep.tsx       # XML önizleme ve export
│   └── SearchableSelect.tsx
├── utils/
│   ├── xmlParser.ts
│   ├── xmlGenerator.ts
│   └── transformations.ts
├── types/
│   └── index.ts
└── index.css
```

## Lisans

MIT

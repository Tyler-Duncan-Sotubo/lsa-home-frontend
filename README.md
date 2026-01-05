src/
├─ storefront-config/
│ ├─ local/
│ │ ├─ base/
│ │ │ ├─ theme.json
│ │ │ ├─ header.json
│ │ │ ├─ footer.json
│ │ │ ├─ pages/
│ │ │ │ ├─ home.json
│ │ │ │ ├─ collection.json
│ │ │ │ └─ product.json
│ │ │ └─ seo.json
│ │ └─ stores/
│ │ ├─ serene.json
│ │ └─ greysteed.json
│ │
│ ├─ runtime/
│ │ ├─ get-store-id.ts
│ │ ├─ get-storefront-config.ts <-- the single switch later
│ │ ├─ merge.ts # optional
│ │ └─ types.ts # shared config type
│ │
│ └─ index.ts

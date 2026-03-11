## XML Field Mapper (Public)

A lightweight, browser-based XML field mapping tool.  
You upload a **source XML** and a **target/template XML**, visually map fields between them, optionally apply simple transformations, and export a transformed XML that matches the target structure.

This repository is a simplified, standalone version intended for experimentation, demos, and integration into other tools.

### Key Features

- **Step 1 – Upload XML files**
  - Select or drag & drop a *source* XML (the data you want to transform).
  - Select or drag & drop a *target/template* XML (the desired output shape).
- **Step 2 – Field mapping**
  - Browse target fields and pick which source field each one should read from.
  - Apply optional transformations such as `split`, `substring`, `replace`, etc.
- **Step 3 – Output**
  - Preview the generated XML in the browser.
  - Copy the result to clipboard or download it as `output.xml`.

> **Out of scope:**  
> Category trees / category XML mapping or other domain‑specific flows are intentionally **not** included in this public version.

### Tech Stack

- **React + TypeScript** (Vite)
- **Tailwind CSS** for styling
- Simple, stateless front‑end only – no backend required.

---

## Requirements

- **Node.js 18+**
- **npm** (or a compatible package manager such as `pnpm`/`yarn`, if you adapt the scripts)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/` (default Vite dev URL).

### 3. Create a production build

```bash
npm run build
```

You can then serve the generated `dist/` folder with any static file server.

---

## Usage Guide

1. **Upload XML files**
   - In the first step, load your *source* XML and *target/template* XML.
   - The parser will extract a flattened representation of fields from each document.
2. **Configure mappings**
   - For each target field, choose which source field should populate it.
   - Optionally attach basic transformations (e.g. splitting a value, taking a substring, string replacement).
3. **Generate and export**
   - Preview the transformed XML.
   - Copy it directly from the UI or download as `output.xml` for further use.

This flow is designed to be repeatable and fast, making it useful for quickly prototyping XML integrations.

---

## Project Structure

```text
src/
├── App.tsx
├── components/
│   ├── StepIndicator.tsx      # Multi-step UI indicator
│   ├── UploadStep.tsx         # Source + target XML upload
│   ├── MappingStep.tsx        # Field mapping & transformations
│   ├── OutputStep.tsx         # XML preview & export
│   └── SearchableSelect.tsx   # Searchable dropdown for field selection
├── utils/
│   ├── xmlParser.ts           # XML → internal representation
│   ├── xmlGenerator.ts        # Internal representation → XML
│   └── transformations.ts     # Reusable transformation helpers
├── types/
│   └── index.ts               # Shared TypeScript types
└── index.css                  # Global styles / Tailwind entry
```

---

## Notes & Limitations

- The XML parser is designed for typical integration‑style XMLs and may not support every edge case of the XML spec.
- Large XML files may impact browser performance; this tool is primarily intended for small–medium payloads.
- There is no persistence layer; mappings exist only in the current browser session.

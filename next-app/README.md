# Next.js File Manager

Conversion of the Flask dashboard to Next.js + TypeScript.

## Setup

```bash
cd next-app
npm install
npm run dev
```

Visit **http://localhost:3000/dashboard**

---

## File Structure

```
next-app/
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── api/
│   │   └── files/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── types.ts
├── tsconfig.json
└── package.json
```

## How it works

1. `app/dashboard/page.tsx` — client component that calls `/api/files` on mount, shows skeleton rows while loading, then renders the file list.
2. `app/api/files/route.ts` — Next.js Route Handler returning mock `FileRecord[]` as JSON. Swap `MOCK_DATA` for a real DB query when ready.
3. `lib/types.ts` — shared TypeScript interfaces used by both the page and the API route.
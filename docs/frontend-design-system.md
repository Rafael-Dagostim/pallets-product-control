# Frontend Design System — Paletes Maracajá

Reference document for all frontend visual decisions. Source of truth for colors, typography, components, and layout patterns.

---

## Color Palette

### Core Colors

| Token | Hex | HSL | CSS Variable | Usage |
|-------|-----|-----|-------------|-------|
| Background | `#FFF9F0` | `36 100% 97%` | `--background` | Page background (cream) |
| Foreground | `#2C1F16` | `20 34% 13%` | `--foreground` | Default text color (dark brown) |
| Card | `#EFDEC4` | `36 56% 85%` | `--card` | Card/modal backgrounds (tan) |
| Card Foreground | `#2C1F16` | `20 34% 13%` | `--card-foreground` | Text on cards |
| Primary | `#B8860B` | `43 89% 38%` | `--primary` | Buttons, active nav, links (golden) |
| Primary Foreground | `#FFFFFF` | `0 0% 100%` | `--primary-foreground` | Text on primary buttons (white) |
| Secondary | `#2C1F16` | `20 34% 13%` | `--secondary` | Header/navbar background (dark brown) |
| Secondary Foreground | `#B8860B` | `43 89% 38%` | `--secondary-foreground` | Text on header (golden) |
| Destructive | `#B8250B` | `9 89% 38%` | `--destructive` | Delete/cancel buttons (red) |
| Destructive Foreground | `#FFFFFF` | `0 0% 100%` | `--destructive-foreground` | Text on destructive buttons |
| Muted | `#D4C4A8` | `36 30% 74%` | `--muted` | Disabled/muted backgrounds |
| Muted Foreground | `#8B7355` | `30 25% 44%` | `--muted-foreground` | Placeholder text, subtle labels |
| Border | `#2C1F16` | `20 34% 13%` | `--border` | Card borders (dark brown) |
| Input | `#2C1F16` | `20 34% 13%` | `--input` | Input underline color |
| Ring | `#B8860B` | `43 89% 38%` | `--ring` | Focus ring (golden) |

### Status Badge Colors

| Status | Background | Text | Usage |
|--------|-----------|------|-------|
| ATIVO / OPEN | `#B8860B` (golden) | `#FFFFFF` | Active/open records |
| REFORMED | `#4A7C59` (green) | `#FFFFFF` | Reformed production |
| IN_PRODUCTION | `#2563EB` (blue) | `#FFFFFF` | Orders in production |
| DONE | `#4A7C59` (green) | `#FFFFFF` | Completed orders |
| CANCELED | `#B8250B` (red) | `#FFFFFF` | Canceled items |
| PAID | `#4A7C59` (green) | `#FFFFFF` | Paid production |

---

## Typography

### Font Family
- **Primary**: `Lato` (Google Fonts)
- **Fallback**: `system-ui, -apple-system, sans-serif`
- Load via `next/font/google` in `layout.tsx`

### Font Weights
| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, form labels |
| Bold | 700 | Card titles, headings, buttons |
| Black | 900 | Brand title "PALETES" |

### Font Sizes (Tailwind classes)
| Element | Mobile | Desktop | Class |
|---------|--------|---------|-------|
| Page title | 24px | 32px | `text-2xl md:text-3xl font-bold` |
| Card title | 18px | 20px | `text-lg md:text-xl font-bold uppercase` |
| Card subtitle | 14px | 14px | `text-sm` |
| Body text | 16px | 16px | `text-base` |
| Button text | 14px | 16px | `text-sm md:text-base font-bold uppercase` |
| Input placeholder | 16px | 16px | `text-base` |
| Nav label | 12px | 14px | `text-xs md:text-sm` |
| Badge | 12px | 12px | `text-xs font-bold uppercase` |
| Brand "PALETES" | 28px | 36px | `text-3xl md:text-4xl font-black` |
| Brand "Maracajá" | 18px | 24px | `text-lg md:text-2xl` |

---

## Component Patterns

### Button Variants
| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary (default) | `#B8860B` | White | None | SALVAR, LOGIN, ADICIONAR |
| Destructive | `#B8250B` | White | None | EXCLUIR, CANCELAR |
| Outline | Transparent | `#2C1F16` | `#2C1F16` | Secondary actions |
| Ghost | Transparent | `#2C1F16` | None | Nav items, subtle links |

All buttons: `rounded-lg`, `font-bold`, `uppercase`, `px-6 py-3`, `tracking-wide`

### Input Style (Underline)
- **Background**: Transparent
- **Border**: Bottom only (`border-b-2`), color `#2C1F16`
- **Focus**: Bottom border changes to golden `#B8860B`
- **Placeholder**: Muted foreground `#8B7355`
- **Icon prefix**: Left-aligned icon (user, lock, etc.) in muted foreground
- **No box shadow, no ring, no rounded corners**

### Card Style
- **Background**: `#EFDEC4` (tan)
- **Border**: `2px solid #2C1F16` (dark brown)
- **Border radius**: `rounded-xl` (12px)
- **Padding**: `p-4 md:p-5`
- **Shadow**: Subtle `shadow-sm`
- **Hover**: Slight scale `hover:scale-[1.01]` + `transition-transform`
- **Click**: Cursor pointer when interactive

### Modal/Dialog Style
- **Background**: `#EFDEC4` (tan)
- **Border**: `2px solid #2C1F16`
- **Border radius**: `rounded-xl`
- **Close button**: X icon in top-left, dark brown
- **Overlay**: Semi-transparent dark (`bg-black/50`)
- **Width**: Full on mobile (with margin), max `480px` on desktop

### Badge Style
- **Border radius**: `rounded-full`
- **Padding**: `px-3 py-1`
- **Font**: `text-xs font-bold uppercase`
- Colors per status (see Status Badge Colors table above)

---

## Navigation Patterns

### Mobile (< 768px / `md` breakpoint)
- **Position**: Fixed bottom (`fixed bottom-0`)
- **Height**: 64px
- **Background**: `#2C1F16` (dark brown)
- **Layout**: 4 main tab icons + "Mais" (ellipsis) overflow button
- **Main tabs**: Paletes, Colaboradores, Produção, Pedidos
- **Overflow** ("Mais"): Opens a Sheet from bottom with Clientes + Relatório
- **Active tab**: Golden text `#B8860B` + golden icon
- **Inactive tab**: Muted text `#8B7355`
- **Each tab**: Icon (24px) + label below (12px)

### Desktop (>= 768px)
- **Position**: Fixed top (`fixed top-0`)
- **Height**: 64px
- **Background**: `#2C1F16` (dark brown)
- **Layout**: Logo left | 6 horizontal tabs center | User name + dropdown right
- **Logo**: Pallet icon + "Paletes Maracajá" text
- **Active tab**: Golden text + bottom border accent
- **All 6 tabs visible**: Paletes, Colaboradores, Produção, Pedidos, Clientes, Relatório

### Mobile Header (list pages only)
- Dark brown background, full width
- Pallet logo illustration (SVG) + "Paletes Maracajá" text in golden
- Visible only on mobile, hidden on desktop (navbar has logo)

---

## Layout & Spacing

### Responsive Breakpoints
| Breakpoint | Width | Tailwind | Usage |
|-----------|-------|----------|-------|
| Mobile | < 768px | default | Single column, bottom nav |
| Desktop | >= 768px | `md:` | Multi-column where needed, top nav |
| Wide | >= 1280px | `xl:` | Max container width |

### Container
- **Max width**: `max-w-4xl` (896px) for content pages
- **Padding**: `px-4 md:px-6`
- **Center**: `mx-auto`
- **Top offset** (desktop): `pt-20` (for fixed top nav)
- **Bottom offset** (mobile): `pb-20` (for fixed bottom nav)

### Card List Spacing
- **Gap between cards**: `gap-3 md:gap-4` (12px mobile, 16px desktop)
- **List layout**: Single column stack (`flex flex-col`)

### Form Spacing
- **Gap between inputs**: `gap-6` (24px)
- **Button group**: `flex gap-4`, aligned at bottom

---

## Login Page Layout

### Mobile
```
┌──────────────────────────┐
│ ████ Dark Brown ████████ │  Header (40% height)
│   PALETES                │
│     Maracajá             │
│   [pallet illustration]  │
│                          │
├──────────────────────────┤
│                          │  Cream body (60%)
│      Bem Vindo           │
│                          │
│  👤 usuário              │  Underline input
│  ──────────────────────  │
│                          │
│  🔒 Senha                │  Underline input
│  ──────────────────────  │
│                          │
│   ┌──────────────────┐   │
│   │     LOGIN        │   │  Golden button
│   └──────────────────┘   │
│                          │
│  Develop by Rafael D.    │  Footer
└──────────────────────────┘
```

### Desktop
```
┌─────────────────┬──────────────────────────┐
│                 │                          │
│  Dark Brown     │       Bem Vindo          │
│  Left Panel     │                          │
│                 │  👤 usuário              │
│  PALETES        │  ──────────────────────  │
│    Maracajá     │                          │
│  [pallet]       │  🔒 Senha               │
│                 │  ──────────────────────  │
│  ~~~waves~~~    │                          │
│  ~~~waves~~~    │  ┌──────────────────┐    │
│                 │  │      LOGIN       │    │
│                 │  └──────────────────┘    │
│                 │                          │
│                 │  Develop by Rafael D.    │
└─────────────────┴──────────────────────────┘
     40% width              60% width
```

---

## Env Variables (Frontend)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

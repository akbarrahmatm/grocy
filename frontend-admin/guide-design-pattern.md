# Design Patterns & Project Guidelines

A living reference for architecture decisions, folder structure, and coding conventions used in this project.

**Stack:** React 19 · Vite 8 · TypeScript 6 · Tailwind CSS v4 · React Router v7

---

## Table of Contents

1. [Project Structure — React + Vite](#1-project-structure--react--vite)
2. [Component Patterns](#2-component-patterns)
3. [Styling with Tailwind v4](#3-styling-with-tailwind-v4)
4. [Routing](#4-routing)
5. [State Management](#5-state-management)
6. [TypeScript Conventions](#6-typescript-conventions)
7. [File & Naming Conventions](#7-file--naming-conventions)
8. [Performance Best Practices](#8-performance-best-practices)

---

## 1. Project Structure — React + Vite

### Recommended Folder Layout

```
src/
├── assets/                   # Static files (images, fonts, svgs)
│   ├── hero.webp
│   └── students-hero.webp
│
├── components/               # Reusable UI building blocks
│   ├── ui/                   # Primitive components (Button, Badge, Card, etc.)
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   │
│   ├── layout/               # Page-level structure
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   └── sections/             # Landing page sections (each = one scroll block)
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       ├── TestimonialsSection.tsx
│       ├── PricingSection.tsx
│       └── CTASection.tsx
│
├── hooks/                    # Custom React hooks
│   ├── useScrollAnimation.ts
│   └── useMediaQuery.ts
│
├── lib/                      # Helpers, constants, utilities
│   ├── constants.ts
│   └── utils.ts
│
├── pages/                    # Route-level pages
│   ├── Index.tsx             # Composes sections, no business logic here
│   └── NotFound.tsx
│
├── types/                    # Shared TypeScript types & interfaces
│   └── index.ts
│
├── App.tsx
├── main.tsx
└── index.css                 # Global Tailwind entry point
```

### The Golden Rule for `pages/`

`pages/` files are **orchestrators**, not implementors.

```tsx
// ✅ Good — Index.tsx only composes, never defines UI directly
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import Footer from "@/components/layout/Footer";

export default function Index() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
```

```tsx
// ❌ Bad — Index.tsx with 300 lines of JSX and inline styles
export default function Index() {
  return (
    <main>
      <nav className="flex justify-between p-4 ...">
        {/* 50 lines of navbar */}
      </nav>
      <section className="...">{/* 100 lines of hero */}</section>
      {/* and so on... */}
    </main>
  );
}
```

### When to Create a New File

| Signal                                     | Action                  |
| ------------------------------------------ | ----------------------- |
| A section is visually distinct on the page | New file in `sections/` |
| A component is used in 2+ places           | New file in `ui/`       |
| A block of JSX exceeds ~50 lines           | Split it out            |
| Logic can be reused across components      | Extract to `hooks/`     |

### Path Aliases

Always use `@/` alias instead of relative paths. Configure in `vite.config.ts` and `tsconfig.app.json`:

```ts
// vite.config.ts
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```tsx
// ✅ Use this
import HeroSection from "@/components/sections/HeroSection";

// ❌ Not this
import HeroSection from "../../components/sections/HeroSection";
```

---

## 2. Component Patterns

### Component File Anatomy

Each component file should follow this order:

```tsx
// 1. Imports
import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";

// 2. Types / Interfaces (local to this file)
interface Props {
  title: string;
  description?: string;
}

// 3. Component
export default function FeatureCard({ title, description }: Props) {
  // 4. Hooks first
  const [isOpen, setIsOpen] = useState(false);

  // 5. Derived state / handlers
  const handleClick = () => setIsOpen((prev) => !prev);

  // 6. Render
  return (
    <div className="...">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### Component Granularity

```
Page
└── Section          ← one scroll block (HeroSection, PricingSection)
    └── Component    ← reusable piece (FeatureCard, PricingTier)
        └── UI       ← primitive (Button, Badge, Icon)
```

Do not skip levels — a `Section` should not directly render raw `<button>` elements; use `ui/Button` instead.

---

## 3. Styling with Tailwind v4

This project uses **Tailwind CSS v4** via the Vite plugin (`@tailwindcss/vite`). There is no `tailwind.config.js` — configuration lives in CSS.

### Global Entry Point

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* Define design tokens here */
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --font-display: "Cal Sans", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

### Component-Level Styling

Since this project uses Tailwind, **do not create separate CSS files per component**. Keep styling in the JSX via utility classes.

```tsx
// ✅ Correct — Tailwind utilities inline
<button className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover transition">
  Get Started
</button>;

// ❌ Avoid — separate .css file for a single component
import "./Button.css";
```

### When a Separate CSS File Is Justified

Only reach for a custom CSS file when:

- You need complex animations (`@keyframes`) that Tailwind can't express
- You're working with a third-party library that requires class overrides
- A pseudo-element pattern (`::before`, `::after`) is too verbose as utilities

In those cases, create `src/styles/animations.css` and import it once in `index.css`.

### Reusable Class Patterns

For class combos used in many places, extract to a utility function — not a CSS file:

```ts
// src/lib/utils.ts
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
```

```tsx
<div className={cn("rounded-xl p-6", isActive && "ring-2 ring-primary")}>
```

---

## 4. Routing

This project uses **React Router v7**.

### Route Definition

Routes are defined in `App.tsx`:

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Adding New Pages

1. Create the file in `src/pages/`
2. Add its `<Route>` in `App.tsx`
3. Never import a page directly inside another page — use links

---

## 5. State Management

For a landing page, you rarely need global state. Follow this hierarchy:

```
Local useState → Props drilling (max 2 levels) → Context → External library
```

### Local State

Default for UI toggles, form inputs, and ephemeral interactions:

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false);
```

### Shared State via Context

Use React Context only for truly global concerns (theme, language, auth):

```tsx
// src/context/ThemeContext.tsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

## 6. TypeScript Conventions

### Prefer `interface` for Props, `type` for Unions

```ts
// Props → interface
interface ButtonProps {
  label: string;
  variant?: "primary" | "ghost";
  onClick?: () => void;
}

// Unions / computed types → type
type Variant = "primary" | "secondary" | "ghost";
type SectionId = "hero" | "features" | "pricing" | "cta";
```

### Shared Types

Put types used across multiple files in `src/types/index.ts`:

```ts
// src/types/index.ts
export interface NavItem {
  label: string;
  href: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
}
```

### Avoid `any`

```ts
// ❌ Bad
const handleData = (data: any) => { ... }

// ✅ Good
const handleData = (data: Testimonial[]) => { ... }
```

---

## 7. File & Naming Conventions

| Item               | Convention                  | Example                    |
| ------------------ | --------------------------- | -------------------------- |
| Component files    | PascalCase                  | `HeroSection.tsx`          |
| Hook files         | camelCase with `use` prefix | `useScrollAnimation.ts`    |
| Utility files      | camelCase                   | `utils.ts`, `constants.ts` |
| CSS files (if any) | Same name as component      | `HeroSection.module.css`   |
| Type files         | camelCase or `index.ts`     | `types/index.ts`           |
| Asset files        | kebab-case                  | `students-hero.webp`       |

### One Component Per File

```
// ✅ One file, one default export
// HeroSection.tsx
export default function HeroSection() { ... }

// ❌ Avoid multiple components in one file (except tiny sub-components)
```

---

## 8. Performance Best Practices

### Images

Always use `.webp` format and add explicit dimensions to avoid layout shift:

```tsx
<img
  src="/assets/students-hero.webp"
  alt="Students collaborating"
  width={800}
  height={500}
  loading="lazy"
/>
```

### Code Splitting

Lazy-load page components for faster initial load:

```tsx
// App.tsx
import { lazy, Suspense } from "react";

const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</Suspense>;
```

### Icons

Import only the icons you use from `react-icons` — do not import the whole pack:

```tsx
// ✅ Tree-shakeable
import { FiArrowRight, FiMenu } from "react-icons/fi";

// ❌ Heavy
import * as Icons from "react-icons/fi";
```

---

> This document should be updated whenever a new pattern is introduced or an existing convention changes. Treat it as the source of truth for how this codebase is organized.

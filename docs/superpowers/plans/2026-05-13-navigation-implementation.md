# Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent top navigation bar with "May"hem Sprint branding and responsive hamburger menu for Log Activity and Leaderboard links.

**Architecture:** Create a new `Navigation.tsx` client component that renders a sticky top bar. The component detects the current pathname to highlight the active link, uses `usePathname()` from Next.js, and manages hamburger menu state with `useState`. On desktop (≥768px), show horizontal links; on mobile, show a hamburger icon that toggles a dropdown menu. Insert the component into `layout.tsx` so it wraps all pages.

**Tech Stack:** React (hooks: `useState`, `usePathname`), Next.js Link, Tailwind CSS, lucide-react (Menu, X icons)

---

## Task 1: Create Navigation Component

**Files:**
- Create: `src/components/Navigation.tsx`

- [ ] **Step 1: Create the Navigation component file with initial structure**

```tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="sticky top-0 z-50 bg-brand-black border-b border-brand-surface">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-lg font-bold">
            <span className="text-brand-gold">May</span>
            <span className="text-white">hem Sprint</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white hover:text-brand-gold-bright'
            }`}
          >
            Log Activity
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm font-medium transition-colors ${
              isActive('/leaderboard') ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white hover:text-brand-gold-bright'
            }`}
          >
            Leaderboard
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-brand-gold hover:text-brand-gold-bright"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-surface border-t border-brand-black">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-2">
            <Link
              href="/"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-brand-gold text-brand-black' : 'text-white hover:bg-brand-black'
              }`}
            >
              Log Activity
            </Link>
            <Link
              href="/leaderboard"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/leaderboard') ? 'bg-brand-gold text-brand-black' : 'text-white hover:bg-brand-black'
              }`}
            >
              Leaderboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Run the dev server to verify no syntax errors**

```bash
npm run dev
```

Expected: Server starts without TypeScript or import errors.

---

## Task 2: Integrate Navigation into Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Import Navigation component at the top**

```tsx
import { Navigation } from '@/components/Navigation'
```

- [ ] **Step 2: Add Navigation inside body before children**

Replace:
```tsx
<body className={`${poppins.variable} font-sans bg-brand-black text-white`}>
  {children}
</body>
```

With:
```tsx
<body className={`${poppins.variable} font-sans bg-brand-black text-white`}>
  <Navigation />
  {children}
</body>
```

- [ ] **Step 3: Run dev server and verify nav appears on all pages**

Navigate to:
- `http://localhost:3000/` (should highlight "Log Activity")
- `http://localhost:3000/leaderboard` (should highlight "Leaderboard")
- Resize browser to mobile width and verify hamburger appears
- Tap hamburger, verify menu opens and closes
- Tap a menu link, verify menu closes

Expected: Nav bar is sticky at top, active link is gold-highlighted, mobile hamburger works smoothly.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navigation.tsx src/app/layout.tsx
git commit -m "feat: add persistent top navigation with responsive hamburger menu"
```

---

## Task 3: Visual Polish and Accessibility

**Files:**
- Modify: `src/components/Navigation.tsx`

- [ ] **Step 1: Add smooth transitions and hover effects to logo**

Replace the logo Link section with:
```tsx
<Link 
  href="/" 
  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
>
  <span className="text-lg font-bold">
    <span className="text-brand-gold hover:text-brand-gold-bright transition-colors">May</span>
    <span className="text-white">hem Sprint</span>
  </span>
</Link>
```

- [ ] **Step 2: Add aria labels and semantic HTML improvements**

Ensure the nav uses proper ARIA attributes (already in place with `aria-label` on hamburger button). Verify `<nav>` semantic tag is used (it is).

- [ ] **Step 3: Test on mobile device or responsive emulator**

Open DevTools → toggle device toolbar → test at iPhone 375px width.
- Hamburger appears and is tappable
- Menu slides out smoothly
- Links are large enough to tap (48px minimum height)

Expected: All interactions work smoothly on mobile.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "style: add smooth transitions and hover effects to navigation"
```

---

## Spec Coverage Checklist

✅ Desktop layout (≥768px): Horizontal nav bar with logo and two links  
✅ Mobile layout (<768px): Hamburger menu that toggles dropdown  
✅ Logo styling: "May" in gold, "hem Sprint" in white  
✅ Active link indication: Gold text/underline on desktop, gold background on mobile  
✅ Sticky positioning: Nav bar stays at top when scrolling  
✅ Link destinations: "/" for Log Activity, "/leaderboard" for Leaderboard  
✅ Component integration: Navigation wrapped in layout.tsx  

---

## Plan complete and saved to `docs/superpowers/plans/2026-05-13-navigation-implementation.md`. 

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

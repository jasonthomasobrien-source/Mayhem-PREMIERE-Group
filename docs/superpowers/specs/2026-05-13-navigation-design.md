# Navigation Design: Top Bar with Responsive Hamburger

**Date:** 2026-05-13  
**Scope:** Add persistent top navigation bar with logo and links to Log Activity and Leaderboard pages.

---

## Overview

The app needs a prominent, always-visible navigation bar that directs users between the two core pages: logging outreach and viewing the leaderboard. The nav bar lives at the top of every page and includes the "May"hem Sprint branding.

---

## Desktop Layout (≥768px)

```
┌──────────────────────────────────────────────────────────┐
│  May"hem Sprint                    Log Activity | Leaderboard │
└──────────────────────────────────────────────────────────┘
```

- **Left:** "May"hem Sprint" logo/text, clickable (links to `/`)
  - "May" is rendered in gold (#B18F32 or #D4AF54 on hover)
  - "hem Sprint" is white
- **Right:** Two nav links
  - "Log Activity" (links to `/`)
  - "Leaderboard" (links to `/leaderboard`)
  - Both are text buttons with gold text on hover
  - Active link (current page) gets a gold underline
- **Background:** Dark (`bg-brand-black` or `bg-brand-surface`)
- **Height:** ~56px (compact, doesn't dominate)

---

## Mobile Layout (<768px)

```
┌────────────────────────────────┐
│  May"hem Sprint              [≡]│
└────────────────────────────────┘
     ↓ (tap hamburger)
┌────────────────────────────────┐
│  Log Activity                  │
│  Leaderboard                   │
└────────────────────────────────┘
```

- **Left:** "May"hem Sprint" logo/text (same as desktop)
- **Right:** Hamburger menu icon (☰)
- **Tap hamburger:** Reveals dropdown/slide-out menu below the nav bar
  - "Log Activity"
  - "Leaderboard"
  - Links are full-width or padded, readable on touch
  - Active link gets gold highlight
  - Menu dismisses on link tap or click outside

---

## Styling Details

| Element | Style |
|---------|-------|
| Nav bar background | `bg-brand-black` or `bg-brand-surface` |
| Logo "May" text | Gold (#B18F32), bold weight |
| Logo "hem Sprint" text | White (#FFFFFF) |
| Nav links (desktop) | White text, gold (#D4AF54) on hover |
| Active link | Gold underline or background tint |
| Hamburger icon | Gold (#D4AF54), 24px |
| Mobile menu background | `bg-brand-surface`, matches nav bar |
| Mobile menu links | White text, gold (#D4AF54) on tap |

---

## Behavior

- **Always visible:** Sticky to top across all pages
- **Logo as home:** Clicking "May"hem Sprint" on any page navigates to `/`
- **Active link indication:** The current page's link is highlighted with gold
  - Desktop: gold underline
  - Mobile: gold background or text color
- **Menu persistence:** Mobile menu closes after selecting a link
- **Breakpoint:** Hamburger appears at `md` (768px), horizontal nav at desktop

---

## Component Structure

Create a new `Navigation.tsx` component (client-side for interactivity):
- Render at the top of the layout or on each page
- Accept current pathname to highlight active link
- Use `useRouter()` to detect which page is active
- Handle hamburger open/close state with `useState`

Place the nav bar inside `layout.tsx` so it wraps all routes without duplication.

---

## Migration

Update `src/app/layout.tsx`:
- Import `Navigation` component
- Render it inside `<body>` before `{children}`
- No other layout changes needed; nav bar is self-contained

---

## Out of Scope

- User profile menu
- Notifications or badges
- Search functionality
- Admin link (if needed later, add to mobile menu only)

# 🎨 Navigation Visual Guide: Menu & Gizi Submenu

**Complete Visual Reference for 3 Menu Routes**

---

## 📱 Desktop View

```
┌────────────────────────────────────────────────────┐
│  Bergizi-ID                             Theme  👤  │
│  SPPG Dashboard                                    │
├────────────────────────────────────────────────────┤
│                                                     │
│  🔍 Search...                                      │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  📊 Dashboard                                      │
│                                                     │
├────────────────────────────────────────────────────┤
│  📂 OPERASIONAL                                    │
│                                                     │
│  🍽️ Menu & Gizi                            ▼      │
│     ├─ 📋 Daftar Menu                              │
│     ├─ ➕ Buat Menu Baru                           │
│     └─ 📅 Perencanaan Menu              [New]     │
│                                                     │
│  📦 Procurement                          [New]     │
│  🏭 Produksi                                       │
│  🚛 Distribusi                                     │
│                                                     │
├────────────────────────────────────────────────────┤
│  📂 MANAJEMEN                              ▸       │
│                                                     │
├────────────────────────────────────────────────────┤
│  📂 LAPORAN & ANALISIS                     ▸       │
│                                                     │
├────────────────────────────────────────────────────┤
│  📂 SISTEM                                 ▸       │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 🎯 Active States

### State 1: On `/menu` (Daftar Menu)

```
┌────────────────────────────────────────────────────┐
│  🍽️ Menu & Gizi                            ▼      │
│     ├─ 📋 Daftar Menu            ◄━━━━━━━━━━━━━━│ ACTIVE (Blue bg)
│     ├─ ➕ Buat Menu Baru                           │
│     └─ 📅 Perencanaan Menu              [New]     │
└────────────────────────────────────────────────────┘
```

### State 2: On `/menu/create` (Buat Menu Baru)

```
┌────────────────────────────────────────────────────┐
│  🍽️ Menu & Gizi                            ▼      │
│     ├─ 📋 Daftar Menu                              │
│     ├─ ➕ Buat Menu Baru         ◄━━━━━━━━━━━━━━│ ACTIVE (Blue bg)
│     └─ 📅 Perencanaan Menu              [New]     │
└────────────────────────────────────────────────────┘
```

### State 3: On `/menu/plans` (Perencanaan Menu)

```
┌────────────────────────────────────────────────────┐
│  🍽️ Menu & Gizi                            ▼      │
│     ├─ 📋 Daftar Menu                              │
│     ├─ ➕ Buat Menu Baru                           │
│     └─ 📅 Perencanaan Menu      ◄━━━━━━━ [New]   │ ACTIVE (Blue bg)
└────────────────────────────────────────────────────┘
```

### State 4: Collapsed (Parent Only)

```
┌──────────────┐
│  📊          │
├──────────────┤
│  🍽️          │ ◄─── Menu & Gizi (icon only)
│  📦          │
│  🏭          │
│  🚛          │
└──────────────┘
```

---

## 🎨 Color Scheme

### Light Mode

**Parent Item (Menu & Gizi)**:
- Default: `bg-transparent text-foreground`
- Hover: `bg-accent/50 text-accent-foreground`

**Child Items**:
- Default: `bg-transparent text-muted-foreground`
- Hover: `bg-accent/30 text-foreground`
- Active: `bg-primary text-primary-foreground` (Blue with white text)

**Badge**:
- "New": `bg-secondary text-secondary-foreground`

---

### Dark Mode

**Parent Item (Menu & Gizi)**:
- Default: `bg-transparent text-foreground`
- Hover: `bg-accent/20 text-accent-foreground`

**Child Items**:
- Default: `bg-transparent text-muted-foreground`
- Hover: `bg-accent/10 text-foreground`
- Active: `bg-primary text-primary-foreground` (Blue with white text)

**Badge**:
- "New": `bg-secondary/80 text-secondary-foreground`

---

## 📐 Spacing & Layout

### Hierarchy

```
┌─────────────────────────────────────────┐
│  Parent Item (pl-4)                     │  ← Base padding
│     ├─ Child Item (ml-6 = pl-10)       │  ← Indentation
│     └─ Child Item (ml-6 = pl-10)       │  ← Same level
└─────────────────────────────────────────┘
```

### Dimensions

- **Parent Item Height**: `h-10` (40px)
- **Child Item Height**: `h-9` (36px)
- **Icon Size**: `h-4 w-4` (16x16px)
- **Badge Height**: `h-5` (20px)
- **Chevron Icon**: `h-4 w-4` (16x16px)

### Spacing

- **Parent Padding**: `px-4` (left: 16px, right: 16px)
- **Child Indentation**: `ml-6` (24px)
- **Icon-to-Text Gap**: `mr-2` (8px)
- **Text-to-Badge Gap**: `ml-auto` (auto margin)
- **Chevron Gap**: `ml-2` (8px)

---

## 🎬 Interaction States

### 1. Hover States

#### Parent Hover
```
┌────────────────────────────────────────────────────┐
│  🍽️ Menu & Gizi                            ▼      │
│  └─ bg-accent/50 (light gray background)          │
└────────────────────────────────────────────────────┘
```

#### Child Hover
```
┌────────────────────────────────────────────────────┐
│     ├─ 📋 Daftar Menu                              │
│     │  └─ bg-accent/30 (lighter gray)              │
└────────────────────────────────────────────────────┘
```

### 2. Click Transitions

#### Parent Click (Expand)
```
Before:  🍽️ Menu & Gizi  ▸   (collapsed, chevron right)
After:   🍽️ Menu & Gizi  ▼   (expanded, chevron down)
         ├─ 📋 Daftar Menu
         ├─ ➕ Buat Menu Baru
         └─ 📅 Perencanaan Menu
```

#### Child Click (Navigate)
```
Click "Buat Menu Baru"
  ↓
Router.push('/menu/create')
  ↓
Active state moves to clicked item
  ↓
Page content loads
```

### 3. Auto-Expansion

```
User types URL: /menu/plans
  ↓
Page loads
  ↓
Sidebar detects active route
  ↓
Auto-expand "Menu & Gizi" submenu
  ↓
Highlight "Perencanaan Menu" item
```

---

## 🔄 Animation Flow

### Expand Animation

```css
/* Parent button click */
transition: all 200ms ease-in-out

/* Chevron rotation */
▸ (0deg) → ▼ (90deg)

/* Children reveal */
opacity: 0 → 1
height: 0 → auto
```

### Collapse Animation

```css
/* Parent button click */
transition: all 200ms ease-in-out

/* Chevron rotation */
▼ (90deg) → ▸ (0deg)

/* Children hide */
opacity: 1 → 0
height: auto → 0
```

---

## 📱 Mobile View (Responsive)

### Collapsed Sidebar (width < 1024px)

```
┌─────┐
│ 📊  │ Dashboard
├─────┤
│ 🍽️  │ Menu & Gizi (tap opens mobile drawer)
│ 📦  │ Procurement
│ 🏭  │ Produksi
│ 🚛  │ Distribusi
└─────┘
```

### Mobile Drawer (when expanded)

```
┌───────────────────────────────────────┐
│  ← Back        MENU                 X │
├───────────────────────────────────────┤
│                                        │
│  🍽️ Menu & Gizi                       │
│                                        │
│     📋 Daftar Menu                    │
│                                        │
│     ➕ Buat Menu Baru                 │
│                                        │
│     📅 Perencanaan Menu      [New]   │
│                                        │
└───────────────────────────────────────┘
```

---

## 🎯 Icon Specifications

### Icon Types

| Icon | Name | Size | Color | Usage |
|------|------|------|-------|-------|
| 🍽️ | UtensilsCrossed | 16x16 | currentColor | Parent menu |
| 📋 | List | 16x16 | currentColor | Daftar Menu |
| ➕ | Plus | 16x16 | currentColor | Buat Menu Baru |
| 📅 | Calendar | 16x16 | currentColor | Perencanaan Menu |
| ▼ | ChevronDown | 16x16 | muted-foreground | Expanded |
| ▸ | ChevronRight | 16x16 | muted-foreground | Collapsed |

### Icon Colors by State

**Default State**:
- Light mode: `text-muted-foreground` (#71717a)
- Dark mode: `text-muted-foreground` (#a1a1aa)

**Active State**:
- Light mode: `text-primary-foreground` (#ffffff)
- Dark mode: `text-primary-foreground` (#ffffff)

**Hover State**:
- Light mode: `text-foreground` (#09090b)
- Dark mode: `text-foreground` (#fafafa)

---

## 🏷️ Badge Specifications

### "New" Badge

**Visual**:
```
┌─────────┐
│  New    │ ← bg-secondary, text-secondary-foreground
└─────────┘
```

**Dimensions**:
- Height: `h-5` (20px)
- Padding: `px-2` (left: 8px, right: 8px)
- Font size: `text-xs` (12px)
- Border radius: `rounded-sm` (2px)

**Colors**:
- Light mode: 
  - Background: `hsl(210 40% 96%)` (very light blue)
  - Text: `hsl(222.2 84% 4.9%)` (dark blue)
- Dark mode:
  - Background: `hsl(217.2 32.6% 17.5%)` (dark blue-gray)
  - Text: `hsl(210 40% 98%)` (light blue-white)

---

## 🎨 Component Hierarchy

```
ModularSidebar
├─ Brand Section
│  ├─ Logo (Bergizi-ID icon)
│  ├─ Brand name
│  └─ Subtitle (SPPG Dashboard)
│
├─ Navigation Section (ScrollArea)
│  ├─ Dashboard (single item)
│  │
│  └─ Operasional Group
│     ├─ Menu & Gizi (parent with children)
│     │  ├─ Daftar Menu (child)
│     │  ├─ Buat Menu Baru (child)
│     │  └─ Perencanaan Menu (child with badge)
│     │
│     ├─ Procurement (single item)
│     ├─ Produksi (single item)
│     └─ Distribusi (single item)
│
└─ Footer Section
   ├─ User avatar + name
   └─ Theme toggle
```

---

## 🔍 Accessibility

### ARIA Labels

```html
<!-- Parent button -->
<button 
  aria-expanded="true"
  aria-controls="menu-gizi-submenu"
  aria-label="Menu & Gizi, expanded, has 3 items"
>
  🍽️ Menu & Gizi ▼
</button>

<!-- Child link -->
<a 
  href="/menu/plans"
  aria-current="page"
  aria-label="Perencanaan Menu, new feature"
>
  📅 Perencanaan Menu [New]
</a>
```

### Keyboard Navigation

**Tab**: Move between menu items  
**Enter/Space**: Expand/collapse parent or navigate to page  
**Arrow Up/Down**: Navigate within submenu  
**Escape**: Collapse submenu or close mobile drawer

---

## 🎯 User Journey Visualization

### Journey 1: First-Time User Discovers Planning

```
User logs in
  ↓
Sees sidebar navigation
  ↓
Notices "🍽️ Menu & Gizi" in Operasional
  ↓
Clicks to expand
  ↓
Sees 3 submenu items
  ↓
Notices "📅 Perencanaan Menu" with [New] badge
  ↓
Curious, clicks on it
  ↓
Lands on /menu/plans dashboard
  ↓
Sees metrics + "Buat Rencana Baru" button
  ↓
Creates first plan
  ↓
SUCCESS! Feature adopted
```

### Journey 2: Power User Quick Navigation

```
User opens app
  ↓
Sees "Menu & Gizi" already expanded (last visit)
  ↓
Clicks "➕ Buat Menu Baru"
  ↓
Directly to /menu/create form
  ↓
Fills in menu details
  ↓
Adds ingredients with IngredientSelector
  ↓
Defines recipe steps
  ↓
Reviews nutrition + cost
  ↓
Submits menu
  ↓
Returns to "📋 Daftar Menu" to see new entry
```

---

## 📊 Visual Hierarchy

### Information Architecture

```
Level 1: MAIN NAVIGATION (Dashboard)
  ↓
Level 2: SECTION GROUPS (Operasional, Manajemen, etc.)
  ↓
Level 3: FEATURE AREAS (Menu & Gizi, Procurement, etc.)
  ↓
Level 4: SPECIFIC ACTIONS (Daftar, Buat, Perencanaan)
  ↓
Level 5: DETAIL PAGES (/menu/plans/[id])
```

### Visual Weight

**Highest Priority** (most prominent):
1. Active child item (blue background, white text)
2. "New" badge (draws attention)
3. Parent item when expanded (chevron down)

**Medium Priority**:
4. Hovered items (gray background)
5. Parent items (section headers)

**Lowest Priority** (subtle):
6. Collapsed groups (chevron right)
7. Disabled items (if any)

---

## 🎨 Complete Style Guide

### Typography

**Parent Item**:
- Font size: `text-sm` (14px)
- Font weight: `font-medium` (500)
- Line height: `leading-normal`

**Child Item**:
- Font size: `text-sm` (14px)
- Font weight: `font-normal` (400)
- Line height: `leading-normal`

**Badge**:
- Font size: `text-xs` (12px)
- Font weight: `font-semibold` (600)
- Text transform: `uppercase`

### Borders & Shadows

**No borders on items** (clean design)
**Shadow on hover**: `shadow-sm` (subtle elevation)
**Active item shadow**: None (flat, relies on color)

---

## ✅ Visual QA Checklist

### Desktop (≥1024px)

- [ ] Parent item shows full text + icon
- [ ] Child items indented with ml-6
- [ ] Chevron icon rotates on expand/collapse
- [ ] Active state shows blue background
- [ ] "New" badge visible and readable
- [ ] Hover states work on all items
- [ ] Icons render at correct size (16x16)
- [ ] Spacing consistent across all items

### Tablet (768px - 1023px)

- [ ] Sidebar collapses to icon-only on smaller tablets
- [ ] Tap targets large enough (min 44x44)
- [ ] Mobile drawer opens correctly
- [ ] Submenu items visible in drawer

### Mobile (<768px)

- [ ] Hamburger menu triggers drawer
- [ ] Drawer slides in from left
- [ ] Navigation items stack vertically
- [ ] Close button in top right
- [ ] Backdrop closes drawer on tap

### Dark Mode

- [ ] All colors adjust correctly
- [ ] Sufficient contrast (WCAG AA)
- [ ] Active state visible
- [ ] Icons readable
- [ ] Badge colors adjusted

---

## 🎉 Visual Design Complete

**Status**: ✅ **Production-Ready Visual Design**

All visual elements implemented according to enterprise design system standards with:
- Clear hierarchy
- Consistent spacing
- Accessible colors
- Smooth animations
- Responsive layouts
- Touch-friendly targets

---

**Last Updated**: October 10, 2025  
**Design System**: Bergizi-ID Enterprise UI  
**Version**: 1.0.0

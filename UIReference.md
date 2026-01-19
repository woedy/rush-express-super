# RushExpress UI/UX Reference

Use this document to keep the rider, merchant, and admin web apps visually aligned with the customer app (`web-customer`).

## Source of Truth
- Tailwind configuration: `web-customer/tailwind.config.ts`
- Design tokens + utilities: `web-customer/src/index.css`

## Core Design Tokens
### Brand Colors
- Primary: Deep Navy (`--primary`, `--primary-glow`)
- Secondary: Energetic Orange (`--secondary`, `--secondary-glow`)
- Accent: Modern Teal (`--accent`)

### Status Colors
- Success: `--success`
- Warning: `--warning`
- Destructive: `--destructive`

### Surface + Typography
- Background: `--background`
- Foreground: `--foreground`
- Card: `--card`
- Muted: `--muted`
- Font: `Inter` with `font-sans`

## Shadows, Gradients, and Utilities
- Gradients: `--gradient-hero`, `--gradient-secondary`, `--gradient-subtle`, `--gradient-card`
- Shadows: `--shadow-soft`, `--shadow-medium`, `--shadow-strong`, `--shadow-glow`
- Utility classes: `.gradient-hero`, `.shadow-soft`, `.transition-smooth`, `.text-gradient`

## Component Library
Base UI components are in `web-customer/src/components/ui`. Reuse these patterns for other web apps to maintain consistency.

## Implementation Guidance
- Mirror Tailwind config and CSS variables from the customer app.
- Keep spacing, radius, and animation tokens aligned with `web-customer`.
- When building new screens, check against the customer app for color usage, layout density, and button styles.

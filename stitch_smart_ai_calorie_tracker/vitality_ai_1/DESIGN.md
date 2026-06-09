---
name: Vitality AI
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#584237'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#006591'
  on-tertiary: '#ffffff'
  tertiary-container: '#09a4e8'
  on-tertiary-container: '#003650'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is built for a high-performance health and AI platform that balances clinical precision with human energy. The brand personality is optimistic, proactive, and authoritative. 

The aesthetic follows a **Modern Corporate** style with a focus on high-clarity layouts and subtle **Glassmorphism** for data visualization layers. The UI should evoke a sense of "intelligent vitality"—where clean, expansive white space meets high-energy accents. Surfaces should feel light and airy, utilizing soft shadows and intentional color pops to guide the user through complex health data with ease.

## Colors

The palette is anchored by a high-visibility **Vibrant Orange**, used strategically for primary call-to-actions, progress indicators, and core branding elements to stimulate energy and movement.

**Professional Blue** serves as the secondary anchor, providing a calming, trustworthy counterpoint used for navigational elements, technical data points, and supportive UI components.

The interface relies heavily on a **Clean White** foundation and a series of cool, light grays (`#f1f5f9`, `#f8fafc`) to maintain a medical-grade cleanliness. High-contrast slate is used for typography to ensure maximum legibility for health metrics.

## Typography

This design system utilizes **Manrope** across all levels to leverage its modern, geometric construction and excellent legibility in digital health interfaces. 

Headlines use bold and extra-bold weights with slight negative letter-spacing to create a confident, impactful visual hierarchy. Body text is set with generous line-height to maintain breathability in data-dense layouts. Labels and captions utilize semi-bold weights and slight tracking to ensure they remain distinct from body prose, even at small scales.

## Layout & Spacing

The design system employs a **Fluid Grid** model based on an 8px spatial scale. 

- **Desktop:** 12-column grid with 24px gutters and 48px outer margins.
- **Tablet:** 8-column grid with 20px gutters and 32px outer margins.
- **Mobile:** 4-column grid with 16px gutters and 16px outer margins.

Spacing is designed to be "airy." Large sections of health data should be separated by `lg` (40px) or `xl` (64px) vertical rhythms to prevent cognitive overload. Elements within cards and components follow the `base` (4px) or `sm` (16px) increments.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

The background is the lowest layer (`#ffffff`). Content containers and cards sit on Layer 1, utilizing a very soft, diffused shadow (15% opacity of the secondary blue-gray) to suggest elevation without appearing heavy. 

For AI-driven insights or "active" states, a subtle **Backdrop Blur** (12px) is used on semi-transparent white overlays to create a sophisticated, glass-like depth. Outlines are kept minimal, reserved for input states and low-contrast dividers (`#e2e8f0`).

## Shapes

The shape language is consistently **Rounded**, reflecting a friendly and accessible approach to health technology. 

Standard components like cards and input fields use a 0.5rem (8px) radius. Large containers or featured dashboard widgets use `rounded-lg` (16px), while buttons and decorative tags may use `rounded-xl` (24px) or full pill shapes to emphasize their interactable nature. This curvature softens the technical edge of the AI, making the experience feel more organic.

## Components

- **Buttons:** Primary buttons are solid Vibrant Orange with white text. Secondary buttons use a Professional Blue outline or a soft blue ghost style.
- **Chips/Badges:** Used for health categories or status. High-priority alerts use an orange tint; steady metrics use a blue or neutral tint. Always use pill-shapes (full rounding).
- **Cards:** White background with a 1px border (`#f1f5f9`) and the "Layer 1" ambient shadow. Padding should be generous (`md` spacing).
- **Input Fields:** Clean, minimal borders. On focus, the border transitions to Professional Blue with a soft 2px outer glow.
- **Progress Indicators:** Use the Vibrant Orange for "current progress" to draw the eye, with Professional Blue for "targets" or "benchmarks."
- **Data Visualizations:** Charts should utilize the primary/secondary palette, using varying opacities of blue for historical data and orange for projected or active AI insights.
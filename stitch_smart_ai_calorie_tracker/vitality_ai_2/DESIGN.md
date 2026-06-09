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
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#28c38a'
  on-tertiary-container: '#004a31'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
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
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is centered on the intersection of high-technology and human wellness. The brand personality is **Empathetic, Precise, and Vital**. It avoids the clinical coldness of traditional medical apps, instead opting for a "Supportive Expert" persona. 

The design style is **Modern Corporate with Glassmorphic accents**. It utilizes a clean, airy layout with ample whitespace to reduce cognitive load—crucial for users tracking complex nutritional data. Subtle translucency is applied to AI-driven components (like the chatbot and insight cards) to distinguish "intelligent" layers from static data. The emotional response should be one of "calm control"—reassuring the user that their health journey is being handled with both scientific accuracy and personal care.

## Colors

The palette is strategically split between organic growth and digital intelligence. 
- **Primary (Vibrant Green):** Used for "Success" states, active calorie tracking progress, and primary call-to-action buttons. It represents vitality and health.
- **Secondary (Soft Blue):** Reserved for AI-powered features, chatbot elements, and data visualization trends. It establishes trust and technical sophistication.
- **Neutral (Slate Grays):** Used for typography and structural borders to maintain a professional, grounded feel.
- **Semantic Colors:** Use a soft Amber (#F59E0B) for warnings (e.g., nearing calorie limits) and a clean Rose (#F43F5E) for critical alerts.

## Typography

This design system uses a dual-sans pairing to balance character with utility. 
- **Manrope** is used for all headlines and numerical data. Its modern, geometric construction feels precise and friendly, making it perfect for displaying "Daily Totals" and "Nutrient Breakdowns."
- **Inter** is used for body copy and UI labels. It provides exceptional legibility at small sizes, which is essential for dense food logs and ingredient lists.
- **Numerical Scaling:** For calorie counts and macro percentages, use `stats-number` to ensure the most important health data is immediately scannable.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 
- **The Card Grid:** Dashboard elements are organized into "Intelligence Cards" that span 3, 4, or 6 columns. 
- **AI Chatbot Overlay:** On desktop, the AI interface should occupy a fixed-width right sidebar (320px-400px) or a floating action sheet on mobile.
- **Rhythm:** Use an 8px base unit for all padding and margins. Vertical rhythm should prioritize "Stacking" (using `stack-md` or `stack-lg`) to separate distinct health metrics.
- **Responsive Behavior:** On mobile, all cards reflow into a single column, with the primary "Daily Progress" ring pinned to the top of the viewport.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**.
- **Surface Level (0dp):** The main background uses a very light cool gray (#F8FAFC).
- **Card Level (1dp):** White surfaces with a very soft, diffused shadow (Blur 15px, Opacity 4%, Y-Offset 4px). This creates a "lifted" paper feel.
- **AI Intelligence Layer (2dp):** Components driven by AI (like the chatbot or automated suggestions) utilize a **Glassmorphic** effect: White background at 70% opacity with a 20px backdrop blur and a thin 1px white border. This visual "shimmer" signals to the user that this content is dynamic and generated.
- **Active State:** Elements being interacted with should increase in shadow density rather than just changing color.

## Shapes

The shape language is **Rounded**, reflecting the approachable and organic nature of health. 
- **Standard UI:** Buttons, inputs, and small cards use a 0.5rem (8px) radius.
- **Container Cards:** Main dashboard sections use `rounded-lg` (16px) to feel more like distinct "objects."
- **AI Bubbles:** Chatbot messages and AI insight chips use `rounded-xl` (24px) or full pill-shapes to feel more conversational and less rigid than standard data.
- **Visualizations:** Progress rings and bar charts should have rounded end-caps to maintain the soft aesthetic.

## Components

- **Buttons:** Primary buttons are solid Vibrant Green with high-contrast white text. Secondary buttons (AI actions) use a Blue tint with 10% opacity and Blue text.
- **Intelligence Cards:** Must include a "Confidence Score" or "AI Label" in the top right corner using the `label-md` style. These cards house data visualizations.
- **Data Visualizations:** Use "Donut" charts for daily calorie limits. Use rounded "Sparklines" for weekly weight or macro trends. Always use the Primary Green for "Positive/On Track" and Secondary Blue for "AI Predicted" trends.
- **Chatbot Interface:** Message bubbles from the AI should use the Glassmorphic style (blurred background). User messages should be solid Neutral Slate to clearly distinguish human vs. machine input.
- **Input Fields:** Use a subtle 1px border (#E2E8F0). On focus, the border should transition to the Secondary Blue with a soft blue outer glow.
- **Chips/Badges:** For food categories (e.g., "High Protein," "Low Carb"), use small pill-shaped badges with soft background tints of the primary/secondary colors.
- **Food Log Lists:** Use clean, single-line rows with high-contrast Manrope numbers for calorie counts, ensuring the numbers are vertically aligned for easy scanning.
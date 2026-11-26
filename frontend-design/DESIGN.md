---
name: Clinical Material Diagnostic
colors:
  surface: '#f8f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f8f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e7e8eb'
  surface-container-highest: '#e1e2e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424654'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737785'
  outline-variant: '#c3c6d6'
  surface-tint: '#0856cf'
  primary: '#0041a2'
  on-primary: '#ffffff'
  primary-container: '#0b57d0'
  on-primary-container: '#ced9ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#9deeed'
  on-secondary-container: '#0b6e6e'
  tertiary: '#94000a'
  on-tertiary: '#ffffff'
  tertiary-container: '#bb1b1b'
  on-tertiary-container: '#ffcec8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001847'
  on-primary-fixed-variant: '#0040a1'
  secondary-fixed: '#a0f0f0'
  secondary-fixed-dim: '#84d4d3'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f4f'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#930009'
  background: '#f8f9fc'
  on-background: '#191c1e'
  surface-variant: '#e1e2e5'
typography:
  display-lg:
    fontFamily: Roboto Flex
    fontSize: 57px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.25px
  display-md:
    fontFamily: Roboto Flex
    fontSize: 45px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: 0px
  headline-lg:
    fontFamily: Roboto Flex
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: 0px
  headline-lg-mobile:
    fontFamily: Roboto Flex
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: 0px
  headline-md:
    fontFamily: Roboto Flex
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Roboto Flex
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0px
  title-lg:
    fontFamily: Roboto Flex
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0px
  title-md:
    fontFamily: Roboto Flex
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.15px
  title-sm:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1px
  body-lg:
    fontFamily: Roboto Flex
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.25px
  body-sm:
    fontFamily: Roboto Flex
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.4px
  label-lg:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Roboto Flex
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-sm:
    fontFamily: Roboto Flex
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for high-precision dermatological monitoring and clinical triage. It communicates diagnostic rigor, absolute data clarity, and calming reassurance to reduce patient scanning anxiety. Built strictly on modern native Android Material 3 (Material You) principles, the interface fuses clinical precision with intuitive tactile ergonomics.

The visual signature relies on pristine surfaces, high-contrast legibility, deliberate tonal surface elevation instead of aggressive drop shadows, and instantly recognizable medical status tokens. Interactive states lean on organic spring physics, ripple interactions, and generous touch affordances optimized for one-handed thumb-zone clinical use during physical self-examinations.

## Colors

The palette is anchored in an authoritative medical tech blue paired with a clinical mint-teal secondary to represent biological vitality and calm reassurance. Critical alerts (malignancy warnings, irregular border indicators) utilize a clinical rose-red, while monitoring changes trigger an amber warning tone.

### Palette Architecture
- **Primary (`#0B57D0`):** Core interactive states, active indicators, high-emphasis action triggers, primary FAB fills.
- **On Primary (`#FFFFFF`):** High-contrast typography and iconography placed over primary surfaces.
- **Primary Container (`#D3E3FD`):** Low-strain, high-visibility backdrops for high-priority informational highlights and lesion status badges.
- **On Primary Container (`#041E49`):** Deep navy typography sitting on top of primary container fills.
- **Secondary (`#006A6A`):** Clinical mint-teal for routine tracking metrics, verified doctor notes, and healthy progression data.
- **Secondary Container (`#CCE8E7`):** Gentle contextual grouping for routine skin logs.
- **On Secondary Container (`#002020`):** Dark teal text for secondary tags and body metadata.
- **Surface (`#FCFCFF`):** Clean, bright white canvas engineered to avoid color distortion during photographic review of dermoscopic images.
- **Surface Container Lowest (`#FFFFFF`):** Unbroken pure white layer used for high-fidelity clinical photography viewports.
- **Surface Container Low (`#F0F4F8`):** Subtle blue-gray container tier for card backgrounds.
- **Surface Container (`#E9EFF6`):** Standard surface container tier for structured grouping.
- **Surface Container High (`#E2E9F1`):** Raised container for modals and drawer panels.
- **On Surface (`#191C1E`):** Deep navy-neutral maximizing WCAG AAA legibility for clinical metrics and diagnoses.
- **On Surface Variant (`#41474D`):** Mid-tone slate for supporting medical timestamps, axis markings, and secondary metadata.
- **Outline (`#72787E`):** Structural borders for input fields and unselected chip states.
- **Outline Variant (`#C1C7CE`):** Hairline separators and table borders.
- **Error / Clinical Alert (`#BA1A1A`):** Urgent alerts (ABCDE melanoma rule flags, asymmetric lesion warnings).
- **Error Container (`#FFEDEA`):** Alert callout backgrounds.
- **Warning Amber (`#825500` / Container `#FFDDAE`):** Lesion shift alerts, re-scan interval overdue notifications.

## Typography

Typography is calibrated for absolute clarity and high-stress readability under variable examination lighting. Standardized on `Roboto Flex`, the variable axes maintain balanced optical hierarchy across patient-facing records and doctor analysis summaries.

- **Headlines (`headline-lg`, `headline-md`):** Reserved for screen-level orientation, primary assessment conclusions, and direct patient status summaries.
- **Titles (`title-lg`, `title-md`, `title-sm`):** Anchor card blocks, anatomical zone labels, and sub-section divisions.
- **Body (`body-lg`, `body-md`):** Formatted with ample line spacing for clinical summaries, pathology details, and patient self-care instructions.
- **Labels (`label-lg`, `label-md`, `label-sm`):** Used inside interactive targets, pill-shaped tags, measurement values (e.g., `4.2 mm`), and bottom bar navigation. Letter-spacing is widened to guarantee rapid comprehension at reduced scales.

## Layout & Spacing

The layout is built around standard Material 3 mobile navigation paradigms, respecting native Android display features like Edge-to-Edge windowing, punch-hole camera cutouts, and bottom navigation gesture bars.

### Grid & System Insets
- **Mobile (compact, <600dp):** 4-column fluid layout with a `16px` (`margin`) outer edge margin and `16px` (`gutter`) column gutter. Top spacing dynamically accommodates the Android Status Bar (`WindowInsetsCompat.Type.statusBars()`). Bottom spacing extends through the 3-button or Gesture Navigation Bar, applying bottom padding directly onto scrolling surfaces.
- **Tablet / Foldable (medium/expanded, >=600dp):** 8-to-12-column layout with `24px` margins and gutters, swapping bottom navigation for an M3 Navigation Rail on the start edge.

### Rhythm Principles
- Component internal padding strictly follows an 8dp grid (with 4dp sub-steps for dense metadata tags).
- Interactive tap zones are enforced at a strict minimum of `48x48dp` bounding boxes, regardless of visible asset size, ensuring reliable one-handed operation during dermoscopy attachment handling.

## Elevation & Depth

This design system avoids dark or skeuomorphic drop shadows. Depth and hierarchy are achieved through Material 3 **tonal elevation**, where higher-tier surfaces receive increasing tints of primary blue layered over the neutral surface, accompanied by soft ambient occlusion.

- **Level 0 (Flat):** Pure `Surface` (`#FCFCFF`) or `Surface Container Lowest` (`#FFFFFF`). Zero elevation. Used for app canvases and direct lesion comparison viewports to maintain color fidelity.
- **Level 1 (Tonal Base):** `Surface Container Low` (`#F0F4F8`). Elevation applied to standard cards, non-urgent list entries, and persistent search bars. Ambient shadow: `0px 1px 2px rgba(25, 28, 30, 0.05)`.
- **Level 2 (Active Interactive):** `Surface Container` (`#E9EFF6`). Applied to pressed cards, elevated chips, and quick-filter trays. Ambient shadow: `0px 2px 4px rgba(25, 28, 30, 0.08)`.
- **Level 3 (Overlays & Actions):** `Surface Container High` (`#E2E9F1`). Used for Bottom Sheets, Date/Time Pickers, and Dialogs. Floating Action Buttons (FAB) resting at this level employ an explicit dual-stage ambient blur: `0px 4px 8px 3px rgba(11, 87, 208, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.1)`.
- **Level 4 & 5 (Temporary Modals):** Navigation drawers, lesion zoom modals, and critical alert dialogs. Deep ambient tinting with pure backdrop scrim (`rgba(25, 28, 30, 0.32)`).

## Shapes

The interface balances the friendly approachability of consumer health applications with the precision of hospital diagnostics:

- **Full / Pill (`rounded-full` / `9999px`):** Reserved for Action Chips, Filter Chips, Lesion Severity Badges, Primary Pill Buttons, and Active Indicators inside the Navigation Bar.
- **Large Container (`rounded-xl` / `1.5rem` / `24dp`):** Bottom Sheets, Primary Cards, Floating Camera Viewports, and Dialog surfaces.
- **Medium Container (`rounded-lg` / `1rem` / `16dp`):** Lesion list items, input field borders, metric cards, and Extended Floating Action Buttons.
- **Small Component (`0.5rem` / `8dp`):** Progress indicator capsules, segmented control items, and micro-thumbnails for time-lapse comparisons.

## Components

### Buttons
- **Filled Primary:** Rounded pill (`9999px`), `Primary` background with `On Primary` text. Used exclusively for definitive steps: "Start Full Body Scan", "Confirm Lesion Capture", "Submit to Dermatologist". Height: `48dp`.
- **Tonal (Secondary):** Rounded pill (`9999px`), `Primary Container` fill with `On Primary Container` text. Used for secondary tasks: "Add Note", "Retake Photo".
- **Outlined:** Rounded pill (`9999px`), `1px` border of `Outline`, transparent fill. Used for neutral actions: "Export PDF", "Remind Me Later".

### Floating Action Button (FAB)
- Centered or bottom-end docked. Standard M3 geometry: `56x56dp` container with `rounded-xl` (`16dp`) corner radius. Fills use `Primary Container` with `On Primary Container` iconography (`24dp`). An Extended FAB expands to include a `label-lg` title alongside the icon for primary camera triggers.

### Chips
- **Filter & Assist Chips:** Height `32dp`, fully pill-shaped (`9999px`).
  - *Selected:* `Secondary Container` fill, no outline, accompanied by a check icon (`18dp`).
  - *Unselected:* Transparent background with a `1px` `Outline Variant` stroke, text in `On Surface Variant`.
- **Diagnostic Severity Chips:** Pill-shaped indicator badges utilizing semantic tints (e.g., Red container for "High Risk / Irregular", Amber container for "Evolving", Mint container for "Benign / Stable").

### Bottom Navigation Bar
- Native M3 layout: `80dp` height with background `Surface Container`.
- **Active Indicator:** An elongated pill (`64x32dp`) in `Primary Container` enveloping the active vector icon (`On Primary Container`).
- **Labels:** `label-sm` placed beneath the icon, transitioning from `On Surface Variant` (inactive) to `On Surface` bold (active). System navigation bar scrims pass seamlessly underneath.

### Cards & Lesion Comparison Tiles
- **Standard Card:** Background `Surface Container Low` with a `rounded-lg` (`16dp`) border radius. Contains split-pane visual comparisons (historical dermoscopic image vs. current scan).
- **Outlined Card:** Transparent with a `1px` `Outline Variant` stroke. Used for secondary data: doctor's clinic info, sensor calibration instructions.

### Input Fields
- Filled M3 text fields with `Surface Container` background, top rounded corners (`8dp`), and an active `2px` bottom indicator line in `Primary`.
- Accompanying helper text rendered in `body-sm` (`On Surface Variant`), switching to `Error` for incomplete or invalid data inputs.

### Lesion Time-Lapse Slider (Domain Specific)
- Dual-thumb range slider or comparison scrub controller with a pill-shaped track, calibrated in days/months since initial lesion detection. Thumb elements: `20dp` circular targets with `Primary` fills and resting elevation level 1.
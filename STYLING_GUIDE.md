# Design System & Styling Guide

## Overview

This document outlines the standardized design system for the Canteen Management Frontend application. All components should use these centralized design tokens to ensure consistency across the entire application.

## Design System Location

All design tokens are defined in: `/lib/theme.ts`

## Core Principles

1. **Never hardcode values** - Always use design tokens from `theme.ts`
2. **Consistency is key** - Use the same spacing, typography, and colors throughout
3. **Mobile-first** - Design for mobile, ensure it works on all screen sizes
4. **Accessibility** - Maintain proper contrast ratios and touch target sizes
5. **Premium feel** - Use smooth animations, proper shadows, and attention to detail

---

## Design Tokens

### Colors

```typescript
import { COLORS, STATUS_COLORS } from '@/lib/theme';

// Primary brand colors
COLORS.primary          // #6366F1 - Indigo-500
COLORS.primaryDark      // #4F46E5 - Indigo-600
COLORS.primaryLight     // #818CF8 - Indigo-400

// Secondary colors
COLORS.secondary        // #8B5CF6 - Violet-500
COLORS.secondaryDark    // #7C3AED - Violet-600
COLORS.secondaryLight   // #A78BFA - Violet-400

// Semantic colors
COLORS.success          // #10B981 - Emerald-500
COLORS.warning          // #F59E0B - Amber-500
COLORS.error            // #EF4444 - Red-500
COLORS.info             // #3B82F6 - Blue-500

// Neutrals
COLORS.background       // #FFFFFF
COLORS.surface          // #F9FAFB - Gray-50
COLORS.surfaceVariant   // #F3F4F6 - Gray-100
COLORS.outline          // #E5E7EB - Gray-200

// Text colors
COLORS.onPrimary        // #FFFFFF
COLORS.onSurface        // #111827 - Gray-900
COLORS.onSurfaceVariant // #6B7280 - Gray-500
COLORS.onBackground     // #111827

// Order status colors
STATUS_COLORS.PENDING   // #F59E0B
STATUS_COLORS.CONFIRMED // #6366F1
STATUS_COLORS.PREPARING // #8B5CF6
STATUS_COLORS.READY     // #3B82F6
STATUS_COLORS.DELIVERED // #10B981
STATUS_COLORS.CANCELLED // #EF4444
```

### Spacing

```typescript
import { SPACING } from '@/lib/theme';

SPACING.XXS    // 2px
SPACING.XS     // 4px
SPACING.S      // 8px
SPACING.M      // 12px
SPACING.L      // 16px
SPACING.XL     // 24px
SPACING.XXL    // 32px
SPACING.XXXL   // 40px
```

**Usage Guidelines:**
- Use `XXS` for very tight spacing (e.g., icon to text)
- Use `XS-S` for internal component padding
- Use `M-L` for component margins and standard padding
- Use `XL-XXXL` for section spacing and page margins

### Typography

```typescript
import { TYPOGRAPHY } from '@/lib/theme';

// Display/Headers
TYPOGRAPHY.DISPLAY      // 32px, 900 weight - Hero sections
TYPOGRAPHY.H1           // 28px, 900 weight - Page titles
TYPOGRAPHY.H2           // 22px, 900 weight - Section headers
TYPOGRAPHY.H3           // 18px, 800 weight - Card titles

// Subtitles
TYPOGRAPHY.SUBTITLE       // 16px, 700 weight - Subtitles
TYPOGRAPHY.SUBTITLE_SMALL // 14px, 600 weight - Small subtitles

// Body text
TYPOGRAPHY.BODY           // 15px, 400 weight - Regular text
TYPOGRAPHY.BODY_BOLD      // 15px, 700 weight - Bold text
TYPOGRAPHY.BODY_SEMIBOLD  // 15px, 600 weight - Semibold text
TYPOGRAPHY.BODY_SMALL     // 13px, 400 weight - Small text
TYPOGRAPHY.BODY_SMALL_BOLD // 13px, 700 weight - Small bold text

// Labels/Captions
TYPOGRAPHY.CAPTION        // 12px, 600 weight - Captions
TYPOGRAPHY.CAPTION_BOLD   // 12px, 800 weight, uppercase - Bold captions
TYPOGRAPHY.LABEL          // 11px, 700 weight, uppercase - Labels

// Tiny text
TYPOGRAPHY.TINY           // 10px, 600 weight - Very small text
TYPOGRAPHY.TINY_BOLD      // 10px, 900 weight - Very small bold text
```

**Usage Example:**
```typescript
const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.H1,
    color: theme.colors.onSurface,
  },
});
```

### Border Radius

```typescript
import { RADIUS } from '@/lib/theme';

RADIUS.NONE    // 0px - No rounding
RADIUS.XS      // 4px - Subtle
RADIUS.S       // 8px - Small buttons, badges
RADIUS.M       // 12px - Standard buttons, inputs
RADIUS.L       // 16px - Cards, larger elements
RADIUS.XL      // 20px - Prominent cards
RADIUS.XXL     // 24px - Modals, large cards
RADIUS.XXXL    // 28px - Hero sections
RADIUS.FULL    // 9999px - Circular elements
```

### Shadows

```typescript
import { SHADOWS } from '@/lib/theme';

SHADOWS.NONE   // No shadow
SHADOWS.SM     // Subtle shadow - Hover states
SHADOWS.MD     // Standard shadow - Cards
SHADOWS.LG     // Prominent shadow - Modals
SHADOWS.XL     // Deep shadow - Floating elements
```

---

## Component Styles

Pre-defined component styles for common UI patterns:

```typescript
import { COMPONENT_STYLES } from '@/lib/theme';

// Containers
COMPONENT_STYLES.container        // Standard container
COMPONENT_STYLES.centerContainer  // Centered container

// Headers
COMPONENT_STYLES.header           // Page header
COMPONENT_STYLES.headerTitle      // Header title text
COMPONENT_STYLES.headerSubtitle   // Header subtitle text

// Cards
COMPONENT_STYLES.card             // Standard card
COMPONENT_STYLES.cardLarge        // Large card

// Buttons
COMPONENT_STYLES.button           // Standard button
COMPONENT_STYLES.buttonLarge      // Large button
COMPONENT_STYLES.buttonContent    // Button content height
COMPONENT_STYLES.buttonLabel      // Button label text
COMPONENT_STYLES.buttonLabelSmall // Small button label

// Inputs
COMPONENT_STYLES.input            // Standard input

// Lists
COMPONENT_STYLES.listContent      // List container
COMPONENT_STYLES.listHeader       // List header

// Empty states
COMPONENT_STYLES.emptyContainer   // Empty state container
COMPONENT_STYLES.emptyText        // Empty state text

// Badges
COMPONENT_STYLES.badge            // Badge container
COMPONENT_STYLES.badgeText        // Badge text

// Modals
COMPONENT_STYLES.modalContent     // Modal container
COMPONENT_STYLES.modalTitle       // Modal title

// Sections
COMPONENT_STYLES.section          // Section container
COMPONENT_STYLES.sectionTitle     // Section title

// Rows
COMPONENT_STYLES.row              // Flex row
COMPONENT_STYLES.rowSpaceBetween  // Row with space-between

// Divider
COMPONENT_STYLES.divider          // Standard divider
```

---

## Usage Examples

### Example 1: Using Typography and Spacing

```typescript
import { TYPOGRAPHY, SPACING, RADIUS } from '@/lib/theme';

const styles = StyleSheet.create({
  container: {
    padding: SPACING.L,
  },
  title: {
    ...TYPOGRAPHY.H1,
    marginBottom: SPACING.M,
  },
  button: {
    borderRadius: RADIUS.M,
    paddingHorizontal: SPACING.L,
  },
});
```

### Example 2: Using Component Styles

```typescript
import { COMPONENT_STYLES } from '@/lib/theme';

const MyComponent = () => {
  return (
    <View style={COMPONENT_STYLES.container}>
      <View style={COMPONENT_STYLES.listHeader}>
        <Text style={COMPONENT_STYLES.headerTitle}>My Page</Text>
      </View>
      {/* Content */}
    </View>
  );
};
```

### Example 3: Using Colors with Theme

```typescript
import { COLORS } from '@/lib/theme';
import { useTheme } from 'react-native-paper';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.onSurface }}>Hello</Text>
    </View>
  );
};
```

### Example 4: Combining Tokens

```typescript
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, COLORS } from '@/lib/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.L,
    padding: SPACING.L,
    marginBottom: SPACING.M,
    ...SHADOWS.MD,
  },
  cardTitle: {
    ...TYPOGRAPHY.H3,
    color: COLORS.onSurface,
    marginBottom: SPACING.S,
  },
  cardDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.onSurfaceVariant,
  },
});
```

---

## Best Practices

### ✅ DO

```typescript
// Use design tokens
const styles = StyleSheet.create({
  text: {
    ...TYPOGRAPHY.BODY,
    color: theme.colors.onSurface,
    marginBottom: SPACING.M,
  },
});

// Use component styles
<View style={COMPONENT_STYLES.container}>
  <Text style={COMPONENT_STYLES.headerTitle}>Title</Text>
</View>
```

### ❌ DON'T

```typescript
// Don't hardcode values
const styles = StyleSheet.create({
  text: {
    fontSize: 15,           // ❌ Use TYPOGRAPHY.BODY instead
    fontWeight: '700',      // ❌ Use TYPOGRAPHY.BODY_BOLD instead
    marginBottom: 12,       // ❌ Use SPACING.M instead
  },
});

// Don't duplicate styles
<View style={{ flex: 1 }}>  {/* ❌ Use COMPONENT_STYLES.container instead */}
```

---

## Migration Guide

When updating existing components:

1. **Import design tokens:**
   ```typescript
   import { TYPOGRAPHY, SPACING, RADIUS, COLORS, COMPONENT_STYLES } from '@/lib/theme';
   ```

2. **Replace hardcoded values:**
   - Spacing: `12` → `SPACING.M`
   - Font sizes: `fontSize: 28` → `...TYPOGRAPHY.H1`
   - Border radius: `borderRadius: 12` → `borderRadius: RADIUS.M`

3. **Use component styles where applicable:**
   - Replace common patterns with `COMPONENT_STYLES.*`

4. **Test thoroughly:**
   - Ensure visual appearance remains consistent
   - Check dark mode compatibility (if applicable)
   - Verify on different screen sizes

---

## Status Badge Colors

Always use STATUS_COLORS for order status badges:

```typescript
import { STATUS_COLORS } from '@/lib/theme';

const getStatusColor = (status: string) => {
  return STATUS_COLORS[status.toUpperCase()] || COLORS.onSurfaceVariant;
};
```

---

## Responsive Design

### Touch Targets
- Minimum touch target: 44x44 points
- Use `COMPONENT_STYLES.buttonContent` for proper button heights

### Spacing
- Use relative units (`%`, `flex`) for layout
- Use absolute spacing tokens for margins/padding

### Typography
- Typography scales are optimized for mobile
- Avoid scaling text; use appropriate typography tokens

---

## React Native Paper Integration

The app uses React Native Paper for UI components. Access theme via:

```typescript
import { useTheme } from 'react-native-paper';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Button 
      mode="contained"
      buttonColor={theme.colors.primary}
      textColor={theme.colors.onPrimary}
    >
      Click Me
    </Button>
  );
};
```

---

## Animations

Use consistent animation durations:

```typescript
import { ANIMATION } from '@/lib/theme';

ANIMATION.DURATION.FAST    // 150ms - Quick transitions
ANIMATION.DURATION.NORMAL  // 300ms - Standard animations
ANIMATION.DURATION.SLOW    // 500ms - Slow, emphasized animations
```

---

## Questions?

If you need to add new design tokens or component styles:

1. Add them to `/lib/theme.ts`
2. Document them in this guide
3. Update existing components to use the new tokens

This ensures the design system evolves consistently across the application.

# MockRise Design System

A comprehensive, human-crafted design system for the MockRise AI-powered interview platform. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

## 📚 Related Documentation

- **[README.md](../README.md)** - Project overview and quick start
- **[PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** - Complete project architecture and structure
- **[server/TESTING_GUIDE.md](../server/TESTING_GUIDE.md)** - Backend testing guide

## 🎨 Design Philosophy

MockRise's design system is built on the principles of:

- **Human-Crafted**: Every component feels natural and intuitive, avoiding generic AI-generated patterns
- **Professional**: Clean, modern aesthetics suitable for career-focused users
- **Accessible**: WCAG AA compliant with comprehensive keyboard navigation and screen reader support
- **Responsive**: Seamless experience across all devices and screen sizes
- **Animated**: Smooth, purposeful animations that enhance user experience
- **Multilingual**: Full support for English (LTR) and Arabic (RTL) layouts

## 🚀 Quick Start

### Installation

```bash
npm install @mockrise/design-system
```

### Basic Usage

```tsx
import { ThemeProvider } from '@mockrise/design-system';
import { EnhancedButton } from '@mockrise/design-system';

function App() {
  return (
    <ThemeProvider defaultTheme="light" defaultLanguage="en">
      <EnhancedButton variant="gradient" size="lg">
        Get Started
      </EnhancedButton>
    </ThemeProvider>
  );
}
```

## 🎯 Core Components

### Enhanced Components

Our enhanced components extend the base UI with additional features:

#### EnhancedButton
- Loading states with animated spinners
- Icon support (left/right)
- Motion props for Framer Motion integration
- Multiple variants: default, destructive, outline, secondary, ghost, link, gradient, success, warning

```tsx
<EnhancedButton
  variant="gradient"
  size="lg"
  loading={isLoading}
  leftIcon={<Sparkles />}
  motionProps={{
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }}
>
  Start Interview
</EnhancedButton>
```

#### EnhancedCard
- Multiple variants: default, elevated, glass, gradient, accent, success, warning, destructive
- Hover effects: lift, glow, scale, rotate
- Loading and skeleton states
- Interactive mode

```tsx
<EnhancedCard
  variant="glass"
  hover="lift"
  interactive
  motionProps={{
    initial={{ opacity: 0, y: 20 },
    animate={{ opacity: 1, y: 0 }}
  }}
>
  <CardHeader>
    <CardTitle>Interview Session</CardTitle>
    <CardDescription>AI-powered mock interview</CardDescription>
  </CardHeader>
</EnhancedCard>
```

### Animated Charts

#### RadarChart
Interactive radar charts for skill assessments:

```tsx
<RadarChart
  data={[
    { skill: "Technical", value: 85, color: "hsl(var(--primary))" },
    { skill: "Communication", value: 92, color: "hsl(var(--accent))" },
    { skill: "Problem Solving", value: 78, color: "hsl(var(--secondary))" },
  ]}
  size={300}
/>
```

#### CircularProgress
Animated circular progress indicators:

```tsx
<CircularProgress
  value={75}
  size={120}
  color="hsl(var(--primary))"
  showValue
/>
```

#### BarChart & LineChart
Data visualization components with smooth animations:

```tsx
<BarChart
  data={[
    { label: "Week 1", value: 65 },
    { label: "Week 2", value: 72 },
    { label: "Week 3", value: 78 },
  ]}
  orientation="vertical"
/>
```

## 🎨 Design Tokens

### Color System

Our color system is built on a professional palette:

```typescript
const colors = {
  primary: {
    50: 'hsl(239, 100%, 97%)',
    500: 'hsl(239, 84%, 60%)', // Main brand color
    900: 'hsl(239, 84%, 20%)',
  },
  secondary: {
    50: 'hsl(265, 100%, 97%)',
    500: 'hsl(265, 75%, 65%)',
    900: 'hsl(265, 75%, 25%)',
  },
  accent: {
    50: 'hsl(158, 100%, 97%)',
    500: 'hsl(158, 64%, 52%)',
    900: 'hsl(158, 64%, 12%)',
  },
};
```

### Typography Scale

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
  },
};
```

### Spacing Scale

```typescript
const spacing = {
  0: '0px',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
  32: '8rem',   // 128px
  40: '10rem',  // 160px
  48: '12rem',  // 192px
  56: '14rem',  // 224px
  64: '16rem',  // 256px
};
```

## 🌙 Theme System

### Light/Dark Mode

```tsx
import { useTheme } from '@mockrise/design-system';

function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Theme Variants

```typescript
const themeVariants = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(220 15% 15%)',
    primary: 'hsl(239 84% 60%)',
    // ... more colors
  },
  dark: {
    background: 'hsl(220 20% 10%)',
    foreground: 'hsl(220 10% 95%)',
    primary: 'hsl(239 84% 67%)',
    // ... more colors
  },
};
```

## 🌍 Internationalization

### RTL/LTR Support

```tsx
import { LanguageToggle } from '@mockrise/design-system';

function Header() {
  return (
    <header>
      <LanguageToggle />
    </header>
  );
}
```

### Language Variants

```typescript
const layoutTokens = {
  ltr: {
    direction: 'ltr',
    textAlign: 'left',
    marginStart: 'margin-left',
    marginEnd: 'margin-right',
  },
  rtl: {
    direction: 'rtl',
    textAlign: 'right',
    marginStart: 'margin-right',
    marginEnd: 'margin-left',
  },
};
```

## 📱 Responsive Design

### Responsive Layout Components

```tsx
import { ResponsiveLayout, ResponsiveGrid, ResponsiveContainer } from '@mockrise/design-system';

// Flexible layout
<ResponsiveLayout
  breakpoint="md"
  direction="row"
  gap="lg"
  align="center"
  justify="between"
>
  <div>Content 1</div>
  <div>Content 2</div>
</ResponsiveLayout>

// Responsive grid
<ResponsiveGrid
  cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
  gap="md"
>
  {items.map(item => <Card key={item.id} {...item} />)}
</ResponsiveGrid>

// Responsive container
<ResponsiveContainer
  maxWidth="xl"
  padding="lg"
  center
>
  <h1>Centered Content</h1>
</ResponsiveContainer>
```

### Responsive Text

```tsx
import { ResponsiveText } from '@mockrise/design-system';

<ResponsiveText
  size={{ default: "base", sm: "lg", md: "xl", lg: "2xl" }}
  weight="semibold"
  align="center"
  color="primary"
>
  Responsive Heading
</ResponsiveText>
```

## 🎭 Animation System

### Framer Motion Integration

All components support Framer Motion props:

```tsx
<EnhancedButton
  motionProps={{
    initial={{ opacity: 0, scale: 0.95 }},
    animate={{ opacity: 1, scale: 1 }},
    whileHover={{ scale: 1.05 }},
    whileTap={{ scale: 0.95 }},
    transition={{ duration: 0.2 }}
  }}
>
  Animated Button
</EnhancedButton>
```

### Animation Tokens

```typescript
const animations = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
};
```

## ♿ Accessibility

### WCAG AA Compliance

- **Color Contrast**: All color combinations meet WCAG AA standards
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

### Accessibility Features

```tsx
// Accessible button with proper ARIA attributes
<EnhancedButton
  aria-label="Start interview session"
  aria-describedby="interview-description"
  role="button"
  tabIndex={0}
>
  Start Interview
</EnhancedButton>

// Accessible form with proper labeling
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <div id="email-error" role="alert">
      Please enter a valid email address
    </div>
  )}
</div>
```

## 🧩 Component Patterns

### Card Patterns

```tsx
// Standard card
<EnhancedCard variant="default" hover="lift">
  <CardHeader>
    <CardTitle>Interview Session</CardTitle>
    <CardDescription>AI-powered mock interview</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Session details...</p>
  </CardContent>
  <CardFooter>
    <Button>Start Session</Button>
  </CardFooter>
</EnhancedCard>

// Glass morphism card
<EnhancedCard variant="glass" hover="glow">
  <div className="p-6">
    <h3>Glass Card</h3>
    <p>Beautiful glass effect</p>
  </div>
</EnhancedCard>
```

### Form Patterns

```tsx
// Form with validation states
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Full Name</Label>
    <Input
      id="name"
      placeholder="Enter your name"
      className={hasError ? "border-destructive" : ""}
    />
    {hasError && (
      <p className="text-sm text-destructive">This field is required</p>
    )}
  </div>
  
  <EnhancedButton
    type="submit"
    loading={isSubmitting}
    disabled={!isValid}
  >
    {isSubmitting ? "Submitting..." : "Submit"}
  </EnhancedButton>
</form>
```

## 📊 Dashboard Layouts

### Trainee Dashboard

```tsx
function TraineeDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
        <StatCard title="Total Interviews" value="12" change="+3 this week" />
        <StatCard title="Success Rate" value="87%" change="+5% from last month" />
        <StatCard title="Hours Practiced" value="24.5" change="+6.2 this week" />
        <StatCard title="Achievements" value="8" change="2 new badges" />
      </ResponsiveGrid>

      {/* Quick Actions */}
      <EnhancedCard variant="elevated">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid cols={{ default: 1, sm: 3 }} gap="md">
            <ActionButton icon={<Calendar />} title="Schedule AI Interview" />
            <ActionButton icon={<Users />} title="Practice with Peer" />
            <ActionButton icon={<Award />} title="View Feedback" />
          </ResponsiveGrid>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}
```

### Interviewer Dashboard

```tsx
function InterviewerDashboard() {
  return (
    <div className="space-y-8">
      {/* Interview Queue */}
      <EnhancedCard variant="elevated">
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {interviews.map(interview => (
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </CardContent>
      </EnhancedCard>

      {/* Current Session */}
      <EnhancedCard variant="glass">
        <CardHeader>
          <CardTitle>Current Session</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionControls />
          <ProgressBar value={progress} />
        </CardContent>
      </EnhancedCard>
    </div>
  );
}
```

## 🎨 Style Guide

### Color Usage

- **Primary**: Main brand color for CTAs and important actions
- **Secondary**: Supporting color for secondary actions
- **Accent**: Success states and positive feedback
- **Destructive**: Error states and destructive actions
- **Warning**: Caution states and warnings
- **Muted**: Subtle text and backgrounds

### Typography Hierarchy

```tsx
// Display headings
<h1 className="text-4xl md:text-6xl font-bold">Hero Title</h1>
<h2 className="text-3xl md:text-5xl font-bold">Section Title</h2>

// Body text
<p className="text-lg text-muted-foreground">Large body text</p>
<p className="text-base">Regular body text</p>
<p className="text-sm text-muted-foreground">Small body text</p>
```

### Spacing Guidelines

- Use consistent spacing scale (4px base unit)
- Maintain visual hierarchy with appropriate spacing
- Use responsive spacing for different screen sizes
- Apply generous whitespace for better readability

## Related Documentation

- **[README.md](./README.md)** - Project overview and quick start
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Complete project architecture and structure
- **[server/README.md](./server/README.md)** - Backend authentication system documentation
- **[server/TESTING_GUIDE.md](./server/TESTING_GUIDE.md)** - Comprehensive backend API testing guide

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

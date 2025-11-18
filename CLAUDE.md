
# BVL Seminare

You are a logistics expert working for BVL Seminare, a german company that offers seminars and training in logistics and supply chain management. Your task is to create sophisticated examples (applets) that showcase how AI can be utilized in modern logistics and supply chain management. All examples should be in German language.

## Technology

All examples should be written in:
- React 19 with using Vite
- TypeScript
- Konva for 2D Canvas rendering (optional if required)
- MUI 7 with Lucide Icons
- A docker file for easy building and deployment

Each applet should have its own subdirectory with a `README.md` file that explains the functionality of the applet, how to run it, and any other relevant information. Always use the `template` directory as a starting point for each applet. The applets are put into `applets` directory and numerated like this 00_{name}, 01_{name}, 02_{name}, ....


# Nexus Frontend - Design System & Tech Stack Reference

Quick reference for building React + TypeScript + Material UI applications with the same design patterns and styling approach.

---

## Tech Stack

### Core Framework
```json
{
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "typescript": "5.9.3",
  "vite": "7.2.2"
}
```

**React 19 Features:**
- React Compiler for auto-optimization (no manual `useMemo`/`useCallback`)
- `useActionState`, `useOptimistic`, `useFormStatus`
- Modern JSX transform (no React import needed)

### UI Framework
```json
{
  "@mui/material": "7.3.5",
  "@emotion/react": "11.13.3",
  "@emotion/styled": "11.13.0",
  "lucide-react": "0.553.0"
}
```

### State & Data
```json
{
  "@tanstack/react-query": "5.90.7",
  "axios": "1.13.2",
  "zod": "4.1.12"
}
```

### Canvas & Visualization
```json
{
  "konva": "10.0.9",
  "react-konva": "19.2.0",
  "recharts": "3.4.1"
}
```

### i18n
```json
{
  "i18next": "25.6.1",
  "react-i18next": "16.2.4"
}
```

### Testing & Storybook
```json
{
  "vitest": "4.0.8",
  "@storybook/react-vite": "10.0.6"
}
```

---

## Color System

### Structure
Numbered scale: **50** (lightest) → **700** (darkest)

### Brand Colors

#### Purple (Primary)
```typescript
purple = {
  50: '#F3F2F9',   // Backgrounds
  100: '#E5E3F3',  // Hover states
  200: '#C5BFE5',  // Borders
  300: '#A396DA',  // UI elements
  400: '#8B7FD7',  // Interactive
  500: '#6C5FC7',  // Primary actions ⭐
  600: '#5A4DB3',  // Pressed states
  700: '#4A3F9A',  // Dark text
}
```

#### Orange (Accent)
```typescript
orange = {
  50: '#FFF5F0',
  100: '#FFE8DC',
  200: '#FFCDB3',
  300: '#FFB08A',
  400: '#FF9466',
  500: '#FF6B35',  // Primary accent ⭐
  600: '#E65A28',
  700: '#CC4A1C',
}
```

### Neutrals
```typescript
gray = {
  50: '#FAFAFA',   // Page background
  100: '#F5F5F5',  // Surface
  200: '#E5E5E5',  // Borders
  300: '#D4D4D4',  // Disabled
  400: '#A3A3A3',  // Secondary text
  500: '#737373',  // Body text
  600: '#525252',  // Headings
  700: '#404040',  // Emphasized
  800: '#262626',  // Dark mode bg
  900: '#171717',  // Near black
}
```

### Semantic Colors
```typescript
success = { 50-800 scale, 500: '#22C55E' }   // Green
warning = { 50-800 scale, 500: '#F59E0B' }   // Amber
error   = { 50-800 scale, 500: '#EF4444' }   // Red
info    = { 50-800 scale, 500: '#3B82F6' }   // Blue
```

### Status Color Mappings
```typescript
statusColors = {
  running: success[500],      // #22C55E (green)
  idle: gray[400],            // #A3A3A3 (gray)
  stopped: error[500],        // #EF4444 (red)
  setup: warning[500],        // #F59E0B (amber)
  completed: success[600],    // #16A34A (dark green)
  inProgress: info[500],      // #3B82F6 (blue)
  planned: purple[400],       // #8B7FD7 (purple)
  cancelled: gray[500],       // #737373 (gray)
}
```

### Usage
```typescript
import { colors } from '@/theme/colors';

// Direct access
const primary = colors.purple[500];       // #6C5FC7
const accent = colors.orange[500];        // #FF6B35

// Status colors
const runningColor = colors.success[500]; // #22C55E

// In components
<Chip sx={{ bgcolor: colors.success[500] }}>Running</Chip>
<Typography sx={{ color: colors.gray[600] }}>Text</Typography>
```

---

## Design Tokens

### Spacing (8-point grid)
```typescript
spacing = {
  0: 0,
  0.5: 4,    // 4px
  1: 8,      // 8px
  1.5: 12,   // 12px
  2: 16,     // 16px
  3: 24,     // 24px
  4: 32,     // 32px
  5: 40,     // 40px
  6: 48,     // 48px
  8: 64,     // 64px
  10: 80,    // 80px
  12: 96,    // 96px
  16: 128,   // 128px
  20: 160,   // 160px
  24: 192,   // 192px
}

// Helper function
space(3) = 24px
```

### Typography

#### Sizes
```typescript
fontSize = {
  xs: 11,      // Caption
  sm: 13,      // Small body
  base: 14,    // Body text
  md: 16,      // Medium
  lg: 18,      // Large
  xl: 20,      // Extra large
  '2xl': 24,   // H3
  '3xl': 30,   // H2
  '4xl': 36,   // H1
}
```

#### Weights
```typescript
fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

#### Variants
```typescript
typography = {
  h1: { fontSize: 36, fontWeight: 600, lineHeight: 1.25 },
  h2: { fontSize: 30, fontWeight: 600, lineHeight: 1.375 },
  h3: { fontSize: 24, fontWeight: 600, lineHeight: 1.375 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: 11, fontWeight: 400, lineHeight: 1.5 },
}
```

### Shadows
```typescript
shadows = {
  xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
  sm: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',

  // Special
  hover: '0 8px 16px -4px rgba(0,0,0,0.15), 0 4px 8px -4px rgba(0,0,0,0.1)',
  modal: '0 24px 48px -12px rgba(0,0,0,0.25)',
}
```

### Border Radius
```typescript
borderRadius = {
  xs: 2,
  sm: 4,
  md: 6,      // Default
  lg: 8,      // Cards
  xl: 12,
  '2xl': 16,
  full: 9999, // Pills
}
```

### Transitions
```typescript
duration = {
  fast: 150,     // ms
  normal: 200,   // ms
  slow: 300,     // ms
}

easing = {
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

transition = {
  fast: 'all 150ms ease-out',
  normal: 'all 200ms ease-out',
  slow: 'all 300ms ease-out',
}
```

### Layout
```typescript
layout = {
  sidebarWidth: 240,
  appBarHeight: 64,
  cardPadding: 24,
  contentMaxWidth: 1600,
}
```

### Breakpoints
```typescript
breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}
```

---

## Usage Patterns

### Component Structure
```typescript
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { tokens, spacing } from '@/theme/tokens';

interface ComponentProps {
  title: string;
  value: number;
  status: 'running' | 'idle';
}

export default function Component({ title, value, status }: ComponentProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{
      p: spacing[3],                           // 24px
      borderRadius: tokens.borderRadius.lg,    // 8px
      border: `1px solid ${colors.gray[200]}`,
      transition: tokens.transition.normal,
      '&:hover': {
        boxShadow: tokens.shadows.hover,
      },
    }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('section.title')}
      </Typography>
      <Chip
        label={t(`status.${status}`)}
        sx={{ bgcolor: colors.statusColors[status] }}
      />
    </Box>
  );
}
```

### Styling Best Practices

**DO:**
```typescript
// ✅ Use design tokens
<Box sx={{ p: spacing[3], borderRadius: tokens.borderRadius.lg }}>

// ✅ Import colors
import { colors } from '@/theme/colors';
<Box sx={{ bgcolor: colors.purple[500] }}>

// ✅ Use translation keys
const { t } = useTranslation();
<Typography>{t('nav.dashboard')}</Typography>

// ✅ Use MUI sx prop
<Box sx={{ display: 'flex', gap: 2 }}>
```

**DON'T:**
```typescript
// ❌ Hardcode values
<Box sx={{ padding: '24px', borderRadius: '8px' }}>

// ❌ Hardcode colors
<Box sx={{ backgroundColor: '#6C5FC7' }}>

// ❌ Hardcode strings
<Typography>Dashboard</Typography>

// ❌ Use styled components
const StyledBox = styled(Box)({ ... });
```

### React Query Hook Pattern
```typescript
// hooks/useWorkspaces.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.getWorkspaces(),
    staleTime: 30000,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
```

### i18n Pattern
```json
// locales/en.json
{
  "nav": { "dashboard": "Dashboard", "settings": "Settings" },
  "common": { "save": "Save", "cancel": "Cancel" },
  "status": { "running": "Running", "idle": "Idle" }
}

// locales/de.json
{
  "nav": { "dashboard": "Dashboard", "settings": "Einstellungen" },
  "common": { "save": "Speichern", "cancel": "Abbrechen" },
  "status": { "running": "Läuft", "idle": "Inaktiv" }
}
```

```typescript
// Component usage
const { t } = useTranslation();
<Typography>{t('nav.dashboard')}</Typography>
<Button>{t('common.save')}</Button>
```

**MANDATORY:** All user-facing text MUST use translation keys.

### TypeScript Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
```

---

## Component Patterns

### Functional Components
```typescript
// ✅ GOOD: Functional component with TypeScript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4">{title}</Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      {actions}
    </Box>
  );
}
```

### No Manual Memoization (React 19)
```typescript
// ❌ BAD: Manual memoization
const Component = React.memo(({ data }) => {
  const result = useMemo(() => process(data), [data]);
  const handler = useCallback(() => {}, []);
  return <div>{result}</div>;
});

// ✅ GOOD: Let React Compiler optimize
export default function Component({ data }) {
  const result = process(data);    // Auto-memoized
  const handler = () => {};        // Auto-stabilized
  return <div>{result}</div>;
}
```

### Custom Hooks
```typescript
// hooks/useWorkspace.ts
import { useContext } from 'react';
import { WorkspaceContext } from '@/contexts/WorkspaceContext';

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (context === undefined) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }

  return context;
}
```

---

## MUI Theme Customization

### Theme Setup
```typescript
// App.tsx or main.tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { colors } from '@/theme/colors';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.purple[500],
    },
    secondary: {
      main: colors.orange[500],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
    button: {
      textTransform: 'none',  // No uppercase
    },
  },
  spacing: 8,  // 8-point grid
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
          borderColor: colors.gray[200],
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <YourApp />
    </ThemeProvider>
  );
}
```

### Component Defaults
```typescript
// Applied via theme.components
Card: {
  elevation: 0,
  borderRadius: 8px,
  border: '1px solid',
  padding: 24px,
}

Button: {
  borderRadius: 6px,
  textTransform: 'none',
  fontWeight: 500,
}

Chip: {
  borderRadius: 6px,
  fontWeight: 500,
}
```

---

## Quick Reference

### Common Imports
```typescript
// Core
import { useState, useEffect, useRef } from 'react';

// MUI
import { Box, Typography, Card, Button, Chip } from '@mui/material';

// Icons
import { Menu, User, Settings, ChevronRight } from 'lucide-react';

// Design System
import { colors } from '@/theme/colors';
import { tokens, spacing, space } from '@/theme/tokens';

// i18n
import { useTranslation } from 'react-i18next';

// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Router
import { useNavigate, useParams, Link } from 'react-router';

// Types
import type { Workspace, Simulation } from '@/types';
```

### Spacing Examples
```typescript
<Box sx={{ p: spacing[3] }}>           // 24px padding
<Box sx={{ mb: space(2) }}>            // 16px margin-bottom
<Box sx={{ gap: spacing[1.5] }}>       // 12px gap
<Stack spacing={3}>                    // 24px spacing
```

### Color Examples
```typescript
// Status colors
<Chip sx={{ bgcolor: colors.success[500] }}>Running</Chip>
<Chip sx={{ bgcolor: colors.error[500] }}>Stopped</Chip>

// Brand colors
<Button sx={{ bgcolor: colors.purple[500] }}>Primary</Button>
<Button sx={{ bgcolor: colors.orange[500] }}>Accent</Button>

// MUI theme colors
<Typography color="text.primary">Main text</Typography>
<Typography color="text.secondary">Secondary text</Typography>
<Box sx={{ bgcolor: 'background.default' }}>Page</Box>
```

### Typography Examples
```typescript
<Typography variant="h1">Page Title</Typography>      // 36px
<Typography variant="h2">Section</Typography>         // 30px
<Typography variant="h3">Subsection</Typography>      // 24px
<Typography variant="body1">Body text</Typography>    // 14px
<Typography variant="caption">Caption</Typography>    // 11px
```

---

## API & Data Patterns

### API Client
```typescript
// services/api.ts
import axios from 'axios';

class ApiClient {
  private client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 30000,
  });

  async getWorkspaces(): Promise<Workspace[]> {
    const { data } = await this.client.get('/api/v1/workspaces');
    return data;
  }

  async createWorkspace(request: CreateRequest): Promise<Workspace> {
    const { data } = await this.client.post('/api/v1/workspaces', request);
    return data;
  }
}

export const apiClient = new ApiClient();
```

### React Query Setup
```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

### Custom Hook Pattern
```typescript
// hooks/useWorkspaces.ts
export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.getWorkspaces(),
  });
}

export function useWorkspace(id: string | null) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => apiClient.getWorkspace(id!),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
```

---

## File Structure

```
src/
├── components/        # Reusable UI components
│   ...
├── locales/          # i18n translations
│   ├── en.json
│   └── de.json
├── theme/            # Design system
│   ├── colors.ts
│   └── tokens.ts
├── utils/            # Utilities
├── i18n.ts           # i18next setup
├── App.tsx           # Root with routing
└── main.tsx          # Entry point
```

---

## Best Practices Checklist

### ✅ DO

- Use design system tokens (`colors`, `spacing`, `tokens`)
- Use MUI `sx` prop for styling
- Use translation keys for ALL text (`t('key')`)
- Use TypeScript strict mode with interfaces
- Use functional components only
- Let React Compiler handle optimization
- Import from `@/` alias
- Use React Query for data fetching
- Use semantic color names (`text.primary`, `background.default`)

### ❌ DON'T

- Hardcode strings, colors, or spacing values
- Use styled components (Emotion's `styled()`)
- Use class components
- Use manual `useMemo`/`useCallback` (React 19 handles it)
- Use `console.log` in production
- Skip TypeScript types (`any` sparingly)
- Use uppercase button text (set `textTransform: 'none'`)

---

## Summary

This design system provides:

- **Comprehensive color palette** (50-700 scale, semantic colors, status mappings)
- **8-point spacing grid** (0-192px scale)
- **Typography system** (11px-72px, weight variants)
- **Shadow system** (xs-2xl + special shadows)
- **Transition presets** (150ms-500ms)
- **MUI theme integration** with custom component defaults
- **React 19 patterns** with compiler optimization
- **TypeScript strict mode** for safety
- **i18n mandatory** for all user text
- **React Query** for data fetching
- **Konva** for canvas rendering

**Philosophy:**
- Design tokens over magic numbers
- `sx` prop over styled components
- Functional over class components
- React Compiler over manual optimization
- Translation keys over hardcoded strings
- Type safety everywhere


Here is the list of applets to create
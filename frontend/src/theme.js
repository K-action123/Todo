// Stormy Morning Color Palette
// #6A89A7 - Steel Blue (primary)
// #BDDDFC - Light Sky (soft bg accents)
// #88BDF2 - Cornflower Blue (interactive)
// #384959 - Deep Navy (text/dark)

export const theme = {
  colors: {
    // Core palette
    steel:      '#6A89A7',
    sky:        '#BDDDFC',
    cornflower: '#88BDF2',
    navy:       '#384959',

    // Backgrounds
    pageBg:     '#f0f4f8',
    cardBg:     '#ffffff',
    inputBg:    '#f7fafc',

    // Priority
    high:       { text: '#c0392b', bg: '#fdf0ef', border: '#f5c6c2', dot: '🔴' },
    medium:     { text: '#d68910', bg: '#fef9e7', border: '#fdeaa0', dot: '🟡' },
    low:        { text: '#1e8449', bg: '#eafaf1', border: '#a9dfbf', dot: '🟢' },

    // UI
    textPrimary:   '#384959',
    textSecondary: '#6A89A7',
    textMuted:     '#9ab0c4',
    border:        '#d4e6f1',
    borderFocus:   '#88BDF2',
    shadow:        'rgba(56, 73, 89, 0.08)',
    shadowMd:      'rgba(56, 73, 89, 0.14)',
  },

  radius: {
    sm:  '6px',
    md:  '10px',
    lg:  '14px',
    xl:  '20px',
    full:'9999px',
  },

  font: {
    sans: "'Inter', 'Segoe UI', system-ui, sans-serif",
  }
};

export const PRIORITIES = {
  high:   { label: 'High',   ...theme.colors.high },
  medium: { label: 'Medium', ...theme.colors.medium },
  low:    { label: 'Low',    ...theme.colors.low },
};
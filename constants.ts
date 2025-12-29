
import { AppSettings, AccentColor, Theme } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accentColor: 'blue',
  backgroundStyle: 'solid',
  syncWithOutlook: false,
  showEmail: true,
  showInstructions: true,
  showSecurity: true,
  showAnalysis: true,
  showFollowUp: true,
  suggestionCount: 3,
  systemInstruction: '',
};

export const ACCENT_COLORS: Record<AccentColor, Record<Theme, string>> = {
  blue: { light: '59, 130, 246', dark: '96, 165, 250' },
  green: { light: '34, 197, 94', dark: '74, 222, 128' },
  orange: { light: '249, 115, 22', dark: '251, 146, 60' },
  slate: { light: '100, 116, 139', dark: '148, 163, 184' },
  rose: { light: '244, 63, 94', dark: '251, 113, 133' },
};
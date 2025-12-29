
export enum SecurityStatus {
  SAFE = 'Safe',
  SPAM = 'Spam',
  PHISHING = 'Phishing',
  VIRUS = 'Virus Detected',
}

export interface SecurityAnalysis {
  status: SecurityStatus;
  details: string;
}

export interface EmailAnalysisResult {
  sentiment: string;
  urgency: string;
  intent: string;
  keyPoints: string[];
  nextActions: string[];
}

export interface FollowUpAnalysis {
  requiresFollowUp: boolean;
  isClosed: boolean;
  reason: string;
  suggestedReminder: string | null;
}

export interface FullEmailAnalysis {
  security: SecurityAnalysis;
  sentiment: string;
  urgency: string;
  intent: string;
  keyPoints: string[];
  nextActions: string[];
  followUp: FollowUpAnalysis;
}

export interface Email {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  subject: string;
  body: string;
  date: string;
  thread: Email[];
}

export type Theme = 'light' | 'dark';
export type AccentColor = 'blue' | 'green' | 'orange' | 'slate' | 'rose';
export type BackgroundStyle = 'solid' | 'gradient';

export interface AppSettings {
  theme: Theme;
  accentColor: AccentColor;
  backgroundStyle: BackgroundStyle;
  syncWithOutlook: boolean;
  showEmail: boolean;
  showInstructions: boolean;
  showSecurity: boolean;
  showAnalysis: boolean;
  showFollowUp: boolean;
  suggestionCount: number;
  systemInstruction: string;
}

export const tones = [
  'Default',
  'More professional',
  'More technical',
  'More accessible',
  'More polite',
  'More formal',
  'More informal',
  'Grammatically correct',
  'Easier to read',
  'More passionate',
  'Less emotional',
  'More sarcastic',
  'As bullet points',
  'Shorter',
  'Longer',
  'More persuasive',
  'More direct',
] as const;

export type ToneType = typeof tones[number];
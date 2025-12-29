
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSettings, Email, EmailAnalysisResult, SecurityAnalysis, SecurityStatus, Theme, AccentColor, ToneType, tones, FollowUpAnalysis as FollowUpAnalysisData } from './types';
import { getCurrentEmail } from './services/mockOutlookService';
import { analyzeEmail, generateSuggestions } from './services/geminiService';
import { Header } from './components/Header';
import { SecurityScan } from './components/SecurityScan';
import { EmailAnalysis } from './components/EmailAnalysis';
import { FollowUpAnalysis } from './components/FollowUpAnalysis';
import { Instructions } from './components/Instructions';
import { ResponseSuggestions } from './components/ResponseSuggestions';
import { SettingsPanel } from './components/SettingsPanel';
import { DEFAULT_SETTINGS, ACCENT_COLORS } from './constants';
import { Icon } from './components/shared/Icon';

const App: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [currentEmail, setCurrentEmail] = useState<Email | null>(null);
    const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
    const [emailAnalysis, setEmailAnalysis] = useState<EmailAnalysisResult | null>(null);
    const [followUpAnalysis, setFollowUpAnalysis] = useState<FollowUpAnalysisData | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsHistory, setSuggestionsHistory] = useState<string[][]>([]);

    const [selectedTone, setSelectedTone] = useState<ToneType>(tones[0]);
    const [customInstruction, setCustomInstruction] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const effectiveTheme = useMemo(() => {
        if (settings.syncWithOutlook) {
             if (typeof window !== 'undefined' && window.matchMedia) {
                 return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
             }
        }
        return settings.theme;
    }, [settings.syncWithOutlook, settings.theme]);

    const handleThemeToggle = () => {
        setSettings(prev => ({
            ...prev,
            syncWithOutlook: false,
            theme: effectiveTheme === 'dark' ? 'light' : 'dark'
        }));
    };

    const applyTheming = useCallback(() => {
        const root = document.documentElement;
        const colorTheme: Theme = settings.syncWithOutlook ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : settings.theme;
        
        root.classList.toggle('dark', colorTheme === 'dark');
        
        const accent = ACCENT_COLORS[settings.accentColor][colorTheme];
        root.style.setProperty('--accent-color', accent);

        if (settings.backgroundStyle === 'gradient') {
             document.body.classList.add('bg-gradient-to-br');
             if(colorTheme === 'dark'){
                document.body.classList.remove('from-white', 'to-slate-100');
                document.body.classList.add('from-slate-900', 'to-slate-800');
             } else {
                document.body.classList.remove('from-slate-900', 'to-slate-800');
                document.body.classList.add('from-white', 'to-slate-100');
             }
        } else {
            document.body.classList.remove('bg-gradient-to-br', 'from-white', 'to-slate-100', 'from-slate-900', 'to-slate-800');
        }

    }, [settings]);

    useEffect(() => {
        applyTheming();
    }, [applyTheming]);


    const handleGenerateResponses = useCallback(async (
        email: Email,
        tone: ToneType,
        instruction: string,
        count: number,
        systemInstruction: string
    ) => {
        setIsLoading(true);
        setError(null);
        if (suggestions.length > 0) {
            setSuggestionsHistory(prev => [...prev, suggestions]);
        }
        try {
            const result = await generateSuggestions(email, tone, instruction, count, systemInstruction);
            setSuggestions(result.suggestions);
        } catch (e) {
            setError('Could not generate responses. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [suggestions]);
    
    const initialFetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const email = await getCurrentEmail();
            setCurrentEmail(email);
            
            const analysisResult = await analyzeEmail(email);
            setSecurityAnalysis(analysisResult.security);
            setEmailAnalysis({
                sentiment: analysisResult.sentiment,
                urgency: analysisResult.urgency,
                intent: analysisResult.intent,
                keyPoints: analysisResult.keyPoints,
                nextActions: analysisResult.nextActions,
            });
            setFollowUpAnalysis(analysisResult.followUp);
            
            await handleGenerateResponses(email, selectedTone, customInstruction, settings.suggestionCount, settings.systemInstruction);

        } catch (e) {
            setError('Failed to load email data and initial analysis.');
            setSecurityAnalysis({status: SecurityStatus.SAFE, details: "Could not perform analysis."});
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        initialFetch();
    }, [initialFetch]);
    
    const handleApplyInstructions = () => {
        if (currentEmail) {
            handleGenerateResponses(currentEmail, selectedTone, customInstruction, settings.suggestionCount, settings.systemInstruction);
        }
    };

    const handleBack = () => {
        if (suggestionsHistory.length > 0) {
            const previousSuggestions = suggestionsHistory[suggestionsHistory.length - 1];
            setSuggestions(previousSuggestions);
            setSuggestionsHistory(prev => prev.slice(0, prev.length - 1));
        }
    };

    const themeClass = settings.theme === 'dark' ? 'dark' : '';
    const backgroundClass = settings.backgroundStyle === 'solid' 
        ? 'bg-white dark:bg-slate-900' 
        : 'bg-transparent';

    return (
        <div className={`flex flex-col h-full antialiased text-slate-800 dark:text-slate-200 transition-colors duration-300 ${themeClass} ${backgroundClass}`}>
            <Header 
                onSettingsClick={() => setIsSettingsOpen(true)}
                isDarkMode={effectiveTheme === 'dark'}
                onToggleTheme={handleThemeToggle}
            />

            {isSettingsOpen && (
                <SettingsPanel 
                    settings={settings}
                    setSettings={setSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}

            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {settings.showSecurity && <SecurityScan analysis={securityAnalysis} isLoading={isLoading && !securityAnalysis} />}

                {settings.showEmail && currentEmail && (
                    <details className="group rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
                        <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50">
                            <h3 className="text-base font-semibold">Original Email</h3>
                            <Icon name="chevron-down" className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-sm space-y-2">
                           <p><strong>From:</strong> {currentEmail.sender.name} &lt;{currentEmail.sender.email}&gt;</p>
                           <p><strong>Subject:</strong> {currentEmail.subject}</p>
                           <p className="whitespace-pre-wrap pt-2">{currentEmail.body}</p>
                        </div>
                    </details>
                )}

                {settings.showAnalysis && <EmailAnalysis analysis={emailAnalysis} isLoading={isLoading && !emailAnalysis} />}
                
                {settings.showFollowUp && <FollowUpAnalysis analysis={followUpAnalysis} isLoading={isLoading && !followUpAnalysis} />}

                {settings.showInstructions && (
                    <Instructions 
                        tone={selectedTone}
                        setTone={setSelectedTone}
                        instruction={customInstruction}
                        setInstruction={setCustomInstruction}
                        onApply={handleApplyInstructions}
                        isLoading={isLoading}
                        tones={tones}
                    />
                )}

                <ResponseSuggestions 
                    suggestions={suggestions} 
                    isLoading={isLoading && suggestions.length === 0}
                    onBack={handleBack}
                    showBack={suggestionsHistory.length > 0}
                    suggestionCount={settings.suggestionCount}
                />
            </main>
        </div>
    );
};

export default App;

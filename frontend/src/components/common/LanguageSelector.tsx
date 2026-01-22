import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

export const LanguageSelector = ({ className = '' }: { className?: string }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'en', label: 'English', flag: '🇺🇸' }
    ];

    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div className={`relative z-50 ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all text-gray-700 group hover:border-[#11303B]/30"
            >
                <Globe className="w-4 h-4 text-gray-400 group-hover:text-[#11303B] transition-colors" />
                <span className="text-sm font-bold">{currentLanguage.label}</span>
                <span className="text-xs">{currentLanguage.flag}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0A0A0B] border border-white/10 shadow-2xl overflow-hidden z-50 py-1"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        i18n.changeLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className={`text-sm font-medium ${i18n.language === lang.code ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                            {lang.label}
                                        </span>
                                    </div>
                                    {i18n.language === lang.code && (
                                        <Check className="w-4 h-4 text-[#11303B]" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Sparkles, Lock, ArrowRight, Brain, Code2, Mic, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PremiumBanner = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/25 rounded-2xl p-6 shadow-xl relative overflow-hidden text-white"
        >
            {/* Background blur decorative element */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#5d8c2c]/10 rounded-full blur-3xl" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2 max-w-3xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/35 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={12} className="animate-pulse" />
                        Premium Modules Available
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Supercharge Your Pipeline with HiringAI Pro</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        Unlock automated aptitude assessments, real-time coding evaluations, and interactive AI voice interviews. 
                        Bring your recruitment flow into the future.
                    </p>
                </div>
                <a
                    href="https://thirdeyedata.ai/contact-us/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5d8c2c] to-[#4a7a1f] text-white hover:shadow-lg hover:shadow-green-500/20 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shrink-0 self-start md:self-center"
                >
                    Upgrade to Enterprise
                    <ArrowRight size={16} />
                </a>
            </div>
        </motion.div>
    );
};

export const PremiumShowcaseModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasShown = sessionStorage.getItem('hasShownPremiumModal');
        const role = localStorage.getItem('role');
        const isAdmin = role === 'admin' || role === 'SUPER_ADMIN' || role === 'HR_ADMIN';
        
        if (!hasShown && !isAdmin) {
            // Delay slightly for premium experience feel
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('hasShownPremiumModal', 'true');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!isOpen) return null;

    const premiumFeatures = [
        {
            title: "Aptitude Round",
            description: "Automatically generate tailored MCQ assessments and grade candidate math, logic, and reasoning capabilities in real-time.",
            icon: Brain,
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
        },
        {
            title: "Coding Round",
            description: "An isolated runtime environment support for multiple programming languages. Candidates write code against automated unit-test suites.",
            icon: Code2,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
        },
        {
            title: "AI Interview",
            description: "Automated, conversational voice interviews powered by advanced voice AI agents. Evaluates technical depth and communication skills.",
            icon: Mic,
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative"
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#5d8c2c]/10 rounded-full blur-3xl -z-10" />

                    {/* Close Button */}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute top-5 right-5 p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 md:p-10 space-y-8 flex-1 overflow-y-auto">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#5d8c2c]/15 border border-[#5d8c2c]/30 text-[#8ec84c] text-xs font-bold uppercase tracking-wider">
                                <Sparkles size={12} />
                                Enterprise Upgrade
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">Unlock Premium Recruitment Rounds</h3>
                            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                                Get access to production-ready screening rounds that completely automate candidate evaluation.
                            </p>
                        </div>

                        {/* Premium Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {premiumFeatures.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div 
                                        key={i} 
                                        className="bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 space-y-3 transition-all flex flex-col text-center items-center justify-between"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${f.color.split(' ')[1]} ${f.color.split(' ')[2]}`}>
                                            <Icon size={24} className={f.color.split(' ')[0]} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-200 text-sm">{f.title}</h4>
                                            <p className="text-xs text-slate-450 leading-relaxed font-medium">{f.description}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-750 font-bold uppercase">
                                            <Lock size={8} /> Pro Feature
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CTA Section */}
                        <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-left">
                                <h5 className="font-bold text-slate-250 text-sm">Ready to elevate your hiring standard?</h5>
                                <p className="text-xs text-slate-400 mt-1">Talk to our product specialists to integrate custom test libraries.</p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    Maybe Later
                                </button>
                                <a
                                    href="https://thirdeyedata.ai/contact-us/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5d8c2c] to-[#4a7a1f] text-white hover:shadow-lg hover:shadow-green-500/20 rounded-xl font-bold text-xs transition-all hover:-translate-y-0.5"
                                >
                                    Contact Us
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

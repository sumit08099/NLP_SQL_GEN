import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BrainCircuit, ArrowRight, Zap, ShieldCheck,
    Database, MessageSquare, Sparkles, BarChart3,
    ChevronRight, Globe, Cpu, Terminal
} from 'lucide-react';
import logo from '../assets/logo.jpeg';

const LandingPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const features = [
        {
            icon: <BrainCircuit className="text-brand-400" size={24} />,
            title: "Hybrid Intelligence",
            description: "Powered by a custom fine-tuned T5-Small model paired with Gemini 2.0 Flash for maximum reasoning depth."
        },
        {
            icon: <Database className="text-purple-400" size={24} />,
            title: "Neural Ingestion",
            description: "Simply upload your CSV or Excel files. Our AI automatically maps the schema to its data sources."
        },
        {
            icon: <Terminal className="text-emerald-400" size={24} />,
            title: "Self-Correcting SQL",
            description: "Specialized agents monitor and fix query errors in real-time before they ever reach your terminal."
        },
        {
            icon: <BarChart3 className="text-amber-400" size={24} />,
            title: "Deep Analysis",
            description: "Go beyond simple queries. Ask for anomalies, correlations, and trends in plain natural language."
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-brand-500/30 overflow-hidden">
            {/* Background Mesh/Glow */}
            <div className="fixed inset-0 bg-mesh opacity-40 pointer-events-none" />
            <div className="fixed top-0 left-0 w-full h-[500px] bg-brand-600/10 blur-[150px] -translate-y-1/2 pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-10 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-lg shadow-brand-500/20">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">NLP2SQL</span>
                </div>
                <div className="flex items-center gap-6">
                    {token ? (
                        <button
                            onClick={() => navigate('/workspace')}
                            className="btn-primary"
                        >
                            Enter Workspace
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Login</Link>
                            <Link to="/signup" className="btn-primary">Initialize Access</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-40 max-w-7xl mx-auto px-10 pt-20 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10 mb-8">
                            <Sparkles size={16} className="text-brand-400" />
                            <span className="text-[10px] font-black text-brand-300 uppercase tracking-[0.3em]">Protocol v4.2 Active</span>
                        </div>
                        <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                            TALK TO YOUR DATA <br />
                            <span className="text-brand-500">LIKE A PRO.</span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 max-w-lg leading-relaxed font-medium">
                            Transform natural language into complex SQL operations instantly.
                            Built with a multi-agent neural architecture for enterprise-grade precision.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button
                                onClick={() => navigate(token ? '/workspace' : '/signup')}
                                className="h-16 px-10 bg-brand-600 hover:bg-brand-500 rounded-2xl text-lg font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-brand-500/20 group flex items-center justify-center gap-3"
                            >
                                {token ? "Sync Workspace" : "Begin Deployment"}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-4 px-8 glass-card border-white/5 bg-white/[0.02]">
                                <ShieldCheck size={24} className="text-emerald-500" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Protocol</p>
                                    <p className="text-xs font-bold">End-to-End Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 glass-card p-1 bg-white/[0.05] border-white/10 shadow-3xl">
                            <div className="bg-[#000] rounded-[2.2rem] overflow-hidden border border-white/5">
                                <div className="p-10 space-y-8">
                                    <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                                        <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                                            <MessageSquare className="text-brand-400" />
                                        </div>
                                        <p className="font-mono text-sm text-brand-300">"Compare revenue by region for 2024..."</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NLP2SQL Engine Active</span>
                                        </div>
                                        <div className="terminal-box bg-slate-950">
                                            <div className="terminal-content">
                                                <span className="text-brand-400">SELECT</span> region, SUM(amount) <br />
                                                <span className="text-brand-400">FROM</span> sales_2024 <br />
                                                <span className="text-brand-400">GROUP BY</span> region <br />
                                                <span className="text-brand-400">ORDER BY</span> 2 DESC;
                                                <span className="terminal-cursor" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ width: ["0%", "80%", "80%"] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-full bg-brand-500"
                                            />
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ width: ["0%", "60%", "60%"] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                                className="h-full bg-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative floating elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/20 blur-[80px] rounded-full animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-600/10 blur-[100px] rounded-full animate-pulse" />
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="mt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-10 group hover:border-brand-500/30 transition-all hover:-translate-y-2"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:bg-brand-500/10 group-hover:border-brand-500/20 transition-all">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">{feature.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-50 border-t border-white/5 bg-slate-950/40 backdrop-blur-3xl py-20">
                <div className="max-w-7xl mx-auto px-10 flex flex-col items-center gap-10">
                    <div className="flex items-center gap-3 opacity-50">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-lg shadow-brand-500/20">
                            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-black tracking-tighter">NLP2SQL</span>
                    </div>
                    <div className="flex gap-12 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                        <a href="#" className="hover:text-brand-400 transition-colors">NLP2SQL Engine</a>
                        <a href="#" className="hover:text-brand-400 transition-colors">Registry</a>
                        <a href="#" className="hover:text-brand-400 transition-colors">Workspace</a>
                        <a href="#" className="hover:text-brand-400 transition-colors">Support</a>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">
                        © 2026 - Engineered for Intelligence - Protocol 4.2.0
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

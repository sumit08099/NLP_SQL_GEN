import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit, ArrowRight, Zap, ShieldCheck,
    Database, MessageSquare, Sparkles, BarChart3,
    ChevronRight, Globe, Cpu, Terminal, X,
    Layers, Search, Activity, Cpu as CpuIcon,
    Code2, Network, Binary, Brain as BrainIcon
} from 'lucide-react';
import logo from '../assets/logo.jpeg';

const LandingPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [terminalText, setTerminalText] = useState("");
    const fullTerminalCode = `SELECT region, SUM(amount) \nFROM sales_2024 \nGROUP BY region \nORDER BY 2 DESC;`;

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTerminalText(fullTerminalCode.slice(0, i));
            i++;
            if (i > fullTerminalCode.length) i = 0;
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            id: 1,
            icon: <BrainCircuit className="text-brand-400" size={24} />,
            title: "Hybrid Intelligence",
            description: "Powered by a custom fine-tuned T5-Small model paired with Gemini 2.0 Flash.",
            longDescription: "Our architecture utilizes a dual-engine approach. A local fine-tuned T5-Small handles standard SQL syntax with minimal latency, while Gemini 2.0 Flash provides deep reasoning for complex joins and multi-table relationships.",
            specs: ["T5-Small Local Inference", "Gemini 2.0 Flash Expert", "98.4% Query Accuracy", "Sub-200ms Latency"],
            color: "brand"
        },
        {
            id: 2,
            icon: <Database className="text-purple-400" size={24} />,
            title: "Neural Ingestion",
            description: "Simply upload your CSV or Excel files. Our AI automatically maps the schema.",
            longDescription: "Bypass complex ETL processes. Upload any flat file, and our Neural Mapper automatically infers data types, detects primary keys, and builds a relational schema in our secure virtualization layer.",
            specs: ["Auto-Type Detection", "Primary Key Inference", "CSV/XLSX Support", "Secure Isolation"],
            color: "purple"
        },
        {
            id: 3,
            icon: <Terminal className="text-emerald-400" size={24} />,
            title: "Self-Correcting SQL",
            description: "Specialized agents monitor and fix query errors in real-time.",
            longDescription: "The NLP2SQL loop features a dedicated Reflection Agent. If a query fails execution, the agent analyzes the traceback, consults the database schema, and automatically generates a corrected version within milliseconds.",
            specs: ["Reflection Loop", "Traceback Analysis", "Auto-Heal Protocol", "Schema Aware"],
            color: "emerald"
        },
        {
            id: 4,
            icon: <BarChart3 className="text-amber-400" size={24} />,
            title: "Deep Analysis",
            description: "Go beyond simple queries. Ask for anomalies, correlations, and trends.",
            longDescription: "NLP2SQL doesn't just fetch data—it understands intent. Ask questions like 'Why did sales drop in July?' and our engine will perform multi-dimensional analysis to find correlations and hidden insights.",
            specs: ["Anomaly Detection", "Correlation Mapping", "Trend Forecasting", "Natural Intuition"],
            color: "amber"
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-brand-500/30 overflow-hidden font-sans">
            {/* Background Animations */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-mesh opacity-30" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-10 py-8 max-w-7xl mx-auto backdrop-blur-md">
                <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity group">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-slate-900 p-0.5 group-hover:scale-105 transition-transform">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">NLP2SQL</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-brand-500 -mt-1">Intelligence Layer</span>
                    </div>
                </Link>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-8"
                >
                    {token ? (
                        <button
                            onClick={() => navigate('/workspace')}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/20"
                        >
                            Enter Workspace
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em] hidden sm:block">Access Terminal</Link>
                            <Link to="/signup" className="h-12 px-8 flex items-center bg-white text-black hover:bg-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                                Initialize
                            </Link>
                        </>
                    )}
                </motion.div>
            </nav>

            <main className="relative z-40 max-w-7xl mx-auto px-10 pt-20 pb-32">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2 glass rounded-full border border-white/10 mb-10 group cursor-default">
                            <Activity size={14} className="text-brand-400 animate-pulse" />
                            <span className="text-[10px] font-black text-brand-300 uppercase tracking-[0.4em]">Engine Status: Optimal</span>
                        </div>

                        <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-10">
                            TALK TO <br />
                            <span className="text-brand-500 relative">
                                DATA
                                <motion.div
                                    className="absolute -bottom-2 left-0 w-full h-3 bg-brand-500/20 -rotate-1"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                />
                            </span>
                            <br />
                            LIKE A PRO.
                        </h1>

                        <p className="text-xl text-slate-400 mb-12 max-w-lg leading-relaxed font-medium border-l-4 border-brand-500/30 pl-8 py-2">
                            Transform natural language into high-performance SQL.
                            Built with a multi-agent architectural loop for enterprise-grade precision and self-healing queries.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <button
                                onClick={() => navigate(token ? '/workspace' : '/signup')}
                                className="h-18 px-12 bg-indigo-600 hover:bg-indigo-500 rounded-[2rem] text-lg font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-3xl shadow-indigo-600/30 group flex items-center justify-center gap-4"
                            >
                                {token ? "Sync Workspace" : "Begin Deployment"}
                                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                            </button>

                            <div className="flex items-center gap-5 px-10 glass-card border-white/5 bg-white/[0.02] rounded-[2rem]">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Protection Layer</p>
                                    <p className="text-xs font-bold text-slate-200">E2E Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pro Terminal Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 p-1 rounded-[3.5rem] bg-gradient-to-tr from-brand-500/20 via-white/5 to-purple-500/20 backdrop-blur-2xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                            <div className="bg-[#0b0f1a] rounded-[3.2rem] overflow-hidden border border-white/5 p-2">
                                {/* Terminal Header */}
                                <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-slate-900/40">
                                    <div className="flex gap-2.5">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/50 shadow-inner" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500/50 shadow-inner" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/50 shadow-inner" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CpuIcon size={14} className="text-slate-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">NLP2SQL SHELL</span>
                                    </div>
                                    <div className="w-16" />
                                </div>

                                <div className="p-10 space-y-10">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shrink-0">
                                            <MessageSquare className="text-brand-400" size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Natural Query</p>
                                            <p className="font-mono text-sm text-brand-300 italic">"Analyze high-revenue clusters for Q4 sales data..."</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 opacity-60">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Engine Logic Mapping [OK]</span>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-brand-500/5 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative bg-black/60 rounded-3xl p-8 font-mono text-sm leading-relaxed border border-white/5 shadow-2xl overflow-hidden group min-h-[200px]">
                                                <div className="terminal-content-v2 text-brand-300 whitespace-pre">
                                                    {terminalText}
                                                    <span className="w-2 h-5 bg-brand-500 inline-block align-middle ml-1 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex gap-10">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">System Latency</p>
                                                <p className="text-xs font-bold text-emerald-500">142ms</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Logic Engine</p>
                                                <p className="text-xs font-bold text-brand-400">P-Reflect 2.0</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    animate={{ x: ["-100%", "100%"] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                    className="w-full h-full bg-brand-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Tech Badges */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-6 -left-6 z-20 glass-card p-4 rounded-3xl border-brand-500/30 flex items-center gap-3 bg-[#020617]/80"
                        >
                            <Binary size={18} className="text-brand-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Auto-Schema Mapping</span>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                            className="absolute -bottom-10 -right-6 z-20 glass-card p-4 rounded-3xl border-emerald-500/30 flex items-center gap-3 bg-[#020617]/80"
                        >
                            <ShieldCheck size={18} className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Validated Execution</span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Features Section */}
                <div id="features-section" className="space-y-12">
                    <div className="flex flex-col items-center text-center space-y-4 mb-20">
                        <h2 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.5em] mb-2">Core Platform Capabilities</h2>
                        <h3 className="text-5xl font-black tracking-tighter">ENGINEERED FOR DATA OBSESSED.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedFeature(feature)}
                                className="glass-card p-10 group hover:border-brand-500/30 transition-all hover:-translate-y-2 cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={16} className="text-brand-500" />
                                </div>

                                <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/5 border border-${feature.color}-500/10 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-${feature.color}-500/10 transition-all shadow-xl`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">{feature.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">{feature.description}</p>
                                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    Expand Intelligence <ArrowRight size={12} />
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Feature Modal */}
            <AnimatePresence>
                {selectedFeature && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFeature(null)}
                            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-3xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-4xl glass-card border-white/10 overflow-hidden shadow-[0_50px_200px_-20px_rgba(59,130,246,0.2)]"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Modal Left: Visual */}
                                <div className={`bg-${selectedFeature.color}-600/10 p-12 flex flex-col items-center justify-center border-r border-white/5 relative overflow-hidden`}>
                                    <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-20 pointer-events-none" />
                                    <div className={`w-32 h-32 rounded-[2.5rem] bg-${selectedFeature.color}-500/10 flex items-center justify-center mb-8 border border-${selectedFeature.color}-500/20 shadow-2xl relative z-10`}>
                                        {React.cloneElement(selectedFeature.icon, { size: 64 })}
                                    </div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-64 h-64 border border-dashed border-white/5 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-80 h-80 border border-dashed border-white/5 rounded-full"
                                    />
                                </div>

                                {/* Modal Right: Content */}
                                <div className="p-12 md:p-16 space-y-10 relative">
                                    <button
                                        onClick={() => setSelectedFeature(null)}
                                        className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`w-2 h-2 rounded-full bg-${selectedFeature.color}-500`} />
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Module Specification</h4>
                                        </div>
                                        <h2 className="text-5xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                            {selectedFeature.title.toUpperCase()}
                                        </h2>
                                        <p className="text-lg text-slate-400 leading-relaxed font-medium">
                                            {selectedFeature.longDescription}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                                            <Layers size={14} className="text-brand-400" /> TECHNICAL ARCHITECTURE
                                        </h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedFeature.specs.map((spec, sidx) => (
                                                <div key={sidx} className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-brand-500/30 transition-all">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 group-hover:scale-125 transition-transform" />
                                                    <span className="text-[11px] font-bold text-slate-300 tracking-tight">{spec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <button
                                            onClick={() => navigate(token ? '/workspace' : '/signup')}
                                            className="w-full py-5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            Initialize Core <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global CTA Section */}
            <section className="relative z-40 max-w-7xl mx-auto px-10 pb-40">
                <div className="glass-card p-20 rounded-[4rem] text-center space-y-12 overflow-hidden relative group border-brand-500/10">
                    <div className="absolute inset-0 bg-brand-600/[0.03] group-hover:bg-brand-600/[0.06] transition-all" />
                    <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <Sparkles size={48} className="text-brand-400 mx-auto mb-10" />
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                            READY TO SCALE <br />
                            YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-600">INTELLIGENCE?</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                            Join the next generation of data-driven teams. Upload your first dataset and experience the power of autonomous SQL generation.
                        </p>
                        <div className="pt-10">
                            <button
                                onClick={() => navigate(token ? '/workspace' : '/signup')}
                                className="h-20 px-16 bg-white text-black hover:bg-slate-200 rounded-[2.5rem] text-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-3xl group inline-flex items-center gap-4"
                            >
                                Deploy Kernel <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-50 border-t border-white/5 bg-slate-950/40 backdrop-blur-3xl py-32">
                <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-20">
                    <div className="col-span-2 space-y-10">
                        <Link to="/" className="flex items-center gap-4 group w-fit">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-500/30 shadow-lg shadow-brand-500/10 group-hover:scale-105 transition-transform">
                                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter">NLP2SQL</span>
                        </Link>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm">
                            Next-generation autonomous data intelligence platform. Built for precision. Engineered for scale.
                        </p>
                        <div className="flex gap-10">
                            <Globe onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 hover:text-brand-400 cursor-pointer transition-colors" size={24} />
                            <Activity onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-emerald-400 cursor-pointer transition-colors" size={24} />
                            <ShieldCheck onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-purple-400 cursor-pointer transition-colors" size={24} />
                        </div>
                    </div>

                    <div className="space-y-10">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Resource Registry</h4>
                        <div className="flex flex-col gap-6 text-slate-500 text-sm font-bold uppercase tracking-widest">
                            <Link to="/workspace" onClick={() => window.scrollTo(0, 0)} className="hover:text-brand-400 transition-colors">NLP2SQL Engine</Link>
                            <Link to="/signup" onClick={() => window.scrollTo(0, 0)} className="hover:text-brand-400 transition-colors">Registry</Link>
                            <Link to="/workspace" onClick={() => window.scrollTo(0, 0)} className="hover:text-brand-400 transition-colors">Workspace</Link>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Support Channel</h4>
                        <div className="flex flex-col gap-6 text-slate-500 text-sm font-bold uppercase tracking-widest">
                            <button onClick={() => setShowHelp(true)} className="text-left hover:text-brand-400 transition-colors uppercase">Terminal Help</button>
                            <div className="flex items-center gap-2 text-emerald-500/60">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs">System Status: Operational</span>
                            </div>
                            <div className="flex items-center gap-2 text-brand-400/60">
                                <ShieldCheck size={12} />
                                <span className="text-xs">Security Audit: Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-10 mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">
                    <p>© 2026 - Engineered for Intelligence</p>
                    <div className="flex gap-10">
                        <span>SYSTEM_STABLE</span>
                        <span>NODE_SYNC_READY</span>
                    </div>
                </div>
            </footer>
            {/* Help Modal */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20"
                    >
                        <div onClick={() => setShowHelp(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" />
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="w-full max-w-4xl glass-card rounded-[3rem] p-10 md:p-16 relative overflow-hidden ring-1 ring-white/10"
                        >
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-10 right-10 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>

                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-500/30 shadow-xl bg-slate-900 p-0.5">
                                    <img src={logo} alt="NLP2SQL" className="w-full h-full object-cover rounded-[0.9rem]" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase">Operations Manual</h2>
                                    <p className="text-[10px] text-brand-500 font-black uppercase tracking-[0.4em] mt-1">Live Intelligence System</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="space-y-6">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                        <Database className="text-purple-400" size={20} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">01. Data Ingestion</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        Upload dynamic datasets (CSV/Excel). The engine will automatically map schemas and initialize the Neural Synchronizer.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <MessageSquare className="text-emerald-400" size={20} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">02. NLP Querying</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        Speak to your data. Ask for complex joins, aggregations, or filters using natural language. No SQL knowledge required.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                        <Zap className="text-amber-400" size={20} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">03. Storytelling</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        The Logic Layer provides analytical storytelling, identifying trends and outliers beyond the raw SQL results.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-16 p-8 rounded-3xl bg-brand-500/5 border border-brand-500/20">
                                <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-4">Pro Security Tip</h4>
                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                    Every query processed through our engine is sandboxed. Your raw credentials and sensitive metadata are never exposed to the public intelligence layer.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;

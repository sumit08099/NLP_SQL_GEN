import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Upload,
    Database,
    MessageSquare,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Loader2,
    Table as TableIcon,
    Code2,
    Info,
    ChevronDown,
    ChevronUp,
    BrainCircuit,
    ShieldCheck,
    LogOut,
    User as UserIcon,
    Search,
    Plus,
    Zap,
    Layout,
    Cpu,
    RefreshCw,
    Clock
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

function HomePage() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'System Initialized. I am your AI Data Intelligence Layer. Upload a knowledge base (CSV/Excel) to begin deep-analysis within the secure environment.',
            isIntro: true
        }
    ]);
    const [query, setQuery] = useState('');
    const [file, setFile] = useState(null);
    const [tableName, setTableName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [schema, setSchema] = useState([]);
    const [showTechDetails, setShowTechDetails] = useState({});
    const [token] = useState(localStorage.getItem('token'));
    const [username] = useState(localStorage.getItem('username') || 'Operative');

    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchSchema();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleTechDetails = (msgIndex) => {
        setShowTechDetails(prev => ({
            ...prev,
            [msgIndex]: !prev[msgIndex]
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file || !tableName) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', tableName);

        try {
            await axios.post(`${API_BASE_URL}/upload`, formData);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Node Synchronized. Target "${tableName}" has been successfully ingested into the persistent knowledge layer. I have analyzed its structure and am ready for queries.`
            }]);
            fetchSchema();
            setFile(null);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Sync Error: ${error.response?.data?.detail || error.message}`
            }]);
        } finally {
            setIsUploading(false);
        }
    };

    const fetchSchema = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/schema`);
            setSchema(response.data.schema);
        } catch (error) {
            console.error('Error fetching schema:', error);
        }
    };

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg = { role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        const currentQuery = query;
        setQuery('');
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('query', currentQuery);

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/chat`, formData, config);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.answer,
                sql: response.data.sql,
                data: response.data.data,
                plan: response.data.plan,
                reflection: response.data.reflection
            }]);
        } catch (error: any) {
            let errorMsg = error.response?.data?.detail || error.message;
            if (error.response?.status === 401) {
                handleLogout();
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Protocol Violation: ${errorMsg}`
                }]);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-brand-500/30">
            {/* Mesh Background Decorations */}
            <div className="fixed inset-0 bg-mesh opacity-40 pointer-events-none" />

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-slate-950/60 border-r border-white/5 flex flex-col p-6 backdrop-blur-3xl z-30"
            >
                <div className="flex items-center gap-4 mb-10 px-2 leading-tight">
                    <div className="p-3 glass-card shadow-lg shadow-brand-500/10">
                        <BrainCircuit size={24} className="text-brand-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white">SQL MASTER</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural Engine v4</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">

                    {/* User Section */}
                    <section className="space-y-4">
                        <div className="p-5 glass-card border-brand-500/10 bg-brand-500/[0.02]">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-brand-500/20 ring-1 ring-white/20">
                                    <UserIcon size={24} className="text-white" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-sm font-black text-white truncate">{username}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Authenticated</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-slate-400 hover:text-white transition-all bg-white/[0.03] hover:bg-white/[0.08] rounded-xl border border-white/5 uppercase tracking-widest"
                            >
                                <LogOut size={14} /> Close Terminal
                            </button>
                        </div>
                    </section>

                    {/* Table Ingestion */}
                    <section>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Data Ingestion</h2>
                            <div className="p-1 glass rounded-md">
                                <Zap size={10} className="text-brand-400" />
                            </div>
                        </div>

                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div className="group relative">
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const selected = e.target.files?.[0];
                                        if (selected) {
                                            setFile(selected);
                                            setTableName(selected.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'));
                                        }
                                    }}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".csv,.xlsx,.xls"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center p-8 glass-card border-dashed border-white/10 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all cursor-pointer group"
                                >
                                    <div className="p-4 bg-slate-900 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-2xl border border-white/5">
                                        <Upload size={24} className="text-slate-400 group-hover:text-brand-400" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-2">
                                        {file ? file.name : "Select Knowledge Base"}
                                    </span>
                                </label>
                            </div>

                            <AnimatePresence>
                                {file && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Knowledge Identifier"
                                            value={tableName}
                                            onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none text-white h-12 uppercase tracking-widest placeholder:text-slate-700"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isUploading}
                                            className="btn-primary w-full h-12 text-xs uppercase tracking-[0.2em]"
                                        >
                                            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                            Sync Knowledge
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </section>

                    {/* Active Knowledge */}
                    <section>
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">Neural Knowledge Map</h2>
                        <div className="glass-card bg-black/40 p-5 font-mono text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto custom-scrollbar border-white/5 ring-1 ring-white/5">
                            {schema || "Connect data source to initialize knowledge mapping."}
                        </div>
                    </section>
                </div>
            </motion.aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col relative bg-slate-950/20 backdrop-blur-sm z-20">
                {/* Header bar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/40 backdrop-blur-3xl active:z-50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 glass-card border-emerald-500/20 bg-emerald-500/[0.03]">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em]">End-to-End Secure</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/5" />
                        <div className="flex items-center gap-3 text-slate-500">
                            <Clock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 cursor-pointer hover:text-brand-400 transition-colors group">
                            <Search size={16} className="text-slate-500 group-hover:text-brand-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-brand-400">Search Logs</span>
                        </div>
                        <div className="p-2.5 glass-card hover:bg-white/5 transition-all cursor-pointer">
                            <RefreshCw size={16} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar relative">
                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-3xl relative ${msg.role === 'user' ? 'w-full flex justify-end' : 'w-full'}`}>
                                    {/* User Prompt */}
                                    {msg.role === 'user' && (
                                        <div className="glass-card bg-brand-600/10 border-brand-500/30 p-6 rounded-[2rem] rounded-tr-none shadow-2xl shadow-brand-500/5 min-w-[300px]">
                                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-3 glass shadow-xl rounded-2xl bg-slate-900 border border-brand-500/30">
                                                <UserIcon size={20} className="text-brand-400" />
                                            </div>
                                            <p className="text-base text-white/90 leading-relaxed font-medium">{msg.content}</p>
                                        </div>
                                    )}

                                    {/* AI Response Prompt */}
                                    {msg.role === 'assistant' && (
                                        <div className="w-full space-y-6">
                                            <div className="glass-card p-10 rounded-[2.5rem] rounded-tl-none ring-1 ring-white/5 shadow-2xl shadow-black/60 bg-slate-900/50">
                                                <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 p-3 glass shadow-xl rounded-2xl bg-slate-900 border border-white/10">
                                                    <BrainCircuit size={20} className="text-brand-400" />
                                                </div>
                                                <div className="text-base md:text-lg text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {msg.content}
                                                </div>

                                                {/* Chain Analysis Toggle */}
                                                {(msg.sql || msg.plan) && (
                                                    <div className="mt-10 pt-8 border-t border-white/5">
                                                        <button
                                                            onClick={() => toggleTechDetails(i)}
                                                            className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-brand-400 transition-all group"
                                                        >
                                                            <div className={cn("p-1 rounded-md bg-white/5 group-hover:bg-brand-500/10", showTechDetails[i] && "rotate-180")}>
                                                                <ChevronDown size={14} className="transition-transform" />
                                                            </div>
                                                            Advanced Insight Analysis
                                                        </button>

                                                        <AnimatePresence>
                                                            {showTechDetails[i] && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="mt-8 space-y-6 overflow-hidden"
                                                                >
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="p-6 glass-card border-brand-500/20 bg-brand-500/[0.03]">
                                                                            <div className="flex items-center gap-3 mb-4 text-[10px] font-black text-brand-400 uppercase tracking-widest">
                                                                                <Cpu size={14} /> Neural Logic Plan
                                                                            </div>
                                                                            <p className="text-xs text-slate-400 leading-relaxed italic">{msg.plan}</p>
                                                                        </div>

                                                                        <div className="p-6 glass-card border-emerald-500/20 bg-emerald-500/[0.03]">
                                                                            <div className="flex items-center gap-3 mb-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                                                <Layout size={14} /> Execution Kernel
                                                                            </div>
                                                                            <code className="block text-[11px] font-mono text-emerald-400/80 break-all bg-black/40 p-3 rounded-xl border border-white/5">{msg.sql}</code>
                                                                        </div>
                                                                    </div>

                                                                    {msg.data && msg.data.length > 0 && (
                                                                        <div className="glass-card border-white/5 overflow-hidden">
                                                                            <div className="p-4 bg-white/5 border-b border-white/5">
                                                                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                                    <TableIcon size={14} /> Knowledge Retrieval Snippet
                                                                                </div>
                                                                            </div>
                                                                            <div className="overflow-x-auto">
                                                                                <table className="w-full text-xs text-slate-300 border-collapse">
                                                                                    <thead>
                                                                                        <tr className="bg-white/[0.02]">
                                                                                            {Object.keys(msg.data[0]).map(k => (
                                                                                                <th key={k} className="text-left p-4 uppercase tracking-tighter text-slate-500 font-black border-b border-white/5">{k}</th>
                                                                                            ))}
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-white/5">
                                                                                        {msg.data.slice(0, 5).map((row, ri) => (
                                                                                            <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                                                                                                {Object.values(row).map((val, vi) => (
                                                                                                    <td key={vi} className="p-4 truncate max-w-[200px] border-r border-white/5 last:border-0">{String(val)}</td>
                                                                                                ))}
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                                {msg.data.length > 5 && (
                                                                                    <div className="p-3 bg-white/[0.02] text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                                                                        Continuing Log Sequence... (+{msg.data.length - 5} items)
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="glass-card p-8 rounded-[2rem] rounded-tl-none flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand-600/5 animate-pulse" />
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand-500/40 blur-lg rounded-full animate-bounce" />
                                    <Loader2 size={32} className="animate-spin text-brand-500 relative z-10" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-base font-black text-white uppercase tracking-widest">Querying Neural Core...</p>
                                    <div className="flex gap-1.5 mt-2">
                                        {[0, 1, 2].map(n => (
                                            <motion.div
                                                key={n}
                                                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: n * 0.2 }}
                                                className="w-1.5 h-1.5 rounded-full bg-brand-500"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={chatEndRef} className="h-10" />
                </div>

                {/* Input Layer */}
                <footer className="p-10 pt-0 relative z-30">
                    <div className="max-w-4xl mx-auto relative group">
                        {/* Soft Ambient Glow */}
                        <div className="absolute inset-0 bg-brand-600/20 rounded-[2.5rem] blur-3xl opacity-0 group-focus-within:opacity-40 transition-opacity" />

                        <div className="relative glass-card border-brand-500/20 p-2 overflow-hidden bg-brand-950/40">
                            <div className="absolute top-0 right-10 -translate-y-full flex items-center gap-4 mb-2">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Input Layer Alpha v2</span>
                            </div>

                            <input
                                type="text"
                                placeholder="Ask the Neural Core anything about your data bases..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="w-full bg-transparent py-6 pl-10 pr-24 rounded-[2rem] outline-none text-lg text-white font-medium placeholder:text-slate-600 focus:placeholder:text-slate-500 transition-all"
                            />

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={!query.trim() || isProcessing}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-brand-600 hover:bg-brand-500 text-white rounded-[1.5rem] transition-all shadow-xl shadow-brand-600/30 disabled:opacity-20 flex items-center justify-center"
                            >
                                <Send size={24} />
                            </motion.button>
                        </div>
                    </div>
                    <div className="text-center mt-6 flex justify-center gap-8 items-center">
                        <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center gap-2">
                            <ShieldCheck size={10} /> Certified Enterprise Grade
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
                            Sync Status: <span className="text-brand-500">Live Optimization</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default HomePage;

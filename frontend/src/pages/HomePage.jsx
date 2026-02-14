import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Upload, Database, MessageSquare, ChevronRight, CheckCircle,
    AlertCircle, Loader2, Table as TableIcon, Code2, Info, ChevronDown,
    ChevronUp, BrainCircuit, ShieldCheck, LogOut, User as UserIcon,
    Search, Plus, Zap, Layout, Cpu, RefreshCw, Clock, Download,
    Trash2, Layers, Check, ArrowRight, Brain as BrainIcon, Terminal,
    Sparkles, LogIn, User, Lock
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo from '../assets/logo.jpeg';

const API_BASE_URL = 'http://localhost:8000';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

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
    const [schema, setSchema] = useState('');
    const [showTechDetails, setShowTechDetails] = useState({});
    const [token] = useState(localStorage.getItem('token'));
    const [username] = useState(localStorage.getItem('username') || 'Operative');
    const [selectedForAmbiguity, setSelectedForAmbiguity] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSchema = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/schema`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchema(response.data.schema);
        } catch (error) {
            console.error('Error fetching schema:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchSchema();
    }, [fetchSchema]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
            await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Node Synchronized. Target "${tableName}" has been successfully ingested into the persistent knowledge layer. I have analyzed its structure and am ready for queries.`
            }]);
            fetchSchema();
            setFile(null);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Sync Error: ${error.response?.data?.detail || error.message}`
            }]);
        } finally {
            setIsUploading(false);
        }
    };



    const handleDownload = (data, filename = "analyzed_data.csv") => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row =>
            Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSend = async (forcedQuery = null) => {
        const queryToSend = forcedQuery || query;
        if (!queryToSend.trim()) return;

        const userMsg = { role: 'user', content: queryToSend };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('query', queryToSend);

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_BASE_URL}/chat`, formData, config);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.answer,
                sql: response.data.sql,
                data: response.data.data,
                plan: response.data.plan,
                reflection: response.data.reflection,
                is_ambiguous: response.data.is_ambiguous,
                potential_matches: response.data.potential_matches
            }]);
        } catch (error) {
            let errorMsg = error.response?.data?.detail || error.message;
            if (error.response?.status === 401) {
                handleLogout();
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `System Error: ${errorMsg}`
                }]);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
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
                    <Link to="/" className="p-3 glass-card shadow-lg shadow-brand-500/10 rounded-full overflow-hidden hover:scale-110 transition-transform">
                        <img src={logo} alt="Logo" className="w-6 h-6 object-cover rounded-full" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white">NLP2SQL</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">NLP2SQL Engine v4</span>
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
                                        key="file-details"
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
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">NLP2SQL Knowledge Map</h2>
                        <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                            {schema && schema.split('Table:').slice(1).map((tableInfo, idx) => {
                                const tableNameMatch = tableInfo.trim().split('\n')[0];
                                return (
                                    <div key={idx} className="glass-card bg-black/40 p-4 border-white/5 ring-1 ring-white/5 group">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{tableNameMatch}</span>
                                            <button
                                                onClick={() => handleDownload(`SELECT * FROM "${tableNameMatch}"`, `${tableNameMatch}.csv`)}
                                                className="p-1.5 opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 rounded-md transition-all border border-white/5"
                                            >
                                                <Download size={10} />
                                            </button>
                                        </div>
                                        <pre className="text-[9px] text-slate-500 font-mono leading-relaxed opacity-60">
                                            {tableInfo.split('\n').slice(1).join('\n').trim()}
                                        </pre>
                                    </div>
                                );
                            }) || (
                                    <div className="glass-card bg-black/40 p-5 font-mono text-[10px] text-slate-500 italic opacity-50 border-white/5">
                                        Connect data source to initialize knowledge mapping.
                                    </div>
                                )}
                        </div>
                    </section>
                </div>
            </motion.aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col relative bg-slate-950/20 backdrop-blur-sm z-20">
                {/* Header bar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/40 backdrop-blur-3xl z-50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 glass-card border-emerald-500/20 bg-emerald-500/[0.03]">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em]">End-to-End Secure</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/5" />
                        <div className="flex items-center gap-3 text-slate-500">
                            <Clock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">
                                System Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div onClick={clearMessages} className="flex items-center gap-3 cursor-pointer hover:text-red-400 transition-colors group">
                            <Trash2 size={16} className="text-slate-500 group-hover:text-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-red-400">Clear Logic Path</span>
                        </div>
                        <div
                            onClick={fetchSchema}
                            className="p-2.5 glass-card hover:bg-brand-500/10 transition-all cursor-pointer active:scale-90 ring-1 ring-white/5"
                        >
                            <RefreshCw size={16} className="text-brand-400" />
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
                                    {/* User Avatar & Prompt */}
                                    {msg.role === 'user' && (
                                        <div className="flex items-start gap-6 flex-row-reverse w-full">
                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] ring-2 ring-white/30 relative overflow-hidden group"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <UserIcon size={30} className="text-white relative z-10" />
                                                    <div className="absolute bottom-0 w-full h-1/3 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                                        <span className="text-[8px] font-black text-white/80 uppercase truncate px-1">{username.substring(0, 8)}</span>
                                                    </div>
                                                </motion.div>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            </div>
                                            <motion.div
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="glass-card bg-brand-600/10 border-brand-500/30 p-7 rounded-[2.5rem] rounded-tr-none shadow-2xl shadow-brand-500/5 max-w-2xl relative"
                                            >
                                                <div className="absolute -right-2 top-6 w-4 h-4 bg-brand-600/20 border-r border-t border-brand-500/30 rotate-45 backdrop-blur-3xl" />
                                                <p className="text-base text-white/90 leading-relaxed font-medium">{msg.content}</p>
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* AI Avatar & Response */}
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-start gap-6 w-full">
                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="w-18 h-18 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-700 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.4)] ring-4 ring-brand-500/30 shrink-0 relative overflow-hidden group"
                                                >
                                                    <div className="absolute inset-0 bg-brand-400/20 animate-pulse" />
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <img src={logo} alt="NLP2SQL" className="w-12 h-12 rounded-full object-cover relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                                </motion.div>
                                                <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">NLP2SQL Engine</span>
                                            </div>
                                            <div className="w-full space-y-6">
                                                <motion.div
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    className="glass-card p-10 rounded-[2.5rem] rounded-tl-none ring-1 ring-white/5 shadow-2xl shadow-black/60 bg-slate-900/50 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-brand-500 to-indigo-600" />
                                                    <div className="text-base md:text-lg text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                                                        {msg.content}
                                                    </div>

                                                    {/* AMBIGUITY UI */}
                                                    {msg.is_ambiguous && msg.potential_matches && (
                                                        <div className="mt-8 p-8 glass-card border-brand-500/30 bg-brand-500/[0.05] shadow-inner shadow-brand-500/10">
                                                            <div className="flex items-center gap-3 mb-6">
                                                                <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                                                                    <Layers size={16} className="text-brand-400" />
                                                                </div>
                                                                <h4 className="text-[11px] font-black text-brand-400 uppercase tracking-[0.2em]">Mission Data Selection Required</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {msg.potential_matches.map(table => (
                                                                    <label key={table}
                                                                        className={cn(
                                                                            "flex items-center gap-4 px-5 py-4 bg-slate-950/40 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95",
                                                                            selectedForAmbiguity.includes(table) ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/50 shadow-lg shadow-brand-500/10" : "border-white/5 hover:border-white/20"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                                            selectedForAmbiguity.includes(table) ? "bg-brand-500 border-brand-500" : "border-white/10 bg-black/20"
                                                                        )}>
                                                                            {selectedForAmbiguity.includes(table) && <Check size={14} className="text-white" />}
                                                                        </div>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="hidden"
                                                                            checked={selectedForAmbiguity.includes(table)}
                                                                            onChange={(e) => {
                                                                                if (e.target.checked) setSelectedForAmbiguity(prev => [...prev, table]);
                                                                                else setSelectedForAmbiguity(prev => prev.filter(t => t !== table));
                                                                            }}
                                                                        />
                                                                        <span className={cn("text-xs font-bold uppercase tracking-widest", selectedForAmbiguity.includes(table) ? "text-white" : "text-slate-400")}>{table}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (selectedForAmbiguity.length > 0) {
                                                                        const tableString = selectedForAmbiguity.join(', ');
                                                                        const originalReq = messages[i - 1].content;
                                                                        const refinedQuery = `In the table(s) [${tableString}], ${originalReq}`;
                                                                        handleSend(refinedQuery);
                                                                        setSelectedForAmbiguity([]);
                                                                    }
                                                                }}
                                                                className="w-full mt-6 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                                                                disabled={selectedForAmbiguity.length === 0}
                                                            >
                                                                Synchronize Target Profiles <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Analysis Block */}
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
                                                                        key={`tech-details-${i}`}
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: "auto" }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="mt-8 space-y-6 overflow-hidden"
                                                                    >
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                            <div className="p-6 glass-card border-brand-500/20 bg-brand-500/[0.03]">
                                                                                <div className="flex items-center gap-3 mb-4 text-[10px] font-black text-brand-400 uppercase tracking-widest">
                                                                                    <Cpu size={14} /> NLP2SQL Logic Plan
                                                                                </div>
                                                                                <p className="text-xs text-slate-400 leading-relaxed italic">{msg.plan}</p>
                                                                            </div>
                                                                            <div className="p-6 glass-card border-emerald-500/20 bg-emerald-500/[0.03]">
                                                                                <div className="flex items-center gap-3 mb-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                                                    <Terminal size={14} /> SQL Engine
                                                                                </div>
                                                                                <div className="terminal-box">
                                                                                    <div className="terminal-header">
                                                                                        <div className="terminal-dot bg-red-500/50" />
                                                                                        <div className="terminal-dot bg-amber-500/50" />
                                                                                        <div className="terminal-dot bg-emerald-500/50" />
                                                                                    </div>
                                                                                    <div className="terminal-content">
                                                                                        <span className="text-emerald-500/50 mr-2">system@sql-master:~$</span>
                                                                                        {msg.sql}
                                                                                        <span className="terminal-cursor" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {msg.data && msg.data.length > 0 && (
                                                                            <div className="space-y-6">
                                                                                {(Array.isArray(msg.data[0]) ? msg.data : [msg.data]).map((dataset, dIdx) => (
                                                                                    <div key={dIdx} className="glass-card border-white/5 overflow-hidden">
                                                                                        <div className="p-4 bg-white/5 border-b border-white/5">
                                                                                            <div className="flex items-center justify-between gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <TableIcon size={14} />
                                                                                                    {msg.data.length > 1 ? `Knowledge Retrieval Block ${dIdx + 1}` : "Knowledge Retrieval Snippet"}
                                                                                                </div>
                                                                                                <button
                                                                                                    onClick={() => handleDownload(dataset, `knowledge_block_${dIdx + 1}.csv`)}
                                                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-lg border border-brand-500/20 transition-all font-bold"
                                                                                                >
                                                                                                    <Download size={12} /> {msg.data.length > 1 ? `Export Dataset ${dIdx + 1}` : "Download CSV"}
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="p-6 overflow-x-auto">
                                                                                            {dataset.length > 0 ? (
                                                                                                <table className="w-full text-left border-separate border-spacing-y-2">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            {Object.keys(dataset[0]).map(col => (
                                                                                                                <th key={col} className="px-5 py-3 text-[10px] font-black text-brand-400 uppercase tracking-widest bg-brand-500/5 rounded-xl border border-white/5">{col}</th>
                                                                                                            ))}
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {dataset.slice(0, 10).map((row, ridx) => (
                                                                                                            <tr key={ridx} className="group hover:scale-[1.01] transition-transform">
                                                                                                                {Object.values(row).map((val, vidx) => (
                                                                                                                    <td key={vidx} className="px-5 py-4 text-xs text-slate-300 bg-white/[0.02] group-hover:bg-white/[0.04] first:rounded-l-2xl last:rounded-r-2xl border-y border-white/5 first:border-l last:border-r font-medium">
                                                                                                                        {String(val)}
                                                                                                                    </td>
                                                                                                                ))}
                                                                                                            </tr>
                                                                                                        ))}
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            ) : (
                                                                                                <div className="p-10 text-center text-slate-500 text-xs font-medium italic">
                                                                                                    Query completed successfully, but returned no records.
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        {dataset.length > 10 && (
                                                                                            <div className="p-3 bg-white/[0.02] text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                                                                                Continuing Log Sequence... (+{dataset.length - 10} items)
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isProcessing && (
                        <motion.div
                            key="loader"
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
                                    <p className="text-base font-black text-white uppercase tracking-widest">Querying NLP2SQL Engine...</p>
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
                    <div ref={chatEndRef} className="h-40" />
                </div>

                {/* Input Layer */}
                <footer className="p-10 pt-0 relative z-30">
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-10 z-50">
                        <div className="glass-card p-3 pr-6 bg-slate-900/80 ring-1 ring-white/10 shadow-[0_0_100px_rgba(59,98,255,0.2)] flex items-center gap-5 border-2 border-brand-500/20 group focus-within:border-brand-500/60 transition-all rounded-[3rem]">
                            <div className="w-14 h-14 bg-slate-950 rounded-[1.8rem] flex items-center justify-center p-0.5 border border-white/10 shadow-2xl group-focus-within:border-brand-500/40 transition-all">
                                <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-[1.6rem] group-focus-within:scale-110 transition-transform" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Command the data layer... (e.g. 'Show revenue by city')"
                                className="bg-transparent border-none outline-none focus:ring-0 text-slate-100 placeholder:text-slate-600 text-lg py-5 flex-1 font-medium tracking-tight"
                                spellCheck={false}
                                autoComplete="off"
                                autoCorrect="off"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isProcessing || !query.trim()}
                                className="p-5 bg-gradient-to-br from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white rounded-[2rem] shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                            >
                                {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                            </button>
                        </div>
                        <div className="flex justify-center mt-6 gap-10">
                            <span className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Neural Sync Active
                            </span>
                            <span className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Protocol v4.2.0
                            </span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default HomePage;

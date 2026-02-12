import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    Search
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

function HomePage() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Welcome! I am your AI Data Assistant. I can help you analyze CSV or Excel files using natural language. No SQL knowledge required!',
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
    const [username] = useState(localStorage.getItem('username') || 'Explorer');

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
                content: `✅ I have successfully learned the data from "${file.name}". You can now ask me questions like "Summarize this table" or "What are the top 5 values?".`
            }]);
            fetchSchema();
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Upload failed: ${error.response?.data?.detail || error.message}`
            }]);
        } finally {
            setIsUploading(false);
            setFile(null);
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
        } catch (error) {
            let errorMsg = error.response?.data?.detail || error.message;
            if (error.response?.status === 401) {
                handleLogout();
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Error: ${errorMsg}`
                }]);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-80 bg-slate-900/80 border-r border-slate-800 flex flex-col p-6 backdrop-blur-2xl z-10">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                        <BrainCircuit size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">SQL Master</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multi-Agent AI</p>
                    </div>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">

                    {/* User Profile */}
                    <section className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                                {username[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-none">{username}</h3>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
                            <LogOut size={14} /> Log Out
                        </button>
                    </section>

                    {/* Non-Technical Guide */}
                    <section className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20">
                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                            <Info size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Guide</h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Ask questions like "Who are top earners?" or "Show trends by month". No SQL needed.
                        </p>
                    </section>

                    {/* Upload Section */}
                    <section>
                        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                            <Upload size={14} className="text-indigo-400" /> Ingest Data
                        </h2>
                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div className="group relative">
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const selected = e.target.files[0];
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
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700/50 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer bg-slate-800/20 group"
                                >
                                    <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-inner">
                                        <Upload size={20} className="text-slate-400 group-hover:text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">{file ? file.name : "Select Document"}</span>
                                </label>
                            </div>

                            {file && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <input
                                        type="text"
                                        placeholder="Assign Table Name"
                                        value={tableName}
                                        onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
                                        className="w-full bg-slate-800 border border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-white h-11"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isUploading || !file}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                            >
                                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                                Process Knowledge
                            </button>
                        </form>
                    </section>

                    {/* Database Info */}
                    <section>
                        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                            <TableIcon size={14} className="text-purple-400" /> Knowledge Map
                        </h2>
                        <div className="text-[11px] bg-black/40 p-4 rounded-xl border border-slate-800 font-mono text-slate-400 whitespace-pre-wrap leading-tight max-h-60 overflow-y-auto ring-1 ring-white/5 custom-scrollbar">
                            {schema || "Connect data sources to expand AI context."}
                        </div>
                    </section>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-slate-950">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full ring-1 ring-emerald-500/20">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span className="text-[9px] text-emerald-400 uppercase font-black tracking-[0.2em]">Secure Session</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 text-slate-500">
                            <Search size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Search conversations</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/5" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v2.4 LTS</span>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 custom-scrollbar relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`max-w-[85%] md:max-w-2xl rounded-[2rem] p-6 shadow-2xl relative border-white/5 border ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                                : 'bg-slate-900 shadow-black/40 rounded-tl-none ring-1 ring-white/5'
                                }`}>

                                <div className={`absolute top-0 ${msg.role === 'user' ? 'right-0 -translate-y-1/2 translate-x-1/2' : 'left-0 -translate-y-1/2 -translate-x-1/2'} p-2.5 rounded-2xl border border-slate-800 shadow-xl bg-slate-900`}>
                                    {msg.role === 'user' ? <UserIcon size={16} className="text-indigo-400" /> : <BrainCircuit size={16} className="text-purple-400" />}
                                </div>

                                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                </div>

                                {/* AI Path Logs */}
                                {(msg.sql || msg.plan || msg.reflection) && msg.role === 'assistant' && (
                                    <div className="mt-6 pt-6 border-t border-white/5">
                                        <button
                                            onClick={() => toggleTechDetails(i)}
                                            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                                        >
                                            {showTechDetails[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            AI Chain Analysis
                                        </button>

                                        {showTechDetails[i] && (
                                            <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Agent Reasoning</div>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">{msg.plan}</p>
                                                </div>

                                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">SQL Generation</div>
                                                    <code className="block text-[11px] font-mono text-emerald-400/80 break-all bg-black/20 p-2 rounded-lg">{msg.sql}</code>
                                                </div>

                                                {msg.data && msg.data.length > 0 && (
                                                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 overflow-x-auto">
                                                        <table className="w-full text-[10px] text-slate-400 border-collapse">
                                                            <thead>
                                                                <tr>{Object.keys(msg.data[0]).map(k => (<th key={k} className="text-left p-2 border-b border-slate-700">{k}</th>))}</tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-800">
                                                                {msg.data.slice(0, 3).map((row, ri) => (
                                                                    <tr key={ri}>{Object.values(row).map((val, vi) => (<td key={vi} className="p-2 truncate max-w-[100px]">{String(val)}</td>))}</tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="bg-slate-900 border border-white/5 rounded-3xl rounded-tl-none p-6 shadow-2xl flex items-center gap-4">
                                <Loader2 size={24} className="animate-spin text-indigo-500" />
                                <div>
                                    <p className="text-sm text-white font-medium">Solving Query...</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Multi-Agent Workflow Active</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 md:p-10 pt-0">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-[2rem] blur-2xl group-focus-within:bg-indigo-500/20 transition-all pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Ask anything about your knowledge base..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="w-full bg-slate-900/90 border border-white/10 rounded-[2rem] py-6 pl-8 pr-20 shadow-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all backdrop-blur-3xl text-white placeholder-slate-600"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!query.trim()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-30 rounded-2xl text-white transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                        >
                            <Send size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;

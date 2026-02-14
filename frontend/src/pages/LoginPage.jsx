import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
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

function cn(...inputs) {
    return twMerge(clsx(inputs));
}




const API_BASE_URL = 'http://localhost:8000';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, formData);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('username', username);
            navigate('/workspace');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please check your username and password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] bg-mesh flex items-center justify-center p-6 relative overflow-hidden selection:bg-brand-500/30">
            {/* Animated Background Elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl w-full relative z-10 flex flex-col items-center"
            >
                {/* Branding */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1 glass-card mb-6 shadow-2xl shadow-brand-500/20 group rounded-full overflow-hidden"
                    >
                        <img src={logo} alt="Logo" className="w-16 h-16 rounded-full object-cover group-hover:scale-110 transition-transform" />
                    </motion.div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        NLP2SQL
                    </h1>
                    <div className="flex items-center gap-2 px-4 py-1.5 glass rounded-full border border-white/10">
                        <Sparkles size={14} className="text-brand-400" />
                        <span className="text-xs font-bold text-brand-300 uppercase tracking-[0.2em]">Next-Gen Data Intelligence</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="w-full glass-card p-10 md:p-14">
                    <h2 className="text-2xl font-bold text-white mb-8">System Access</h2>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="login-error"
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm overflow-hidden"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity</label>
                            <div className="group relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-16 glass bg-white/[0.03] rounded-2xl pl-14 pr-6 text-white focus:ring-2 focus:ring-brand-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-lg border-white/5"
                                    placeholder="Username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Pass-Key</label>
                            <div className="group relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-16 glass bg-white/[0.03] rounded-2xl pl-14 pr-6 text-white focus:ring-2 focus:ring-brand-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-lg border-white/5"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full h-16 text-lg group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>Initialize Session</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-500 font-medium">
                            New operative?{' '}
                            <Link to="/signup" className="text-brand-400 font-bold hover:text-brand-300 transition-all border-b border-brand-500/20 hover:border-brand-400 pb-0.5">
                                Secure Registry
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex flex-col items-center gap-4 opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
                        Protocol v4.0.2 // Encrypted Node
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

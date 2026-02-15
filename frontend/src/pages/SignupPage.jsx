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
    Sparkles, LogIn, User, Lock, Mail, UserPlus, CheckCircle2, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo from '../assets/logo.jpeg';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}


const API_BASE_URL = 'http://localhost:8000';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError('');

        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);

        try {
            await axios.post(`${API_BASE_URL}/signup`, data);
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Backend unavailable or internal error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] bg-mesh flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decoration */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl w-full relative z-10"
            >
                {/* Branding */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <Link
                        to="/"
                        className="p-1 glass-card mb-6 shadow-2xl shadow-purple-500/20 rounded-full overflow-hidden hover:scale-105 transition-transform"
                    >
                        <img src={logo} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Operative Registry</h1>
                    <p className="text-slate-400 font-medium">Initialize your credentials for the secure data layer</p>
                </div>

                {/* Main Card */}
                <div className="glass-card p-10 md:p-14">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="signup-error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
                            >
                                <AlertCircle size={20} />
                                {error}
                            </motion.div>
                        )}

                        {isSuccess && (
                            <motion.div
                                key="signup-success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-400 font-bold"
                            >
                                <div className="p-2 bg-emerald-500/20 rounded-full">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p>Account Security Verified</p>
                                    <p className="text-xs font-medium opacity-70">Redirecting to terminal login...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Universal Identity</label>
                            <div className="group relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full h-16 glass bg-white/[0.03] rounded-2xl pl-14 pr-6 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-600 text-lg border-white/5"
                                    placeholder="Your username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Communication Channel</label>
                            <div className="group relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-16 glass bg-white/[0.03] rounded-2xl pl-14 pr-6 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-600 text-lg border-white/5"
                                    placeholder="Email address"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Pass-Key</label>
                            <div className="group relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full h-16 glass bg-white/[0.03] rounded-2xl pl-14 pr-6 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-600 text-lg border-white/5"
                                    placeholder="e.g. Pass@word#123"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm Identity</label>
                            <div className="group relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <Shield size={20} />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full h-16 glass bg-white/[0.03] rounded-2xl pl-14 pr-6 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-600 text-lg border-white/5"
                                    placeholder="Verify Password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={isLoading || isSuccess}
                                className="btn-primary w-full h-16 text-lg bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        <span>Create Identity</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 font-medium">
                            Already registered?{' '}
                            <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-all border-b border-purple-500/20 hover:border-purple-400">
                                Return to Terminal
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Safety Badge */}
                <div className="mt-10 flex flex-col items-center justify-center gap-2 text-slate-600 opacity-60">
                    <div className="flex items-center gap-2">
                        <Shield size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">End-to-End Encryption Secure</span>
                    </div>
                    <p className="text-[10px] font-medium text-brand-400/80 italic">Pro-Tip: Use symbols like @, #, $ for maximum security.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;

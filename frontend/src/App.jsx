import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  UserPlus,
  LogIn,
  LogOut
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

function App() {
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
  const [showTechDetails, setShowTechDetails] = useState({}); // Tracking expanded state for tech details per message
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchSchema();
    }
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleTechDetails = (msgIndex) => {
    setShowTechDetails(prev => ({
      ...prev,
      [msgIndex]: !prev[msgIndex]
    }));
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || !tableName) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('table_name', tableName);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData);
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

      // Add Auth Token if exists
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

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
        errorMsg = "Your session has expired. Please log in again.";
        setIsLoggedIn(false);
        setToken(null);
        localStorage.removeItem('token');
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${errorMsg}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulation Login
  const simulateLogin = () => {
    const fakeToken = "dummy-token-" + Math.random();
    setToken(fakeToken);
    localStorage.setItem('token', fakeToken);
    setIsLoggedIn(true);
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
            <h1 className="text-xl font-bold tracking-tight text-white">
              SQL Master
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multi-Agent AI</p>
          </div>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">

          {/* User Profile / Auth Status */}
          <section className="bg-slate-800/30 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Session Status</span>
              {isLoggedIn ? <ShieldCheck size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-400" />}
            </div>
            {isLoggedIn ? (
              <button onClick={() => { setToken(null); localStorage.removeItem('token'); setIsLoggedIn(false); }} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg">
                <LogOut size={14} /> Log Out
              </button>
            ) : (
              <button onClick={simulateLogin} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white transition-all bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20">
                <LogIn size={14} /> Quick Login
              </button>
            )}
          </section>

          {/* Non-Technical Guide */}
          <section className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <Info size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">How it works</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload any data table. Our **Team of Agents** will analyze it and answer your questions instantly.
            </p>
          </section>

          {/* Upload Section */}
          <section>
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Upload size={14} className="text-indigo-400" /> Data Ingestion
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
                  <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-slate-400 group-hover:text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{file ? file.name : "Choose CSV/Excel"}</span>
                </label>
              </div>

              {file && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Table Name</label>
                  <input
                    type="text"
                    placeholder="Table Name"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
                    className="w-full bg-slate-800 border border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-white h-11"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 h-12"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                Learn this Data
              </button>
            </form>
          </section>

          {/* Database Info */}
          <section>
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TableIcon size={14} className="text-purple-400" /> Active Knowledge
            </h2>
            <div className="space-y-2">
              <div className="text-[11px] bg-black/40 p-4 rounded-xl border border-slate-800 font-mono text-slate-400 whitespace-pre-wrap leading-tight max-h-60 overflow-y-auto ring-1 ring-white/5">
                {schema || "Your AI Brain is currently empty. Upload some data!"}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-950">
        {/* Subtle Background Decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 custom-scrollbar relative z-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] md:max-w-2xl rounded-3xl p-6 shadow-2xl relative border-white/5 border ${msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-indigo-500/10'
                : 'bg-slate-900 shadow-black/40 rounded-tl-none ring-1 ring-white/5'
                }`}>

                {/* Role Icon */}
                <div className={`absolute top-0 ${msg.role === 'user' ? 'right-0 -translate-y-1/2 translate-x-1/2' : 'left-0 -translate-y-1/2 -translate-x-1/2'} p-2 rounded-full border border-slate-800 shadow-xl bg-slate-900`}>
                  {msg.role === 'user' ? <MessageSquare size={16} className="text-indigo-400" /> : <BrainCircuit size={16} className="text-purple-400" />}
                </div>

                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Agent Path & Technical Details toggle for Non-Tech Users */}
                {(msg.sql || msg.plan || msg.reflection) && msg.role === 'assistant' && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <button
                      onClick={() => toggleTechDetails(i)}
                      className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                    >
                      {showTechDetails[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Show AI Transparency Logs
                    </button>

                    {showTechDetails[i] && (
                      <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                        {/* Reasoning Plan */}
                        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                            <BrainCircuit size={12} /> The Plan
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            {msg.plan || "Deciphering request and mapping tables..."}
                          </p>
                        </div>

                        {/* Reflection Notes */}
                        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            <CheckCircle size={12} /> Quality Check
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            {msg.reflection || "Query validated for accuracy and safety."}
                          </p>
                        </div>

                        {/* SQL Code */}
                        {msg.sql && (
                          <div className="p-4 bg-black/40 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                              <Code2 size={12} /> Technically, I asked:
                            </div>
                            <code className="block text-[11px] font-mono text-emerald-400/80 break-all bg-emerald-500/5 p-2 rounded-lg">
                              {msg.sql}
                            </code>
                          </div>
                        )}

                        {/* Raw Data Sample */}
                        {msg.data && msg.data.length > 0 && (
                          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 overflow-x-auto">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <TableIcon size={12} /> Raw Data snippet
                            </div>
                            <table className="w-full text-[10px] text-slate-400 border-collapse">
                              <thead>
                                <tr>
                                  {Object.keys(msg.data[0]).map(k => (
                                    <th key={k} className="text-left p-2 border-b border-slate-700">{k}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {msg.data.slice(0, 3).map((row, ri) => (
                                  <tr key={ri}>
                                    {Object.values(row).map((val, vi) => (
                                      <td key={vi} className="p-2 truncate max-w-[100px]">{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {msg.data.length > 3 && <div className="mt-2 text-[9px] text-slate-600 italic">...Showing 3 of {msg.data.length} results.</div>}
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
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-white/5 rounded-3xl rounded-tl-none p-6 shadow-2xl flex items-center gap-4">
                <div className="relative">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                  <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 animate-pulse" />
                </div>
                <div className="animate-pulse">
                  <p className="text-sm text-white font-medium">Analyzing your data...</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Agent Workflow in progress</p>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-10 pt-0 relative z-10">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-10 group-focus-within:opacity-20 transition-opacity" />
            <input
              type="text"
              placeholder={isLoggedIn ? "Ask anything about your data..." : "Please log in to start analyzing data"}
              disabled={!isLoggedIn && messages.length > 1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-900/90 border border-white/10 rounded-3xl py-6 pl-8 pr-20 shadow-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all backdrop-blur-3xl text-white placeholder-slate-600"
            />
            <button
              onClick={handleSend}
              disabled={!isLoggedIn || !query.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-30 disabled:grayscale rounded-2xl text-white transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              <Send size={22} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full ring-1 ring-white/5">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Enterprise Secure</span>
            </div>
            <p className="text-[9px] text-slate-700 uppercase tracking-[0.2em] font-black">
              System Status: <span className="text-indigo-400">All Agents Online</span>
            </p>
          </div>
        </div>
      </div>

      {/* Global CSS for animations and scrollbars */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-bottom { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}

export default App;

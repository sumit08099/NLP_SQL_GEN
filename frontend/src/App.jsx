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
  Code2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! Upload your data (CSV/Excel) and ask me anything about it.' }
  ]);
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [schema, setSchema] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoBottom({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        content: `✅ Successfully ingested ${file.name} as table "${tableName}". You can now start asking questions!`
      }]);
      fetchSchema();
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Upload failed: ${error.response?.data?.detail || error.message}`
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/schema`);
      // Parse the schema text into something more readable for the sidebar if needed
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

      const response = await axios.post(`${API_BASE_URL}/chat`, formData);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.answer,
        sql: response.data.sql,
        data: response.data.data
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.response?.data?.detail || error.message}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900/50 border-r border-slate-800 flex flex-col p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/20">
            <Database size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NLP SQL Master
          </h1>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto">
          {/* Upload Section */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Upload size={14} /> Data Ingestion
            </h2>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="group relative">
                <input
                  type="file"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    if (e.target.files[0] && !tableName) {
                      setTableName(e.target.files[0].name.split('.')[0].toLowerCase().replace(/ /g, '_'));
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 rounded-xl hover:border-primary-500 transition-colors cursor-pointer bg-slate-800/20"
                >
                  <Upload size={24} className="text-slate-500 mb-2" />
                  <span className="text-sm font-medium">{file ? file.name : "Choose CSV/Excel"}</span>
                </label>
              </div>

              <input
                type="text"
                placeholder="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/ /g, '_'))}
                className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />

              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                Ingest Data
              </button>
            </form>
          </section>

          {/* Database Info */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TableIcon size={14} /> Schema Explorer
            </h2>
            <div className="space-y-2">
              <pre className="text-[10px] bg-slate-800/50 p-2 rounded-lg border border-slate-700 text-slate-400 overflow-x-auto">
                {schema || "No tables ingested yet."}
              </pre>
            </div>
          </section>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-none'
                  : 'bg-slate-800/50 border border-slate-700 backdrop-blur-md rounded-tl-none'
                }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>

                {msg.sql && (
                  <div className="mt-4 border-t border-slate-700 pt-4">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
                      <Code2 size={12} /> Generated SQL
                    </div>
                    <code className="block p-3 bg-black/40 rounded-lg text-xs font-mono text-green-400 whitespace-pre-wrap">
                      {msg.sql}
                    </code>
                  </div>
                )}

                {msg.data && msg.data.length > 0 && (
                  <div className="mt-4 border-t border-slate-700 pt-4 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
                      <TableIcon size={12} /> Execution Results
                    </div>
                    <table className="w-full text-[10px] text-slate-300 border-collapse">
                      <tbody className="divide-y divide-slate-700">
                        {msg.data.slice(0, 5).map((row, ri) => (
                          <tr key={ri}>
                            {Object.values(row).map((val, vi) => (
                              <td key={vi} className="p-1">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {msg.data.length > 5 && (
                      <div className="mt-1 text-[8px] text-slate-500 italic">...and {msg.data.length - 5} more rows</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary-500" />
                <span className="text-sm text-slate-400 italic">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 pt-0">
          <div className="max-w-4xl mx-auto relative mt-4">
            <input
              type="text"
              placeholder="Ask a question about your data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-4 pl-6 pr-16 shadow-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all backdrop-blur-md"
            />
            <button
              onClick={handleSend}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-white transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest font-bold">
            Powered by T5-Small & Gemini 2.0 Flash
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

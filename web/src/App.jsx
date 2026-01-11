import { useState, useEffect, useRef } from 'react';
import { 
  FileText, Play, Download, Settings, RefreshCw, Copy, 
  Maximize2, Minimize2, Check, Trash2, RotateCcw, Info, 
  ExternalLink, ShieldCheck, Github, Globe, BookOpen, 
  MessageCircle, X, AlertTriangle, PanelLeft, PanelLeftOpen
} from 'lucide-react';

const DEFAULT_MARKDOWN = [
  '---',
  'title: Markdown 语法示例',
  'subtitle: LaTeXRender 支持的功能展示',
  'author: MatNoble',
  '---',
  '',
  '# 第一章：项目概览',
  '',
  '这个文档展示了 `LaTeXRender` 项目支持的 Markdown 语法。',
  '',
  '## 第二章：数学公式',
  '',
  '行内数学表达式如 $E=mc^2$ 或 $\alpha + \beta = \gamma$。',
  '',
  '$$',
  '\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}',
  '$$',
  '',
  '## 第三章：代码块',
  '',
  '```python',
  'def factorial(n):',
  '    return 1 if n == 0 else n * factorial(n-1)',
  '```'
].join('\n');

function App() {
  const [markdown, setMarkdown] = useState(() => {
    return localStorage.getItem('latex_render_content') || DEFAULT_MARKDOWN;
  });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('matnoble');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");
  
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  
  const logEndRef = useRef(null);

  // 监听快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRender();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [markdown, selectedTemplate]);

  // 防抖保存
  useEffect(() => {
    setIsSaved(false);
    const timeout = setTimeout(() => {
      localStorage.setItem('latex_render_content', markdown);
      setIsSaved(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [markdown]);

  useEffect(() => {
// ... (keep logs scroll effect)
  }, [logs]);

  // ... (keep fetchTemplates)

  const handleRender = async () => {
    if (loading) return;
    setLoading(true);
    setLogs("Starting render process...\n");
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdown,
          template: selectedTemplate,
          compile: true
        })
      });
      
      const data = await res.json();
      if (data.logs) setLogs(data.logs);

      if (!res.ok || data.success === false) {
        setIsLogExpanded(true); // 编译失败，自动展开控制台
        throw new Error(data.detail || "编译失败，请检查控制台日志");
      }

      if (data.pdf_url) {
        setPdfUrl(`${data.pdf_url}?t=${new Date().getTime()}`);
        setIsLogExpanded(false); // 编译成功，收起控制台保持整洁
      }
    } catch (err) {
      setLogs(prev => prev + `\n> Fatal Error: ${err.message}\n`);
      setIsLogExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTex = async () => {
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: markdown, template: selectedTemplate, compile: false })
      });
      const data = await res.json();
      // 使用已有的静态挂载路径
      const texRes = await fetch(`/build/${data.job_id}/document.tex`);
      const texContent = await texRes.text();
      await navigator.clipboard.writeText(texContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert("复制 LaTeX 源码失败");
    }
  };

  const lineCount = markdown.split('\n').length;

  const confirmLoadExample = () => {
    setMarkdown(DEFAULT_MARKDOWN);
    setIsConfirmOpen(false);
  };

  const extractTitle = (md) => {
    const match = md.match(/^---\s*\n([\s\S]*?)\n---/);
    if (match) {
      const frontmatter = match[1];
      const titleMatch = frontmatter.match(/^title:\s*(.*)$/m);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
      }
    }
    return "未命名文档";
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const title = extractTitle(markdown);
      const fileName = `${title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.click();
    }
  };

  return (
    <div className="h-screen flex bg-apple-system-grouped font-sans text-apple-gray-900 overflow-hidden">
      
      {/* Sidebar - Apple Style */}
      <aside className={`bg-white/80 backdrop-blur-xl border-r border-apple-gray-100 transition-all duration-300 ease-in-out flex flex-col relative ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden opacity-0'}`}>
        <div className="p-6 flex items-center gap-3">
          <img src="/icons/web-app-manifest-192x192.png" alt="Logo" className="w-10 h-10 rounded-apple shadow-lg" />
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-lg">LaTexRender</h1>
            <p className="text-xs text-apple-gray-300">v1.1.0 • Stable</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
          {/* Settings Group */}
          <div className="space-y-2">
            <p className="px-2 text-[11px] font-bold text-apple-gray-300 uppercase tracking-widest">配置</p>
            <div className="bg-white rounded-apple border border-apple-gray-50 shadow-apple-sm p-3 space-y-3">
              <div className="space-y-1">
                <label className="text-[12px] text-apple-gray-300 ml-1">排版模板</label>
                <select 
                  value={selectedTemplate} 
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-apple-gray-50 border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-apple-blue transition outline-none"
                >
                  {templates.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Actions Group */}
          <div className="space-y-2">
            <p className="px-2 text-[11px] font-bold text-apple-gray-300 uppercase tracking-widest">操作</p>
            <div className="space-y-1">
              <button 
                onClick={() => setIsConfirmOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white hover:shadow-apple-sm rounded-apple transition text-sm text-apple-gray-300 hover:text-apple-gray-900"
              >
                <RotateCcw className="w-4 h-4" />
                <span>加载示例</span>
              </button>
              <button 
                onClick={() => setIsAboutOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white hover:shadow-apple-sm rounded-apple transition text-sm text-apple-gray-300 hover:text-apple-gray-900"
              >
                <Info className="w-4 h-4" />
                <span>关于项目</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer - Interactive Card */}
        <div className="p-6 border-t border-apple-gray-50">
          <a 
            href="https://matnoble.top" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-3 p-3 bg-apple-gray-50 hover:bg-white hover:shadow-apple-sm rounded-apple transition group"
          >
             <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold text-xs group-hover:bg-apple-blue group-hover:text-white transition-colors">MN</div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold truncate">MatNoble</p>
               <p className="text-[10px] text-apple-gray-300 truncate group-hover:text-apple-blue transition-colors">matnoble.top</p>
             </div>
             <ExternalLink className="w-3 h-3 text-apple-gray-200 group-hover:text-apple-blue transition-colors" />
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Modern Header / Toolbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/50 backdrop-blur-md border-b border-apple-gray-50 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 hover:bg-apple-gray-50 rounded-md transition-all duration-300 ${isSidebarOpen ? 'text-apple-blue bg-apple-blue/5' : 'text-apple-gray-300 hover:text-apple-gray-900'}`}
              title={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
            >
              {isSidebarOpen ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <h2 className="font-semibold text-sm text-apple-gray-900">工作区：{extractTitle(markdown)}</h2>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={handleCopyTex}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-apple-gray-300 hover:text-apple-gray-900 hover:bg-white rounded-apple transition"
                title="复制生成的 LaTeX 源码"
              >
                {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">复制 LaTeX</span>
             </button>
             {pdfUrl && (
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-900 hover:bg-white hover:shadow-apple-md rounded-apple transition"
                >
                  <Download className="w-4 h-4" />
                  <span>下载 PDF</span>
                </button>
             )}
             <button 
                onClick={handleRender}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-apple-blue text-white rounded-apple font-semibold text-sm shadow-lg shadow-apple-blue/20 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
             >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{loading ? '编译中...' : '生成 PDF'}</span>
             </button>
          </div>
        </header>

        {/* Editor & Preview Split View */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Editor Card */}
          <div className="flex-1 bg-white rounded-apple-lg shadow-apple-md flex flex-col overflow-hidden border border-apple-gray-50">
             <div className="px-4 py-2 bg-apple-gray-50/50 border-b border-apple-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-apple-gray-300 uppercase tracking-widest">Markdown</span>
                  <div className="h-3 w-[1px] bg-apple-gray-100" />
                  <span className={`text-[10px] transition-opacity duration-300 ${isSaved ? 'text-green-500 opacity-100' : 'text-apple-gray-200 opacity-50'}`}>
                    {isSaved ? '● 已保存' : '○ 正在输入...'}
                  </span>
                </div>
                <span className="text-[10px] text-apple-gray-200 font-medium">{markdown.length.toLocaleString()} 字符</span>
             </div>
             <div className="flex-1 flex overflow-hidden relative">
                {/* Line Numbers - Apple Style */}
                <div className="w-10 bg-apple-gray-50/30 border-r border-apple-gray-50 text-right pr-2 py-6 select-none flex flex-col font-mono text-[11px] text-apple-gray-200 leading-relaxed">
                  {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="flex-1 p-6 outline-none resize-none font-mono text-sm leading-relaxed text-apple-gray-900 bg-white"
                  spellCheck="false"
                />
             </div>
          </div>

          {/* Preview Card */}
          <div className="flex-1 bg-apple-gray-100 rounded-apple-lg shadow-inner overflow-hidden flex items-center justify-center relative border border-apple-gray-50">
             {loading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center animate-in fade-in duration-300">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
                      <p className="text-[11px] font-bold text-apple-blue uppercase tracking-widest">Rendering PDF</p>
                   </div>
                </div>
             )}
             {pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
             ) : (
                <div className="text-center space-y-4 opacity-30 group">
                  <FileText className="w-16 h-16 mx-auto group-hover:scale-110 transition-transform duration-500" />
                  <p className="text-sm font-medium">准备就绪，等待编译</p>
                </div>
             )}
          </div>
        </div>

        {/* Floating Log Panel (Apple Console Style) */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out z-30 ${isLogExpanded ? 'w-[90%] h-[60%]' : 'w-64 h-10'}`}>
           <div className="w-full h-full bg-apple-gray-900/90 backdrop-blur-md rounded-apple-lg shadow-apple-lg border border-white/10 flex flex-col overflow-hidden">
              <div className="px-4 py-2 flex items-center justify-between cursor-pointer" onClick={() => setIsLogExpanded(!isLogExpanded)}>
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">系统控制台</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setLogs(""); }} className="p-1 hover:bg-white/10 rounded"><Trash2 className="w-3 h-3 text-white/50" /></button>
                    {isLogExpanded ? <Minimize2 className="w-3 h-3 text-white" /> : <Maximize2 className="w-3 h-3 text-white" />}
                 </div>
              </div>
              {isLogExpanded && (
                <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-green-400">
                  <pre className="whitespace-pre-wrap">{logs || "> Ready to compile..."}</pre>
                  <div ref={logEndRef} />
                </div>
              )}
           </div>
        </div>
      </main>

      {/* Modals - Reusing your logic with Apple styling */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-apple-lg shadow-apple-lg max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-100 p-2.5 rounded-full"><AlertTriangle className="w-6 h-6 text-orange-600" /></div>
                <h3 className="text-lg font-bold">确认重置？</h3>
             </div>
             <p className="text-sm text-apple-gray-300 mb-6">加载示例将覆盖当前所有编辑内容，此操作不可撤销。</p>
             <div className="flex gap-3">
                <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-2 text-sm font-semibold bg-apple-gray-50 rounded-apple">取消</button>
                <button onClick={confirmLoadExample} className="flex-1 py-2 text-sm font-semibold bg-orange-600 text-white rounded-apple shadow-lg shadow-orange-200">确认</button>
             </div>
          </div>
        </div>
      )}

      {/* About Modal (Simplified version for brevity, keeps your core info) */}
      {isAboutOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-apple-lg shadow-apple-lg max-w-lg w-full relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setIsAboutOpen(false)} className="absolute top-4 right-4 p-2 text-apple-gray-300 hover:text-apple-gray-900 transition"><X className="w-5 h-5" /></button>
              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-apple-blue rounded-2xl flex items-center justify-center shadow-lg shadow-apple-blue/20">
                       <ShieldCheck className="text-white w-7 h-7" />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold">隐私与安全</h2>
                       <p className="text-xs text-apple-gray-300">本地优先设计理念</p>
                    </div>
                 </div>
                 <p className="text-sm text-apple-gray-300 leading-relaxed bg-apple-gray-50 p-4 rounded-apple">
                    本项目所有文档均在您的本地环境进行渲染和编译。我们坚持不上传、不追踪、不泄露，保护每一份学术灵感。
                 </p>
                 <div className="grid grid-cols-2 gap-3">
                    <a href="https://github.com/MatNoble" target="_blank" className="flex items-center gap-2 p-3 border rounded-apple hover:bg-apple-gray-50 transition text-sm font-medium"><Github className="w-4 h-4" /> GitHub</a>
                    <a href="https://matnoble.top" target="_blank" className="flex items-center gap-2 p-3 border rounded-apple hover:bg-apple-gray-50 transition text-sm font-medium"><Globe className="w-4 h-4 text-apple-blue" /> 个人门户</a>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}

export default App

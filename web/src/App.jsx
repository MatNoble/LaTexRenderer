import { useState, useEffect, useRef } from 'react';
import { FileText, Play, Download, Settings, RefreshCw, Copy, Maximize2, Minimize2, Check, Trash2, RotateCcw, Info, ExternalLink, ShieldCheck, Github, Globe, BookOpen, MessageCircle, X, AlertTriangle } from 'lucide-react';

const DEFAULT_MARKDOWN = [
  '---',
  'title: Markdown 语法示例',
  'subtitle: LaTeXRender 支持的功能展示',
  'author: MatNoble',
  '---',
  '',
  '# 第一章：项目概览',
  '',
  '这个文档展示了 `LaTeXRender` 项目支持的 Markdown 语法。它演示了如何将各种 Markdown 元素转换为通过 LaTeX 排版的精美 PDF 文档。',
  '',
  '## 第二章：文本格式化',
  '',
  '本段展示了不同的文本样式。你可以使用 **加粗文本**，*斜体文本*，甚至是 ***加粗并斜体*** 的组合。',
  '',
  '我们现在还支持 ~~删除线文本~~，这对于表示删除或更正非常有用。',
  '',
  '对于行内代码片段，可以使用 `行内代码`。',
  '',
  '## 第三章：列表',
  '',
  '### 无序列表',
  '*   项目一',
  '*   项目二',
  '    *   嵌套项目 A',
  '    *   嵌套项目 B',
  '*   项目三',
  '',
  '### 有序列表',
  '1.  第一项',
  '2.  第二项',
  '    1.  嵌套有序项 1',
  '    2.  嵌套有序项 2',
  '3.  第三项',
  '',
  '## 第四章：链接与图片',
  '',
  '你可以包含 [指向外部网站的超链接](https://www.google.com)。',
  '',
  '这是一个来自项目 `doc` 文件夹的图片示例：',
  '![微信 Logo](doc/wechat-logo.png)',
  '',
  '## 第五章：引用块',
  '',
  '> 这是一个引用块。用于引用来源或强调某些文本。',
  '>',
  '> > 也支持嵌套引用块，表示多级引用或强调。',
  '',
  '## 第六章：代码块',
  '',
  '代码块会通过 LaTeX 的 listings 宏包进行渲染，并支持语法高亮。',
  '',
  '```python',
  'def factorial(n):',
  '    if n == 0:',
  '        return 1',
  '    else:',
  '        return n * factorial(n-1)',
  '',
  'print(factorial(5))',
  '```',
  '',
  '```java',
  'public class HelloWorld {',
  '    public static void main(String[] args) {',
  '        System.out.println("Hello, Java!");',
  '    }',
  '}',
  '```',
  '',
  '## 第七章：表格',
  '',
  '表格现在可以正确转换为 LaTeX 的 `tabular` 环境，并使用 `booktabs` 样式。',
  '',
  '| 功能         | 状态    | 备注                  |',
  '| :----------- | :------ | :-------------------- |',
  '| 标题         | 已支持  | H1-H4 对应不同层级章节 |',
  '| 文本格式化   | 已支持  | 加粗、斜体、删除线     |',
  '| 列表         | 已支持  | 有序、无序、嵌套       |',
  '| 表格         | 已支持  | 自动检测列数           |',
  '| 数学公式     | 已支持  | 行内与块级             |',
  '',
  '## 第八章：数学公式',
  '',
  '行内数学表达式如 $E=mc^2$ 或 $\\alpha + \\beta = \\gamma$ 渲染非常精美。',
  '',
  '同时也支持块级数学公式，非常适合学术论文：',
  '',
  '$$',
  '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
  '$$',
  '',
  '另一个块级公式示例：',
  '$$',
  '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}',
  '$$',
  '',
  '## 第九章：水平分割线',
  '',
  '水平分割线显示为一条实线：',
  '',
  '---',
  '',
  '以上即为支持的 Markdown 语法示例。'
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
  
  const logEndRef = useRef(null);

  // 持久化编辑器内容
  useEffect(() => {
    localStorage.setItem('latex_render_content', markdown);
  }, [markdown]);

  // 自动滚动日志
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data.templates);
      if (data.templates.length > 0) {
         if(data.templates.includes('matnoble')) setSelectedTemplate('matnoble');
         else setSelectedTemplate(data.templates[0]);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  const handleRender = async () => {
    setLoading(true);
    setLogs("正在发送请求...\n");
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
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "渲染失败");
      }

      const data = await res.json();
      setLogs(prev => prev + "格式转换成功。\n");
      
      if (data.pdf_url) {
        setPdfUrl(`${data.pdf_url}?t=${new Date().getTime()}`);
        setLogs(prev => prev + "PDF 编译成功。\n");
      } else {
        setLogs(prev => prev + "警告：未返回 PDF 链接。\n");
      }

    } catch (err) {
      setLogs(prev => prev + `错误: ${err.message}\n`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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
    return "document";
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const title = extractTitle(markdown);
      const fileName = `${title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLoadExample = () => {
    setIsConfirmOpen(true);
  };

  const confirmLoadExample = () => {
    setMarkdown(DEFAULT_MARKDOWN);
    setIsConfirmOpen(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <img src="/icons/web-app-manifest-192x192.png" alt="Logo" className="w-8 h-8 rounded-md" />
          <h1 className="text-lg font-bold text-gray-800">MatNoble LaTeX Renderer</h1>
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition"
            title="关于项目与使用说明"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
            <Settings className="w-4 h-4" />
            <span className="mr-1">模板：</span>
            <select 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="bg-transparent border-none outline-none font-medium text-gray-800"
            >
              {templates.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleLoadExample}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition"
            title="重置为默认示例文档"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">加载示例</span>
          </button>

          {pdfUrl && (
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition"
              title="下载 PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">下载</span>
            </button>
          )}

          <button 
            onClick={handleRender} 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50 shadow-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span className="font-medium">{loading ? '编译中...' : '生成 PDF'}</span>
          </button>
        </div>
      </header>

      {/* Confirmation Modal for Loading Example */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-100 p-2.5 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">确认重置？</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                确定要加载默认示例文档吗？这将会 <span className="text-red-600 font-semibold">覆盖您当前在编辑区输入的所有内容</span>，且该操作不可撤销。
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition"
              >
                取消
              </button>
              <button 
                onClick={confirmLoadExample}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-sm transition"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">关于项目</h2>
                  <p className="text-gray-500 text-sm">高效、私密、优雅的 Markdown 转 LaTeX 方案</p>
                </div>
              </div>

              <div className="space-y-6">
                <section className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="text-sm">隐私声明</h3>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    本项目坚持 <strong>本地优先 (Local-first)</strong> 设计理念。您的文档内容仅在您本地环境处理，永远不会上传到第三方服务器。我们尊重并保护每一份学术成果和个人笔记的隐私。
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">使用说明</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                    <li>支持标准的 Markdown 语法。</li>
                    <li>数学公式请使用 <code className="bg-gray-100 px-1 rounded text-blue-600">$...$</code> (行内) 或 <code className="bg-gray-100 px-1 rounded text-blue-600">$$...$$</code> (块级)。</li>
                    <li>生成的 PDF 将自动使用 Noto CJK 字体支持中文排版。</li>
                    <li>点击右上方“加载示例”可以快速体验所有支持的功能。</li>
                  </ul>
                </section>

                <hr className="border-gray-100" />

                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">作者信息</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href="https://github.com/MatNoble" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group">
                      <div className="bg-gray-100 p-2 rounded-md group-hover:bg-white transition"><Github className="w-5 h-5 text-gray-700" /></div>
                      <div>
                        <div className="text-sm font-bold">GitHub</div>
                        <div className="text-xs text-gray-500">@MatNoble</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-blue-500" />
                    </a>
                    <a href="https://matnoble.top" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group">
                      <div className="bg-blue-50 p-2 rounded-md group-hover:bg-white transition"><Globe className="w-5 h-5 text-blue-600" /></div>
                      <div>
                        <div className="text-sm font-bold">个人门户</div>
                        <div className="text-xs text-gray-500">matnoble.top</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-blue-500" />
                    </a>
                    <a href="https://blog.matnoble.top" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group">
                      <div className="bg-green-50 p-2 rounded-md group-hover:bg-white transition"><BookOpen className="w-5 h-5 text-green-600" /></div>
                      <div>
                        <div className="text-sm font-bold">个人博客</div>
                        <div className="text-xs text-gray-500">blog.matnoble.top</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-blue-500" />
                    </a>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                      <div className="bg-orange-50 p-2 rounded-md"><MessageCircle className="w-5 h-5 text-orange-600" /></div>
                      <div>
                        <div className="text-sm font-bold">微信公众号</div>
                        <div className="text-xs text-gray-500">数学思维探究社</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col border-r bg-gray-50">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full p-6 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="在此输入 Markdown 内容..."
          />
          <div className={`transition-all duration-300 ease-in-out bg-gray-900 text-gray-300 flex flex-col border-t border-gray-700 ${isLogExpanded ? 'h-3/4' : 'h-32'}`}>
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 select-none">
                 <span className="font-bold text-gray-400 text-xs tracking-wider">系统日志</span>
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setLogs("")}
                        className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition flex items-center justify-center"
                        title="清空日志"
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                     <button 
                        onClick={handleCopyLogs} 
                        className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition flex items-center justify-center"
                        title="复制日志"
                     >
                        {copySuccess ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                     </button>
                     <button 
                        onClick={() => setIsLogExpanded(!isLogExpanded)} 
                        className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition flex items-center justify-center"
                        title={isLogExpanded ? "最小化" : "最大化"}
                     >
                        {isLogExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                     </button>
                 </div>
            </div>
            
            <div className="flex-1 p-3 text-xs font-mono overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <pre className="whitespace-pre-wrap font-mono leading-tight">{logs}</pre>
                <div ref={logEndRef} />
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-gray-200 flex flex-col items-center justify-center relative">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full" 
              title="PDF 预览"
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p>点击“生成 PDF”查看预览</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
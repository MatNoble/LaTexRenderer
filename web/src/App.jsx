import { useState, useEffect, useRef } from 'react';
import { FileText, Play, Download, Settings, RefreshCw, Copy, Maximize2, Minimize2, Check, Trash2, RotateCcw } from 'lucide-react';

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
  '行内数学表达式如 $E=mc^2$ 或 $\alpha + \beta = \gamma$ 渲染非常精美。',
  '',
  '同时也支持块级数学公式，非常适合学术论文：',
  '',
  '$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$',
  '',
  '另一个块级公式示例：',
  '$$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}$$',
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
    if (window.confirm("确定要重置为默认示例文档吗？这将覆盖当前编辑区的内容。")) {
      setMarkdown(DEFAULT_MARKDOWN);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <img src="/icons/web-app-manifest-192x192.png" alt="Logo" className="w-8 h-8 rounded-md" />
          <h1 className="text-lg font-bold text-gray-800">MatNoble LaTeX Renderer</h1>
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
import React, { useState, useEffect } from 'react';
import { FileText, Play, Download, Settings, RefreshCw } from 'lucide-react';

function App() {
  const [markdown, setMarkdown] = useState(`---\ntitle: 示例文档
author: MatNoble
subtitle: 自动生成的副标题
---

# 第一章 绪论

这是通过 **Web 界面** 生成的文档。

$ E = mc^2 $

## 列表测试
1. 第一项
2. 第二项
`);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('matnoble');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data.templates);
      if (data.templates.length > 0) {
         // Default to matnoble if exists, else first one
         if(data.templates.includes('matnoble')) setSelectedTemplate('matnoble');
         else setSelectedTemplate(data.templates[0]);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  const handleRender = async () => {
    setLoading(true);
    setLogs("Sending request...\n");
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
        throw new Error(errData.detail || "Render failed");
      }

      const data = await res.json();
      setLogs(prev => prev + "Conversion successful.\n");
      
      if (data.pdf_url) {
        // Add timestamp to force iframe refresh
        setPdfUrl(`${data.pdf_url}?t=${new Date().getTime()}`);
        setLogs(prev => prev + "PDF Compiled successfully.\n");
      } else {
        setLogs(prev => prev + "Warning: PDF URL not returned (maybe latexmk missing?).\n");
      }

    } catch (err) {
      setLogs(prev => prev + `Error: ${err.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-600 w-6 h-6" />
          <h1 className="text-lg font-bold text-gray-800">MatNoble LaTeX Render</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
            <Settings className="w-4 h-4" />
            <span className="mr-2">Template:</span>
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
            onClick={handleRender} 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Compiling...' : 'Generate PDF'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor (Left) */}
        <div className="w-1/2 flex flex-col border-r bg-gray-50">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full p-6 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="Type your markdown here..."
          />
          {/* Logs Panel */}
          <div className="h-32 bg-gray-900 text-gray-300 p-3 text-xs font-mono overflow-y-auto border-t border-gray-700">
            <div className="font-bold text-gray-500 mb-1">SYSTEM LOGS</div>
            <pre className="whitespace-pre-wrap">{logs}</pre>
          </div>
        </div>

        {/* Preview (Right) */}
        <div className="w-1/2 bg-gray-200 flex flex-col items-center justify-center relative">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full" 
              title="PDF Preview"
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p>Click "Generate PDF" to view preview</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App

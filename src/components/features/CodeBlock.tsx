import { useState } from 'react';
import { Check, Copy, Play, Download, X } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'plaintext' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);
  
  // Auto-detect language if not specified
  const detectedLanguage = language === 'plaintext' ? detectLanguage(code) : language;
  const isHTML = detectedLanguage?.toLowerCase() === 'html' || code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html');
  const isPython = detectedLanguage?.toLowerCase() === 'python' || detectedLanguage?.toLowerCase() === 'py';
  const isJavaScript = ['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(detectedLanguage?.toLowerCase() || '');
  const isBash = ['bash', 'sh', 'shell'].includes(detectedLanguage?.toLowerCase() || '');

  const detectLanguage = (code: string): string => {
    if (code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html')) return 'html';
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('=>')) return 'javascript';
    if (code.trim().startsWith('#!/bin/bash') || code.includes('echo ')) return 'bash';
    return 'plaintext';
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      python: 'py',
      py: 'py',
      javascript: 'js',
      js: 'js',
      typescript: 'ts',
      ts: 'ts',
      html: 'html',
      css: 'css',
      bash: 'sh',
      shell: 'sh',
      json: 'json',
      plaintext: 'txt',
    };

    const ext = extensions[detectedLanguage.toLowerCase()] || 'txt';
    const filename = `code.${ext}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${filename}`);
  };

  const handleRun = async () => {
    if (!isPython) {
      toast.error('Code execution is currently only supported for Python');
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setOutput('Running code...');

    try {
      // Mock Python execution
      // In real implementation, you would call a backend API or use Pyodide
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate output
      const mockOutput = `>>> Running Python code...\n\nCode executed successfully!\n\nNote: This is a demo. For actual Python execution, integrate with a backend service or Pyodide.`;
      
      setOutput(mockOutput);
      toast.success('Code executed');
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast.error('Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  // Professional syntax highlighting colors
  const highlightCode = (code: string, lang: string) => {
    const lines = code.split('\n');
    
    return lines.map((line, i) => {
      let highlighted = line;
      
      // Keywords (purple)
      highlighted = highlighted.replace(
        /\b(function|const|let|var|if|else|return|import|export|from|class|extends|async|await|try|catch|for|while|do|switch|case|break|continue|default|new|this|super|typeof|instanceof)\b/g,
        '<span style="color: #C678DD;">$1</span>'
      );
      
      // Strings (green)
      highlighted = highlighted.replace(
        /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        '<span style="color: #98C379;">$&</span>'
      );
      
      // Numbers (orange)
      highlighted = highlighted.replace(
        /\b(\d+\.?\d*)\b/g,
        '<span style="color: #D19A66;">$1</span>'
      );
      
      // Functions (blue)
      highlighted = highlighted.replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        '<span style="color: #61AFEF;">$1</span>('
      );
      
      // Comments (gray)
      highlighted = highlighted.replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/g,
        '<span style="color: #5C6370; font-style: italic;">$1</span>'
      );
      
      // HTML Tags (red)
      highlighted = highlighted.replace(
        /(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)(.*?)(&gt;)/g,
        '<span style="color: #E06C75;">$1$2</span>$3<span style="color: #E06C75;">$4</span>'
      );
      
      // Object properties (cyan)
      highlighted = highlighted.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*):/g,
        '<span style="color: #56B6C2;">$1</span>:'
      );
      
      return (
        <div key={i} className="hover:bg-white/5 px-4 -mx-4 transition-colors">
          <span className="select-none text-gray-600 dark:text-gray-500 inline-block w-8 text-right mr-4">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      );
    });
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden bg-[#282C34] shadow-lg border border-gray-700">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#21252B] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <span className="text-xs text-gray-400 font-mono uppercase tracking-wide ml-2">{detectedLanguage}</span>
          {isHTML && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setShowPreview(true)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  showPreview ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  !showPreview ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Code
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isPython && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md font-medium"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-md font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-md font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500 hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {isHTML && showPreview ? (
        <div className="bg-white dark:bg-gray-100 p-6 min-h-[200px] max-h-[600px] overflow-auto">
          <iframe
            srcDoc={code}
            className="w-full min-h-[200px] h-full border-0 rounded"
            sandbox="allow-scripts"
            title="HTML Preview"
            style={{ height: '500px' }}
          />
        </div>
      ) : (
        <pre className="p-4 sm:p-5 overflow-x-auto max-h-[60vh] sm:max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <code className="text-xs sm:text-sm font-mono leading-[1.6] text-[#ABB2BF]">
            {highlightCode(code, detectedLanguage)}
          </code>
        </pre>
      )}
      
      {/* Output Section */}
      {showOutput && output && (
        <div className="border-t border-gray-700 bg-[#1E2127]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400 font-mono">OUTPUT</span>
            <button
              onClick={() => setShowOutput(false)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <pre className="p-4 text-xs sm:text-sm font-mono text-[#98C379] whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
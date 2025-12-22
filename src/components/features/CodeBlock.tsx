import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'plaintext' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="my-4 rounded-xl overflow-hidden bg-[#282C34] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#21252B] border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-md"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy code
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono leading-relaxed text-[#ABB2BF]">
          {highlightCode(code, language)}
        </code>
      </pre>
    </div>
  );
}

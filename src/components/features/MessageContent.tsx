import { CodeBlock } from './CodeBlock';
import { FileText, Image as ImageIcon, Download } from 'lucide-react';

interface MessageContentProps {
  content: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

export function MessageContent({ content, attachments }: MessageContentProps) {
  // Parse markdown-style code blocks
  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {text.slice(lastIndex, match.index)}
          </p>
        );
      }

      // Add code block
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      parts.push(<CodeBlock key={`code-${match.index}`} code={code} language={language} />);

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {text.slice(lastIndex)}
        </p>
      );
    }

    return parts.length > 0 ? parts : <p className="whitespace-pre-wrap">{text}</p>;
  };

  const isImageType = (type: string) => type.startsWith('image/');
  const isPDFType = (type: string) => type === 'application/pdf';

  return (
    <div>
      {renderContent(content)}
      
      {attachments && attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachments.map((attachment, index) => (
            <div key={index}>
              {isImageType(attachment.type) ? (
                <div className="relative group">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-md rounded-lg border border-border"
                  />
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </a>
                </div>
              ) : (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors border border-border"
                >
                  {isPDFType(attachment.type) ? (
                    <FileText className="w-5 h-5 text-destructive" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{attachment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {attachment.type}
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

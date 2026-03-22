import { CodeBlock } from './CodeBlock';
import { GeneratedImage } from './GeneratedImage';
import { GeneratedFile } from './GeneratedFile';
import { LinkSafetyModal } from '../modals/LinkSafetyModal';
import { WebViewModal } from '../modals/WebViewModal';
import { FileText, Image as ImageIcon, Download } from 'lucide-react';
import { useState } from 'react';

interface MessageContentProps {
  content: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  generatedImage?: {
    url: string;
    prompt: string;
  };
  generatedImages?: Array<{
    url: string;
    revised_prompt?: string;
  }>;
  generatedFile?: {
    name: string;
    content: string;
    type: string;
  };
  onRetryImage?: () => void;
  onEditImage?: (editDescription: string) => void;
  isStreaming?: boolean;
}

export function MessageContent({ 
  content, 
  attachments, 
  generatedImage,
  generatedImages,
  generatedFile,
  onRetryImage,
  onEditImage,
  isStreaming = false
}: MessageContentProps) {
  const [linkSafetyOpen, setLinkSafetyOpen] = useState(false);
  const [webViewOpen, setWebViewOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.href;
    if (href && !href.startsWith(window.location.origin)) {
      e.preventDefault();
      setSelectedUrl(href);
      setLinkSafetyOpen(true);
    }
  };

  const handleOpenLink = (url: string) => {
    setWebViewOpen(true);
  };
  // Convert URLs to clickable links with icon
  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // Extract domain for display
        const domain = part.replace(/^https?:\/\//, '').split('/')[0];
        
        return (
          <a
            key={index}
            href={part}
            onClick={handleLinkClick}
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="break-all">{part}</span>
            <span className="text-xs text-muted-foreground ml-1">{domain}</span>
          </a>
        );
      }
      return part;
    });
  };

  // Parse markdown-style code blocks and format text
  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index);
        const lines = textContent.split('\n');
        
        parts.push(
          <div key={`text-${lastIndex}`} className="space-y-2">
            {lines.map((line, i) => (
              <p key={i} className="whitespace-pre-wrap break-words leading-relaxed">
                {linkifyText(line)}
              </p>
            ))}
          </div>
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
      const textContent = text.slice(lastIndex);
      const lines = textContent.split('\n');
      
      parts.push(
        <div key={`text-${lastIndex}`} className="space-y-2">
          {lines.map((line, i) => (
            <p key={i} className="whitespace-pre-wrap break-words leading-relaxed">
              {linkifyText(line)}
              {isStreaming && i === lines.length - 1 && <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />}
            </p>
          ))}
        </div>
      );
    }

    return parts.length > 0 ? parts : (
      <p className="whitespace-pre-wrap break-words leading-relaxed">
        {linkifyText(text)}
        {isStreaming && <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />}
      </p>
    );
  };

  const isImageType = (type: string) => type.startsWith('image/');
  const isPDFType = (type: string) => type === 'application/pdf';

  return (
    <div>
      {/* Generated Images (Multiple) */}
      {generatedImages && generatedImages.length > 0 && (
        <div className="mb-4">
          <GeneratedImage 
            images={generatedImages}
            onEditImage={onEditImage}
          />
        </div>
      )}

      {/* Generated Image (Single - Legacy) */}
      {generatedImage && !generatedImages && (
        <div className="mb-4">
          <GeneratedImage 
            images={[{ url: generatedImage.url, revised_prompt: generatedImage.prompt }]}
            onEditImage={onEditImage}
          />
        </div>
      )}
      
      {/* Generated File */}
      {generatedFile && (
        <div className="mb-4">
          <GeneratedFile
            fileName={generatedFile.name}
            fileContent={generatedFile.content}
            fileType={generatedFile.type}
          />
        </div>
      )}

      {content && renderContent(content)}
      
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
                  onClick={handleLinkClick}
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

      {/* Link Safety Modal */}
      <LinkSafetyModal
        isOpen={linkSafetyOpen}
        onClose={() => setLinkSafetyOpen(false)}
        url={selectedUrl}
        onOpenLink={handleOpenLink}
      />

      {/* Web View Modal */}
      <WebViewModal
        isOpen={webViewOpen}
        onClose={() => setWebViewOpen(false)}
        url={selectedUrl}
      />
    </div>
  );
}

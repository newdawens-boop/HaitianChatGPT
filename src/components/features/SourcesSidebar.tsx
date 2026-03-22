import { useState } from 'react';
import { X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  favicon?: string;
}

interface SourcesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  searchQuery?: string;
}

export function SourcesSidebar({ isOpen, onClose, sources, searchQuery }: SourcesSidebarProps) {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  const toggleSource = (id: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSources(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Sources</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Query */}
        {searchQuery && (
          <div className="p-4 border-b border-border bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">Search query</p>
            <p className="text-sm font-medium">{searchQuery}</p>
          </div>
        )}

        {/* Sources List */}
        <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {sources.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No sources found</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Favicon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
                        {source.favicon ? (
                          <img
                            src={source.favicon}
                            alt=""
                            className="w-5 h-5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-2 mb-1">
                              {source.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              {source.domain}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleSource(source.id)}
                            className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0"
                          >
                            {expandedSources.has(source.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Snippet */}
                        {expandedSources.has(source.id) && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                              {source.snippet}
                            </p>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                            >
                              Visit website
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* More Section */}
          {sources.length > 0 && (
            <div className="p-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Showing {sources.length} {sources.length === 1 ? 'source' : 'sources'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

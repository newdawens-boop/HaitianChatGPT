import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EXAMPLE_PROMPTS = [
  "How do I learn a new language effectively?",
  "What are some healthy breakfast ideas?",
  "Explain quantum physics in simple terms",
  "Help me write a cover letter",
  "What's the best way to manage stress?",
  "How can I improve my productivity?",
  "Suggest a workout routine for beginners",
  "What are the benefits of meditation?",
  "How do I start investing?",
  "Explain blockchain technology",
  "What's a good recipe for dinner tonight?",
  "How can I sleep better?",
  "What are tips for public speaking?",
  "How do I create a budget?",
  "What's the history of the internet?",
  "How can I learn to code?",
  "What are healthy lunch ideas?",
  "Explain artificial intelligence",
  "How do I build confidence?",
  "What are good books to read?",
  "How can I improve my memory?",
  "What's the best way to study?",
  "How do I start a business?",
  "What are tips for time management?",
  "How can I reduce anxiety?",
  "What's a good exercise for back pain?",
  "How do I write a resume?",
  "What are healthy snack options?",
  "Explain climate change",
  "How can I be more creative?",
];

export function PublicHomePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [displayedPrompts, setDisplayedPrompts] = useState<string[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Randomize and select 10 prompts on mount
    const shuffled = [...EXAMPLE_PROMPTS].sort(() => Math.random() - 0.5);
    setDisplayedPrompts(shuffled.slice(0, 10));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setInputValue(value);
    } else {
      setShowLoginPrompt(true);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setShowLoginPrompt(true);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">HC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Haitian ChatGPT
            </span>
          </div>
          <button
            onClick={handleLoginClick}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:scale-105 transition-transform font-medium"
          >
            Log in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              What's on your mind today?
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Ask anything, explore ideas, or start a conversation
            </p>
          </div>

          {/* Input Section */}
          <div className="relative mb-12">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask anything..."
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none transition-colors"
            />
            {inputValue.length > 15 && (
              <div className="absolute -bottom-8 right-0 text-sm text-amber-600 dark:text-amber-400">
                {20 - inputValue.length} characters remaining
              </div>
            )}
          </div>

          {/* Example Prompts */}
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Try asking about...
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="group p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <p className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Unlock Full Access</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to send longer messages, upload files, and get smarter responses
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleLoginClick}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
              >
                Sign in / Sign up
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Continue exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

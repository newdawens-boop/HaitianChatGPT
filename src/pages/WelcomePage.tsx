import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-xl">Haitian ChatGPT</span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8">
            What's on your mind today?
          </h1>
          
          <div className="relative">
            <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-left cursor-not-allowed">
              Ask anything
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-transparent">
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg"
              >
                Log in to start chatting
              </button>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Sign in to unlock full features: file uploads, voice input, and more
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="hover:underline">Terms of Use</a>
          <span>|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}

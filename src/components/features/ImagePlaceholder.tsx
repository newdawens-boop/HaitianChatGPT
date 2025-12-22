export function ImagePlaceholder() {
  return (
    <div className="my-4">
      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" 
             style={{
               backgroundSize: '200% 200%',
               animation: 'shimmer 2s infinite',
             }} 
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </div>
  );
}

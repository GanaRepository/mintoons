// app/loading.tsx
import { Loader2, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        {/* Main loading spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Loading text */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Creating Magic...
          </h2>
          <p className="text-gray-500 text-sm">
            Getting your stories ready
          </p>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
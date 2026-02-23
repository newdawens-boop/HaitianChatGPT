import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneOff, Pause, Play, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { chatService } from '@/lib/chatService';

interface Voice {
  id: string;
  name: string;
  preview: string;
}

const VOICES: Voice[] = [
  { id: 'tintin', name: 'Tintin', preview: "Hola! You're coming back again!" },
  { id: 'luna', name: 'Luna', preview: "Hi this is Luna. How's your day?" },
  { id: 'kk', name: 'KK', preview: "Hey, how's everything going? shou..." },
  { id: 'joan', name: 'Joan', preview: 'Hello this is Joan. You can ask m...' },
  { id: 'patti', name: 'Patti', preview: "Good to see you! The weather's..." },
  { id: 'nico', name: 'Nico', preview: "Hi there! What a day! So what are..." },
  { id: 'lzzy', name: 'Lzzy', preview: "I'm Lzzy. How's it going? Feel like..." },
];

type SpeechRate = 0.8 | 1.0 | 1.2 | 1.5;

export function VoicePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [speechRate, setSpeechRate] = useState<SpeechRate>(1.0);
  const [enableOpening, setEnableOpening] = useState(true);
  const [enableInterrupt, setEnableInterrupt] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to use voice mode');
      navigate('/auth');
      return;
    }

    startVoiceSession();
    return () => {
      stopVoiceSession();
    };
  }, [user, navigate]);

  const startVoiceSession = async () => {
    setIsConnected(true);
    
    // Initialize audio level monitoring
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start monitoring audio levels
      monitorAudioLevel();
      
      // Initialize speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript;
          setTranscription(transcript);
          
          if (event.results[last].isFinal) {
            handleVoiceInput(transcript);
          }
        };
        
        recognitionRef.current.start();
      }
      
      // Play opening greeting if enabled
      if (enableOpening) {
        setTimeout(() => {
          speakText(selectedVoice.preview);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to start voice session:', error);
      toast.error('Failed to access microphone');
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255); // Normalize to 0-1
      requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const stopVoiceSession = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    window.speechSynthesis.cancel();
  };

  const handleVoiceInput = async (text: string) => {
    try {
      const { message } = await chatService.sendMessage(
        [{ role: 'user', content: text }],
        undefined
      );
      
      if (message) {
        speakText(message);
      }
    } catch (error) {
      console.error('Failed to process voice input:', error);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      
      // Try to match voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        v.name.toLowerCase().includes(selectedVoice.id.toLowerCase())
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      recognitionRef.current?.start();
      setIsPaused(false);
    } else {
      recognitionRef.current?.stop();
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleEnd = () => {
    stopVoiceSession();
    navigate(-1);
  };

  const handleVoiceChange = (voice: Voice) => {
    setSelectedVoice(voice);
    setShowVoiceSelect(false);
    toast.success(`Voice changed to ${voice.name}`);
  };

  const getSpeechRateLabel = (rate: SpeechRate) => {
    switch (rate) {
      case 0.8: return '0.8x Slower';
      case 1.0: return '1.0x Normal';
      case 1.2: return '1.2x Faster';
      case 1.5: return '1.5x Fastest';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        
        <h1 className="text-xl font-semibold">Dawinix</h1>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Status */}
        <div className="text-center mb-8">
          {isConnected ? (
            <p className="text-lg text-white/80">
              {transcription || (isPaused ? 'Paused' : 'Listening...')}
            </p>
          ) : (
            <p className="text-lg text-white/80">Connecting...</p>
          )}
        </div>

        {/* Audio Level Indicator */}
        <div className="flex items-center gap-1 mb-16">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-8 rounded-full transition-all ${
                audioLevel > i * 0.15 ? 'bg-white' : 'bg-white/20'
              }`}
              style={{
                height: audioLevel > i * 0.15 ? `${32 + audioLevel * 20}px` : '8px',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={handleEnd}
            className="w-16 h-16 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-colors"
          >
            <PhoneOff className="w-7 h-7 text-red-400" />
          </button>
          
          <button
            onClick={handlePauseResume}
            className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            {isPaused ? (
              <Play className="w-7 h-7" />
            ) : (
              <Pause className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Show Keyboard Button */}
        <button
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="mt-8 text-sm text-white/60 hover:text-white/80 flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Tap to show keyboard
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed inset-x-0 top-20 mx-4 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
            <div className="p-4 space-y-1">
              {/* Speech Rate */}
              <button
                onClick={() => {
                  const rates: SpeechRate[] = [0.8, 1.0, 1.2, 1.5];
                  const currentIndex = rates.indexOf(speechRate);
                  const nextIndex = (currentIndex + 1) % rates.length;
                  setSpeechRate(rates[nextIndex]);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-purple-400">⏱️</span>
                  </div>
                  <span className="font-medium">Speech Rate</span>
                </div>
                <span className="text-white/60">{getSpeechRateLabel(speechRate)}</span>
              </button>

              {/* Voice Selection */}
              <button
                onClick={() => setShowVoiceSelect(!showVoiceSelect)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-blue-400">🎤</span>
                  </div>
                  <span className="font-medium">Voice Selection</span>
                </div>
                <span className="text-white/60">{selectedVoice.name}</span>
              </button>

              {/* Opening */}
              <button
                onClick={() => setEnableOpening(!enableOpening)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-green-400">💬</span>
                  </div>
                  <span className="font-medium">Opening</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${enableOpening ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${enableOpening ? 'translate-x-6' : ''}`} />
                </div>
              </button>

              {/* Voice Interrupt */}
              <button
                onClick={() => setEnableInterrupt(!enableInterrupt)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-orange-400">🎙️</span>
                  </div>
                  <span className="font-medium">Voice Interrupt</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${enableInterrupt ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${enableInterrupt ? 'translate-x-6' : ''}`} />
                </div>
              </button>

              {/* Keyboard Input */}
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-400">⌨️</span>
                  </div>
                  <span className="font-medium">Keyboard input</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${showKeyboard ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${showKeyboard ? 'translate-x-6' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Voice Selection Panel */}
      {showVoiceSelect && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowVoiceSelect(false)}
          />
          <div className="fixed inset-x-0 top-20 bottom-0 bg-gray-900 z-50 rounded-t-3xl overflow-hidden animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Play Voice</h2>
                <button
                  onClick={() => setShowVoiceSelect(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {VOICES.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => handleVoiceChange(voice)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                      selectedVoice.id === voice.id
                        ? 'bg-gray-700'
                        : 'bg-gray-800/50 hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      🎤
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-sm text-white/60">{voice.preview}</div>
                    </div>
                    {selectedVoice.id === voice.id && (
                      <div className="text-blue-400">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

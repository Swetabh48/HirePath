'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioWaveform } from './audiowaveform';
import SpeechIndicator from './voice/speechindicator';
import { OpenAIVoiceAgent } from '@/lib/voice/openai-voice';

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended';

interface EnhancedVoiceAgentProps {
  onTranscript: (text: string, isUser: boolean) => void;
  onCallStatusChange: (status: CallStatus) => void;
  questions?: string[];
  currentQuestion?: string;
  interviewData?: {
    role: string;
    type: string;
    level: string;
    techstack: string[];
    questions: string[];
  };
}

export const EnhancedVoiceAgent = ({ 
  onTranscript, 
  onCallStatusChange, 
  questions = [],
  currentQuestion,
  interviewData
}: EnhancedVoiceAgentProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const voiceAgentRef = useRef<OpenAIVoiceAgent | null>(null);

  // Initialize OpenAI Voice Agent
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (apiKey) {
      voiceAgentRef.current = new OpenAIVoiceAgent(apiKey);
    } else {
      console.error('OpenAI API key not found');
    }
  }, []);

  // Speech synthesis function with better error handling
  const speak = useCallback(async (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure speech settings
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a more natural voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      return new Promise<void>((resolve) => {
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        
        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          setIsSpeaking(false);
          resolve();
        };

        synthRef.current!.speak(utterance);
        onTranscript(text, false);
      });
    }
  }, [onTranscript]);

  // Process user speech and get AI response
  const processUserSpeech = useCallback(async (userText: string) => {
    if (!voiceAgentRef.current || isProcessingResponse) return;
    
    setIsProcessingResponse(true);
    setIsListening(false);
    
    try {
      // Stop recognition temporarily
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      onTranscript(userText, true);
      
      // Get AI response
      const aiResponse = await voiceAgentRef.current.processUserResponse(userText);
      
      // Speak AI response
      await speak(aiResponse);
      
      // Resume listening after AI finishes speaking
      setTimeout(() => {
        if (callStatus === 'active' && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (error) {
            console.log('Could not restart recognition:', error);
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error processing user speech:', error);
    } finally {
      setIsProcessingResponse(false);
    }
  }, [onTranscript, speak, callStatus, isProcessingResponse]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window) {
        recognitionRef.current = new window.webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        recognitionRef.current = new window.SpeechRecognition();
      }

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false; // Process one statement at a time
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const results = Array.from(event.results);
          const lastResult = results[results.length - 1];
          
          if (lastResult.isFinal && lastResult[0].confidence > 0.5) {
            const transcript = lastResult[0].transcript.trim();
            if (transcript) {
              processUserSpeech(transcript);
            }
          }
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            alert('Microphone permission is required for voice interaction.');
          }
          // Restart if it was a temporary error
          if (callStatus === 'active' && !isProcessingResponse) {
            setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                } catch (e) {
                  console.log('Could not restart after error:', e);
                }
              }
            }, 1000);
          }
        };

        recognitionRef.current.onend = () => {
          if (callStatus === 'active' && !isProcessingResponse && !isSpeaking) {
            setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                } catch (error) {
                  console.log('Recognition restart failed:', error);
                }
              }
            }, 500);
          }
        };
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [callStatus, isProcessingResponse, isSpeaking, processUserSpeech]);

  // Audio visualization setup
  const setupAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      updateAudioData();
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
      throw error;
    }
  }, []);

  const updateAudioData = useCallback(() => {
    if (analyserRef.current && dataArrayRef.current && callStatus === 'active') {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const normalizedData = Array.from(dataArrayRef.current).map(value => value / 255);
      setAudioData(normalizedData);
      animationRef.current = requestAnimationFrame(updateAudioData);
    }
  }, [callStatus]);

  const updateCallStatus = useCallback((status: CallStatus) => {
    setCallStatus(status);
    onCallStatusChange(status);
  }, [onCallStatusChange]);

  const startCall = async () => {
    if (!voiceAgentRef.current) {
      alert('Voice agent not initialized. Please check your OpenAI API key.');
      return;
    }

    updateCallStatus('connecting');
    
    try {
      await setupAudioVisualization();
      
      // Initialize conversation with interview data
      let initialMessage = '';
      if (interviewData) {
        initialMessage = await voiceAgentRef.current.initializeConversation(interviewData);
      } else {
        initialMessage = currentQuestion || 
          "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.";
      }
      
      updateCallStatus('active');
      
      // Speak the initial message
      await speak(initialMessage);
      
      // Start listening after the AI finishes speaking
      setTimeout(() => {
        if (recognitionRef.current && callStatus !== 'ended') {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (error) {
            console.error('Error starting recognition:', error);
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting call:', error);
      updateCallStatus('idle');
      alert('Failed to start call. Please check your microphone permissions.');
    }
  };

  const endCall = () => {
    updateCallStatus('ended');
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessingResponse(false);
  };

  const toggleListening = () => {
    if (recognitionRef.current && callStatus === 'active' && !isProcessingResponse) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error toggling recognition:', error);
        }
      }
    }
  };

  const toggleSpeaking = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Audio Visualization */}
      <div className="relative">
        <AudioWaveform 
          audioData={audioData} 
          isRecording={callStatus === 'active' && (isListening || isSpeaking)} 
          height={80}
          barCount={32}
        />
        <SpeechIndicator isActive={isSpeaking || isProcessingResponse} size="lg" />
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-2">
          {callStatus === 'idle' && 'Ready to start interview'}
          {callStatus === 'connecting' && 'Connecting...'}
          {callStatus === 'active' && (
            isProcessingResponse ? 'Processing...' :
            isSpeaking ? 'AI Speaking...' : 
            isListening ? 'Listening...' : 'Ready to listen'
          )}
          {callStatus === 'ended' && 'Interview completed'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {callStatus === 'idle' && (
          <Button onClick={startCall} className="btn-call flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Start Interview
          </Button>
        )}
        
        {callStatus === 'active' && (
          <>
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "secondary"}
              size="icon"
              disabled={isSpeaking || isProcessingResponse}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={toggleSpeaking}
              variant={isSpeaking ? "destructive" : "secondary"}
              size="icon"
              disabled={isProcessingResponse}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <Button onClick={endCall} variant="destructive" className="flex items-center gap-2">
              <PhoneOff className="w-4 h-4" />
              End Interview
            </Button>
          </>
        )}
        
        {callStatus === 'connecting' && (
          <Button onClick={endCall} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
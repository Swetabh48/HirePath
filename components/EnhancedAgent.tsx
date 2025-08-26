'use client';

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EnhancedVoiceAgent } from "./EnhancedVoiceAgent";
import { createFeedback } from "@/lib/actions/general.action";
import SpeechIndicator from "./voice/speechindicator";
import { SavedMessage } from "@/types";

interface EnhancedAgentProps {
  userName: string;
  userId: string;
  type: "generate" | "interview";
  interviewId: string;
  questions?: string[];
}

const EnhancedAgent = ({ userName, userId, type, interviewId, questions = [] }: EnhancedAgentProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscript = useCallback((text: string, isUser: boolean) => {
    const newMessage: SavedMessage = {
      role: isUser ? 'user' : 'assistant',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // If user spoke, process the response and move to next question
    if (isUser && questions.length > 0 && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 2000);
    }
  }, [questions, currentQuestionIndex]);

  const handleCallStatusChange = useCallback((status: 'idle' | 'connecting' | 'active' | 'ended') => {
    setCallStatus(status);
  }, []);

  const handleGenerateFeedback = useCallback(async (messagesData: SavedMessage[]) => {
    if (!interviewId || !userId) {
      console.error('Missing interviewId or userId');
      router.push('/');
      return;
    }

    setIsProcessing(true);

    try {
      const transcript = messagesData.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const result = await createFeedback({
        interviewId,
        userId,
        transcript
      });

      if (result?.success && result.feedbackId) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.error('Error saving feedback');
        router.push('/');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      router.push('/');
    } finally {
      setIsProcessing(false);
    }
  }, [interviewId, userId, router]);

  useEffect(() => {
    if (callStatus === 'ended') {
      if (type === 'generate') {
        router.push('/');
      } else if (messages.length > 0) {
        handleGenerateFeedback(messages);
      }
    }
  }, [callStatus, messages, type, router, handleGenerateFeedback]);

  const getCurrentQuestion = useCallback(() => {
    if (!questions || questions.length === 0) return undefined;
    return questions[currentQuestionIndex] || questions[questions.length - 1];
  }, [questions, currentQuestionIndex]);

  const latestMessage = messages.length > 0 ? messages[messages.length - 1]?.content : '';

  return (
    <div className="flex flex-col gap-8">
      {/* Interview Display */}
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={54}
              className="object-cover"
            />
            {callStatus === 'active' && <SpeechIndicator isActive={true} size="md" />}
          </div>
          <h3>AI Interviewer</h3>
          {questions.length > 0 && (
            <p className="text-sm text-center text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          )}
        </div>
        
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={120}
              height={120}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Voice Agent Controls */}
      <EnhancedVoiceAgent
        onTranscript={handleTranscript}
        onCallStatusChange={handleCallStatusChange}
        questions={questions}
        currentQuestion={getCurrentQuestion()}
      />

      {/* Latest Message Display */}
      {latestMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className={cn(
              'transition-opacity duration-500 opacity-0',
              'animate-fadeIn opacity-100'
            )}>
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-center">
          <p className="text-primary-200">Generating feedback...</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedAgent;
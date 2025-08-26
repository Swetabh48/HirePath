'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioData: number[];
  isRecording: boolean;
  height?: number;
  barCount?: number;
  className?: string;
}

export const AudioWaveform = ({ 
  audioData, 
  isRecording, 
  height = 80, 
  barCount = 32,
  className 
}: AudioWaveformProps) => {
  // Generate bars based on audio data or random data for demo
  const bars = Array.from({ length: barCount }, (_, i) => {
    const dataIndex = Math.floor((i / barCount) * audioData.length);
    const amplitude = audioData[dataIndex] || (isRecording ? Math.random() * 0.8 + 0.2 : 0.1);
    return amplitude * height;
  });

  return (
    <div 
      className={cn(
        "flex items-end justify-center gap-1 px-4",
        className
      )}
      style={{ height: `${height}px` }}
    >
      {bars.map((barHeight, index) => (
        <motion.div
          key={index}
          className={cn(
            "bg-gradient-to-t rounded-full min-h-[2px]",
            isRecording 
              ? "from-primary-200 to-primary-100" 
              : "from-gray-600 to-gray-500"
          )}
          style={{ width: '3px' }}
          animate={{
            height: Math.max(barHeight, 2),
            opacity: isRecording ? 0.6 + (barHeight / height) * 0.4 : 0.3,
          }}
          transition={{
            duration: 0.15,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};
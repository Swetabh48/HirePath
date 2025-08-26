import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
interface SpeechIndicatorProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SpeechIndicator = ({ isActive, size = 'md' }: SpeechIndicatorProps) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className={cn(
          "absolute rounded-full border-2 border-primary-200/30",
          sizeMap[size]
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={cn(
          "absolute rounded-full border-2 border-primary-200/50",
          sizeMap[size]
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default SpeechIndicator;
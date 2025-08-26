import { cn } from '@/lib/utils';
import { Award, Star, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  isNew?: boolean;
}
 const AchievementBadge = ({ title, description, type,  isNew }: AchievementBadgeProps) => {
  const typeConfig = {
    bronze: { color: 'text-orange-400', bg: 'bg-orange-500/10', icon: Award },
    silver: { color: 'text-gray-300', bg: 'bg-gray-500/10', icon: Star },
    gold: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Trophy },
    platinum: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Target }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-gray-700/50 relative",
        config.bg
      )}
    >
      {isNew && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
      
      <div className={cn("p-2 rounded-full", config.bg)}>
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export default AchievementBadge
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}
const StatCard = ({ icon: Icon, title, value, change, trend }: StatCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-dark-200 rounded-xl p-6 border border-gray-700/50 hover:border-primary-200/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary-200/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary-200" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-sm",
          trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
        )}>
          {trend !== 'neutral' && <TrendIcon className="w-4 h-4" />}
          {change}
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-gray-400 text-sm">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatCard
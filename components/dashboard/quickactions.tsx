
import { Zap, Brain, BarChart3, Calendar} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
interface QuickActionsProps {
  userId: string;
}
const QuickActions = ({ userId }: QuickActionsProps) => {
  const actions = [
    {
      icon: Zap,
      label: 'Quick Interview',
      description: 'Start a 10-minute practice session',
      href: '/interview/quick',
      color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30'
    },
    {
      icon: Brain,
      label: 'AI Coach',
      description: 'Get personalized improvement tips',
      href: '/coach',
      color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View detailed performance metrics',
      href: '/analytics',
      color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30'
    },
    {
      icon: Calendar,
      label: 'Schedule',
      description: 'Plan your interview sessions',
      href: '/schedule',
      color: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30'
    }
  ];

  return (
    <div className="bg-dark-200 rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <div className={cn(
                "p-4 rounded-lg border transition-all cursor-pointer group",
                action.color
              )}>
                <action.icon className="w-8 h-8 mb-3 text-primary-200 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold mb-1">{action.label}</h4>
                <p className="text-sm text-gray-400">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions
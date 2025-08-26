import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { 
  Calendar, 
  Star, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  BookOpen,
  Target,
  Zap
} from "lucide-react";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { Feedback } from "@/types";

interface InterviewCardProps {
  id: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string | number | Date;
}

const InterviewCard = async ({
  id,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  let feedback: Feedback | null = null;
  
  if (userId && id) {
    try {
      const result = await getFeedbackByInterviewId({ interviewId: id, userId });
      feedback = result || null;
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  }

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const hasCompleted = !!feedback;

  const badgeColor = {
    Behavioral: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Mixed: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    Technical: "bg-green-500/20 text-green-300 border-green-500/30",
  }[normalizedType as keyof typeof badgeColor] || "bg-gray-500/20 text-gray-300 border-gray-500/30";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  // Calculate performance indicators
  const scoreColor = feedback?.totalScore 
    ? feedback.totalScore >= 80 
      ? "text-green-400" 
      : feedback.totalScore >= 60 
        ? "text-yellow-400" 
        : "text-red-400"
    : "text-gray-400";

  const cardVariants: Variants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const overlayVariants: Variants = {
    hover: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="card-border w-[360px] max-sm:w-full min-h-96 group cursor-pointer transition-shadow"
      variants={cardVariants}
      whileHover="hover"
      layout
    >
      <div className="card-interview relative overflow-hidden">
        {/* Background Gradient Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary-200/5 via-transparent to-primary-100/10 opacity-0"
          variants={overlayVariants}
        />

        {/* Status Indicator */}
        <div className="absolute top-3 left-3 z-10">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
            hasCompleted ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
          )}>
            {hasCompleted ? (
              <>
                <Award className="w-3 h-3" />
                Completed
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                Pending
              </>
            )}
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            badgeColor
          )}>
            {normalizedType}
          </div>
        </div>

        <div className="relative z-10">
          {/* Cover Image with Animation */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-6"
          >
            <Image
              src={getRandomInterviewCover()}
              alt="Interview cover"
              width={90}
              height={90}
              className="rounded-full object-cover shadow-lg border-2 border-primary-200/20"
            />
          </motion.div>

          {/* Interview Title */}
          <motion.h3 
            className="mb-4 capitalize text-xl font-bold"
            whileHover={{ scale: 1.05 }}
          >
            {role} Interview
          </motion.h3>

          {/* Metrics Row */}
          <div className="flex flex-wrap gap-3 mb-4">
            <motion.div 
              className="flex items-center gap-2 bg-dark-300/50 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Calendar className="w-4 h-4 text-primary-200" />
              <span className="text-sm">{formattedDate}</span>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2 bg-dark-300/50 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-4 h-4 text-primary-200" />
              <span className={cn("text-sm font-semibold", scoreColor)}>
                {feedback?.totalScore ? `${feedback.totalScore}/100` : "---/100"}
              </span>
            </motion.div>

            {feedback && (
              <motion.div 
                className="flex items-center gap-2 bg-dark-300/50 px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+{Math.floor(Math.random() * 15) + 5}%</span>
              </motion.div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
              {feedback?.finalAssessment ||
                "Ready to test your skills? This interview will help you practice and improve your abilities. Get personalized feedback and track your progress."}
            </p>
          </div>

          {/* Performance Indicators */}
          {feedback && feedback.categoryScores && (
            <motion.div 
              className="mb-6 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <h4 className="text-sm font-semibold text-primary-200 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Performance Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {feedback.categoryScores.slice(0, 4).map((category, index) => (
                  <div key={index} className="bg-dark-300/30 rounded-lg p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 truncate">{category.name}</span>
                      <span className="text-xs font-semibold text-primary-200">
                        {category.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <motion.div
                        className="bg-gradient-to-r from-primary-200 to-primary-100 h-1 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${category.score}%` }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-auto relative z-10">
          <DisplayTechIcons techStack={techstack} />

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className={cn(
                "relative overflow-hidden",
                feedback ? "btn-secondary" : "btn-primary"
              )}
            >
              <Link
                href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}
                className="flex items-center gap-2"
              >
                {feedback ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    View Feedback
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Interview
                  </>
                )}
              </Link>

              {/* Button hover effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-primary-200/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </motion.div>
        </div>

        {/* Quick Action Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          variants={overlayVariants}
        >
          <div className="text-center space-y-4">
            {!feedback && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                className="space-y-2"
              >
                <Button size="sm" variant="outline" className="border-primary-200/50">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Start (5 min)
                </Button>
                <p className="text-xs text-gray-300">Jump right in with a short version</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Completion Badge */}
        {feedback && feedback.totalScore >= 90 && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            🏆 Excellent!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default InterviewCard;
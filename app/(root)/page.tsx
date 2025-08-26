"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import {InterviewDashboard}from "@/components/InterviewDashboard";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getInterviewByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [userInterviews, setUserInterviews] = useState<any[]>([]);
  const [allInterviews, setAllInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in"); // Redirect if not logged in
        return;
      }
      setUser(currentUser);

      // Fetch interviews
      const [userInt, allInt] = await Promise.all([
        getInterviewByUserId(currentUser.uid),
        getLatestInterviews({ userId: currentUser.uid }),
      ]);
      setUserInterviews(userInt || []);
      setAllInterviews(allInt || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  const hasPastInterviews = userInterviews.length > 0;
  const hasUpcomingInterviews = allInterviews.length > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="card-cta flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview Ready with AI-Powered Practice and Feedback</h2>
          <p className="text-lg">Practice with our free voice agent and get instant AI feedback</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="AI Interview Assistant" width={400} height={400} className="max-sm:hidden" />
      </section>

      {/* Enhanced Dashboard */}
      <InterviewDashboard userId={user.uid} userInterviews={userInterviews} />

      {/* Your Interviews Section */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Recent Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.slice(0, 6).map((interview) => <InterviewCard {...interview} key={interview.id} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">You have not taken any interviews yet</p>
              <Button asChild className="btn-primary">
                <Link href="/interview">Create Your First Interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Available Interviews Section */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Practice with These Interviews</h2>
        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterviews.slice(0, 6).map((interview) => <InterviewCard {...interview} key={interview.id} />)
          ) : (
            <p className="text-center text-gray-400 py-8">No practice interviews available at the moment</p>
          )}
        </div>
      </section>
    </>
  );
}

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// timeout wrapper
function timeoutAfter<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Gemini API Timeout")), ms);
    promise.then(
      res => { clearTimeout(timer); resolve(res); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

// sanitize Gemini output and parse JSON safely
function safeParseQuestions(text: string): string[] {
  try {
    const trimmed = text.trim();
    if (!trimmed.startsWith("[")) {
      // attempt to fix bad formatting
      const fixed = trimmed.substring(trimmed.indexOf("["));
      return JSON.parse(fixed);
    }
    return JSON.parse(trimmed);
  } catch (e) {
    throw new Error("Failed to parse Gemini response into JSON.");
  }
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    // retry wrapper
    const generateInterview = async (): Promise<string[]> => {
      const { text } = await timeoutAfter(
        generateText({
          model: google("gemini-2.5-flash"),
          prompt: `Prepare questions for a job interview.
            The job role is ${role}.
            The job experience level is ${level}.
            The tech stack used in the job is: ${techstack}.
            The focus between behavioural and technical questions should lean towards: ${type}.
            The amount of questions required is: ${amount}.
            Please return only the questions, without any additional text.
            The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
            Return the questions formatted like this:
            ["Question 1", "Question 2", "Question 3"]`
        }),
        10000 // timeout: 10 seconds
      );

      return safeParseQuestions(text);
    };

    let questions: string[] = [];

    try {
      questions = await generateInterview();
    } catch (firstErr) {
      console.warn("First Gemini call failed, retrying...");
      try {
        questions = await generateInterview();
      } catch (secondErr) {
        console.error("Gemini call failed twice:", secondErr);
        return Response.json({ success: false, error: "Gemini API failed." }, { status: 500 });
      }
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Final Error:", error);
    return Response.json({ success: false, error: error.message || error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

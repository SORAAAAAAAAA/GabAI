// components/EvaluationHandler.tsx
"use client";

import { useDataChannel } from "@livekit/components-react";
import { useEffect } from "react";
import { useInterviewData } from "@/context/InterviewDataContext";
import { toast } from "sonner";
// Import your toast or notification library here if you have one
// import { toast } from "sonner"; 

export const EvaluationHandler = () => {
  // This hook works because this component will be inside SessionProvider
  const { message } = useDataChannel("evaluation");
  const { setLatestEvaluation } = useInterviewData();

  useEffect(() => {
    if (message) {
      
      try {
        const rawString = new TextDecoder().decode(message.payload);
        const payload = JSON.parse(rawString);

        if (payload.type === 'EVALUATION') {
          console.log("New Evaluation Received:", payload.data);
          
          // 1. Update the Global Context
          setLatestEvaluation(payload.data);

          // 2. Optional: Show a toast immediately
          toast("New Feedback Received", {
             description: "Check the feedback panel for details."
          });
        }
      } catch (error) {
        console.error("Failed to parse evaluation data:", error);
      }
    }
  }, [message, setLatestEvaluation]);

  return null; // This component doesn't need to render anything itself
};
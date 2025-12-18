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
          
          // Parse the evaluation data
          const evaluationData = payload.data;
          const scores = typeof evaluationData.scores === 'string' 
            ? JSON.parse(evaluationData.scores) 
            : evaluationData.scores;
          
          // Handle both nested (feedback.strengths) and flat (strengths) structures
          let strengths: string[] = [];
          let improvement_tip = '';
          
          if (evaluationData.feedback) {
            // Data is already in the correct nested structure
            strengths = evaluationData.feedback.strengths || [];
            improvement_tip = evaluationData.feedback.improvement_tip || '';
          } else {
            // Data is in flat structure, extract from top level
            strengths = typeof evaluationData.strengths === 'string'
              ? JSON.parse(evaluationData.strengths)
              : (evaluationData.strengths || []);
            improvement_tip = evaluationData.improvement_tip || '';
          }

          // Transform into the expected structure
          const transformedData = {
            scores,
            feedback: {
              strengths: Array.isArray(strengths) ? strengths : [strengths],
              improvement_tip
            }
          };
          
          // 1. Update the Global Context
          setLatestEvaluation(transformedData);

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
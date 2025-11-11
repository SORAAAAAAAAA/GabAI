import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

let interviewChat: any = null;

export async function startInterview(  name: string, job: string, resume: string) {
  const systemPrompt = `
  You are a professional interviewer. You will interview the candidate below.

  Candidate Name: ${name}
  Resume Information: ${resume}
  Job Applied for: ${job}

  Your Guide as an Interviewer:
  - Generate 8-15 questions that is necessarry and relevant to the user.
  - The generated question should be relevant to the user's Resume and the Job they are applying for.
  - You should make the interview and your role to be as realistic as possible.
  - You should make it so that you are understanding the user and not giving the questions in one go.
  - Always finish the current question before moving to the next one.
  `;

  // Create model with system instructions
  const model = ai.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt
  });

  // Start chat with just the initial user message
  interviewChat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Let's begin the interview. Start with a greeting and your first question." }]
      },
    ],
  });

  // Get the AI's first response
  const firstResponse = await interviewChat.sendMessage("");

  return firstResponse.response.text();

}

export async function continueInterview(userMessage: string) {
  if (!interviewChat) {
    throw new Error("Interview not started. Please call startInterview() first.");
  }

  const aiResponse = await interviewChat.sendMessage(userMessage);
  return aiResponse.response.text();
}
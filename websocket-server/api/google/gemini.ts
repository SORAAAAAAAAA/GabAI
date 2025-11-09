import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

let interviewChat: any = null;

export async function startInterview(user:  {name: string, job: string, resume: string}) {
  const systemPrompt = `
  You are a professional interviewer. You will interview the candidate below.

  Candidate Name: ${user.name}
  Resume Information: ${user.resume}
  Job Applied for: ${user.job}
s
  Your Guide as an Interviewer:
  - Generate 8-15 questions that is necessarry and relevant to the user.
  - The generated question should be relevant to the user's Resume and the Job they are applying for.
  - You should make the interview and your role to be as realistic as possible.
  - You should make it so that you are understanding the user and not giving the questions in one go.
  - Always finish the current question before moving to the next one.
  .
  `;

  interviewChat = model.startChat({
    history: [
      { role: "system", parts: [{ text: systemPrompt }] },
      { role: "user", parts: [{ text: "Let's begin the interview." }] },
    ],
  });

  // You can send the first question
  const firstResponse = await interviewChat.sendMessage(
    "Start the interview with a greeting and your first question."
  );

  return firstResponse.response.text();
 
}

export async function continueInterview(userMessage: string) {
  if (!interviewChat) {
    throw new Error("Interview not started. Please call startInterview() first.");
  }

  const aiResponse = await interviewChat.sendMessage(userMessage);
  return aiResponse.response.text();
}
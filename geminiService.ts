
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AppState, DayOfWeek } from "./types";

const addStudyLogFunction: FunctionDeclaration = {
  name: 'addStudyLog',
  description: 'Adds a manual study session log for a subject.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      subjectName: { type: Type.STRING, description: 'The name of the subject (e.g. Math, Physics)' },
      durationMinutes: { type: Type.NUMBER, description: 'Duration of study in minutes' },
      date: { type: Type.STRING, description: 'Date of study in YYYY-MM-DD format. Defaults to today.' }
    },
    required: ['subjectName', 'durationMinutes']
  }
};

const updateScheduleFunction: FunctionDeclaration = {
  name: 'updateSchedule',
  description: 'Adds or updates a repeating schedule for a subject.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      subjectName: { type: Type.STRING, description: 'The name of the subject' },
      day: { type: Type.STRING, description: 'Day of the week (e.g. Monday, Tuesday)' },
      startTime: { type: Type.STRING, description: 'Start time in HH:mm' },
      endTime: { type: Type.STRING, description: 'End time in HH:mm' }
    },
    required: ['subjectName', 'day', 'startTime', 'endTime']
  }
};

export const chatWithGemini = async (prompt: string, state: AppState, onUpdate: (action: string, args: any) => void) => {
  // Always initialize GoogleGenAI inside the call with the correct API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are StudiFlow AI, a helpful study assistant. 
    You have access to the user's study data:
    - User: ${JSON.stringify(state.user)}
    - Subjects: ${JSON.stringify(state.subjects)}
    - Schedule: ${JSON.stringify(state.schedules)}
    - Logs (Total logs count): ${state.logs.length}
    
    Current Date: ${new Date().toISOString().split('T')[0]}
    
    Users might ask you to:
    1. Log study time (e.g., "I studied Math for 2 hours today").
    2. Add/Update their timetable (e.g., "Schedule Physics for Mondays at 2pm to 4pm").
    3. Get stats (e.g., "How many hours did I study this week?").
    
    Always be encouraging and professional. If you call a function, confirm the action to the user.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [addStudyLogFunction, updateScheduleFunction] }]
      }
    });

    // Access functionCalls as a property
    const calls = response.functionCalls;
    if (calls && calls.length > 0) {
      for (const call of calls) {
        onUpdate(call.name, call.args);
      }
    }

    // Access .text property directly (not a method)
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!";
  }
};

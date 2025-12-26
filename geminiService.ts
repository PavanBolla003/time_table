import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AppState, DayOfWeek, ActivityType } from "./types";

const logActivityFunction: FunctionDeclaration = {
  name: 'logActivity',
  description: 'Logs any activity (Study, Sleep, Meal, Social, etc.) to the daily workflow.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, description: 'Type of activity: Study, Sleep, Meal, Social, Exercise, Class, Other' },
      title: { type: Type.STRING, description: 'Title or description of the activity (e.g. "Math Study", "Lunch", "Instagram")' },
      durationMinutes: { type: Type.NUMBER, description: 'Duration in minutes' },
      startTime: { type: Type.STRING, description: 'Start time in HH:mm format (optional, defaults to now)' }
    },
    required: ['type', 'title', 'durationMinutes']
  }
};

const updateScheduleFunction: FunctionDeclaration = {
  name: 'updateSchedule',
  description: 'Adds or updates a repeating schedule for a subject.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      subjectName: { type: Type.STRING, description: 'The name of the subject (if applicable)' },
      title: { type: Type.STRING, description: 'Title of the event' },
      day: { type: Type.STRING, description: 'Day of the week (e.g. Monday, Tuesday)' },
      startTime: { type: Type.STRING, description: 'Start time in HH:mm' },
      endTime: { type: Type.STRING, description: 'End time in HH:mm' }
    },
    required: ['title', 'day', 'startTime', 'endTime']
  }
};

export const chatWithGemini = async (prompt: string, state: AppState, onUpdate: (action: string, args: any) => void) => {
  // Always initialize GoogleGenAI inside the call with the correct API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.0-flash';

  const systemInstruction = `
    You are StudiFlow AI, a smart daily workflow assistant. 
    You have access to the user's data:
    - User Name: ${state.user?.name}
    - Subjects: ${JSON.stringify(state.subjects.map(s => s.name))}
    - Today's Logs: ${state.logs.length} entries
    
    Current Date: ${new Date().toISOString().split('T')[0]}
    
    Capabilities:
    1. Log any activity (Study, Sleep, Meals, Social Media).
       - If user says "I studied Math for 2 hours", call logActivity(type='Study', title='Math', duration=120).
       - If user says "I slept for 8 hours", call logActivity(type='Sleep', title='Night Sleep', duration=480).
    2. Manage Schedule.
    3. Analyze data (e.g. "How much sleep did I get?").
    
    Be concise, friendly, and motivational.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [logActivityFunction, updateScheduleFunction] }]
      }
    });

    // Access functionCalls as a property
    const calls = response.functionCalls;
    if (calls && calls.length > 0) {
      for (const call of calls) {
        onUpdate(call.name, call.args);
      }
    }

    // Access .text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!";
  }
};

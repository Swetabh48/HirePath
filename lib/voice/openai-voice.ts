import OpenAI from 'openai';

export class OpenAIVoiceAgent {
  private openai: OpenAI;
  private currentConversation: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async initializeConversation(interviewData: {
    role: string;
    type: string;
    level: string;
    techstack: string[];
    questions: string[];
  }) {
    const systemPrompt = `You are a professional AI interviewer conducting a ${interviewData.type} interview for a ${interviewData.level} ${interviewData.role} position.

Tech Stack: ${interviewData.techstack.join(', ')}
Interview Questions: ${interviewData.questions.join('\n')}

Guidelines:
1. Be professional, friendly, and encouraging
2. Ask one question at a time from the provided list
3. Listen to the candidate's response and provide brief acknowledgment
4. Ask relevant follow-up questions based on their answers
5. Keep responses concise and conversational
6. If they seem confused, offer clarification
7. Maintain a supportive interview atmosphere

Start by greeting the candidate and asking the first question.`;

    this.currentConversation = [
      { role: 'system', content: systemPrompt }
    ];

    return this.generateResponse("Let's begin the interview.");
  }

  async processUserResponse(userInput: string): Promise<string> {
    this.currentConversation.push({ role: 'user', content: userInput });

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: this.currentConversation,
        max_tokens: 150,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, could you repeat that?";
      this.currentConversation.push({ role: 'assistant', content: response });

      return response;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return "I'm having trouble processing your response. Could you try again?";
    }
  }

  async generateResponse(context: string): Promise<string> {
    this.currentConversation.push({ role: 'user', content: context });

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: this.currentConversation,
        max_tokens: 100,
        temperature: 0.8,
      });

      const response = completion.choices[0]?.message?.content || "Hello! Let's start with your first question.";
      this.currentConversation.push({ role: 'assistant', content: response });

      return response;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return "Hello! I'm ready to begin your interview. Let's start with the first question.";
    }
  }

  getConversationHistory() {
    return this.currentConversation.filter(msg => msg.role !== 'system');
  }

  resetConversation() {
    this.currentConversation = [];
  }
}
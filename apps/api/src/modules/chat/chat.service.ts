import { Injectable } from '@nestjs/common';
import { AssistantMessage } from '@shiftly/shared-types';

@Injectable()
export class ChatService {
  async sendMessage(
    prompt: string,
    history: AssistantMessage[] = [],
  ): Promise<AssistantMessage> {
    // Simulate a delay for the AI response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple mock logic based on keywords
    let responseText =
      "I'm your Shiftly AI Assistant. How can I help you today?";

    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      responseText =
        "Hello! I'm here to help you find shifts or manage your workforce. What do you need assistance with?";
    } else if (
      lowerPrompt.includes('find a job') ||
      lowerPrompt.includes('shift')
    ) {
      responseText =
        'I can certainly help you find shifts! Are you looking for a specific type of work (e.g., warehousing, retail, hospitality) or a particular location?';
    } else if (
      lowerPrompt.includes('payment') ||
      lowerPrompt.includes('wallet') ||
      lowerPrompt.includes('money')
    ) {
      responseText =
        'Your payments are handled securely via our Wallet system. When you complete a shift, funds are released from Escrow to your wallet. You can view this on the Wallet page.';
    }

    return {
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    };
  }
}

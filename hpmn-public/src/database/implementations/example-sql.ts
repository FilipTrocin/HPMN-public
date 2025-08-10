import { RelationalDatabaseClient, Message, Action, Memory } from '../interfaces';

export class ExampleSQLClient implements RelationalDatabaseClient {
  constructor(private config: { url: string; apiKey?: string }) {}

  async getMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    // Implement using your SQL client
    return [];
  }

  async getFirstMessage(conversationId: string): Promise<Message | null> {
    return null;
  }

  async createMessage(message: Partial<Message>): Promise<Message> {
    return {
      id: 'msg-1',
      conversation_id: message.conversation_id!,
      question: message.question!,
      answer: message.answer!,
      name: message.name || '',
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  async deleteInactiveConversations(daysInactive: number): Promise<void> {
    // Implement archival/deletion logic
  }

  async getActions(): Promise<Action[]> {
    return [];
  }

  async getAction(id: string): Promise<Action | null> {
    return null;
  }

  async createAction(action: Partial<Action>): Promise<Action> {
    return {
      id: action.id || 'action-1',
      name: action.name || '',
      content: action.content || '{}',
      url: action.url || '',
      tags: action.tags || [],
      active: true,
      category: action.category || 'default'
    };
  }

  async getMemories(): Promise<Memory[]> {
    return [];
  }

  async createMemory(memory: Partial<Memory>): Promise<Memory> {
    return {
      id: memory.id || 'mem-1',
      title: memory.title || '',
      content: memory.content || '',
      tags: memory.tags || [],
      active: true,
      created_at: new Date()
    };
  }
}

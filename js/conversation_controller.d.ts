import Conversation from './models/conversations';

export interface ConversationController {
  load(): Promise<void>;
  get(id: string): Conversation | undefined;
  getUnsafe(id: string): Conversation | undefined;
  getOrCreate(id: string, type: Conversation.Type): Conversation;
  getOrCreateAndWait(
    id: string,
    type: Conversation.Type
  ): Promise<Conversation>;
  deleteContact(id: string): Promise<void>;
  reset(): void;
}

export default ConversationController;

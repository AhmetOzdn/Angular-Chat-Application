import { MessageModel } from "./messageModel";

export interface ChatModel {
    id: string;
    userId: string;
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    userConnectionId: string;
    chatId: number;
    chatName: string;
    chatDescription: string;
    chatMessages: MessageModel[];
    createdDate: string; 
    updatedDate: string | null;
    deletedDate: string | null;
}

export interface ChatResponseModel {
    items: ChatModel[];
  }
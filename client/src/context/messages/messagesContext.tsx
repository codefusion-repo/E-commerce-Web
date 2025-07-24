"use client";
// messagesContext.tsx

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { MessageType } from "../../interfaces/messages/messagesInterface";

// Crear interface para MessagesContextType
interface MessagesContextType {
  messages: MessageType[];

  addMessage: (newMessage: string) => void;
  removeMessage: (id: number) => void;
}

// Crear MessagesContext
const MessagesContext = createContext<MessagesContextType | null>(null);

// Exportar MessagesProvider
export const MessagesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<MessageType[]>([]);

  const addMessage = (newMessage: string) => {
    const updatedMessages: MessageType[] = [];
    let isMessageInside: boolean = false;

    messages.forEach((message) => {
      if (message.text === newMessage) {
        isMessageInside = true;
      }

      updatedMessages.push(message);
    });

    if (isMessageInside === false) {
      const newMessageType: MessageType = {
        id: Date.now(),
        text: newMessage,
        countdown: 20,
      };

      updatedMessages.push(newMessageType);
    }

    setMessages(updatedMessages);
  };

  const removeMessage = (id: number) => {
    const updatedMessages: MessageType[] = [];
    messages.forEach((message) => {
      if (message.id !== id) {
        updatedMessages.push(message);
      }
    });

    setMessages(updatedMessages);
  };

  const updateCountdown = () => {
    const updatedMessages: MessageType[] = [];
    messages.forEach((message) => {
      if (message.countdown > 0) {
        updatedMessages.push({ ...message, countdown: message.countdown - 1 });
      }
    });

    setMessages(updatedMessages);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const intervalId = setInterval(updateCountdown, 1000);
      return () => clearInterval(intervalId);
    }
  }, [messages]);

  return (
    <MessagesContext.Provider
      value={{
        messages,

        addMessage,
        removeMessage,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

// Exportar useMessages para usar las variables de MessagesContext
export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }

  return context;
};

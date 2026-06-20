"use client";
// messagesContext.tsx

import React, {
  ReactNode,
  createContext,
  useCallback,
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

  const addMessage = useCallback((newMessage: string) => {
    setMessages((currentMessages) => {
      const isMessageInside = currentMessages.some(
        (message) => message.text === newMessage
      );

      if (isMessageInside) {
        return currentMessages;
      }

      return [
        ...currentMessages,
        {
          id: Date.now(),
          text: newMessage,
          countdown: 20,
        },
      ];
    });
  }, []);

  const removeMessage = useCallback((id: number) => {
    setMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== id)
    );
  }, []);

  const updateCountdown = useCallback(() => {
    setMessages((currentMessages) =>
      currentMessages
        .filter((message) => message.countdown > 0)
        .map((message) => ({ ...message, countdown: message.countdown - 1 }))
    );
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const intervalId = setInterval(updateCountdown, 1000);
      return () => clearInterval(intervalId);
    }
  }, [messages.length, updateCountdown]);

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

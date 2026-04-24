import React, { createContext, useState, useContext, useCallback } from 'react';
import { chatService } from '../services/api';

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Load all chats
  const loadChats = useCallback(async () => {
    try {
      const res = await chatService.getChats();
      setChats(res.data.chats || []);
    } catch {
      setError('Failed to load chats');
    }
  }, []);

  // 🔹 Load single chat
  const loadChat = async (chatId) => {
    try {
      setLoading(true);
      const res = await chatService.getChat(chatId);

      setActiveChat(res.data.chat);
      setMessages(res.data.messages || []);
      setError(null);
    } catch {
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create new chat
  const createChat = async (provider, model) => {
    try {
      setLoading(true);

      const res = await chatService.createChat(provider, model);
      const newChat = res.data.chat;

      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setMessages([]);
      setError(null);

      return newChat;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create chat';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Send message (improved)
  const sendMessage = async (content) => {
    if (!activeChat) return;

    const tempId = Date.now();

    // Optimistic UI
    const userMsg = {
      id: tempId,
      role: 'user',
      content,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatService.sendMessage(activeChat._id, content);

      const aiMsg = {
        id: tempId + 1,
        role: 'assistant',
        content: res.data.message.assistantMessage.content,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);

      // Update chat title safely
      setChats(prev =>
        prev.map(chat =>
          chat._id === activeChat._id
            ? { ...chat, title: chat.title || content.slice(0, 40) }
            : chat
        )
      );

      setError(null);
    } catch (err) {
      // rollback user message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete chat
  const deleteChat = async (chatId) => {
    try {
      await chatService.deleteChat(chatId);

      setChats(prev => prev.filter(chat => chat._id !== chatId));

      if (activeChat?._id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch {
      setError('Failed to delete chat');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        loading,
        error,
        loadChats,
        loadChat,
        createChat,
        sendMessage,
        deleteChat,
        setActiveChat,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
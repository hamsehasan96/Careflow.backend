'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { messageService, Message, Attachment } from '@/services/messageService';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface MessageWithReplies extends Message {
  replies: Message[];
  attachments: Attachment[];
}

export default function ParticipantMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({
    content: '',
    attachments: [] as File[]
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role !== 'participant') {
      router.push('/dashboard');
      return;
    }

    fetchMessages();
    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [session, status, router]);

  const setupWebSocket = () => {
    wsRef.current = messageService.connectWebSocket((message: Message) => {
      const messageWithDefaults: MessageWithReplies = {
        ...message,
        replies: message.replies || [],
        attachments: message.attachments || []
      };
      setMessages(prev => [messageWithDefaults, ...prev]);
      if (!message.isRead) {
        toast.success('New message received!');
      }
    });
  };

  const fetchMessages = async () => {
    try {
      const data = await messageService.getMessages();
      const messagesWithDefaults: MessageWithReplies[] = data.map(message => ({
        ...message,
        replies: message.replies || [],
        attachments: message.attachments || []
      }));
      setMessages(messagesWithDefaults);
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.content.trim()) return;

    try {
      setUploading(true);
      await messageService.sendMessage({
        ...newMessage,
        parentId: replyingTo || undefined
      });
      setNewMessage({ content: '', attachments: [] });
      setReplyingTo(null);
      await fetchMessages();
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewMessage(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageService.markAsRead(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (err) {
      setError('Failed to mark message as read');
    }
  };

  const handleDeleteAttachment = async (messageId: string, attachmentId: string) => {
    try {
      await messageService.deleteAttachment(messageId, attachmentId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              attachments: msg.attachments.filter(a => a.id !== attachmentId) 
            } 
          : msg
      ));
    } catch (err) {
      setError('Failed to delete attachment');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Message List */}
        <div className="md:col-span-2 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.isRead ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{message.senderName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                {!message.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(message.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
              <p className="mt-2">{message.content}</p>

              {/* Attachments */}
              {message.attachments.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Attachments:</h4>
                  <div className="space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between">
                        <a
                          href={attachment.url}
                          download={attachment.filename}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {attachment.filename}
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(message.id, attachment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Button */}
              <button
                onClick={() => setReplyingTo(message.id)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Reply
              </button>

              {/* Replies */}
              {message.replies.length > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="border-l-2 border-gray-200 pl-4">
                      <p className="font-medium">{reply.senderName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* New Message Form */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">
              {replyingTo ? 'Reply to Message' : 'New Message'}
            </h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Type your message..."
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Attach Files
                </button>
                {newMessage.attachments.length > 0 && (
                  <div className="mt-2">
                    {newMessage.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setNewMessage(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {uploading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 
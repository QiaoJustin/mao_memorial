'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MessageForm from '@/components/message/MessageForm';
import MessageWall from '@/components/message/MessageWall';

interface Message {
  id: number;
  content: string;
  nickname: string;
  createdAt: string;
  likeCount: number;
  isPinned?: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMessages(1);
  }, []);

  const fetchMessages = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/messages?page=${pageNum}&pageSize=10`);
      const data = await res.json();

      if (data.code === 200) {
        const newMessages = data.data.items || [];
        if (pageNum === 1) {
          setMessages(newMessages);
        } else {
          setMessages((prev) => [...prev, ...newMessages]);
        }
        setTotal(data.data.total || 0);
        setHasMore(newMessages.length > 0);
        setPage(pageNum);
      } else {
        setHasMore(false);
      }
    } catch {
      setMessages([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchMessages(page + 1);
  };

  const handleSubmitSuccess = () => {
    fetchMessages(1);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="pt-24 pb-12 bg-gradient-crimson">
        <div className="container-page">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">留言纪念</h1>
          <p className="text-white/80">缅怀伟人，表达敬意，留下您的心声</p>
        </div>
      </section>

      <section className="py-12 bg-bg">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <MessageForm onSubmitSuccess={handleSubmitSuccess} />
            </div>

            <div className="lg:col-span-2">
              <MessageWall
                messages={messages}
                isLoading={isLoading}
                hasMore={hasMore}
                loadMore={handleLoadMore}
                total={total}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
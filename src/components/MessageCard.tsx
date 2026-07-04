'use client';

import { useState } from 'react';
import { Heart, Calendar, MessageCircle } from 'lucide-react';

interface MessageCardProps {
  id: number;
  content: string;
  nickname: string;
  createdAt: string;
  likeCount: number;
}

export default function MessageCard({
  id,
  content,
  nickname,
  createdAt,
  likeCount,
}: MessageCardProps) {
  const [likes, setLikes] = useState(likeCount);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((prev) => prev + 1);
    try {
      await fetch(`/api/v1/messages/${id}/like`, { method: 'POST' });
    } catch {
      setLiked(false);
      setLikes((prev) => prev - 1);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
          {nickname.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-text">{nickname}</p>
          <p className="text-xs text-text-light flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {createdAt}
          </p>
        </div>
      </div>
      <p className="text-sm text-text leading-relaxed mb-4">{content}</p>
      <div className="flex items-center gap-6 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center gap-1 text-xs transition-colors ${
            liked ? 'text-primary' : 'text-text-light hover:text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {likes}
        </button>
        <span className="flex items-center gap-1 text-xs text-text-light">
          <MessageCircle className="w-4 h-4" />
          0
        </span>
      </div>
    </div>
  );
}
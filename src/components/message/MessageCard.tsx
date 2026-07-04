'use client';

import { useState } from 'react';
import { Heart, Calendar, Pin } from 'lucide-react';

interface MessageCardProps {
  id: number;
  content: string;
  nickname: string;
  createdAt: string;
  likeCount: number;
  isPinned?: boolean;
}

export default function MessageCard({
  id,
  content,
  nickname,
  createdAt,
  likeCount,
  isPinned,
}: MessageCardProps) {
  const [likes, setLikes] = useState(likeCount);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((prev) => prev + 1);
    try {
      const res = await fetch(`/api/v1/messages/${id}/like`, { method: 'POST' });
      if (res.status === 403) {
        setLiked(false);
        setLikes((prev) => prev - 1);
      }
    } catch {
      setLiked(false);
      setLikes((prev) => prev - 1);
    }
  };

  return (
    <div className={`card p-4 ${isPinned ? 'border-accent' : ''}`}>
      <div className="flex items-center gap-3 mb-3">
        {isPinned && (
          <Pin className="w-4 h-4 text-accent flex-shrink-0" />
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
          {nickname.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-medium text-text">{nickname}</p>
          <p className="text-xs text-text-light flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {createdAt}
          </p>
        </div>
        {isPinned && (
          <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
            置顶
          </span>
        )}
      </div>
      <p className="text-sm text-text leading-relaxed mb-4 whitespace-pre-wrap">{content}</p>
      <div className="flex items-center gap-6 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            liked ? 'text-primary' : 'text-text-light hover:text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

interface MessageFormProps {
  onSubmitSuccess?: () => void;
}

export default function MessageForm({ onSubmitSuccess }: MessageFormProps) {
  const [formData, setFormData] = useState({ nickname: '', content: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const maxNicknameLength = 20;
  const maxContentLength = 200;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nickname = formData.nickname.trim() || '匿名网友';
    
    if (!formData.content.trim()) {
      setErrorMessage('请填写留言内容');
      setSubmitStatus('error');
      return;
    }

    if (formData.content.length > maxContentLength) {
      setErrorMessage(`留言内容不能超过 ${maxContentLength} 字`);
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, nickname }),
      });
      const data = await res.json();

      if (data.code === 200) {
        setSubmitStatus('success');
        setFormData({ nickname: '', content: '' });
        onSubmitSuccess?.();
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else if (res.status === 429) {
        setSubmitStatus('error');
        setErrorMessage('留言过于频繁，请稍后再试');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || '提交失败');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('网络错误，请重试');
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-serif text-xl font-semibold text-text mb-4">发表留言</h2>

      {submitStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">留言已提交，审核通过后将展示</span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-2">昵称（选填）</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value.slice(0, maxNicknameLength) })}
            placeholder="默认：匿名网友"
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-text placeholder-text-light focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <p className="text-xs text-text-light mt-1 text-right">
            {formData.nickname.length}/{maxNicknameLength}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-2">留言内容</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value.slice(0, maxContentLength) })}
            placeholder="写下您对毛主席的缅怀与敬意..."
            rows={5}
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-text placeholder-text-light focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
          />
          <p className="text-xs text-text-light mt-1 text-right">
            {formData.content.length}/{maxContentLength}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitStatus !== 'idle'}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          提交留言
        </button>

        <p className="mt-3 text-xs text-text-light text-center">
          留言内容将经过审核，请文明留言
        </p>
      </form>
    </div>
  );
}
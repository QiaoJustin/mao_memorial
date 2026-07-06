'use client';

import { useState, useEffect } from 'react';

import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableToolbar } from '@/components/admin/AdminTableToolbar';
import { adminFetch } from '@/lib/admin-fetch';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface SensitiveWord {
  id: number;
  word: string;
  level: number;
  category: string;
  replacement: string;
}

export default function SensitiveWordsPage() {
  const [words, setWords] = useState<SensitiveWord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchWords, setBatchWords] = useState('');

  // P1-5: 合并“搜索变化”与“page 变化”两个 Effect 为单个 Effect（依赖 [page, searchQuery]），
  // 避免原结构中搜索变化时先 setPage(1) 再触发 page Effect 导致的两次请求；
  // 同时在 Effect 内创建 AbortController，避免快速切换搜索时旧请求覆盖新请求。
  useEffect(() => {
    // P1-5: 每次依赖变化创建新的 AbortController，用于取消上一次未完成的请求
    const controller = new AbortController();
    fetchWords(controller.signal);
    // P1-5: 清理函数：依赖变化或组件卸载时取消进行中的请求
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const fetchWords = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      let url = `/api/v1/admin/sensitive-words?page=${page}&pageSize=${pageSize}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      // P1-5: 传入 AbortSignal，使请求可被取消
      const res = await adminFetch(url, signal ? { signal } : undefined);
      const data = await res.json();
      if (data.code === 200) {
        setWords(data.data.list);
        setTotal(data.data.total);
      }
    } catch (err) {
      // P1-5: 忽略 AbortController 取消触发的错误，避免 abort 被当作真实错误处理而误清空数据
      if (err instanceof Error && err.name === 'AbortError') return;
      setWords([]);
    } finally {
      // P1-5: 被 abort 的请求不更新 loading 状态，避免旧请求的 finally 把新请求的 isLoading 重置为 false
      if (signal?.aborted) return;
      setIsLoading(false);
    }
  };

  // P1-5: 搜索回调：更新搜索词的同时重置到第一页。
  // 原结构在 Effect 内部 setPage(1) 会再次触发 page Effect 造成重复请求；
  // 改为在搜索回调中调用 setPage(1)，React 18 会对同一事件内的多次 setState 批处理，使合并后的 Effect 只触发一次。
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleAdd = async () => {
    if (!newWord.trim()) {
      alert('请输入敏感词');
      return;
    }
    try {
      const res = await adminFetch('/api/v1/admin/sensitive-words', {
        method: 'POST',
        body: JSON.stringify({ word: newWord.trim() }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setShowAddModal(false);
        setNewWord('');
        fetchWords();
      } else {
        alert(data.message || '添加失败');
      }
    } catch {}
  };

  const handleBatchAdd = async () => {
    if (!batchWords.trim()) {
      alert('请输入敏感词（每行一个）');
      return;
    }
    const wordList = batchWords.split('\n').map((w) => w.trim()).filter((w) => w);
    if (wordList.length === 0) {
      alert('请输入有效的敏感词');
      return;
    }
    try {
      const res = await adminFetch('/api/v1/admin/sensitive-words/batch', {
        method: 'POST',
        body: JSON.stringify({ words: wordList }),
      });
      if (res.ok) {
        setShowBatchModal(false);
        setBatchWords('');
        fetchWords();
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该敏感词？')) return;
    try {
      const res = await adminFetch(`/api/v1/admin/sensitive-words/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchWords();
      }
    } catch {}
  };

  return (
    <>
      <AdminTableToolbar
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        searchPlaceholder="搜索敏感词..."
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加敏感词
        </button>
        <button
          onClick={() => setShowBatchModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors"
        >
          批量导入
        </button>
      </AdminTableToolbar>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-8 text-text-light">暂无敏感词</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">敏感词</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">级别</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">分类</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">替换</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr key={word.id} className="border-b border-border hover:bg-bg transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-text font-medium">{word.word}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        word.level >= 3 ? 'bg-red-100 text-red-700' :
                        word.level === 2 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        L{word.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-light">{word.category || '-'}</td>
                    <td className="px-4 py-4 text-sm text-text-light">{word.replacement}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDelete(word.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && words.length > 0 && (
          <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">添加敏感词</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">敏感词</label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="请输入敏感词"
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors">
                取消
              </button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">批量导入敏感词</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">敏感词列表（每行一个）</label>
                <textarea
                  value={batchWords}
                  onChange={(e) => setBatchWords(e.target.value)}
                  rows={8}
                  placeholder="请输入敏感词，每行一个"
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent resize-none font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBatchModal(false)} className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors">
                取消
              </button>
              <button onClick={handleBatchAdd} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
                导入
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    );
}
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableToolbar } from '@/components/admin/AdminTableToolbar';
import { adminFetch } from '@/lib/admin-fetch';
import { Plus, Edit, Trash2, Key, CheckCircle, XCircle } from 'lucide-react';

interface Admin {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'editor';
  status: 'active' | 'locked' | 'disabled';
  lastLoginAt: string;
  loginCount: number;
  createdAt: string;
}

const roles = [
  { value: 'super_admin', label: '超级管理员', color: 'text-red-500' },
  { value: 'admin', label: '管理员', color: 'text-blue-500' },
  { value: 'editor', label: '编辑', color: 'text-gray-500' },
];

const statuses = [
  { value: 'active', label: '正常', color: 'bg-green-100 text-green-700' },
  { value: 'locked', label: '锁定', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'disabled', label: '禁用', color: 'bg-gray-100 text-gray-700' },
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<number | null>(null);
  const [newAdmin, setNewAdmin] = useState({ username: '', name: '', password: '', role: 'editor', email: '', phone: '' });
  const [newPassword, setNewPassword] = useState('');

  // P1-5: 合并“搜索变化”与“page 变化”两个 Effect 为单个 Effect（依赖 [page, searchQuery]），
  // 避免原结构中搜索变化时先 setPage(1) 再触发 page Effect 导致的两次请求；
  // 同时在 Effect 内创建 AbortController，避免快速切换搜索时旧请求覆盖新请求。
  useEffect(() => {
    // P1-5: 每次依赖变化创建新的 AbortController，用于取消上一次未完成的请求
    const controller = new AbortController();
    fetchAdmins(controller.signal);
    // P1-5: 清理函数：依赖变化或组件卸载时取消进行中的请求
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const fetchAdmins = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      let url = `/api/v1/admin/admins?page=${page}&pageSize=${pageSize}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      // P1-5: 传入 AbortSignal，使请求可被取消
      const res = await adminFetch(url, signal ? { signal } : undefined);
      const data = await res.json();
      if (data.code === 200) {
        setAdmins(data.data.list);
        setTotal(data.data.total);
      }
    } catch (err) {
      // P1-5: 忽略 AbortController 取消触发的错误，避免 abort 被当作真实错误处理而误清空数据
      if (err instanceof Error && err.name === 'AbortError') return;
      setAdmins([]);
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
    if (!newAdmin.username || !newAdmin.password || !newAdmin.name) {
      alert('请填写必填字段');
      return;
    }
    try {
      const res = await adminFetch('/api/v1/admin/admins', {
        method: 'POST',
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json();
      if (data.code === 200) {
        setShowAddModal(false);
        setNewAdmin({ username: '', name: '', password: '', role: 'editor', email: '', phone: '' });
        fetchAdmins();
      } else {
        alert(data.message || '创建失败');
      }
    } catch {}
  };

  const handleUpdate = async (id: number, data: Partial<Admin>) => {
    try {
      const res = await adminFetch(`/api/v1/admin/admins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchAdmins();
      }
    } catch {}
  };

  const handleResetPassword = async () => {
    if (!showPasswordModal || !newPassword) {
      alert('请输入新密码');
      return;
    }
    try {
      const res = await adminFetch(`/api/v1/admin/admins/${showPasswordModal}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setShowPasswordModal(null);
        setNewPassword('');
        fetchAdmins();
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该管理员？')) return;
    try {
      const res = await adminFetch(`/api/v1/admin/admins/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAdmins();
      }
    } catch {}
  };

  return (
    <AdminLayout title="管理员管理" breadcrumbs={[{ label: '管理员管理' }]}>
      <AdminTableToolbar
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        searchPlaceholder="搜索用户名、姓名或邮箱..."
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增管理员
        </button>
      </AdminTableToolbar>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">用户名</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">姓名</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">角色</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">登录次数</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-text-light">暂无数据</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border hover:bg-bg transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {admin.username.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{admin.username}</p>
                        <p className="text-xs text-text-light">{admin.email || '无邮箱'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text">{admin.name}</td>
                  <td className="px-4 py-4">
                    {roles.map((role) => role.value === admin.role && (
                      <span key={role.value} className={`text-sm font-medium ${role.color}`}>
                        {role.label}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-4">
                    {statuses.map((status) => status.value === admin.status && (
                      <span key={status.value} className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${status.color}`}>
                        {status.value === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {status.label}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light">{admin.loginCount}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPasswordModal(admin.id)}
                        className="p-2 text-text-light hover:text-blue-500 transition-colors"
                        title="重置密码"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdate(admin.id, { status: admin.status === 'active' ? 'disabled' : 'active' })}
                        className="p-2 text-text-light hover:text-accent transition-colors"
                        title={admin.status === 'active' ? '禁用' : '启用'}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && admins.length > 0 && (
          <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">新增管理员</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">用户名 *</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">姓名 *</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">密码 *</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">角色</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as Admin['role'] })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors">
                取消
              </button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">重置密码</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码"
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPasswordModal(null)} className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors">
                取消
              </button>
              <button onClick={handleResetPassword} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableToolbar } from '@/components/admin/AdminTableToolbar';
import { adminFetch } from '@/lib/admin-fetch';
import { Plus, Edit, Trash2, Key, CheckCircle, XCircle, User } from 'lucide-react';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<number | null>(null);
  const [newAdmin, setNewAdmin] = useState({ username: '', name: '', password: '', role: 'editor' as Admin['role'], email: '', phone: '' });
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchAdmins(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const fetchAdmins = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      let url = `/api/v1/admin/admins?page=${page}&pageSize=${pageSize}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await adminFetch(url, signal ? { signal } : undefined);
      const data = await res.json();
      if (data.code === 200) {
        setAdmins(data.data.list);
        setTotal(data.data.total);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setAdmins([]);
    } finally {
      if (signal?.aborted) return;
      setIsLoading(false);
    }
  };

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

  const handleEdit = async () => {
    if (!editAdmin) return;
    if (!editAdmin.name) {
      alert('请填写姓名');
      return;
    }
    try {
      const res = await adminFetch(`/api/v1/admin/admins/${editAdmin.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editAdmin.name,
          email: editAdmin.email,
          phone: editAdmin.phone,
          role: editAdmin.role,
          status: editAdmin.status,
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setShowEditModal(false);
        setEditAdmin(null);
        fetchAdmins();
      } else {
        alert(data.message || '更新失败');
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

  const openEditModal = (admin: Admin) => {
    setEditAdmin(admin);
    setShowEditModal(true);
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
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">邮箱</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">角色</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">登录次数</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-text-light">暂无数据</td>
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
                        <p className="text-xs text-text-light">{admin.phone || '无电话'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text">{admin.name}</td>
                  <td className="px-4 py-4 text-sm text-text-light">{admin.email || '无邮箱'}</td>
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
                        onClick={() => openEditModal(admin)}
                        className="p-2 text-text-light hover:text-accent transition-colors"
                        title="编辑信息"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors"
                        title="删除"
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
                <label className="block text-sm font-medium text-text mb-2">邮箱</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                  placeholder="可选"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">电话</label>
                <input
                  type="tel"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                  placeholder="可选"
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

      {showEditModal && editAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">编辑管理员</h3>
                <p className="text-sm text-text-light">用户名: {editAdmin.username}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">姓名 *</label>
                <input
                  type="text"
                  value={editAdmin.name}
                  onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">邮箱</label>
                <input
                  type="email"
                  value={editAdmin.email || ''}
                  onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                  placeholder="可选"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">电话</label>
                <input
                  type="tel"
                  value={editAdmin.phone || ''}
                  onChange={(e) => setEditAdmin({ ...editAdmin, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                  placeholder="可选"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">角色</label>
                <select
                  value={editAdmin.role}
                  onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value as Admin['role'] })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">状态</label>
                <select
                  value={editAdmin.status}
                  onChange={(e) => setEditAdmin({ ...editAdmin, status: e.target.value as Admin['status'] })}
                  className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowEditModal(false); setEditAdmin(null); }} className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors">
                取消
              </button>
              <button onClick={handleEdit} className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
                保存修改
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
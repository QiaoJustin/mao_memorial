'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, Globe, Shield, Mail, Palette } from 'lucide-react';

interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string;
}

const categoryIcons: Record<string, typeof Globe> = {
  general: Globe,
  security: Shield,
  email: Mail,
  appearance: Palette,
};

const categoryLabels: Record<string, string> = {
  general: '通用设置',
  security: '安全设置',
  email: '邮件设置',
  appearance: '外观设置',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, Setting[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/v1/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 200) {
        setSettings(data.data);
      }
    } catch {
      setSettings({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (key: string, value: string, type: string) => {
    setSavingKey(key);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value, type }),
      });
      if (res.ok) {
        fetchSettings();
      }
    } catch {}
    setSavingKey(null);
  };

  const renderInput = (setting: Setting) => {
    const handleChange = (value: string) => {
      handleSave(setting.key, value, setting.type);
    };

    switch (setting.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value === 'true'}
              onChange={(e) => handleChange(e.target.checked ? 'true' : 'false')}
              className="rounded"
            />
            <span className="text-sm text-text-light">
              {setting.value === 'true' ? '开启' : '关闭'}
            </span>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
          />
        );
      case 'json':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent resize-none font-mono text-sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
          />
        );
    }
  };

  return (
    <AdminLayout title="系统设置" breadcrumbs={[{ label: '系统设置' }]}>
      {isLoading ? (
        <div className="card p-6">
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      ) : Object.keys(settings).length === 0 ? (
        <div className="card p-6">
          <p className="text-text-light text-center py-8">暂无设置项</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(settings).map(([category, categorySettings]) => {
            const Icon = categoryIcons[category] || Globe;
            return (
              <div key={category} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="w-6 h-6 text-accent" />
                  <h3 className="text-lg font-semibold text-text">{categoryLabels[category] || category}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorySettings.map((setting) => (
                    <div key={setting.key}>
                      <label className="block text-sm font-medium text-text mb-2">
                        {setting.description || setting.key}
                      </label>
                      {renderInput(setting)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
'use client';

import { useState, useEffect } from 'react';

import { adminFetch } from '@/lib/admin-fetch';
import { Globe, Shield, Mail, Palette, Cloud } from 'lucide-react';

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
  storage: Cloud,
};

const categoryLabels: Record<string, string> = {
  general: '通用设置',
  security: '安全设置',
  email: '邮件设置',
  appearance: '外观设置',
  storage: '对象存储(OSS)',
};

const ossSettingKeys = [
  { key: 'oss_type', label: '存储类型', description: '选择存储服务类型', type: 'string' as const },
  { key: 'oss_aliyun_access_key_id', label: '阿里云 AccessKey ID', description: '阿里云OSS AccessKey ID', type: 'string' as const },
  { key: 'oss_aliyun_access_key_secret', label: '阿里云 AccessKey Secret', description: '阿里云OSS AccessKey Secret', type: 'string' as const },
  { key: 'oss_aliyun_bucket', label: '阿里云 Bucket 名称', description: '阿里云OSS Bucket名称', type: 'string' as const },
  { key: 'oss_aliyun_region', label: '阿里云 Region', description: '阿里云OSS区域（如 oss-cn-hangzhou）', type: 'string' as const },
  { key: 'oss_aliyun_domain', label: '阿里云 CDN 域名', description: '阿里云OSS自定义域名或CDN域名', type: 'string' as const },
  { key: 'oss_qiniu_access_key', label: '七牛 AccessKey', description: '七牛云AccessKey', type: 'string' as const },
  { key: 'oss_qiniu_secret_key', label: '七牛 SecretKey', description: '七牛云SecretKey', type: 'string' as const },
  { key: 'oss_qiniu_bucket', label: '七牛 Bucket 名称', description: '七牛云Bucket名称', type: 'string' as const },
  { key: 'oss_qiniu_domain', label: '七牛 CDN 域名', description: '七牛云自定义域名或CDN域名', type: 'string' as const },
];

const ossTypeOptions = [
  { value: 'local', label: '本地存储' },
  { value: 'aliyun', label: '阿里云 OSS' },
  { value: 'qiniu', label: '七牛云' },
];

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
      const res = await adminFetch('/api/v1/admin/settings');
      const data = await res.json();
      if (data.code === 200) {
        setSettings(data.data);
      }
    } catch (err: unknown) {
      // AbortError 是 cleanup 触发的正常行为，忽略
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('加载设置失败:', err);
      setSettings({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (key: string, value: string, type: string, category: string = 'general', description?: string) => {
    setSavingKey(key);
    try {
      const body: Record<string, unknown> = { value, type, category };
      if (description) body.description = description;
      const res = await adminFetch(`/api/v1/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchSettings();
      }
    } catch {}
    setSavingKey(null);
  };

  const getSettingValue = (key: string) => {
    for (const categorySettings of Object.values(settings)) {
      const setting = categorySettings.find((s) => s.key === key);
      if (setting) return setting.value;
    }
    return '';
  };

  const renderInput = (setting: Setting) => {
    const handleChange = (value: string) => {
      handleSave(setting.key, value, setting.type, setting.category);
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

  const renderOssSetting = (setting: typeof ossSettingKeys[0]) => {
    const value = getSettingValue(setting.key);
    const isSaving = savingKey === setting.key;
    
    if (setting.key === 'oss_type') {
      return (
        <div key={setting.key}>
          <label className="block text-sm font-medium text-text mb-2">
            {setting.label}
          </label>
          <select
            value={value || 'local'}
            onChange={(e) => handleSave(setting.key, e.target.value, setting.type, 'storage', setting.description)}
            disabled={isSaving}
            className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
          >
            {ossTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    const currentOssType = getSettingValue('oss_type') || 'local';
    const isAliyunSetting = setting.key.startsWith('oss_aliyun');
    const isQiniuSetting = setting.key.startsWith('oss_qiniu');
    
    const showSetting = (currentOssType === 'aliyun' && isAliyunSetting) ||
                        (currentOssType === 'qiniu' && isQiniuSetting);

    if (!showSetting) {
      return null;
    }

    const isSecret = setting.key.includes('secret');

    return (
      <div key={setting.key}>
        <label className="block text-sm font-medium text-text mb-2">
          {setting.label}
        </label>
        <input
          type={isSecret ? 'password' : 'text'}
          value={value}
          onChange={(e) => handleSave(setting.key, e.target.value, setting.type, 'storage', setting.description)}
          disabled={isSaving}
          className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent font-mono text-sm"
          placeholder={setting.description}
        />
      </div>
    );
  };

  return (
    <>
      {isLoading ? (
        <div className="card p-6">
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Cloud className="w-6 h-6 text-accent" />
              <h3 className="text-lg font-semibold text-text">对象存储(OSS)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ossSettingKeys.map(renderOssSetting)}
            </div>
          </div>

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
    </>
    );
}
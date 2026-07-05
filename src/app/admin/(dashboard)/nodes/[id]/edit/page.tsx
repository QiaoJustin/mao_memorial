'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NodeForm, { NodeFormData } from '@/components/admin/NodeForm';
import { adminFetch } from '@/lib/admin-fetch';

interface Era {
  id: string;
  name: string;
}

export default function EditNodePage() {
  const params = useParams();
  const id = params.id as string;
  const [eras, setEras] = useState<Era[]>([]);
  const [initialData, setInitialData] = useState<NodeFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/eras', { cache: 'force-cache' }).then(r => r.json()),
      adminFetch(`/api/v1/admin/nodes/${id}`).then(r => r.json()),
    ])
      .then(([erasData, nodeData]) => {
        setEras(erasData.data || []);
        if (nodeData.code === 200) setInitialData(nodeData.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <NodeForm
      key={initialData ? 'loaded' : 'loading'}
      mode="edit"
      nodeId={id}
      eras={eras}
      initialData={initialData || undefined}
      isLoading={isLoading}
    />
  );
}

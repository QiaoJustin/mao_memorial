'use client';

import { useState, useEffect } from 'react';
import NodeForm from '@/components/admin/NodeForm';

interface Era {
  id: string;
  name: string;
}

export default function NewNodePage() {
  const [eras, setEras] = useState<Era[]>([]);

  useEffect(() => {
    fetch('/api/v1/eras', { cache: 'force-cache' })
      .then(r => r.json())
      .then(d => setEras(d.data || []))
      .catch(() => setEras([]));
  }, []);

  return <NodeForm mode="create" eras={eras} />;
}

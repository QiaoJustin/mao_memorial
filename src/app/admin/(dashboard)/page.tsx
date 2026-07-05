import { redirect } from 'next/navigation';

// P2-14: 服务端 redirect，避免客户端 useEffect 跳转的闪烁
export default function AdminPage() {
  redirect('/admin/dashboard');
}
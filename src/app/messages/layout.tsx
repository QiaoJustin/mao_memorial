import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '留言纪念',
  description: '缅怀伟人，表达敬意，留下您的心声，与广大网友共同缅怀毛泽东主席',
  openGraph: {
    title: '留言纪念 - 毛主席生平纪念网站',
    description: '缅怀伟人，表达敬意，留下您的心声，与广大网友共同缅怀毛泽东主席',
  },
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
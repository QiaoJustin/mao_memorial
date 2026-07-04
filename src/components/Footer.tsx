import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg-dark border-t border-border">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-bg font-serif font-bold text-lg">
                毛
              </div>
              <span className="font-serif text-lg font-semibold text-text">
                毛主席生平纪念
              </span>
            </div>
            <p className="text-sm text-text-light leading-relaxed">
              以珍贵历史照片为载体，缅怀毛泽东主席波澜壮阔的一生，传承红色革命精神。
            </p>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-text mb-4">快速导航</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-text-light hover:text-accent transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="text-sm text-text-light hover:text-accent transition-colors">
                  时间轴
                </Link>
              </li>
              <li>
                <Link href="/photos" className="text-sm text-text-light hover:text-accent transition-colors">
                  照片画廊
                </Link>
              </li>
              <li>
                <Link href="/messages" className="text-sm text-text-light hover:text-accent transition-colors">
                  留言纪念
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-text mb-4">关于我们</h3>
            <ul className="space-y-2">
              <li className="text-sm text-text-light">
                纪念毛泽东同志诞辰
              </li>
              <li className="text-sm text-text-light">
                传承红色文化基因
              </li>
              <li className="text-sm text-text-light">
                弘扬革命精神
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-xs text-text-light">
            © 2024 毛主席生平纪念网站 · 缅怀伟人 · 传承精神
          </p>
        </div>
      </div>
    </footer>
  );
}
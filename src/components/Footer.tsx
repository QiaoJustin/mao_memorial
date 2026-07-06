import Link from 'next/link';
import { NAV_ITEMS, SITE_NAME, FOOTER_DESCRIPTION, FOOTER_ABOUT_ITEMS } from '@/constants/navigation';

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
                {SITE_NAME}
              </span>
            </div>
            <p className="text-sm text-text-light leading-relaxed">
              {FOOTER_DESCRIPTION}
            </p>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-text mb-4">快速导航</h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-text-light hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-text mb-4">关于我们</h3>
            <ul className="space-y-2">
              {FOOTER_ABOUT_ITEMS.map((item, index) => (
                <li key={index} className="text-sm text-text-light">
                  {item}
                </li>
              ))}
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
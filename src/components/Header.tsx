'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS, SITE_NAME } from '@/constants/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-bg font-serif font-bold text-lg">
              毛
            </div>
            <span className={`font-serif text-lg font-semibold transition-colors ${isScrolled ? 'text-text' : 'text-white'}`}>
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`${item.label}导航链接`}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isScrolled ? 'text-text' : 'text-white/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            className={`md:hidden p-2 transition-colors ${
              isScrolled ? 'text-text' : 'text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-full left-0 right-0 transition-all ${isScrolled ? 'glass' : 'bg-bg/95 backdrop-blur-md'}`}>
          <nav className="container-page py-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  isScrolled ? 'text-text hover:bg-surface' : 'text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

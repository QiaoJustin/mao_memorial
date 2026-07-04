import type { Config } from 'tailwindcss';

// Tailwind CSS 配置：自定义红金主题色板、字体系统、动画
// 颜色系统遵循 docs/07 §1.2 色彩系统规范
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色调：深红 + 金色（红色文化主题）
        primary: {
          DEFAULT: '#8B0000',
          dark: '#5C0000',
          light: '#B22222',
        },
        accent: {
          DEFAULT: '#D4AF37',
          light: '#F0D060',
        },

        // 年代主题色（6 个年代对应 6 种颜色）
        era: {
          youth: '#4A7C59', // 求学探索 - 墨绿
          revolution: '#8B0000', // 革命征程 - 深红
          yanan: '#C17A3A', // 延安岁月 - 土黄
          liberation: '#B8860B', // 解放战争 - 深金
          founding: '#D4AF37', // 建国初期 - 金色
          construction: '#2F4F4F', // 社会主义建设 - 深灰
        },

        // 中性色
        bg: {
          DEFAULT: '#FAFAF7', // 米白背景
          dark: '#1A1A1A', // 深色背景
        },
        surface: '#FFFFFF', // 卡片背景
        text: {
          DEFAULT: '#2C2C2C', // 主文字
          secondary: '#666666', // 次要文字
          light: '#999999', // 辅助文字
        },
        border: '#E5E5E5',

        // 功能色
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#FF4D4F',
        info: '#1890FF',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"SimSun"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        '5xl': ['3rem', { lineHeight: '1' }], // 48px
        '6xl': ['4rem', { lineHeight: '1' }], // 64px
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.15)',
        '2xl': '0 25px 50px rgba(0,0,0,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(212, 175, 55, 0.6)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(212, 175, 55, 0.9)' },
        },
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};

export default config;

/* eslint-disable no-console */
// 统一日志工具
// 客户端：生产环境仅输出 error，开发环境输出全部
// 服务端：使用 console（可通过 LOG_LEVEL 环境变量控制）

const isProduction = process.env.NODE_ENV === 'production';
const isServer = typeof window === 'undefined';

type LogFn = (message: string, ...args: unknown[]) => void;

interface Logger {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  debug: LogFn;
}

function createServerLogger(): Logger {
  const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  const levels: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 };
  const minLevel = levels[logLevel] ?? 1;

  const prefix = (level: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return `${now} [${level.toUpperCase()}]`;
  };

  return {
    debug: (msg, ...args) => {
      if (minLevel <= 0) console.debug(prefix('DEBUG'), msg, ...args);
    },
    info: (msg, ...args) => {
      if (minLevel <= 1) console.log(prefix('INFO'), msg, ...args);
    },
    warn: (msg, ...args) => {
      if (minLevel <= 2) console.warn(prefix('WARN'), msg, ...args);
    },
    error: (msg, ...args) => {
      console.error(prefix('ERROR'), msg, ...args);
    },
  };
}

function createClientLogger(): Logger {
  return {
    info: (...args: unknown[]) => {
      if (!isProduction) console.log(...args);
    },
    warn: (...args: unknown[]) => {
      if (!isProduction) console.warn(...args);
    },
    error: (...args: unknown[]) => {
      console.error(...args);
    },
    debug: (...args: unknown[]) => {
      if (!isProduction) console.debug(...args);
    },
  };
}

export const logger: Logger = isServer ? createServerLogger() : createClientLogger();
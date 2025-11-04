// src/utils/logger.ts
// 统一的日志工具，类似 Vue DevTools 的样式

/**
 * 日志分类和颜色定义
 */
const LOG_STYLES = {
  // 🔵 流程类 - 主要步骤
  process: {
    color: '#42b983',
    bg: '#f0f9ff',
    icon: '⚙️',
  },
  // 🟢 成功类
  success: {
    color: '#52c41a',
    bg: '#f6ffed',
    icon: '✅',
  },
  // 🟣 数据类 - 数据展示
  data: {
    color: '#722ed1',
    bg: '#f9f0ff',
    icon: '📦',
  },
  // 🟡 警告类
  warning: {
    color: '#faad14',
    bg: '#fffbe6',
    icon: '⚠️',
  },
  // 🔴 错误类
  error: {
    color: '#f5222d',
    bg: '#fff1f0',
    icon: '❌',
  },
  // ⚪️ 调试类 - 详细信息
  debug: {
    color: '#8c8c8c',
    bg: '#fafafa',
    icon: '🔍',
  },
  // 🔵 信息类
  info: {
    color: '#1890ff',
    bg: '#e6f7ff',
    icon: 'ℹ️',
  },
} as const;

type LogType = keyof typeof LOG_STYLES;

/**
 * 创建彩色日志
 */
function createLogger(namespace: string) {
  const log = (type: LogType, message: string, data?: unknown) => {
    const style = LOG_STYLES[type];
    const labelStyle = `
      color: ${style.color};
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 3px;
      background: ${style.bg};
    `;
    
    const messageStyle = `
      color: ${style.color};
      font-weight: 500;
    `;

    if (data !== undefined) {
      // 如果有数据，使用分组显示
      console.groupCollapsed(
        `%c${style.icon} [${namespace}]%c ${message}`,
        labelStyle,
        messageStyle
      );
      console.log(data);
      console.groupEnd();
    } else {
      console.log(
        `%c${style.icon} [${namespace}]%c ${message}`,
        labelStyle,
        messageStyle
      );
    }
  };

  // 分隔线
  const separator = (title?: string) => {
    if (title) {
      console.log(
        `%c━━━━━━━━ ${title} ━━━━━━━━`,
        'color: #d9d9d9; font-weight: bold;'
      );
    } else {
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d9d9d9;');
    }
  };

  return {
    process: (msg: string, data?: unknown) => log('process', msg, data),
    success: (msg: string, data?: unknown) => log('success', msg, data),
    data: (msg: string, data?: unknown) => log('data', msg, data),
    warning: (msg: string, data?: unknown) => log('warning', msg, data),
    error: (msg: string, data?: unknown) => log('error', msg, data),
    debug: (msg: string, data?: unknown) => log('debug', msg, data),
    info: (msg: string, data?: unknown) => log('info', msg, data),
    separator,
  };
}

// 导出各个模块的 logger
export const workerLogger = createLogger('Worker');
export const previewLogger = createLogger('Preview');
export const hookLogger = createLogger('Hook');
export const autoRenderLogger = createLogger('AutoRender');


// 簡單的日誌工具
class Logger {
  constructor() {
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m'
    };
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      formatted += '\n' + JSON.stringify(data, null, 2);
    }
    
    return formatted;
  }

  info(message, data = null) {
    const formatted = this.formatMessage('INFO', message, data);
    console.log(`${this.colors.cyan}${formatted}${this.colors.reset}`);
  }

  success(message, data = null) {
    const formatted = this.formatMessage('SUCCESS', message, data);
    console.log(`${this.colors.green}${formatted}${this.colors.reset}`);
  }

  warn(message, data = null) {
    const formatted = this.formatMessage('WARN', message, data);
    console.warn(`${this.colors.yellow}${formatted}${this.colors.reset}`);
  }

  error(message, data = null) {
    const formatted = this.formatMessage('ERROR', message, data);
    console.error(`${this.colors.red}${formatted}${this.colors.reset}`);
    
    // 在生產環境中，可以將錯誤發送到監控服務
    if (process.env.NODE_ENV === 'production') {
      // TODO: 發送到錯誤監控服務（如 Sentry）
    }
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV !== 'production') {
      const formatted = this.formatMessage('DEBUG', message, data);
      console.log(`${this.colors.blue}${formatted}${this.colors.reset}`);
    }
  }
}

module.exports = new Logger();

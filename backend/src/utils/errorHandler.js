const logger = require('./logger');

/**
 * 全域錯誤處理中間件
 */
function errorHandler(err, req, res, next) {
  // 記錄錯誤
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // 判斷錯誤類型
  let statusCode = err.statusCode || 500;
  let message = err.message || '伺服器內部錯誤';

  // 針對不同錯誤類型返回適當的訊息
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 403;
    message = '權限不足';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = '找不到資源';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = err.message;
  }

  // 在生產環境中不暴露詳細錯誤資訊
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = '系統暫時無法處理，請稍後再試';
  }

  // 返回錯誤回應
  res.status(statusCode).json({
    error: err.name || 'Error',
    message: message,
    ...(err.field && { field: err.field })
  });
}

/**
 * 建立自定義錯誤
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(message = '找不到資源') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message = '權限不足') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 403;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

module.exports = errorHandler;
module.exports.ValidationError = ValidationError;
module.exports.NotFoundError = NotFoundError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.ConflictError = ConflictError;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// 載入環境變數
dotenv.config();

// 載入路由
const divinationRoutes = require('./routes/divination');

// 載入工具
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');

// 建立 Express 應用
const app = express();
const PORT = process.env.PORT || 3000;

// CORS 設定
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
};

// 中間件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 10, // 限制 10 次請求
  message: {
    error: 'Too many requests',
    message: '請求過於頻繁，請稍後再試'
  }
});

app.use('/api/', limiter);

// 日誌中間件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API 路由
app.use('/api/divination', divinationRoutes);

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: '找不到此路徑'
  });
});

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

// 處理未捕獲的異常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

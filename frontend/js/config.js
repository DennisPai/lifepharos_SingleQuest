// LIFF 應用配置
const CONFIG = {
  // LIFF ID（從 line_LIFF.md）
  LIFF_ID: '2008987238-9DfMVogB',
  
  // 後端 API Base URL（部署後更新）
  API_BASE_URL: 'https://your-backend.zeabur.app', // TODO: 部署後更新
  
  // 問題長度限制
  MAX_QUESTION_LENGTH: 30,
  
  // 數字選擇數量
  REQUIRED_NUMBERS_COUNT: 5,
  
  // 數字範圍
  NUMBER_RANGE: {
    min: 1,
    max: 32
  },
  
  // API Endpoints
  API_ENDPOINTS: {
    CHECK: '/api/divination/check',
    SUBMIT: '/api/divination/submit'
  },
  
  // 紅棋列表
  RED_PIECES: ['帥', '仕', '相', '俥', '傌', '炮', '兵'],
  
  // 黑棋列表
  BLACK_PIECES: ['將', '士', '象', '車', '馬', '包', '卒']
};

// 如果是開發環境，可以使用本地 API
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  CONFIG.API_BASE_URL = 'http://localhost:3000';
}

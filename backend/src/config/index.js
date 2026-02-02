// 配置管理模組
module.exports = {
  // Server 配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // LINE Bot 配置（主帳號）
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
  },

  // ImgBB API 配置
  imgbb: {
    apiKey: process.env.IMGBB_API_KEY
  },

  // n8n Webhook 配置
  n8n: {
    baseUrl: process.env.N8N_WEBHOOK_BASE_URL,
    getBoardPath: process.env.N8N_GET_BOARD_PATH || '/webhook/get-board',
    updateBoardPath: process.env.N8N_UPDATE_BOARD_PATH || '/webhook/update-board'
  },

  // 管理員通知配置（助手帳）
  admin: {
    lineToken: process.env.ADMIN_LINE_BOT_TOKEN,
    groupId: process.env.ADMIN_GROUP_ID
  },

  // CORS 配置
  cors: {
    frontendUrl: process.env.FRONTEND_URL
  },

  // Google Sheets 配置
  sheets: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID
  },

  // 業務規則配置
  business: {
    maxQuestionLength: 30,
    requiredNumbersCount: 5,
    numberRange: {
      min: 1,
      max: 32
    },
    redPieces: ['帥', '仕', '相', '俥', '傌', '炮', '兵'],
    blackPieces: ['將', '士', '象', '車', '馬', '包', '卒']
  }
};

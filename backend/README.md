# 後端 API

## 說明

這是象棋卜卦 LIFF 應用的後端 API，使用 Node.js + Express 開發。

## 安裝依賴

```bash
npm install
```

## 環境變數設定

複製 `.env.example` 為 `.env`，並填入實際的值：

```bash
cp .env.example .env
```

必要的環境變數：
- `LINE_CHANNEL_ACCESS_TOKEN` - LINE 主帳號 Access Token
- `IMGBB_API_KEY` - ImgBB API Key
- `N8N_WEBHOOK_BASE_URL` - n8n Webhook Base URL

## 啟動服務

### 開發環境

```bash
npm run dev
```

### 生產環境

```bash
npm start
```

## API 端點

### 健康檢查

```
GET /health
```

### 檢查棋盤狀態

```
GET /api/divination/check?taskId={taskId}&userId={userId}
```

### 提交抽卦

```
POST /api/divination/submit
Content-Type: application/json

{
  "taskId": "ID1768651944450563",
  "userId": "Uabc...",
  "question": "問題",
  "selectedNumbers": [9, 19, 21, 23, 32]
}
```

詳細 API 文檔請參考 [../docs/API.md](../docs/API.md)

## 專案結構

```
backend/
├── src/
│   ├── index.js              # 入口文件
│   ├── config/
│   │   └── index.js          # 配置管理
│   ├── routes/
│   │   └── divination.js     # 卜卦路由
│   ├── services/
│   │   ├── imageGenerator.js # 圖片生成服務
│   │   ├── imgbbUploader.js  # ImgBB 上傳服務
│   │   ├── lineBot.js        # LINE Bot 服務
│   │   └── n8nClient.js      # n8n 客戶端
│   ├── utils/
│   │   ├── validator.js      # 資料驗證
│   │   ├── errorHandler.js   # 錯誤處理
│   │   └── logger.js         # 日誌記錄
│   └── middleware/           # 中間件（未來擴展）
├── package.json
├── .env.example
└── README.md
```

## 部署到 Zeabur

1. 在 Zeabur 專案中新增服務
2. 從 GitHub 匯入 repository
3. **重要**：設定 Root Directory = `/backend`
4. 選擇 Node.js 環境
5. 設定環境變數（從 `.env.example` 複製）
6. 部署

部署完成後：
1. 記錄 backend URL
2. 更新前端 `config.js` 中的 `API_BASE_URL`

## 測試

使用 Postman 或 curl 測試：

```bash
# 健康檢查
curl http://localhost:3000/health

# 檢查棋盤狀態
curl "http://localhost:3000/api/divination/check?taskId=TEST_123&userId=Utest"

# 提交抽卦
curl -X POST http://localhost:3000/api/divination/submit \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TEST_123",
    "userId": "Utest",
    "question": "測試問題",
    "selectedNumbers": [9,19,21,23,32]
  }'
```

## 錯誤處理

- 所有錯誤會被全域錯誤處理中間件捕獲
- 錯誤訊息會記錄在日誌中
- 返回給前端的錯誤訊息為友善的繁體中文
- 生產環境不暴露詳細錯誤資訊

## 日誌

- 使用自定義 logger（utils/logger.js）
- 開發環境：顯示所有日誌
- 生產環境：只顯示 info、warn、error

## 注意事項

- 確保 n8n webhook 可以從外部訪問
- ImgBB API 有上傳限制（單張圖片最大 32MB）
- LINE Bot 推送失敗時會通知管理員
- Rate limiting：每分鐘最多 10 次 API 請求

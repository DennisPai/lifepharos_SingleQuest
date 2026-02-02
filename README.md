# 象棋卜卦 LIFF 單一問題抽卦系統

## 專案簡介

本專案為整合 LINE Front-end Framework (LIFF)、n8n 和 Google Sheets 的象棋卜卦單一問題線上抽卦系統。使用 Node.js 後端處理圖片生成與訊息推送，n8n 處理 Google Sheets 資料操作。

## 技術棧

### 前端
- Vanilla JavaScript
- LIFF SDK v2.27.3
- 響應式設計（手機優先）

### 後端
- Node.js + Express
- canvas（圖片生成）
- @line/bot-sdk（LINE 訊息推送）
- imgbb-uploader（圖片上傳）

### 資料處理
- n8n（已部署在 Zeabur）
- Google Sheets（棋盤庫存資料庫）

### 部署
- Zeabur（前後端分離部署）

## 專案結構

```
lifepharos_SingleQuest/
├── .cursor/                    # Cursor 配置
│   ├── plans/                  # 計劃文件
│   └── rules                   # 開發規則
├── docs/                       # 文檔目錄
│   ├── WORKLOG.md             # 工作日誌
│   ├── API.md                 # API 文檔
│   ├── DESIGN.md              # 設計規格
│   └── N8N_EXPANSION.md       # n8n 擴充說明
├── frontend/                   # LIFF 前端
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── backend/                    # Node.js 後端
│   ├── src/
│   ├── package.json
│   └── .env.example
├── n8n_workflows/              # n8n 工作流
│   ├── get-board-by-taskid.json
│   ├── update-board-usage.json
│   ├── 預約系統(主帳號).json
│   └── 預約系統(助手帳).json
└── README.md                   # 本文件
```

## 功能流程

1. **預約完成** → n8n 推送「開始抽卦」按鈕（Flex Message）
2. **用戶點擊** → 開啟 LIFF 網頁
3. **輸入問題** → 最多 30 字
4. **選擇數字** → 輸入 5 個數字（1-32，不可重複）
5. **處理中** → 後端生成卦象圖片並上傳
6. **顯示結果** → LIFF 顯示卦象，同時推送到 LINE 聊天室
7. **更新資料** → Google Sheets 記錄使用狀態

## 快速開始

### 前置需求

- Node.js >= 18.0.0
- LINE Official Account
- LIFF Channel
- n8n 實例（已部署）
- Google Sheets 表單（棋盤庫存）
- ImgBB API Key

### 環境變數設定

**後端 (.env)**:
```bash
# LINE Bot
LINE_CHANNEL_ACCESS_TOKEN=your_token
LINE_CHANNEL_SECRET=your_secret

# ImgBB
IMGBB_API_KEY=179dcdb74c6a4f1540303be93f5d259c

# n8n
N8N_WEBHOOK_BASE_URL=https://lifepharos.hnd1.zeabur.app

# Server
PORT=3000
NODE_ENV=production
```

**前端 (config.js)**:
```javascript
const CONFIG = {
  LIFF_ID: '2008987238-9DfMVogB',
  API_BASE_URL: 'https://your-backend.zeabur.app'
};
```

### 本地開發

**後端**:
```bash
cd backend
npm install
npm run dev
```

**前端**:
```bash
cd frontend
# 使用 live-server 或任何靜態檔案伺服器
npx live-server
```

### 部署到 Zeabur

**前端**:
1. 建立新專案
2. 匯入 Git repository
3. 設定 Root Directory = `/frontend`
4. 選擇 Static Site 模式
5. 部署

**後端**:
1. 在同專案中新增服務
2. 匯入同一 repository
3. 設定 Root Directory = `/backend`
4. 選擇 Node.js 環境
5. 設定環境變數
6. 部署

**n8n**:
1. 已部署在 https://lifepharos.hnd1.zeabur.app
2. 匯入 workflow JSON 檔案
3. 設定 Google Sheets 認證
4. 啟用 workflow

## 文檔

- [API 文檔](docs/API.md) - 後端 API 端點說明
- [設計規格](docs/DESIGN.md) - 視覺設計與 UI/UX 規格
- [n8n 擴充](docs/N8N_EXPANSION.md) - 預約系統擴充詳細說明
- [工作日誌](docs/WORKLOG.md) - 開發進度記錄

## 重要連結

- **LIFF URL**: https://liff.line.me/2008987238-9DfMVogB
- **n8n**: https://lifepharos.hnd1.zeabur.app
- **棋盤庫存**: [Google Sheets](https://docs.google.com/spreadsheets/d/18vP5xiyvZpPdgfBlhkdHXvpYcgXcxuJTXqVJZz9NxOo)
- **設計參考**: [GitHub](https://github.com/DennisPai/chinesechessdivination_singlequestion)

## 開發規則

請閱讀 [`.cursor/rules`](.cursor/rules) 了解專案開發規則。

**重要規則**:
- 優先更新既有文檔，新增文檔前須先詢問
- 所有變更記錄在 `docs/WORKLOG.md`
- 繁體中文為主要語言
- 遵循 Cursor Rules 的程式碼風格

## 測試

### API 測試
使用 Postman 或 curl 測試後端 API：

```bash
# 檢查棋盤狀態
curl -X GET "http://localhost:3000/api/divination/check?taskId=TEST_123&userId=Utest"

# 提交抽卦
curl -X POST "http://localhost:3000/api/divination/submit" \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TEST_123","userId":"Utest","question":"測試問題","selectedNumbers":[9,19,21,23,32]}'
```

### LIFF 測試
1. 在 LINE 中點擊 Flex Message 按鈕
2. 或直接訪問：`https://liff.line.me/2008987238-9DfMVogB?taskId=TEST_123`

## 故障排除

### LIFF 無法開啟
- 檢查 LIFF ID 是否正確
- 確認 LINE Developers Console 的 Endpoint URL 已更新

### 圖片無法顯示
- 檢查 ImgBB API Key 是否有效
- 確認圖片上傳成功（查看後端日誌）

### Google Sheets 更新失敗
- 檢查 n8n 的 Google Sheets 認證
- 確認 Sheet ID 正確
- 檢查公式欄位沒有被覆蓋

## 授權

本專案為私有專案，未經授權不得使用。

## 聯絡方式

如有問題，請聯絡專案負責人。

---

**最後更新**: 2026-02-02
**版本**: 1.0.0

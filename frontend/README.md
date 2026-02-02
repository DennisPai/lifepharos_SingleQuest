# LIFF 前端

## 說明

這是象棋卜卦 LIFF 應用的前端部分，使用 Vanilla JavaScript 開發。

## 檔案結構

```
frontend/
├── index.html          # 主 HTML 文件
├── css/
│   └── style.css       # 樣式表
├── js/
│   ├── config.js       # 配置文件
│   ├── api.js          # API 呼叫模組
│   ├── liff-init.js    # LIFF 初始化
│   └── main.js         # 主應用邏輯
├── assets/             # 靜態資源（圖片等）
└── README.md           # 本文件
```

## 本地開發

### 使用 live-server（推薦）

```bash
npx live-server --port=8080
```

### 使用 Python HTTP Server

```bash
python -m http.server 8080
```

然後訪問：`http://localhost:8080`

## 配置

部署前需要更新 `js/config.js` 中的以下配置：

```javascript
CONFIG.API_BASE_URL = 'https://your-backend.zeabur.app'; // 更新為實際後端 URL
```

## 部署到 Zeabur

1. 建立新專案（或使用現有專案）
2. 從 GitHub 匯入 repository
3. **重要**：設定 Root Directory = `/frontend`
4. 選擇 Static Site 模式
5. 部署

部署完成後：
1. 記錄 frontend URL
2. 更新 `config.js` 中的 `API_BASE_URL`
3. 前往 LINE Developers Console 更新 LIFF Endpoint URL

## 頁面流程

1. **檢查頁面** - 初始化 LIFF，檢查棋盤狀態
2. **輸入問題頁面** - 用戶輸入問題（最多30字）
3. **輸入數字頁面** - 用戶輸入5個數字（1-32，不可重複）
4. **處理中頁面** - 顯示 loading，等待後端處理
5. **結果顯示頁面** - 顯示抽到的卦象
6. **已使用頁面** - 如果已抽過，顯示之前的結果

## LIFF API 使用

- `liff.init()` - 初始化 LIFF
- `liff.getContext()` - 獲取用戶 ID
- `liff.isInClient()` - 檢查是否在 LINE 中
- `liff.login()` - 外部瀏覽器登入
- `liff.closeWindow()` - 關閉 LIFF 視窗

## 注意事項

- 確保 LIFF ID 正確（`2008987238-9DfMVogB`）
- 所有 URL 參數中必須包含 `taskId`
- 圖片和靜態資源放在 `assets/` 目錄
- 保持程式碼輕量，避免引入大型函式庫

## 測試

### 本地測試
由於 LIFF 需要在 LINE 環境中運行，本地測試有限制。建議：
1. 模擬 API 回應進行 UI 測試
2. 部署到測試環境進行完整測試

### 正式環境測試
1. 在 LINE 中點擊 Flex Message 按鈕
2. 或直接訪問：`https://liff.line.me/2008987238-9DfMVogB?taskId=TEST_123`

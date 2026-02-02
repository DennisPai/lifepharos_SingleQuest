# 🎯 接下來該做什麼

## 目前進度
✅ 後端代碼已推送到 GitHub  
✅ 錯誤已修復（LINE Bot SDK import）  
⏳ **下一步：在 Zeabur 重新部署後端**

---

## 📋 步驟 1：重新部署後端（現在就做）

### 1.1 觸發重新部署

前往 Zeabur：
1. 開啟 https://zeabur.com/dashboard
2. 找到你的後端服務
3. 點擊服務名稱進入詳情頁
4. 點擊右上角的「⋮」選單
5. 選擇「Redeploy」

### 1.2 設定環境變數（如果還沒設定）

**⚠️ 重要**：在部署前，確保以下環境變數都已設定：

```
NODE_ENV=production
PORT=3000
LINE_CHANNEL_ACCESS_TOKEN=（你的主帳號token）
LINE_ADMIN_CHANNEL_ACCESS_TOKEN=（你的助手帳token）
LINE_ADMIN_GROUP_ID=C3ac7b3e3badce99a988d02519e8edb5c
IMGBB_API_KEY=179dcdb74c6a4f1540303be93f5d259c
N8N_BASE_URL=https://lifepharos.hnd1.zeabur.app
GOOGLE_SHEET_ID=18vP5xiyvZpPdgfBlhkdHXvpYcgCxcxuJTXqVJZz9NxOo
```

**📖 詳細說明**：查看 `ZEABUR_SETUP.md` 的「環境變數詳細說明」章節

**❓ N8N_BASE_URL 在哪裡找？**
1. 前往 Zeabur Dashboard
2. 找到你的 n8n 服務
3. 在「Domains」或「Networking」區域複製 URL
4. 例如：`https://lifepharos.hnd1.zeabur.app`
5. ⚠️ URL 結尾**不要**加斜線 `/`

### 1.3 等待部署完成

觀察 Build Logs 和 Runtime Logs：
- Build Logs 應該顯示 Dockerfile 被使用
- Runtime Logs 應該顯示「Server is running on port 3000」

### 1.4 測試後端

部署成功後，測試健康檢查：

```bash
# 在瀏覽器或命令列執行
curl https://your-backend-url.zeabur.app/health
```

應該返回：
```json
{
  "status": "OK",
  "message": "Backend API is running"
}
```

### 1.5 記錄後端 URL

✏️ **重要**：記下你的後端 URL，例如：
```
https://backend-abc123.zeabur.app
```

---

## 📋 步驟 2：部署前端（後端成功後再做）

### 2.1 在 Zeabur 建立前端服務

1. 在同一個 Project 中，點擊「Add Service」
2. 選擇「Git」
3. 選擇 `lifepharos_SingleQuest` repository
4. 設定：
   - **Service Name**：`frontend`
   - **Root Directory**：`/frontend`
   - **Framework**：Static Site（Zeabur 應該會自動檢測）
5. 點擊「Deploy」

### 2.2 記錄前端 URL

部署完成後，記下前端 URL，例如：
```
https://frontend-xyz789.zeabur.app
```

---

## 📋 步驟 3：更新配置（前端部署後）

### 3.1 更新前端 config.js

在本地端修改：

```bash
# 編輯 frontend/js/config.js
# 將 API_BASE_URL 改為你的後端 URL
```

```javascript
const CONFIG = {
  LIFF_ID: '2008987238-9DfMVogB',
  API_BASE_URL: 'https://backend-abc123.zeabur.app',  // ← 改這裡
  MAX_QUESTION_LENGTH: 30,
  // ...
};
```

提交並推送：
```bash
git add frontend/js/config.js
git commit -m "[修改] 更新前端 API URL"
git push
```

Zeabur 會自動重新部署前端。

### 3.2 更新後端環境變數

回到 Zeabur 後端服務：
1. 點擊「Environment Variables」
2. 添加新變數：
   ```
   FRONTEND_URL=https://frontend-xyz789.zeabur.app
   ```
3. 點擊「Save」
4. 服務會自動重啟

---

## 📋 步驟 4：更新 LINE LIFF Endpoint

1. 前往 LINE Developers Console：https://developers.line.biz/console/
2. 選擇你的 Provider
3. 選擇你的 LIFF 應用
4. 點擊「Edit」
5. 更新「Endpoint URL」：
   ```
   https://frontend-xyz789.zeabur.app
   ```
6. 點擊「Update」

---

## 📋 步驟 5：匯入 n8n Workflows（重要）

### 5.1 匯入兩個獨立 workflow

1. 登入你的 n8n：https://lifepharos.hnd1.zeabur.app
2. 匯入 `n8n_workflows/get-board-by-taskid.json`
3. 匯入 `n8n_workflows/update-board-usage.json`
4. 確保兩個 workflow 都已「Active」

### 5.2 擴充預約系統 workflow

根據 `docs/N8N_EXPANSION.md` 的指示：
1. 匯入 `n8n_workflows/預約系統(助手帳).json`
2. 檢查所有 11 個新節點是否正確
3. 確認節點連接正確
4. 啟用 workflow

**📖 詳細步驟**：查看 `docs/N8N_EXPANSION.md`

---

## 📋 步驟 6：完整測試

### 6.1 測試後端 API

```bash
# 1. 健康檢查
curl https://backend-abc123.zeabur.app/health

# 2. 測試查詢棋盤（需要 n8n 運行）
curl "https://backend-abc123.zeabur.app/api/divination/check?taskId=ID1769499728120&userId=Utest"
```

### 6.2 測試完整流程

參考 `docs/TESTING.md` 進行完整測試。

---

## 🎯 快速總結

**現在立即做**：
1. ✅ 在 Zeabur 重新部署後端
2. ✅ 設定所有環境變數（特別是 N8N_BASE_URL）
3. ✅ 測試後端健康檢查

**後端成功後做**：
4. 部署前端
5. 更新前端 config.js
6. 更新後端 FRONTEND_URL
7. 更新 LINE LIFF Endpoint
8. 匯入 n8n workflows
9. 完整測試

---

## 📚 參考文檔

- **詳細部署指南**：`ZEABUR_SETUP.md`（環境變數說明）
- **N8N 擴充指南**：`docs/N8N_EXPANSION.md`
- **完整部署文檔**：`docs/DEPLOYMENT.md`
- **測試指南**：`docs/TESTING.md`
- **快速開始**：`QUICKSTART.md`

---

## ❓ 遇到問題？

### 常見問題

1. **後端啟動失敗**
   - 檢查 Runtime Logs
   - 確認所有環境變數都已設定
   - 確認 N8N_BASE_URL 格式正確

2. **找不到 n8n URL**
   - 前往 Zeabur，找到 n8n 服務
   - 在「Domains」區域複製 URL

3. **前端無法呼叫後端**
   - 檢查 config.js 的 API_BASE_URL
   - 檢查後端的 FRONTEND_URL 環境變數
   - 檢查瀏覽器 Console 的 CORS 錯誤

---

## 🎉 完成後

所有步驟完成後，你將擁有：
- ✅ 運行中的後端 API
- ✅ 運行中的前端 LIFF 應用
- ✅ 整合的 n8n 工作流
- ✅ 完整的抽卦功能

**開始使用吧！** 🚀

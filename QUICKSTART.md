# 快速開始指南 - 5 步驟完成部署

本指南提供最快速的部署路徑，詳細說明請參考 `docs/DEPLOYMENT.md`。

---

## ⚡ 快速部署（5 步驟）

### 步驟 1：安裝依賴（5 分鐘）

```bash
cd backend
npm install
```

驗證：檢查 `node_modules/` 目錄已建立。

---

### 步驟 2：推送到 GitHub（10 分鐘）

```bash
# 在專案根目錄
git init
git add .
git commit -m "初始提交：象棋卜卦 LIFF 系統"
git branch -M main

# 在 GitHub 上建立新 repository，然後：
git remote add origin https://github.com/YOUR_USERNAME/lifepharos_SingleQuest.git
git push -u origin main
```

---

### 步驟 3：設定 n8n Workflows（30-60 分鐘）

#### 3.1 匯入獨立工作流

登入 n8n：https://lifepharos.hnd1.zeabur.app

**匯入 get-board-by-taskid**:
1. 點擊 "+" → "Import from File"
2. 選擇 `n8n_workflows/get-board-by-taskid.json`
3. 點擊 "Save" 並 "Activate"
4. 測試 webhook：
   ```bash
   curl -X POST https://lifepharos.hnd1.zeabur.app/webhook/get-board \
     -H "Content-Type: application/json" \
     -d '{"taskId":"TEST_123"}'
   ```

**匯入 update-board-usage**:
1. 重複上述步驟
2. 選擇 `n8n_workflows/update-board-usage.json`
3. 測試 webhook

#### 3.2 擴充預約系統（助手帳）⭐

**重要**：詳細步驟請參考 `docs/N8N_EXPANSION.md`

**快速摘要**：
1. 開啟 `預約系統(助手帳)` workflow
2. 在 "Google Sheets Update" 節點後插入 IF 節點
3. 新增 11 個節點（參考 N8N_EXPANSION.md 的節點清單）
4. 調整節點連接
5. 測試完整流程

---

### 步驟 4：部署到 Zeabur（30 分鐘）

#### 4.1 部署後端

1. 登入 Zeabur：https://zeabur.com
2. 建立新專案：`lifepharos-singlequest`
3. Add Service → Git → 選擇你的 repository
4. **重要設定**：
   - Service Name: `backend`
   - Root Directory: `/backend`
5. 設定環境變數（從 `backend/.env.example` 複製）：
   ```
   LINE_CHANNEL_ACCESS_TOKEN=你的token
   IMGBB_API_KEY=179dcdb74c6a4f1540303be93f5d259c
   N8N_WEBHOOK_BASE_URL=https://lifepharos.hnd1.zeabur.app
   ADMIN_LINE_BOT_TOKEN=你的助手帳token
   ADMIN_GROUP_ID=C3ac7b3e3badce99a988d02519e8edb5c
   NODE_ENV=production
   FRONTEND_URL=https://你的前端URL（稍後填）
   ```
6. Deploy
7. **記錄後端 URL**（例如：`https://backend-abc123.zeabur.app`）

#### 4.2 更新前端配置

編輯 `frontend/js/config.js`：
```javascript
API_BASE_URL: 'https://backend-abc123.zeabur.app', // 更新為剛剛的 URL
```

推送變更：
```bash
git add frontend/js/config.js
git commit -m "更新後端 API URL"
git push
```

#### 4.3 部署前端

1. 在同一 Zeabur 專案中 Add Service → Git
2. 選擇同一 repository
3. **重要設定**：
   - Service Name: `frontend`
   - Root Directory: `/frontend`
   - Framework Preset: Static Site
4. Deploy
5. **記錄前端 URL**（例如：`https://frontend-xyz789.zeabur.app`）

#### 4.4 更新後端 CORS

回到後端服務，新增環境變數：
```
FRONTEND_URL=https://frontend-xyz789.zeabur.app
```

點擊 "Redeploy"。

---

### 步驟 5：更新 LINE LIFF 設定（5 分鐘）

1. 登入 LINE Developers Console：https://developers.line.biz/console/
2. 找到 LIFF ID：`2008987238-9DfMVogB`
3. Edit → Endpoint URL: `https://frontend-xyz789.zeabur.app`
4. Update

---

## ✅ 驗證部署

### 快速檢查（5 分鐘）

```bash
# 1. 檢查後端健康
curl https://backend-abc123.zeabur.app/health

# 2. 檢查 API
curl "https://backend-abc123.zeabur.app/api/divination/check?taskId=TEST_123&userId=Utest"

# 3. 在 LINE 中測試 LIFF
# 發送訊息：https://liff.line.me/2008987238-9DfMVogB?taskId=TEST_123
```

### 完整測試（30 分鐘）

參考 `docs/TESTING.md` 執行所有測試案例。

---

## 🆘 遇到問題？

| 問題 | 檢查 | 解決方案 |
|------|------|----------|
| 後端無法啟動 | Zeabur Logs | 檢查環境變數、package.json |
| LIFF 無法開啟 | LINE Console | 檢查 Endpoint URL、LIFF ID |
| API 呼叫失敗 | Network Tab | 檢查 CORS、API URL |
| 圖片無法生成 | 後端 Logs | 檢查 canvas 依賴、字體 |
| n8n 無法連線 | n8n Logs | 檢查 webhook 路徑、認證 |

**詳細故障排除**：參考 `docs/DEPLOYMENT.md` 的「故障排除」章節。

---

## 📚 重要文檔

- **部署詳細指南**: `docs/DEPLOYMENT.md`
- **測試指南**: `docs/TESTING.md`
- **n8n 擴充指南**: `docs/N8N_EXPANSION.md`
- **API 文檔**: `docs/API.md`

---

## 🎯 部署後第一件事

執行完整流程測試：
1. 發送預約訊息：`預約單一問題`
2. 助手帳確認付款
3. 點擊 Flex Message 的「開始抽卦」
4. 完整走完流程
5. 檢查 Google Sheets 是否更新
6. 檢查 LINE 是否收到圖片和訊息

---

**預估完成時間**: 1.5-2.5 小時（含測試）

**準備好了嗎？開始吧！** 🚀

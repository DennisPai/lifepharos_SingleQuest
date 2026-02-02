# 部署文檔 - Zeabur 部署指南

## 部署概述

本專案包含三個服務，都部署在 Zeabur 平台：
1. **前端（LIFF）** - Static Site
2. **後端（API）** - Node.js
3. **n8n** - 已部署（現有服務）

---

## 前置準備

### 1. 建立 GitHub Repository

```bash
cd e:\Cursor_PortableFile\lifepharos_SingleQuest
git init
git add .
git commit -m "初始提交：象棋卜卦 LIFF 系統"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lifepharos_SingleQuest.git
git push -u origin main
```

### 2. 準備環境變數

確保以下資訊已準備好：
- [ ] LINE Channel Access Token（主帳號）
- [ ] LINE Channel Secret
- [ ] LINE Admin Bot Token（助手帳）
- [ ] ImgBB API Key（已有：179dcdb74c6a4f1540303be93f5d259c）
- [ ] Google Sheets Spreadsheet ID（已有：18vP5xiyvZpPdgfBlhkdHXvpYcgXcxuJTXqVJZz9NxOo）

---

## 部署步驟

### 服務 1：後端 API（Node.js）

#### 1.1 建立 Zeabur 專案

1. 登入 Zeabur：https://zeabur.com
2. 點擊 "New Project"
3. 輸入專案名稱：`lifepharos-singlequest`
4. 選擇 Region：`Tokyo (HND1)` 或其他

#### 1.2 部署後端服務

1. 點擊 "Add Service" → "Git"
2. 連接 GitHub 並選擇 repository
3. **重要**：Service Name 設為 `backend`
4. **關鍵設定**：
   - Root Directory: `/backend`
   - Environment: Node.js
   - Start Command: `npm start`（會自動從 package.json 讀取）

5. 點擊 "Deploy"

#### 1.3 設定環境變數

在 Zeabur 後端服務中設定環境變數：

```bash
LINE_CHANNEL_ACCESS_TOKEN=YQANihoFPndvkey9J5aZvQgd3gmZ25weoaw7uWxmAG8wPEBLMJ2yuIoGwm1D8FwkMQkcxPku5M/o5zNYcfmySKmjUAZELsyYJtdKlKJJlhXmsaDmuwi5u/ysw9SZ7yGi65EQJrcu6DNfranfX/PacgdB04t89/1O/w1cDnyilFU=
LINE_CHANNEL_SECRET=你的_channel_secret
IMGBB_API_KEY=179dcdb74c6a4f1540303be93f5d259c
N8N_WEBHOOK_BASE_URL=https://lifepharos.hnd1.zeabur.app
N8N_GET_BOARD_PATH=/webhook/get-board
N8N_UPDATE_BOARD_PATH=/webhook/update-board
ADMIN_LINE_BOT_TOKEN=vN0noJiFVVBtP2ud9/tKnsPG7J0LcPKXC9gy4Ex8F+IiHxv5HJ9+LRGrbYIXwvmuFpMwWymevG3Lpy7e3mebu+lQ3UOtdeV6AG30TYSd497NMaqtFWQDp9XKz4Hy9RTSY5XXVEsqPjPL0PPxyKBxjgdB04t89/1O/w1cDnyilFU=
ADMIN_GROUP_ID=C3ac7b3e3badce99a988d02519e8edb5c
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://你的前端URL.zeabur.app
GOOGLE_SHEET_ID=18vP5xiyvZpPdgfBlhkdHXvpYcgXcxuJTXqVJZz9NxOo
```

#### 1.4 驗證部署

1. 等待部署完成（約 2-5 分鐘）
2. 記錄後端 URL（例如：`https://backend-xxx.zeabur.app`）
3. 測試健康檢查：
   ```bash
   curl https://backend-xxx.zeabur.app/health
   ```
4. 預期回應：
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "environment": "production"
   }
   ```

---

### 服務 2：前端 LIFF（Static Site）

#### 2.1 更新前端配置

**在部署前**，更新 `frontend/js/config.js`：

```javascript
const CONFIG = {
  LIFF_ID: '2008987238-9DfMVogB',
  API_BASE_URL: 'https://backend-xxx.zeabur.app', // 更新為剛剛的後端 URL
  // ... 其他配置不變
};
```

**提交變更**：
```bash
git add frontend/js/config.js
git commit -m "更新後端 API URL"
git push
```

#### 2.2 部署前端服務

1. 在同一 Zeabur 專案中，點擊 "Add Service" → "Git"
2. 選擇同一 repository
3. **重要**：Service Name 設為 `frontend`
4. **關鍵設定**：
   - Root Directory: `/frontend`
   - Framework Preset: Static Site（或 HTML）
   - Build Command: 留空（靜態文件不需要建置）
   - Output Directory: `.`（當前目錄）

5. 點擊 "Deploy"

#### 2.3 驗證部署

1. 等待部署完成（約 1-2 分鐘）
2. 記錄前端 URL（例如：`https://frontend-xxx.zeabur.app`）
3. 訪問前端 URL，應該看到空白頁面（因為需要從 LINE 開啟）

#### 2.4 更新後端 CORS

回到後端服務，更新環境變數：
```bash
FRONTEND_URL=https://frontend-xxx.zeabur.app
```

重新部署後端（或等待自動重啟）。

---

### 服務 3：n8n（已部署）

#### 3.1 驗證現有部署

1. 訪問：https://lifepharos.hnd1.zeabur.app
2. 確認可以正常訪問 n8n 介面
3. 檢查 Google Sheets 認證是否正常

#### 3.2 匯入 Workflows

按照 [`n8n_workflows/README.md`](../n8n_workflows/README.md) 的步驟：

1. 匯入 `get-board-by-taskid.json`
2. 匯入 `update-board-usage.json`
3. 擴充 `預約系統(助手帳).json`（參考 `docs/N8N_EXPANSION.md`）

#### 3.3 測試 Webhooks

```bash
# 測試 get-board
curl -X POST https://lifepharos.hnd1.zeabur.app/webhook/get-board \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TEST_123"}'

# 測試 update-board
curl -X POST https://lifepharos.hnd1.zeabur.app/webhook/update-board \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TEST_123","positions":[9,19,21,23,32]}'
```

---

## LINE Developers Console 設定

### 更新 LIFF Endpoint URL

1. 登入 LINE Developers Console：https://developers.line.biz/console/
2. 選擇你的 Provider
3. 選擇你的 LIFF Channel
4. 進入 "LIFF" 標籤
5. 找到 LIFF ID：`2008987238-9DfMVogB`
6. 點擊 "Edit"
7. 更新 Endpoint URL：`https://frontend-xxx.zeabur.app`
8. 點擊 "Update"

### 驗證 LIFF 設定

1. 在 LINE 中傳送測試 URL：
   ```
   https://liff.line.me/2008987238-9DfMVogB?taskId=TEST_123
   ```
2. 應該可以正常開啟 LIFF（會顯示錯誤，因為 TEST_123 不存在，但這證明 LIFF 可以運行）

---

## 部署後驗證

### 1. 系統健康檢查

```bash
# 後端健康檢查
curl https://backend-xxx.zeabur.app/health

# n8n 健康檢查
curl https://lifepharos.hnd1.zeabur.app/health
```

### 2. API 端點測試

```bash
# 檢查 API
curl "https://backend-xxx.zeabur.app/api/divination/check?taskId=TEST_123&userId=Utest"
```

### 3. 完整流程測試

按照 [`TESTING.md`](./TESTING.md) 執行完整的測試流程。

---

## 域名設定（可選）

如果需要使用自訂域名：

### 前端域名
1. 在 Zeabur 前端服務中，點擊 "Domains"
2. 點擊 "Add Domain"
3. 輸入自訂域名（例如：`liff.lifepharos.com`）
4. 按照指示設定 DNS CNAME 記錄
5. 等待 DNS 生效
6. 更新 LINE Developers Console 的 LIFF Endpoint URL

### 後端域名
1. 同樣步驟設定後端域名（例如：`api.lifepharos.com`）
2. 更新前端 `config.js` 的 `API_BASE_URL`
3. 重新部署前端

---

## 環境變數總覽

### 後端環境變數（Zeabur）

| 變數名 | 說明 | 是否必填 | 範例值 |
|--------|------|----------|--------|
| LINE_CHANNEL_ACCESS_TOKEN | 主帳號 Access Token | ✅ 必填 | YQANihoF... |
| LINE_CHANNEL_SECRET | Channel Secret | ✅ 必填 | ... |
| IMGBB_API_KEY | ImgBB API Key | ✅ 必填 | 179dcdb7... |
| N8N_WEBHOOK_BASE_URL | n8n Base URL | ✅ 必填 | https://lifepharos.hnd1.zeabur.app |
| N8N_GET_BOARD_PATH | 查詢 webhook 路徑 | ⚪ 可選 | /webhook/get-board |
| N8N_UPDATE_BOARD_PATH | 更新 webhook 路徑 | ⚪ 可選 | /webhook/update-board |
| ADMIN_LINE_BOT_TOKEN | 助手帳 Token | ✅ 必填 | vN0noJiF... |
| ADMIN_GROUP_ID | 管理員群組 ID | ✅ 必填 | C3ac7b3e... |
| PORT | 服務埠號 | ⚪ 可選 | 3000 |
| NODE_ENV | 環境 | ✅ 必填 | production |
| FRONTEND_URL | 前端 URL | ✅ 必填 | https://frontend-xxx.zeabur.app |
| GOOGLE_SHEET_ID | 棋盤庫存 ID | ⚪ 可選 | 18vP5xiyvZ... |

### 前端配置（config.js）

| 變數名 | 說明 | 範例值 |
|--------|------|--------|
| LIFF_ID | LIFF Channel ID | 2008987238-9DfMVogB |
| API_BASE_URL | 後端 API URL | https://backend-xxx.zeabur.app |

---

## 部署檢查清單

### 部署前
- [ ] 程式碼已推送到 GitHub
- [ ] .gitignore 已設定正確
- [ ] 所有環境變數已準備
- [ ] 本地測試通過

### 後端部署
- [ ] Zeabur 專案已建立
- [ ] Root Directory 設為 `/backend`
- [ ] 環境變數已設定
- [ ] 部署成功
- [ ] 健康檢查通過
- [ ] 記錄後端 URL

### 前端部署
- [ ] config.js 已更新後端 URL
- [ ] 變更已推送到 GitHub
- [ ] Root Directory 設為 `/frontend`
- [ ] 部署成功
- [ ] 可以訪問前端 URL
- [ ] 記錄前端 URL

### n8n 設定
- [ ] get-board-by-taskid workflow 已匯入並啟用
- [ ] update-board-usage workflow 已匯入並啟用
- [ ] 預約系統（助手帳）已擴充
- [ ] 所有 webhook 測試通過

### LINE 設定
- [ ] LIFF Endpoint URL 已更新
- [ ] LIFF 可以正常開啟
- [ ] Flex Message 測試通過

### 最終驗證
- [ ] 完整流程測試通過
- [ ] 防呆機制正常運作
- [ ] 錯誤處理正常運作
- [ ] Google Sheets 正確更新
- [ ] LINE 訊息正常推送

---

## 部署後配置更新

### 1. 更新文檔中的 URL

需要更新以下文件：

- `docs/API.md` - 更新 Base URL
- `README.md` - 更新相關連結
- `frontend/README.md` - 更新部署資訊
- `backend/README.md` - 更新部署資訊

### 2. 記錄部署資訊

在 `docs/WORKLOG.md` 中記錄：
- 部署日期
- 前後端 URL
- 遇到的問題和解決方案

---

## 監控與維護

### 日誌查看

**Zeabur 日誌**:
1. 進入服務頁面
2. 點擊 "Logs" 標籤
3. 即時查看應用程式日誌

**n8n 執行記錄**:
1. 開啟 workflow
2. 點擊 "Executions"
3. 查看歷史執行記錄

### 錯誤監控

**後端錯誤**:
- 查看 Zeabur 日誌
- 檢查管理員群組是否收到錯誤通知

**n8n 錯誤**:
- 檢查 workflow 執行記錄
- 失敗的執行會顯示紅色

### 效能監控

**建議監控指標**:
- API 回應時間（目標：< 3 秒）
- 圖片生成時間（目標：< 2 秒）
- 圖片上傳時間（目標：< 3 秒）
- Google Sheets 更新時間（目標：< 2 秒）

---

## 故障排除

### 問題 1: 後端無法啟動

**可能原因**:
- 環境變數設定錯誤
- 依賴安裝失敗
- PORT 衝突

**解決方案**:
1. 檢查 Zeabur 日誌
2. 確認所有環境變數已設定
3. 確認 package.json 的 start script 正確

---

### 問題 2: LIFF 無法開啟

**可能原因**:
- LIFF Endpoint URL 設定錯誤
- 前端部署失敗
- LIFF ID 錯誤

**解決方案**:
1. 檢查 LINE Developers Console 的 LIFF 設定
2. 確認前端 URL 可以訪問
3. 確認 LIFF ID 正確（2008987238-9DfMVogB）

---

### 問題 3: 圖片無法顯示

**可能原因**:
- ImgBB API Key 無效
- 圖片生成失敗
- 網路問題

**解決方案**:
1. 檢查後端日誌
2. 驗證 ImgBB API Key
3. 測試圖片生成功能
4. 確認 ImgBB 服務正常

---

### 問題 4: Google Sheets 無法更新

**可能原因**:
- n8n Google Sheets 認證失效
- Spreadsheet ID 錯誤
- 欄位名稱不匹配

**解決方案**:
1. 檢查 n8n 的 Google Sheets 認證
2. 確認 Spreadsheet ID 正確
3. 確認欄位名稱與 Google Sheets 一致
4. 測試 n8n workflow

---

### 問題 5: LINE 訊息推送失敗

**可能原因**:
- Access Token 無效或過期
- userId 錯誤
- LINE API 限制

**解決方案**:
1. 檢查 Access Token 是否有效
2. 確認 userId 格式正確
3. 檢查 LINE API 的使用限制
4. 查看後端日誌中的詳細錯誤訊息

---

## 回滾計畫

如果部署後發現嚴重問題：

### 快速回滾
1. 在 Zeabur 中點擊服務
2. 進入 "Deployments" 標籤
3. 選擇之前的穩定版本
4. 點擊 "Redeploy"

### Git 回滾
```bash
git revert HEAD
git push
```

Zeabur 會自動重新部署。

---

## 擴展計畫

### 未來可能的擴展

1. **增加快取機制**
   - Redis 快取棋盤資料
   - 減少 n8n 呼叫次數

2. **圖片儲存優化**
   - 考慮使用 Cloudinary
   - 或自建圖片儲存服務

3. **監控和告警**
   - 整合 Sentry 錯誤監控
   - 設定效能監控

4. **多語言支援**
   - 支援簡體中文
   - 支援英文

---

## 部署時間表

| 階段 | 預估時間 | 說明 |
|------|----------|------|
| 準備工作 | 30 分鐘 | 推送 Git、準備環境變數 |
| 後端部署 | 15 分鐘 | Zeabur 部署 + 環境變數設定 |
| 前端配置 | 10 分鐘 | 更新 config.js + 推送 |
| 前端部署 | 10 分鐘 | Zeabur 部署 |
| n8n 設定 | 30-60 分鐘 | 匯入 workflows + 擴充預約系統 |
| LINE 設定 | 5 分鐘 | 更新 LIFF Endpoint |
| 測試驗證 | 30-60 分鐘 | 完整流程測試 |
| **總計** | **2.5-3.5 小時** | 完整部署 |

---

## 變更歷史

| 日期 | 版本 | 變更內容 |
|------|------|----------|
| 2026-02-02 | 1.0 | 初始部署文檔 |

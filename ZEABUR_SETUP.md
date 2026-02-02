# Zeabur 部署完整指南

## 📋 目錄

1. [後端部署](#1-後端部署)
2. [環境變數詳細說明](#2-環境變數詳細說明)
3. [前端部署](#3-前端部署)
4. [n8n 設定](#4-n8n-設定)
5. [完整流程測試](#5-完整流程測試)

---

## 1. 後端部署

### 步驟 1：在 Zeabur 建立後端服務

1. 登入 Zeabur Dashboard：https://zeabur.com/dashboard
2. 選擇你的 Project（或新建一個）
3. 點擊「Add Service」
4. 選擇「Git」
5. 選擇你的 GitHub Repository：`lifepharos_SingleQuest`
6. 等待 Zeabur 自動檢測（應該會檢測到 `backend/Dockerfile`）

### 步驟 2：配置服務設定

在服務設定頁面：

- **Service Name**：`backend`（或你喜歡的名字）
- **Root Directory**：`/backend` ⚠️ **必須設定**
- **Port**：`3000`（Zeabur 會自動檢測）

### 步驟 3：設定環境變數

點擊服務的「Environment Variables」標籤，**逐一**添加以下環境變數：

---

## 2. 環境變數詳細說明

### 必填環境變數（沒有就無法啟動）

#### 2.1 `NODE_ENV`
**說明**：Node.js 運行環境  
**值**：`production`  
**為什麼需要**：告訴應用程式這是生產環境

---

#### 2.2 `PORT`
**說明**：應用程式監聽的端口  
**值**：`3000`  
**為什麼需要**：讓 Zeabur 知道你的應用在哪個端口運行

---

#### 2.3 `LINE_CHANNEL_ACCESS_TOKEN`
**說明**：LINE 主帳號的 Access Token  
**值**：`YQANihoFPndvkey9J5aZvQgd3gmZ25weoaw7uWxmAG8wPEBLMJ2yuIoGwm1D8FwkMQkcxPku5M/o5zNYcfmySKmjUAZELsyYJtdKlKJJlhXmsaDmuwi5u/ysw9SZ7yGi65EQJrcu6DNfranfX/PacgdB04t89/1O/w1cDnyilFU=`

**如何取得**：
1. 前往 LINE Developers Console：https://developers.line.biz/console/
2. 選擇你的 Provider
3. 選擇你的 Messaging API Channel（主帳號）
4. 找到「Channel access token」
5. 如果沒有，點擊「Issue」按鈕生成
6. 複製整個 token

**為什麼需要**：用來推送抽卦結果訊息給客戶

---

#### 2.4 `LINE_ADMIN_CHANNEL_ACCESS_TOKEN`
**說明**：LINE 助手帳的 Access Token（用於通知管理員）  
**值**：`vN0noJiFVVBtP2ud9/tKnsPG7J0LcPKXC9gy4Ex8F+IiHxv5HJ9+LRGrbYIXwvmuFpMwWymevG3Lpy7e3mebu+lQ3UOtdeV6AG30TYSd497NMaqtFWQDp9XKz4Hy9RTSY5XXVEsqPjPL0PPxyKBxjgdB04t89/1O/w1cDnyilFU=`

**如何取得**：
1. 與上面相同，但選擇「助手帳」的 Channel
2. 複製 Access Token

**為什麼需要**：當棋盤庫存不足時，通知管理員群組

---

#### 2.5 `LINE_ADMIN_GROUP_ID`
**說明**：管理員 LINE 群組 ID  
**值**：`C3ac7b3e3badce99a988d02519e8edb5c`

**為什麼需要**：指定要發送管理員通知的群組

---

#### 2.6 `IMGBB_API_KEY`
**說明**：ImgBB 圖片託管服務的 API Key  
**值**：`179dcdb74c6a4f1540303be93f5d259c`

**為什麼需要**：上傳生成的卦象圖片到雲端，以便 LINE 推送

---

#### 2.7 `N8N_BASE_URL` ⭐ **重點說明**

**說明**：你的 n8n 實例的基礎 URL  
**值格式**：`https://your-n8n-domain.zeabur.app`  
**實際範例**：`https://lifepharos.hnd1.zeabur.app`

**如何取得 N8N_BASE_URL**：

##### 方法 1：如果你的 n8n 已經部署在 Zeabur
1. 前往 Zeabur Dashboard
2. 找到你的 n8n 服務
3. 點擊服務名稱進入詳情頁
4. 在「Networking」或「Domains」區域，你會看到一個 URL
5. 複製這個 URL（例如：`https://lifepharos.hnd1.zeabur.app`）
6. **注意**：URL 結尾**不要**加斜線 `/`

##### 方法 2：如果你的 n8n 部署在其他地方
- 如果是自己架設：`https://your-domain.com`
- 如果是其他平台：使用該平台提供的 URL

**為什麼需要**：後端需要呼叫 n8n 的 webhook 來：
- 查詢棋盤資料（`GET /webhook/get-board`）
- 更新棋盤使用狀態（`POST /webhook/update-board`）

**完整的 webhook URL 範例**：
```
N8N_BASE_URL: https://lifepharos.hnd1.zeabur.app

實際呼叫的 URL：
- https://lifepharos.hnd1.zeabur.app/webhook/get-board
- https://lifepharos.hnd1.zeabur.app/webhook/update-board
```

---

#### 2.8 `GOOGLE_SHEET_ID`
**說明**：Google Sheets「棋盤庫存」的 ID  
**值**：`18vP5xiyvZpPdgfBlhkdHXvpYcgCxcxuJTXqVJZz9NxOo`

**如何取得**：
從 Google Sheets URL 中提取：
```
https://docs.google.com/spreadsheets/d/18vP5xiyvZpPdgfBlhkdHXvpYcgCxcxuJTXqVJZz9NxOo/edit
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                         這就是 SHEET_ID
```

**為什麼需要**：讓後端知道要操作哪個 Google Sheet

---

### 選填環境變數（稍後設定）

#### 2.9 `FRONTEND_URL`
**說明**：前端 LIFF 應用的 URL  
**值**：`https://your-frontend.zeabur.app`（**部署前端後才有**）

**設定時機**：
1. 先部署後端（暫時不設定這個）
2. 部署前端後，記錄前端 URL
3. 回來更新這個環境變數

**為什麼需要**：設定 CORS，允許前端呼叫後端 API

---

## 3. 環境變數設定完整清單

複製以下清單，在 Zeabur 逐一填入：

```env
# 必填 - 立即設定
NODE_ENV=production
PORT=3000
LINE_CHANNEL_ACCESS_TOKEN=YQANihoFPndvkey9J5aZvQgd3gmZ25weoaw7uWxmAG8wPEBLMJ2yuIoGwm1D8FwkMQkcxPku5M/o5zNYcfmySKmjUAZELsyYJtdKlKJJlhXmsaDmuwi5u/ysw9SZ7yGi65EQJrcu6DNfranfX/PacgdB04t89/1O/w1cDnyilFU=
LINE_ADMIN_CHANNEL_ACCESS_TOKEN=vN0noJiFVVBtP2ud9/tKnsPG7J0LcPKXC9gy4Ex8F+IiHxv5HJ9+LRGrbYIXwvmuFpMwWymevG3Lpy7e3mebu+lQ3UOtdeV6AG30TYSd497NMaqtFWQDp9XKz4Hy9RTSY5XXVEsqPjPL0PPxyKBxjgdB04t89/1O/w1cDnyilFU=
LINE_ADMIN_GROUP_ID=C3ac7b3e3badce99a988d02519e8edb5c
IMGBB_API_KEY=179dcdb74c6a4f1540303be93f5d259c
N8N_BASE_URL=https://lifepharos.hnd1.zeabur.app
GOOGLE_SHEET_ID=18vP5xiyvZpPdgfBlhkdHXvpYcgCxcxuJTXqVJZz9NxOo

# 選填 - 部署前端後設定
FRONTEND_URL=（先不填，等前端部署完成後再回來填）
```

---

## 4. 部署後端

設定好所有環境變數後：

1. 點擊「Deploy」按鈕
2. 等待構建完成（約 5-10 分鐘，首次部署較慢）
3. 觀察 Build Logs 和 Runtime Logs

### 檢查部署是否成功

#### 查看 Runtime Logs
應該看到：
```
🚀 Server is running on port 3000
✅ Health check endpoint: GET /health
```

#### 測試健康檢查
在瀏覽器或 curl 測試：
```bash
curl https://your-backend-url.zeabur.app/health
```

應該返回：
```json
{
  "status": "OK",
  "message": "Backend API is running"
}
```

---

## 5. 記錄後端 URL

部署成功後：
1. 在 Zeabur 服務頁面，找到「Domains」區域
2. 複製後端 URL（例如：`https://backend-abc123.zeabur.app`）
3. **保存這個 URL**，接下來會用到

---

## 接下來的步驟

✅ **你已完成**：後端部署

⏭️ **下一步**：
1. 部署前端（參考 `docs/DEPLOYMENT.md`）
2. 更新前端 config.js 的 API_BASE_URL
3. 回來更新後端的 FRONTEND_URL 環境變數
4. 匯入 n8n workflows
5. 更新 LINE LIFF Endpoint

---

## 常見問題

### Q1: 找不到 n8n URL？
**A**: 檢查你的 n8n 是否已經部署並正在運行。如果還沒有，請先部署 n8n。

### Q2: 環境變數設定錯誤怎麼辦？
**A**: 在 Zeabur 服務頁面，點擊「Environment Variables」，修改後點擊「Save」，服務會自動重啟。

### Q3: Runtime Logs 顯示錯誤？
**A**: 檢查環境變數是否都正確設定，特別注意沒有多餘的空格或換行。

### Q4: 可以先不設定 N8N_BASE_URL 嗎？
**A**: 不行。後端啟動時會驗證這個環境變數，沒有設定會導致啟動失敗。

---

## 需要幫助？

查看詳細文檔：
- 完整部署指南：`docs/DEPLOYMENT.md`
- API 文檔：`docs/API.md`
- 測試指南：`docs/TESTING.md`

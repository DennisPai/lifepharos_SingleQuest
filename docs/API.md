# API 文檔 - 象棋卜卦 LIFF 後端 API

## 基本資訊

**Base URL**: `https://your-backend.zeabur.app` (部署後更新)

**Content-Type**: `application/json`

**認證方式**: 無需認證（LIFF 提供的 userId 作為識別）

---

## API Endpoints

### 1. 檢查棋盤狀態

**端點**: `GET /api/divination/check`

**描述**: 檢查指定任務ID的棋盤是否可用，以及是否已被使用

**查詢參數**:
| 參數名 | 類型 | 必填 | 說明 |
|--------|------|------|------|
| `taskId` | string | 是 | 任務ID，格式：ID{timestamp}<br/>範例：`ID1768651944450563` |
| `userId` | string | 是 | LINE 用戶ID<br/>範例：`Uabc123...` |

**請求範例**:
```http
GET /api/divination/check?taskId=ID1768651944450563&userId=Uabc123...
```

**成功回應（未使用）**:
```json
{
  "canStart": true,
  "used": false,
  "boardOrder": "將仕象俥兵卒俥兵士車仕兵卒馬車傌兵兵炮炮相傌帥卒包馬卒包卒象相士"
}
```

**成功回應（已使用）**:
```json
{
  "canStart": false,
  "used": true,
  "previousResult": {
    "question": "今年事業運如何？",
    "pieces": [
      { "name": "士", "color": "black" },
      { "name": "炮", "color": "black" },
      { "name": "相", "color": "red" },
      { "name": "帥", "color": "red" },
      { "name": "士", "color": "black" }
    ],
    "imageUrl": "https://i.ibb.co/xxx/xxx.png"
  }
}
```

**錯誤回應**:

*任務ID不存在* (404):
```json
{
  "error": "Task ID not found",
  "message": "找不到此任務ID，請確認預約資訊"
}
```

*用戶ID不匹配* (403):
```json
{
  "error": "User ID mismatch",
  "message": "此任務不屬於您，請確認預約資訊"
}
```

*n8n 連線失敗* (500):
```json
{
  "error": "Internal server error",
  "message": "系統暫時無法處理，請稍後再試"
}
```

---

### 2. 提交抽卦結果

**端點**: `POST /api/divination/submit`

**描述**: 提交用戶選擇的問題和數字，生成卦象並推送結果

**請求 Body**:
```json
{
  "taskId": "ID1768651944450563",
  "userId": "Uabc123...",
  "question": "今年事業運如何？",
  "selectedNumbers": [9, 19, 21, 23, 32]
}
```

**欄位說明**:
| 欄位名 | 類型 | 必填 | 驗證規則 |
|--------|------|------|----------|
| `taskId` | string | 是 | 格式：ID{timestamp} |
| `userId` | string | 是 | LINE 用戶ID |
| `question` | string | 是 | 長度：1-30字 |
| `selectedNumbers` | array | 是 | 必須5個數字<br/>範圍：1-32<br/>不可重複 |

**成功回應** (200):
```json
{
  "success": true,
  "imageUrl": "https://i.ibb.co/xxx/xxx.png",
  "pieces": [
    { "name": "士", "color": "black" },
    { "name": "炮", "color": "black" },
    { "name": "相", "color": "red" },
    { "name": "帥", "color": "red" },
    { "name": "士", "color": "black" }
  ],
  "question": "今年事業運如何？"
}
```

**錯誤回應**:

*資料驗證失敗* (400):
```json
{
  "error": "Validation error",
  "message": "問題長度必須在1-30字之間",
  "field": "question"
}
```

```json
{
  "error": "Validation error",
  "message": "必須選擇正好5個數字",
  "field": "selectedNumbers"
}
```

```json
{
  "error": "Validation error",
  "message": "數字範圍必須在1-32之間",
  "field": "selectedNumbers"
}
```

```json
{
  "error": "Validation error",
  "message": "數字不可重複",
  "field": "selectedNumbers"
}
```

*任務已使用* (409):
```json
{
  "error": "Task already used",
  "message": "此任務已經完成抽卦，請勿重複操作"
}
```

*用戶ID不匹配* (403):
```json
{
  "error": "User ID mismatch",
  "message": "此任務不屬於您"
}
```

*圖片生成失敗* (500):
```json
{
  "error": "Image generation failed",
  "message": "圖片生成失敗，請稍後再試"
}
```

*圖片上傳失敗* (500):
```json
{
  "error": "Image upload failed",
  "message": "圖片上傳失敗，請稍後再試"
}
```

---

## 內部服務（n8n Webhooks）

### 1. 查詢棋盤資料

**端點**: `POST https://lifepharos.hnd1.zeabur.app/webhook/get-board`

**描述**: 從 Google Sheets 查詢指定任務ID的棋盤資料

**請求 Body**:
```json
{
  "taskId": "ID1768651944450563"
}
```

**回應**:
```json
{
  "success": true,
  "taskId": "ID1768651944450563",
  "userId": "Uabc123...",
  "boardOrder": "將仕象俥兵卒俥兵士車仕兵卒馬車傌兵兵炮炮相傌帥卒包馬卒包卒象相士",
  "used": false,
  "result": null
}
```

### 2. 更新棋盤使用記錄

**端點**: `POST https://lifepharos.hnd1.zeabur.app/webhook/update-board`

**描述**: 更新 Google Sheets 中的棋子位置（P-T 欄位）

**請求 Body**:
```json
{
  "taskId": "ID1768651944450563",
  "positions": [9, 19, 21, 23, 32]
}
```

**回應**:
```json
{
  "success": true,
  "updated": true,
  "rowNumber": 13
}
```

---

## 錯誤處理

### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 400 | 請求參數錯誤 |
| 403 | 權限不足（用戶ID不匹配） |
| 404 | 資源不存在（任務ID未找到） |
| 409 | 衝突（任務已使用） |
| 429 | 請求過於頻繁（Rate limit） |
| 500 | 伺服器內部錯誤 |
| 503 | 服務暫時無法使用 |

### 通用錯誤格式

```json
{
  "error": "錯誤類型",
  "message": "給用戶的友善訊息",
  "field": "相關欄位（可選）"
}
```

---

## Rate Limiting

**限制規則**: 
- 每個 userId 每分鐘最多 5 次請求
- 超過限制返回 429 狀態碼

**回應範例**:
```json
{
  "error": "Too many requests",
  "message": "請求過於頻繁，請稍後再試",
  "retryAfter": 60
}
```

---

## 測試資料

### 測試用 taskId
- `TEST_1234567890123` - 未使用的測試棋盤
- `TEST_9876543210987` - 已使用的測試棋盤

### 測試用 userId
- `Utest123456789abcdef` - 測試用戶ID

---

## 部署資訊

### 環境變數

後端需要的環境變數：
```bash
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
IMGBB_API_KEY=179dcdb74c6a4f1540303be93f5d259c
N8N_WEBHOOK_BASE_URL=https://lifepharos.hnd1.zeabur.app
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.zeabur.app
```

### 部署後更新

部署完成後需要更新：
1. 本文檔的 Base URL
2. 前端 `config.js` 的 `API_BASE_URL`
3. LIFF Endpoint URL（LINE Developers Console）

---

## 變更歷史

| 日期 | 版本 | 變更內容 |
|------|------|----------|
| 2026-02-02 | 1.0 | 初始版本，定義 check 和 submit API |

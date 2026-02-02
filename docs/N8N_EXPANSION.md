# n8n 預約系統擴充文檔

## 概述

本文檔詳細說明如何擴充現有的預約系統（助手帳）workflow，以支援「單一問題」抽卦功能。

---

## 擴充目標

在客戶完成「預約單一問題」付款後，自動：
1. 從棋盤庫存分配一個未使用的棋盤
2. 將 Booking ID 和 USER_ID 寫入棋盤庫存
3. 推送 Flex Message（開始抽卦按鈕）給客戶

---

## 擴充位置

**workflow 名稱**: `預約系統(助手帳).json`

**插入節點位置**: "Google Sheets Update" 節點之後

**原有流程保留**: 其他預約項目（綜合諮詢、年運、命盤）的流程不受影響

---

## 新增節點清單（共 11 個）

| # | 節點類型 | 節點名稱 |
|---|---------|---------|
| 6 | IF | Check If Single Question |
| 7 | Google Sheets | Find Available Board |
| 8 | IF | Check Board Available |
| 9 | Function | Prepare Board Assignment |
| 10 | Google Sheets | Assign Board to User |
| 11 | Function | Build Flex Message |
| 12 | HTTP Request | Push Start Divination Flex |
| 13 | Function | Build No Board Alert |
| 14 | HTTP Request | Notify Customer No Board |
| 15 | HTTP Request | Notify Admin No Board |
| 16 | Merge | Merge All Paths |

---

## 詳細節點配置

### 節點 6 - Check If Single Question (IF)

**目的**: 判斷預約項目是否為「預約單一問題」

**條件設定**:
```javascript
{{ $('Prepare Update Data').item.json.預約項目 }}
```
- Operator: equals
- Value: `預約單一問題`

**輸出分支**:
- True → 節點 7（Find Available Board）
- False → LINE Push Teacher Selection（原有節點）

---

### 節點 7 - Find Available Board (Google Sheets)

**目的**: 查詢第一個未使用的棋盤

**配置**:
- Operation: **Read** (lookup rows)
- Spreadsheet ID: `18vP5xiyvZpPdgfBlhkdHXvpYcgXcxuJTXqVJZz9NxOo`
- Sheet Name: `工作表1`（或實際的棋盤庫存表名）
- Filters:
  - Column: `已使用`
  - Operator: `isEmpty` 或 `equals ""`
- Sort By: `編號` (Ascending)
- Limit: `1`（只取第一筆）

**重要提示**:
- 確保 Google Sheets 認證已設定
- 棋盤庫存的「已使用」欄位（D欄）使用公式：`=IF(Z13="","")`
- 當 Z 欄為空時，D 欄也為空，表示未使用

---

### 節點 8 - Check Board Available (IF)

**目的**: 檢查是否找到可用棋盤

**條件設定**:
```javascript
{{ $json.編號 }}
```
- Operator: `exists` 或 `isNotEmpty`

**輸出分支**:
- True → 節點 9（有可用棋盤）
- False → 節點 13（無可用棋盤）

---

### 節點 9 - Prepare Board Assignment (Function)

**目的**: 準備棋盤分配的資料

**程式碼**:
```javascript
const bookingData = $('Prepare Update Data').item.json;
const boardData = $input.first().json;

return [{
  json: {
    taskId: bookingData.bookingId,      // Booking ID = 任務ID
    userId: bookingData.user_ID,         // 用戶 LINE ID
    boardNumber: boardData.編號,         // 棋盤編號
    boardOrder: boardData.棋盤總順序,    // 棋盤字串
    customerName: bookingData.稱呼       // 客戶稱呼
  }
}];
```

**輸入資料來源**:
- `Prepare Update Data` 節點：bookingId, user_ID, 稱呼
- 上一個節點（Find Available Board）：編號, 棋盤總順序

---

### 節點 10 - Assign Board to User (Google Sheets)

**目的**: 更新棋盤庫存，分配給客戶

**配置**:
- Operation: **Update**
- Spreadsheet ID: `18vP5xiyvZpPdgfBlhkdHXvpYcgXcxuJTXqVJZz9NxOo`
- Sheet Name: `工作表1`
- Columns Mapping Mode: `Define Below`
- Match Column: `編號`
- Match Value: `{{ $json.boardNumber }}`
- Update Columns:
  - `任務ID`: `{{ $json.taskId }}`
  - `USER_ID`: `{{ $json.userId }}`

**重要**:
- **不要更新** `已使用` 欄位（D欄）
- **不要更新** `結果` 欄位（Z欄）
- 這兩個欄位由 Google Sheets 公式自動計算

---

### 節點 11 - Build Flex Message (Function)

**目的**: 構建符合 LINE 官方規範的 Flex Message

**程式碼**:
```javascript
const taskId = $json.taskId;
const liffUrl = `https://liff.line.me/2008987238-9DfMVogB?taskId=${taskId}`;

const flexMessage = {
  type: 'flex',
  altText: '準備開始抽卦囉！',
  contents: {
    type: 'bubble',
    size: 'kilo',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '✨ 準備抽卦囉',
          weight: 'bold',
          size: 'xl',
          color: '#FFFFFF',
          align: 'center'
        }
      ],
      backgroundColor: '#3B6E98',
      paddingAll: '15px'
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '感謝您完成預約！',
          size: 'md',
          weight: 'bold',
          margin: 'none',
          color: '#3B6E98'
        },
        {
          type: 'text',
          text: '請點擊下方按鈕開始抽卦，系統將引導您：',
          size: 'sm',
          color: '#666666',
          wrap: true,
          margin: 'md'
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '1️⃣ 輸入您的問題（30字內）',
              size: 'xs',
              color: '#333333',
              wrap: true
            },
            {
              type: 'text',
              text: '2️⃣ 輸入5個數字進行抽卦',
              size: 'xs',
              color: '#333333',
              wrap: true,
              margin: 'sm'
            },
            {
              type: 'text',
              text: '3️⃣ 查看您的卦象結果',
              size: 'xs',
              color: '#333333',
              wrap: true,
              margin: 'sm'
            }
          ],
          backgroundColor: '#F5F5F5',
          paddingAll: '10px',
          cornerRadius: '8px',
          margin: 'md'
        }
      ],
      paddingAll: '20px'
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '🎲 開始抽卦',
            uri: liffUrl
          },
          style: 'primary',
          color: '#3B6E98',
          height: 'sm'
        }
      ],
      paddingAll: '15px'
    }
  }
};

return [{
  json: {
    pushMessageBody: JSON.stringify({
      to: $json.userId,
      messages: [flexMessage]
    })
  }
}];
```

**注意事項**:
- LIFF URL 必須包含 `taskId` 參數
- Flex Message 必須符合 LINE 官方規範
- 配色使用品牌色（#3B6E98）

---

### 節點 12 - Push Start Divination Flex (HTTP Request)

**目的**: 推送 Flex Message 給客戶

**配置**:
- Method: `POST`
- URL: `https://api.line.me/v2/bot/message/push`
- Headers:
  - `Authorization`: `Bearer YQANihoFPndvkey9J5aZvQgd3gmZ25weoaw7uWxmAG8wPEBLMJ2yuIoGwm1D8FwkMQkcxPku5M/o5zNYcfmySKmjUAZELsyYJtdKlKJJlhXmsaDmuwi5u/ysw9SZ7yGi65EQJrcu6DNfranfX/PacgdB04t89/1O/w1cDnyilFU=`（主帳號 token）
  - `Content-Type`: `application/json`
- Body Type: `JSON`
- Body: `{{ $json.pushMessageBody }}`

**重要**:
- 使用**主帳號**的 Access Token（不是助手帳）
- 確保 token 有效且有權限推送訊息

---

### 節點 13 - Build No Board Alert (Function)

**目的**: 構建無可用棋盤的警告訊息

**程式碼**:
```javascript
const bookingData = $('Prepare Update Data').item.json;

// 客戶訊息
const customerMessage = {
  type: 'text',
  text: '抱歉，目前棋盤庫存不足，我們正在為您準備新的棋盤。\n\n請稍候，管理員將盡快為您處理，感謝您的耐心等待。'
};

// 管理員警告訊息
const adminAlertMessage = {
  type: 'text',
  text: `⚠️ 棋盤庫存不足警告\n\n客戶：${bookingData.稱呼}\nBooking ID：${bookingData.bookingId}\nUSER_ID：${bookingData.user_ID}\n\n請盡快補充棋盤庫存！`
};

return [{
  json: {
    customerUserId: bookingData.user_ID,
    customerMessageBody: JSON.stringify({
      to: bookingData.user_ID,
      messages: [customerMessage]
    }),
    adminMessageBody: JSON.stringify({
      to: 'C3ac7b3e3badce99a988d02519e8edb5c', // 管理員群組ID
      messages: [adminAlertMessage]
    })
  }
}];
```

---

### 節點 14 - Notify Customer No Board (HTTP Request)

**目的**: 通知客戶無可用棋盤

**配置**:
- Method: `POST`
- URL: `https://api.line.me/v2/bot/message/push`
- Headers:
  - `Authorization`: `Bearer YQANihoFPndvkey9J5aZvQgd3gmZ25weoaw7uWxmAG8wPEBLMJ2yuIoGwm1D8FwkMQkcxPku5M/o5zNYcfmySKmjUAZELsyYJtdKlKJJlhXmsaDmuwi5u/ysw9SZ7yGi65EQJrcu6DNfranfX/PacgdB04t89/1O/w1cDnyilFU=`（主帳號）
  - `Content-Type`: `application/json`
- Body Type: `JSON`
- Body: `={{ $json.customerMessageBody }}`

---

### 節點 15 - Notify Admin No Board (HTTP Request)

**目的**: 通知管理員棋盤庫存不足

**配置**:
- Method: `POST`
- URL: `https://api.line.me/v2/bot/message/push`
- Headers:
  - `Authorization`: `Bearer vN0noJiFVVBtP2ud9/tKnsPG7J0LcPKXC9gy4Ex8F+IiHxv5HJ9+LRGrbYIXwvmuFpMwWymevG3Lpy7e3mebu+lQ3UOtdeV6AG30TYSd497NMaqtFWQDp9XKz4Hy9RTSY5XXVEsqPjPL0PPxyKBxjgdB04t89/1O/w1cDnyilFU=`（助手帳）
  - `Content-Type`: `application/json`
- Body Type: `JSON`
- Body: `={{ $json.adminMessageBody }}`

---

### 節點 16 - Merge All Paths (Merge)

**目的**: 合併所有分支路徑

**配置**:
- Mode: `Wait for All Incoming Items`
- 合併以下分支：
  - Push Start Divination Flex（節點 12）
  - Notify Admin No Board（節點 15）
  - LINE Push Teacher Selection（原有節點，處理其他預約項目）

---

## 節點連接關係

### 原有連接調整

1. **"Google Sheets Update"** → **"Check If Single Question"**（節點 6，新增）

### 新增連接

```
Check If Single Question (6)
├─ True → Find Available Board (7)
└─ False → LINE Push Teacher Selection (原有)

Find Available Board (7) → Check Board Available (8)

Check Board Available (8)
├─ True → Prepare Board Assignment (9)
└─ False → Build No Board Alert (13)

Prepare Board Assignment (9) → Assign Board to User (10)
Assign Board to User (10) → Build Flex Message (11)
Build Flex Message (11) → Push Start Divination Flex (12)

Build No Board Alert (13) → Notify Customer No Board (14)
Notify Customer No Board (14) → Notify Admin No Board (15)

Push Start Divination Flex (12) → Merge All Paths (16)
Notify Admin No Board (15) → Merge All Paths (16)
LINE Push Teacher Selection (原有) → ... → Merge All Paths (16)

Merge All Paths (16) → LINE Reply message (原有)
LINE Reply message → Respond to Webhook (原有)
```

---

## 測試步驟

### 1. 測試「預約單一問題」流程

**步驟**:
1. 在主帳號發送訊息：`預約單一問題`
2. 確認助手帳收到預約通知（template message）
3. 在助手帳群組發送：`確認完成預約客戶：ID{timestamp}`
4. **預期結果**:
   - 棋盤庫存中找到第一個未使用的棋盤
   - 任務ID 和 USER_ID 已更新
   - 客戶收到 Flex Message（開始抽卦按鈕）
   - 助手帳收到 reply 訊息確認

### 2. 測試「其他預約項目」流程

**步驟**:
1. 在主帳號發送：`預約綜合諮詢1小時`
2. 助手帳確認付款
3. **預期結果**:
   - 執行原有流程（選擇老師）
   - **不會**觸發棋盤分配
   - **不會**推送 Flex Message

### 3. 測試「無可用棋盤」情況

**步驟**:
1. 手動將所有棋盤的「已使用」欄位填入任意值
2. 執行「預約單一問題」流程
3. **預期結果**:
   - 客戶收到訊息：「棋盤庫存不足...」
   - 管理員群組收到警告訊息
   - workflow 正常結束（不會報錯）

### 4. 測試 Flex Message 點擊

**步驟**:
1. 客戶收到 Flex Message 後點擊「開始抽卦」按鈕
2. **預期結果**:
   - 開啟 LIFF 頁面
   - URL 包含正確的 `taskId` 參數
   - LIFF 頁面能正常初始化

---

## 常見問題

### Q1: 如何確認 Google Sheets 認證已設定？

**A**: 在 n8n 中：
1. 點擊任一 Google Sheets 節點
2. 檢查 "Credential" 欄位
3. 應該顯示 "Google Sheets account" 或類似名稱
4. 測試連接是否正常

### Q2: 如何查看節點執行結果？

**A**:
1. 在 n8n 中點擊 "Execute Workflow"
2. 查看每個節點的輸出資料
3. 綠色勾表示成功，紅色叉表示失敗
4. 點擊節點可查看詳細的輸入/輸出

### Q3: Flex Message 格式錯誤怎麼辦？

**A**:
1. 使用 LINE Flex Message Simulator 驗證 JSON
2. 網址：https://developers.line.biz/flex-simulator/
3. 確保所有必填欄位都已填寫
4. 檢查顏色代碼格式（#RRGGBB）
5. 確保 URI 正確且可訪問

### Q4: 為什麼不更新「已使用」欄位？

**A**:
- 「已使用」欄位（D欄）由 Google Sheets 公式自動計算
- 公式：`=IF(Z13="","")`
- 當 P-T 欄位填入後，Z 欄會自動計算出結果
- Z 欄有值後，D 欄自動顯示「已使用」
- 直接更新 D 欄會覆蓋公式，導致邏輯錯誤

### Q5: 如何處理並發情況？

**A**:
- Google Sheets 的 Update 操作具有原子性
- n8n workflow 按順序執行，不會並發
- 如果擔心並發，可在後端 API 再次驗證

---

## 重要注意事項

### ⚠️ 必須遵守

1. **不要更新公式欄位**
   - 已使用（D欄）
   - 結果（Z欄）
   - 這些欄位由公式自動計算

2. **確認 Access Token 正確**
   - 節點 12, 14：使用主帳號 token
   - 節點 15：使用助手帳 token

3. **測試前備份資料**
   - 複製一份 Google Sheets 作為測試表
   - 或使用測試專用的行（taskId 加 TEST_ 前綴）

4. **Flex Message 必須符合規範**
   - 使用 LINE Flex Simulator 驗證
   - 避免使用不支援的屬性

### ✅ 最佳實踐

1. **逐節點測試**
   - 建立一個節點後立即測試
   - 確認輸入/輸出符合預期

2. **保留原有流程**
   - 其他預約項目的流程不受影響
   - 使用 IF 節點分流

3. **錯誤處理**
   - 無可用棋盤時通知管理員
   - 不要讓 workflow 直接報錯

4. **記錄變更**
   - 更新 WORKLOG.md
   - 記錄每個重要變更

---

## 部署檢查清單

- [ ] 所有 11 個節點已建立
- [ ] 節點連接正確
- [ ] Google Sheets 認證已設定
- [ ] Access Token 已填入且正確
- [ ] Flex Message JSON 已驗證
- [ ] 測試「預約單一問題」流程
- [ ] 測試「其他預約項目」流程
- [ ] 測試「無可用棋盤」情況
- [ ] 測試 Flex Message 點擊
- [ ] workflow 已啟用（Active）

---

## 變更歷史

| 日期 | 版本 | 變更內容 |
|------|------|----------|
| 2026-02-02 | 1.0 | 初始版本，定義擴充方案 |

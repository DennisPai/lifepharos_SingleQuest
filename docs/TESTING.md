# 測試文檔 - 象棋卜卦 LIFF 系統

## 測試環境

**測試策略**: 全部使用正式環境進行測試

**測試資料**: 使用特殊前綴的 taskId（例如：`TEST_1234567890123`）

---

## 測試前準備

### 1. 後端本地測試

```bash
cd backend
npm install
cp .env.example .env
# 編輯 .env 填入實際的環境變數
npm run dev
```

檢查後端是否正常啟動：
```bash
curl http://localhost:3000/health
```

預期回應：
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T...",
  "environment": "development"
}
```

### 2. n8n Workflows 部署

參考 [`n8n_workflows/README.md`](../n8n_workflows/README.md) 完成：
- [ ] 匯入 `get-board-by-taskid.json`
- [ ] 匯入 `update-board-usage.json`
- [ ] 擴充 `預約系統(助手帳).json`
- [ ] 測試所有 webhook 端點

### 3. 測試資料準備

在 Google Sheets（棋盤庫存）中準備測試資料：

| 編號 | 任務ID | USER_ID | 已使用 | 棋盤總順序 |
|------|--------|---------|--------|-----------|
| TEST_001 | TEST_1234567890123 | Utest123 | | 將仕象俥兵卒俥兵士車仕兵卒馬車傌兵兵炮炮相傌帥卒包馬卒包卒象相士 |
| TEST_002 | TEST_9876543210987 | Utest456 | 士、炮、相、帥、士 | 將仕象俥兵卒俥兵士車仕兵卒馬車傌兵兵炮炮相傌帥卒包馬卒包卒象相士 |

---

## 測試案例

### 測試組 1：n8n Workflows 測試

#### Test 1.1: 查詢未使用的棋盤

**測試端點**: `POST /webhook/get-board`

**請求**:
```bash
curl -X POST https://lifepharos.hnd1.zeabur.app/webhook/get-board \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TEST_1234567890123"}'
```

**預期回應**:
```json
{
  "success": true,
  "taskId": "TEST_1234567890123",
  "userId": "Utest123",
  "boardOrder": "將仕象俥兵卒...",
  "used": false,
  "result": null
}
```

**驗證點**:
- ✅ success = true
- ✅ used = false
- ✅ boardOrder 存在且為完整字串
- ✅ result = null

---

#### Test 1.2: 查詢已使用的棋盤

**請求**:
```bash
curl -X POST https://lifepharos.hnd1.zeabur.app/webhook/get-board \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TEST_9876543210987"}'
```

**預期回應**:
```json
{
  "success": true,
  "taskId": "TEST_9876543210987",
  "userId": "Utest456",
  "boardOrder": "將仕象俥兵卒...",
  "used": true,
  "result": "士、炮、相、帥、士"
}
```

**驗證點**:
- ✅ success = true
- ✅ used = true
- ✅ result 存在且格式正確

---

#### Test 1.3: 查詢不存在的 taskId

**請求**:
```bash
curl -X POST https://lifepharos.hnd1.zeabur.app/webhook/get-board \
  -H "Content-Type: application/json" \
  -d '{"taskId":"NOTEXIST123"}'
```

**預期回應**:
```json
{
  "success": false,
  "error": "Task ID not found"
}
```

**驗證點**:
- ✅ success = false
- ✅ error 訊息正確

---

#### Test 1.4: 更新棋盤使用記錄

**請求**:
```bash
curl -X POST https://lifepharos.hnd1.zeabur.app/webhook/update-board \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TEST_1234567890123","positions":[9,19,21,23,32]}'
```

**預期回應**:
```json
{
  "success": true,
  "updated": true,
  "rowNumber": 123
}
```

**驗證點**:
- ✅ success = true
- ✅ updated = true
- ✅ 檢查 Google Sheets：P-T 欄位已更新為 9, 19, 21, 23, 32
- ✅ 檢查 Z 欄：公式自動計算出 "士、炮、相、帥、士"
- ✅ 檢查 D 欄：自動顯示 "士、炮、相、帥、士"

---

### 測試組 2：後端 API 測試

#### Test 2.1: 檢查未使用的棋盤

**請求**:
```bash
curl -X GET "http://localhost:3000/api/divination/check?taskId=TEST_1234567890123&userId=Utest123"
```

**預期回應**:
```json
{
  "canStart": true,
  "used": false,
  "boardOrder": "將仕象俥兵卒..."
}
```

**驗證點**:
- ✅ canStart = true
- ✅ used = false
- ✅ boardOrder 正確

---

#### Test 2.2: 檢查已使用的棋盤

**請求**:
```bash
curl -X GET "http://localhost:3000/api/divination/check?taskId=TEST_9876543210987&userId=Utest456"
```

**預期回應**:
```json
{
  "canStart": false,
  "used": true,
  "previousResult": {
    "question": "（之前的問題）",
    "pieces": [
      {"name": "士", "color": "black"},
      {"name": "炮", "color": "black"},
      {"name": "相", "color": "red"},
      {"name": "帥", "color": "red"},
      {"name": "士", "color": "black"}
    ]
  }
}
```

**驗證點**:
- ✅ canStart = false
- ✅ used = true
- ✅ previousResult.pieces 正確解析

---

#### Test 2.3: userId 不匹配

**請求**:
```bash
curl -X GET "http://localhost:3000/api/divination/check?taskId=TEST_1234567890123&userId=WRONG_USER"
```

**預期回應**: HTTP 403
```json
{
  "error": "User ID mismatch",
  "message": "此任務不屬於您，請確認預約資訊"
}
```

**驗證點**:
- ✅ HTTP 狀態碼 = 403
- ✅ 錯誤訊息友善

---

#### Test 2.4: 提交抽卦（成功）

**請求**:
```bash
curl -X POST http://localhost:3000/api/divination/submit \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TEST_1234567890123",
    "userId": "Utest123",
    "question": "測試問題",
    "selectedNumbers": [9, 19, 21, 23, 32]
  }'
```

**預期回應**:
```json
{
  "success": true,
  "imageUrl": "https://i.ibb.co/...",
  "pieces": [
    {"name": "士", "color": "black"},
    {"name": "炮", "color": "black"},
    {"name": "相", "color": "red"},
    {"name": "帥", "color": "red"},
    {"name": "士", "color": "black"}
  ],
  "question": "測試問題"
}
```

**驗證點**:
- ✅ success = true
- ✅ imageUrl 存在且可訪問
- ✅ pieces 陣列正確（5 個棋子）
- ✅ question 正確
- ✅ 檢查 Google Sheets P-T 欄位已更新
- ✅ 檢查 LINE 推送訊息成功（需實際 LINE 環境）

---

#### Test 2.5: 資料驗證測試

**Test 2.5.1: 問題過長**
```bash
curl -X POST http://localhost:3000/api/divination/submit \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TEST_1234567890123",
    "userId": "Utest123",
    "question": "這是一個超過三十個字的問題這是一個超過三十個字的問題",
    "selectedNumbers": [9, 19, 21, 23, 32]
  }'
```

**預期**: HTTP 400，錯誤訊息 "問題長度不可超過 30 字"

---

**Test 2.5.2: 數字數量不對**
```bash
curl -X POST http://localhost:3000/api/divination/submit \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TEST_1234567890123",
    "userId": "Utest123",
    "question": "測試",
    "selectedNumbers": [9, 19, 21]
  }'
```

**預期**: HTTP 400，錯誤訊息 "必須選擇正好 5 個數字"

---

**Test 2.5.3: 數字超出範圍**
```bash
curl -X POST http://localhost:3000/api/divination/submit \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TEST_1234567890123",
    "userId": "Utest123",
    "question": "測試",
    "selectedNumbers": [9, 19, 21, 23, 99]
  }'
```

**預期**: HTTP 400，錯誤訊息 "數字範圍必須在 1-32 之間"

---

**Test 2.5.4: 數字重複**
```bash
curl -X POST http://localhost:3000/api/divination/submit \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TEST_1234567890123",
    "userId": "Utest123",
    "question": "測試",
    "selectedNumbers": [9, 19, 9, 23, 32]
  }'
```

**預期**: HTTP 400，錯誤訊息 "數字不可重複"

---

### 測試組 3：預約系統擴充測試

#### Test 3.1: 預約單一問題流程

**步驟**:
1. 在主帳號 LINE 中發送：`預約單一問題`
2. 主帳號推送付款訊息
3. 在預約表單中手動將該筆資料的「是否已繳款？」改為「待付款」
4. 在助手帳群組中發送：`確認完成預約客戶：ID{剛剛的BookingID}`

**預期結果**:
- ✅ 助手帳 workflow 觸發
- ✅ 更新預約表單「是否已繳款？」為「確認已付款」
- ✅ IF 判斷進入「單一問題」分支
- ✅ 從棋盤庫存找到第一個未使用的棋盤
- ✅ 更新棋盤的「任務ID」和「USER_ID」
- ✅ 推送 Flex Message 給客戶（主帳號）
- ✅ Flex Message 包含「開始抽卦」按鈕
- ✅ 按鈕 URI 包含正確的 taskId 參數

---

#### Test 3.2: 預約其他項目流程

**步驟**:
1. 在主帳號 LINE 中發送：`預約綜合諮詢1小時`
2. 助手帳確認付款

**預期結果**:
- ✅ 執行原有流程（推送選擇老師訊息）
- ✅ **不會**進入「單一問題」分支
- ✅ **不會**分配棋盤
- ✅ **不會**推送 Flex Message

---

#### Test 3.3: 無可用棋盤測試

**步驟**:
1. 手動將棋盤庫存所有行的「已使用」欄位填入任意值（模擬庫存耗盡）
2. 執行「預約單一問題」流程

**預期結果**:
- ✅ Find Available Board 節點返回空
- ✅ 進入「無可用棋盤」分支
- ✅ 推送訊息給客戶：「棋盤庫存不足...」
- ✅ 推送警告給管理員群組
- ✅ workflow 正常結束（不報錯）

**測試後清理**: 清空測試資料的「已使用」欄位

---

### 測試組 4：LIFF 前端測試

#### Test 4.1: 點擊 Flex Message 開啟 LIFF

**步驟**:
1. 在 LINE 中收到 Flex Message
2. 點擊「開始抽卦」按鈕

**預期結果**:
- ✅ 開啟 LIFF 頁面
- ✅ 顯示「正在檢查資料...」Loading 畫面
- ✅ LIFF 初始化成功
- ✅ 從 URL 正確獲取 taskId
- ✅ 從 liff.getContext() 正確獲取 userId

---

#### Test 4.2: 輸入問題頁面

**步驟**:
1. LIFF 檢查完成後顯示輸入問題頁面

**測試項目**:
- [ ] 標題顯示正確
- [ ] 輸入框可正常輸入
- [ ] 字數計數器即時更新（0/30）
- [ ] 問題為空時「下一步」按鈕禁用
- [ ] 輸入文字後「下一步」按鈕啟用
- [ ] 輸入超過 30 字時無法繼續輸入
- [ ] 點擊「下一步」進入數字輸入頁面

---

#### Test 4.3: 輸入數字頁面

**測試項目**:
- [ ] 標題和說明文字顯示正確
- [ ] 輸入框可正常輸入
- [ ] 即時驗證功能正常

**驗證測試**:
| 輸入 | 預期結果 |
|------|----------|
| `9,19,21,23,32` | ✅ 格式正確，按鈕啟用 |
| `9,19,21` | ❌ 必須正好 5 個數字 |
| `9,19,21,23,99` | ❌ 數字範圍 1-32 |
| `9,19,9,23,32` | ❌ 數字不可重複 |
| `abc,def,ghi` | ❌ 請輸入有效數字 |
| `9, 19, 21, 23, 32` | ✅ 允許空格，自動處理 |

**操作測試**:
- [ ] 點擊「返回」回到問題頁面
- [ ] 點擊「開始抽卦」進入處理中頁面

---

#### Test 4.4: 處理中頁面

**測試項目**:
- [ ] 顯示 Loading 動畫
- [ ] 顯示「正在為您排卦...」
- [ ] 等待後端處理（可能需要 3-10 秒）
- [ ] 自動跳轉到結果頁面

---

#### Test 4.5: 結果顯示頁面

**測試項目**:
- [ ] 標題顯示正確
- [ ] 5 個棋子正確顯示在十字位置
- [ ] 棋子顏色正確（紅/黑）
- [ ] 用戶問題正確顯示
- [ ] 顯示「老師將於24小時內回覆您」
- [ ] 同時收到 LINE 推送訊息（圖片 + 文字）
- [ ] 點擊「完成」按鈕關閉 LIFF

---

#### Test 4.6: 已使用頁面（防呆測試）

**步驟**:
1. 完成一次抽卦後
2. 重新點擊「開始抽卦」按鈕

**預期結果**:
- ✅ 顯示「該問題您已抽卦」
- ✅ 顯示之前的抽卦結果
- ✅ 5 個棋子正確顯示
- ✅ 之前的問題正確顯示
- ✅ 顯示「回到聊天室」按鈕
- ✅ 點擊按鈕關閉 LIFF

---

### 測試組 5：完整流程測試（E2E）

#### Test 5.1: 新用戶完整流程

**步驟**:
1. 客戶發送預約訊息：`預約單一問題`
2. 助手帳確認收款
3. 客戶收到 Flex Message
4. 點擊「開始抽卦」開啟 LIFF
5. 輸入問題："今年事業運如何？"
6. 輸入數字：`9,19,21,23,32`
7. 點擊「開始抽卦」
8. 等待處理
9. 查看結果
10. 檢查 LINE 聊天室是否收到圖片和訊息
11. 點擊「完成」關閉 LIFF

**預期結果**:
- ✅ 所有步驟順利完成
- ✅ 卦象圖片正確生成
- ✅ 圖片成功上傳到 ImgBB
- ✅ LINE 推送成功
- ✅ Google Sheets 正確更新
- ✅ LIFF 正確關閉

**資料驗證**:
- 檢查棋盤庫存：
  - ✅ P-T 欄位 = 9, 19, 21, 23, 32
  - ✅ Z 欄自動顯示結果（例如："士、炮、相、帥、士"）
  - ✅ D 欄自動顯示「已使用」

---

#### Test 5.2: 重複抽卦防呆測試

**步驟**:
1. 在上一個測試完成後
2. 重新點擊 Flex Message 的「開始抽卦」按鈕
3. 開啟 LIFF

**預期結果**:
- ✅ LIFF 檢查發現已使用
- ✅ 直接顯示「已使用頁面」
- ✅ 顯示之前的卦象
- ✅ **不會**進入輸入問題頁面
- ✅ **不會**重複提交

---

### 測試組 6：錯誤處理測試

#### Test 6.1: 圖片生成失敗

**模擬方式**: 修改 `imageGenerator.js` 讓它拋出錯誤

**預期結果**:
- ✅ 後端返回錯誤（HTTP 500）
- ✅ LIFF 顯示錯誤訊息："圖片生成失敗，請稍後再試"
- ✅ Google Sheets 未更新
- ✅ 後端日誌記錄錯誤

---

#### Test 6.2: ImgBB 上傳失敗

**模擬方式**: 使用錯誤的 API key

**預期結果**:
- ✅ 後端返回錯誤（HTTP 500）
- ✅ LIFF 顯示錯誤訊息："圖片上傳失敗，請稍後再試"
- ✅ Google Sheets 未更新
- ✅ 後端日誌記錄錯誤

---

#### Test 6.3: LINE 推送失敗

**模擬方式**: 使用錯誤的 Access Token

**預期結果**:
- ✅ 圖片已生成並上傳
- ✅ Google Sheets 已更新
- ✅ 推送錯誤訊息給客戶（備用訊息）
- ✅ 推送警告給管理員
- ✅ 後端返回成功（但有警告）

---

#### Test 6.4: n8n 無法連線

**模擬方式**: 暫停 n8n 服務

**預期結果**:
- ✅ 後端返回錯誤（HTTP 500）
- ✅ LIFF 顯示錯誤訊息："系統暫時無法處理，請稍後再試"
- ✅ 後端日誌記錄連線錯誤

---

#### Test 6.5: 並發提交測試

**步驟**:
1. 開啟兩個 LIFF 視窗（同一 taskId）
2. 同時提交抽卦

**預期結果**:
- ✅ 只有一個請求成功
- ✅ 另一個請求返回「任務已使用」錯誤
- ✅ Google Sheets 只更新一次

---

## 測試檢查清單

### n8n Workflows
- [ ] get-board-by-taskid 測試通過
- [ ] update-board-usage 測試通過
- [ ] 預約系統擴充測試通過

### 後端 API
- [ ] 健康檢查端點正常
- [ ] check 端點所有測試通過
- [ ] submit 端點所有測試通過
- [ ] 資料驗證測試通過
- [ ] 錯誤處理測試通過

### LIFF 前端
- [ ] 所有頁面正常顯示
- [ ] 頁面切換正常
- [ ] 輸入驗證正常
- [ ] API 呼叫正常
- [ ] 錯誤處理正常

### 完整流程
- [ ] 新用戶完整流程測試通過
- [ ] 重複抽卦防呆測試通過
- [ ] 無可用棋盤測試通過
- [ ] 並發測試通過

### 整合驗證
- [ ] 圖片正確生成
- [ ] 圖片成功上傳 ImgBB
- [ ] LINE 訊息成功推送
- [ ] Google Sheets 正確更新
- [ ] LIFF 正確關閉

---

## 測試報告範本

```markdown
## 測試報告 - {日期}

### 測試環境
- n8n: https://lifepharos.hnd1.zeabur.app
- 後端: {URL}
- 前端: {URL}

### 測試結果

#### n8n Workflows
- get-board-by-taskid: ✅/❌
- update-board-usage: ✅/❌
- 預約系統擴充: ✅/❌

#### 後端 API
- check 端點: ✅/❌
- submit 端點: ✅/❌
- 錯誤處理: ✅/❌

#### LIFF 前端
- UI/UX: ✅/❌
- 頁面流程: ✅/❌
- 資料驗證: ✅/❌

#### 完整流程
- E2E 測試: ✅/❌
- 防呆機制: ✅/❌

### 發現的問題
1. {描述問題}
2. {描述問題}

### 修復記錄
1. {描述修復}
2. {描述修復}

### 備註
{其他需要記錄的事項}
```

---

## 測試後清理

1. 刪除測試資料（taskId 以 TEST_ 開頭的行）
2. 恢復正式環境配置
3. 記錄測試結果在 `docs/WORKLOG.md`

---

## 變更歷史

| 日期 | 版本 | 變更內容 |
|------|------|----------|
| 2026-02-02 | 1.0 | 初始測試文檔 |

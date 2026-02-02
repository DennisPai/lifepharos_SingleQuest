# Cursor Rules 說明

本目錄包含象棋卜卦 LIFF 專案的所有 Cursor Rules。

## 📋 規則列表

### 1. project-standards.mdc
**適用範圍**: 永遠適用（alwaysApply: true）

**內容**:
- 文檔管理規範（必須先詢問才能新增文檔）
- 程式碼風格（ES6+、英文命名、繁體中文註解）
- Git 提交規範（[類型] 簡短描述）
- Code Review 檢查清單

**何時觸發**: 所有對話中都會自動載入

---

### 2. frontend-liff.mdc
**適用範圍**: `frontend/**/*.{js,html,css}`

**內容**:
- LIFF API 使用規範（錯誤處理、Loading 狀態）
- 響應式設計最佳實踐
- 用戶體驗規範（友善錯誤訊息、即時驗證）
- 防呆機制（防止重複提交）

**何時觸發**: 當開啟或編輯前端文件時

---

### 3. backend-nodejs.mdc
**適用範圍**: `backend/**/*.js`

**內容**:
- 資料驗證規範
- 錯誤處理最佳實踐（分層處理）
- 安全性規範（環境變數、Rate Limiting）
- 異步操作規範（async/await）
- 日誌記錄規範
- Google Sheets 整合（透過 n8n）

**何時觸發**: 當開啟或編輯後端文件時

---

### 4. n8n-workflows.mdc
**適用範圍**: `n8n_workflows/**/*.json`

**內容**:
- Webhook 設定規範（語義化命名）
- Function 節點規範（必須包含註解）
- Google Sheets 操作規範（不更新公式欄位）
- 錯誤處理流程

**何時觸發**: 當開啟或編輯 n8n workflow JSON 文件時

---

### 5. security-deployment.mdc
**適用範圍**: 永遠適用（alwaysApply: true）

**內容**:
- 安全注意事項（環境變數管理）
- Zeabur 部署規則（Root Directory 設定）
- 部署前檢查清單
- 部署後更新流程
- 測試規範（TEST_ 前綴）
- 依賴管理

**何時觸發**: 所有對話中都會自動載入

---

### 6. image-generation.mdc
**適用範圍**: `backend/src/services/imageGenerator.js`

**內容**:
- Canvas 高解析度設定
- 品牌配色規範
- 字體處理（繁體中文支援）
- 文字換行邏輯
- 棋子繪製標準（十字排列）
- 尺寸規格總覽

**何時觸發**: 當開啟或編輯 imageGenerator.js 時

---

## 🎯 規則設計原則

### Always Apply（2 個）
這些規則在所有對話中都會自動載入：
- `project-standards.mdc` - 核心開發標準
- `security-deployment.mdc` - 安全和部署規範

### File-Specific（4 個）
這些規則只在相關文件開啟時載入：
- `frontend-liff.mdc` - 前端開發規範
- `backend-nodejs.mdc` - 後端開發規範
- `n8n-workflows.mdc` - n8n 工作流規範
- `image-generation.mdc` - 圖片生成規範

## 📖 使用方式

### 自動載入
- Cursor 會根據當前開啟的文件自動載入對應的規則
- Always Apply 的規則會在所有對話中載入
- File-Specific 的規則只在符合 globs 模式的文件開啟時載入

### 手動選擇
1. 按 `Cmd/Ctrl + Shift + P`
2. 輸入 "Rules"
3. 選擇要載入的規則

## ✅ 規則驗證

所有規則文件已符合以下標準：
- [x] 使用 `.mdc` 格式
- [x] 包含 YAML frontmatter
- [x] description 清楚描述用途
- [x] globs 或 alwaysApply 正確設定
- [x] 內容少於 500 行
- [x] 包含具體範例（✅ GOOD vs ❌ BAD）

## 🔄 更新規則

當需要更新規則時：
1. 編輯對應的 `.mdc` 文件
2. 保持 YAML frontmatter 格式正確
3. 更新 `docs/WORKLOG.md` 記錄變更
4. 提交變更：`git commit -m "[文檔] 更新 Cursor Rules"`

---

**建立日期**: 2026-02-02  
**規則總數**: 6 個（2 個 always apply + 4 個 file-specific）

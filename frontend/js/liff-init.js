// LIFF 初始化模組
const LIFFManager = {
  taskId: null,
  userId: null,
  isInitialized: false,

  /**
   * 初始化 LIFF
   * @returns {Promise<Object>} 包含 taskId 和 userId 的物件
   */
  async init() {
    try {
      console.log('正在初始化 LIFF...');
      
      // 初始化 LIFF SDK
      await liff.init({ liffId: CONFIG.LIFF_ID });
      
      console.log('LIFF 初始化成功');
      
      // 檢查是否在 LIFF browser 中
      if (!liff.isInClient() && !liff.isLoggedIn()) {
        console.log('不在 LINE 中且未登入，執行登入...');
        liff.login();
        return null;
      }
      
      // 從 URL 獲取 taskId
      this.taskId = this.getTaskIdFromURL();
      if (!this.taskId) {
        throw new Error('無法從 URL 獲取任務ID');
      }
      
      console.log('TaskId:', this.taskId);
      
      // 獲取用戶 ID
      const context = liff.getContext();
      if (!context || !context.userId) {
        throw new Error('無法獲取用戶ID');
      }
      
      this.userId = context.userId;
      console.log('UserId:', this.userId);
      
      this.isInitialized = true;
      
      return {
        taskId: this.taskId,
        userId: this.userId
      };
      
    } catch (error) {
      console.error('LIFF 初始化失敗:', error);
      throw error;
    }
  },

  /**
   * 從 URL 獲取 taskId 參數
   * @returns {string|null} taskId
   */
  getTaskIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('taskId');
  },

  /**
   * 關閉 LIFF 視窗
   */
  close() {
    if (liff.isInClient()) {
      liff.closeWindow();
    } else {
      window.close();
    }
  },

  /**
   * 檢查是否已初始化
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && this.taskId && this.userId;
  }
};

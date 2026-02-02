// API 呼叫模組
const API = {
  /**
   * 檢查棋盤狀態
   * @param {string} taskId - 任務ID
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} 棋盤狀態資料
   */
  async checkBoardStatus(taskId, userId) {
    const url = `${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINTS.CHECK}?taskId=${encodeURIComponent(taskId)}&userId=${encodeURIComponent(userId)}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '檢查失敗');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Check board status error:', error);
      throw error;
    }
  },

  /**
   * 提交抽卦結果
   * @param {Object} data - 提交資料
   * @param {string} data.taskId - 任務ID
   * @param {string} data.userId - 用戶ID
   * @param {string} data.question - 用戶問題
   * @param {Array<number>} data.selectedNumbers - 選擇的數字
   * @returns {Promise<Object>} 提交結果
   */
  async submitDivination(data) {
    const url = `${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINTS.SUBMIT}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '提交失敗');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Submit divination error:', error);
      throw error;
    }
  },

  /**
   * 帶重試的 API 呼叫
   * @param {Function} apiFunction - API 函數
   * @param {Array} args - 函數參數
   * @param {number} maxRetries - 最大重試次數
   * @returns {Promise<Object>} API 結果
   */
  async withRetry(apiFunction, args, maxRetries = 1) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        lastError = error;
        
        // 如果是最後一次嘗試，拋出錯誤
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待後重試
        await this.sleep(1000 * (attempt + 1));
      }
    }
    
    throw lastError;
  },

  /**
   * 延遲函數
   * @param {number} ms - 延遲毫秒數
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

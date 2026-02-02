const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * n8n 客戶端服務
 */
class N8nClient {
  constructor() {
    this.baseUrl = config.n8n.baseUrl;
    this.timeout = 10000; // 10 秒超時
  }

  /**
   * 獲取棋盤資料（合併原 checkBoardStatus 和 getBoardData）
   * @param {string} taskId - 任務ID
   * @returns {Promise<Object>} 棋盤資料
   */
  async getBoardByTaskId(taskId) {
    try {
      const url = `${this.baseUrl}${config.n8n.getBoardPath}`;
      
      logger.debug(`Calling n8n GET board: ${url}`);
      
      const response = await axios.post(
        url,
        { taskId },
        { 
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      logger.debug('n8n response:', response.data);

      // 返回格式：
      // {
      //   success: true,
      //   taskId: "ID1768651944450563",
      //   userId: "Uabc...",
      //   boardOrder: "將仕象俥兵卒俥兵士車仕兵卒馬車傌兵兵炮炮相傌帥卒包馬卒包卒象相士",
      //   used: false,  // 或 true
      //   result: null  // 如果 used=true，這裡會有之前的結果
      // }
      return response.data;
      
    } catch (error) {
      logger.error('N8n getBoardByTaskId error:', error.message);
      
      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', error.response.data);
      }
      
      throw new Error('Failed to get board data from n8n');
    }
  }

  /**
   * 更新棋盤使用記錄
   * @param {string} taskId - 任務ID
   * @param {Array<number>} positions - 選擇的位置 [9, 19, 21, 23, 32]
   * @returns {Promise<Object>} 更新結果
   */
  async updateBoardUsage(taskId, positions) {
    try {
      const url = `${this.baseUrl}${config.n8n.updateBoardPath}`;
      
      logger.debug(`Calling n8n UPDATE board: ${url}`);
      logger.debug('Positions:', positions);
      
      const response = await axios.post(
        url,
        { taskId, positions },
        { 
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      logger.debug('n8n update response:', response.data);

      // 返回格式：
      // {
      //   success: true,
      //   updated: true,
      //   rowNumber: 13
      // }
      return response.data;
      
    } catch (error) {
      logger.error('N8n updateBoardUsage error:', error.message);
      
      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', error.response.data);
      }
      
      // 這個錯誤不應該中斷整個流程，只記錄錯誤
      // 可以考慮通知管理員
      throw new Error('Failed to update board usage in n8n');
    }
  }
}

module.exports = new N8nClient();

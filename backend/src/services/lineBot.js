const sdk = require('@line/bot-sdk');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * LINE Bot 服務
 */
class LineBot {
  constructor() {
    // 主帳號 client
    this.mainClient = new sdk.messagingApi.MessagingApiClient({
      channelAccessToken: config.line.channelAccessToken
    });

    // 助手帳 client（用於管理員通知）
    this.adminClient = null;
    if (config.admin.lineToken) {
      this.adminClient = new sdk.messagingApi.MessagingApiClient({
        channelAccessToken: config.admin.lineToken
      });
    }
  }

  /**
   * 推送抽卦結果給用戶
   * @param {string} userId - 用戶 LINE ID
   * @param {string} imageUrl - 卦象圖片 URL
   * @param {string} question - 用戶問題
   * @returns {Promise<Object>} 推送結果
   */
  async pushDivinationResult(userId, imageUrl, question) {
    try {
      logger.info(`Pushing divination result to user: ${userId}`);

      const messages = [
        {
          type: 'image',
          originalContentUrl: imageUrl,
          previewImageUrl: imageUrl
        },
        {
          type: 'text',
          text: '完成抽卦，老師將於24小時內回覆您'
        }
      ];

      await this.mainClient.pushMessage({
        to: userId,
        messages
      });

      logger.success('Message pushed successfully');
      return { success: true };

    } catch (error) {
      logger.error('LINE push message failed:', error);

      // 推送失敗時嘗試發送錯誤訊息
      try {
        await this.mainClient.pushMessage({
          to: userId,
          messages: [{
            type: 'text',
            text: '系統處理中發生錯誤，管理員將盡快為您處理。造成不便敬請見諒。'
          }]
        });
      } catch (secondError) {
        logger.error('Failed to send error message:', secondError);
      }

      // 通知管理員
      await this.notifyAdmin({
        type: 'push_failed',
        userId,
        imageUrl,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * 通知管理員（發送到管理員群組）
   * @param {Object} data - 通知資料
   */
  async notifyAdmin(data) {
    if (!this.adminClient || !config.admin.groupId) {
      logger.warn('Admin notification not configured');
      return;
    }

    try {
      const { type, userId, error, taskId, imageUrl } = data;

      let message = '⚠️ 系統錯誤通知\n\n';
      message += `錯誤類型：${type}\n`;
      
      if (userId) message += `用戶ID：${userId}\n`;
      if (taskId) message += `任務ID：${taskId}\n`;
      if (imageUrl) message += `圖片URL：${imageUrl}\n`;
      if (error) message += `錯誤訊息：${error}\n`;
      
      message += `\n時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`;

      await this.adminClient.pushMessage({
        to: config.admin.groupId,
        messages: [{
          type: 'text',
          text: message
        }]
      });

      logger.info('Admin notification sent');

    } catch (error) {
      logger.error('Failed to notify admin:', error);
    }
  }
}

module.exports = new LineBot();

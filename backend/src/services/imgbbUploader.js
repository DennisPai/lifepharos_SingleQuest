const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * ImgBB 上傳服務
 */
class ImgBBUploader {
  constructor() {
    this.apiKey = config.imgbb.apiKey;
    this.apiUrl = 'https://api.imgbb.com/1/upload';
  }

  /**
   * 上傳圖片到 ImgBB
   * @param {Buffer} imageBuffer - 圖片 Buffer
   * @param {string} name - 圖片名稱（可選）
   * @returns {Promise<Object>} 上傳結果 {url, displayUrl, deleteUrl}
   */
  async uploadToImgBB(imageBuffer, name = null) {
    try {
      logger.info('Uploading image to ImgBB...');

      // 將 Buffer 轉換為 base64
      const base64Image = imageBuffer.toString('base64');

      // 建立 FormData
      const formData = new FormData();
      formData.append('key', this.apiKey);
      formData.append('image', base64Image);
      
      if (name) {
        formData.append('name', name);
      }

      // 發送請求
      const response = await axios.post(this.apiUrl, formData, {
        headers: formData.getHeaders(),
        timeout: 30000 // 30 秒超時
      });

      // 檢查回應
      if (response.data.success) {
        logger.success('Image uploaded successfully');
        logger.debug('ImgBB response:', response.data.data);

        return {
          url: response.data.data.url,
          displayUrl: response.data.data.display_url,
          deleteUrl: response.data.data.delete_url
        };
      } else {
        throw new Error('ImgBB upload failed: ' + JSON.stringify(response.data));
      }

    } catch (error) {
      logger.error('ImgBB upload error:', error.message);

      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', error.response.data);
      }

      throw new Error('圖片上傳失敗，請稍後再試');
    }
  }
}

module.exports = new ImgBBUploader();

const config = require('../config');
const { ValidationError } = require('./errorHandler');

/**
 * 資料驗證工具
 */
class Validator {
  /**
   * 驗證 taskId 格式
   * @param {string} taskId
   * @throws {ValidationError}
   */
  static validateTaskId(taskId) {
    if (!taskId) {
      throw new ValidationError('任務ID不可為空', 'taskId');
    }

    // taskId 格式：ID{timestamp}
    if (!taskId.startsWith('ID')) {
      throw new ValidationError('任務ID格式錯誤', 'taskId');
    }

    const timestamp = taskId.substring(2);
    if (!/^\d+$/.test(timestamp)) {
      throw new ValidationError('任務ID格式錯誤', 'taskId');
    }
  }

  /**
   * 驗證 userId
   * @param {string} userId
   * @throws {ValidationError}
   */
  static validateUserId(userId) {
    if (!userId) {
      throw new ValidationError('用戶ID不可為空', 'userId');
    }

    if (!userId.startsWith('U')) {
      throw new ValidationError('用戶ID格式錯誤', 'userId');
    }
  }

  /**
   * 驗證問題
   * @param {string} question
   * @throws {ValidationError}
   */
  static validateQuestion(question) {
    if (!question || question.trim() === '') {
      throw new ValidationError('問題不可為空', 'question');
    }

    if (question.length > config.business.maxQuestionLength) {
      throw new ValidationError(
        `問題長度不可超過 ${config.business.maxQuestionLength} 字`,
        'question'
      );
    }
  }

  /**
   * 驗證選擇的數字
   * @param {Array<number>} selectedNumbers
   * @throws {ValidationError}
   */
  static validateSelectedNumbers(selectedNumbers) {
    // 檢查是否為陣列
    if (!Array.isArray(selectedNumbers)) {
      throw new ValidationError('數字必須是陣列格式', 'selectedNumbers');
    }

    // 檢查數量
    if (selectedNumbers.length !== config.business.requiredNumbersCount) {
      throw new ValidationError(
        `必須選擇正好 ${config.business.requiredNumbersCount} 個數字`,
        'selectedNumbers'
      );
    }

    // 檢查每個數字
    for (const num of selectedNumbers) {
      if (!Number.isInteger(num)) {
        throw new ValidationError('所有數字必須是整數', 'selectedNumbers');
      }

      if (num < config.business.numberRange.min || num > config.business.numberRange.max) {
        throw new ValidationError(
          `數字範圍必須在 ${config.business.numberRange.min}-${config.business.numberRange.max} 之間`,
          'selectedNumbers'
        );
      }
    }

    // 檢查重複
    const uniqueNumbers = new Set(selectedNumbers);
    if (uniqueNumbers.size !== selectedNumbers.length) {
      throw new ValidationError('數字不可重複', 'selectedNumbers');
    }
  }

  /**
   * 驗證提交資料
   * @param {Object} data
   * @throws {ValidationError}
   */
  static validateSubmitData(data) {
    const { taskId, userId, question, selectedNumbers } = data;

    this.validateTaskId(taskId);
    this.validateUserId(userId);
    this.validateQuestion(question);
    this.validateSelectedNumbers(selectedNumbers);
  }
}

module.exports = Validator;

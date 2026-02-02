const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const Validator = require('../utils/validator');
const { ValidationError, NotFoundError, UnauthorizedError, ConflictError } = require('../utils/errorHandler');
const n8nClient = require('../services/n8nClient');
const imageGenerator = require('../services/imageGenerator');
const imgbbUploader = require('../services/imgbbUploader');
const lineBot = require('../services/lineBot');
const config = require('../config');

/**
 * GET /api/divination/check
 * 檢查棋盤狀態
 */
router.get('/check', async (req, res, next) => {
  try {
    const { taskId, userId } = req.query;

    // 驗證參數
    Validator.validateTaskId(taskId);
    Validator.validateUserId(userId);

    logger.info(`Checking board status for taskId: ${taskId}, userId: ${userId}`);

    // 呼叫 n8n 獲取棋盤資料
    const boardData = await n8nClient.getBoardByTaskId(taskId);

    if (!boardData.success) {
      throw new NotFoundError('找不到此任務ID，請確認預約資訊');
    }

    // 驗證用戶ID是否匹配
    if (boardData.userId !== userId) {
      logger.warn(`User ID mismatch: expected ${boardData.userId}, got ${userId}`);
      throw new UnauthorizedError('此任務不屬於您，請確認預約資訊');
    }

    // 判斷是否已使用
    if (boardData.used) {
      logger.info(`Task ${taskId} is already used`);
      
      // 解析之前的結果（傳入完整的 boardData）
      const previousResult = parsePreviousResult(boardData);
      
      return res.json({
        canStart: false,
        used: true,
        previousResult
      });
    }

    // 未使用，可以開始抽卦
    logger.info(`Task ${taskId} is available`);
    res.json({
      canStart: true,
      used: false,
      boardOrder: boardData.boardOrder
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/divination/submit
 * 提交抽卦結果
 */
router.post('/submit', async (req, res, next) => {
  try {
    const { taskId, userId, question, selectedNumbers } = req.body;

    // 驗證所有資料
    Validator.validateSubmitData(req.body);

    logger.info(`Submit divination for taskId: ${taskId}`);

    // 再次檢查棋盤狀態（防止並發）
    const boardData = await n8nClient.getBoardByTaskId(taskId);

    if (!boardData.success) {
      throw new NotFoundError('找不到此任務ID');
    }

    // 驗證用戶ID
    if (boardData.userId !== userId) {
      throw new UnauthorizedError('此任務不屬於您');
    }

    // 檢查是否已使用
    if (boardData.used) {
      throw new ConflictError('此任務已經完成抽卦，請勿重複操作');
    }

    // 解析棋子
    const pieces = extractPieces(boardData.boardOrder, selectedNumbers);
    logger.info('Extracted pieces:', pieces);

    // 生成卦象圖片
    logger.info('Generating image...');
    const imageBuffer = await imageGenerator.generateDivinationImage(question, pieces);

    // 上傳到 ImgBB
    logger.info('Uploading image to ImgBB...');
    const uploadResult = await imgbbUploader.uploadToImgBB(imageBuffer);
    const imageUrl = uploadResult.url;
    logger.info('Image uploaded:', imageUrl);

    // 並行處理：更新 Google Sheets 和推送 LINE 訊息
    logger.info('Processing in parallel...');
    await Promise.all([
      // 更新 Google Sheets（包含問題）
      n8nClient.updateBoardUsage(taskId, selectedNumbers, question),
      
      // 推送 LINE 訊息
      lineBot.pushDivinationResult(userId, imageUrl, question)
    ]);

    logger.success(`Divination completed for taskId: ${taskId}`);

    // 返回成功結果
    res.json({
      success: true,
      imageUrl,
      pieces,
      question
    });

  } catch (error) {
    next(error);
  }
});

/**
 * 解析之前的結果
 * @param {Object} boardData - 從 n8n 返回的完整棋盤資料
 * @returns {Object} 解析後的結果
 */
function parsePreviousResult(boardData) {
  if (!boardData || !boardData.result) {
    return {
      question: '',
      pieces: [],
      imageUrl: null
    };
  }

  // 分割棋子
  const pieceNames = boardData.result.split('、');
  const pieces = pieceNames.map(name => ({
    name,
    color: config.business.redPieces.includes(name) ? 'red' : 'black'
  }));

  // 從"已使用"欄位讀取問題（n8n 會返回 usedValue 欄位）
  const question = boardData.usedValue || '（之前的問題）';

  return {
    question,
    pieces,
    imageUrl: null
  };
}

/**
 * 從棋盤字串中提取棋子
 * @param {string} boardOrder - 棋盤字串
 * @param {Array<number>} positions - 位置陣列（1-based）
 * @returns {Array<Object>} 棋子陣列
 */
function extractPieces(boardOrder, positions) {
  const pieces = [];

  for (const position of positions) {
    // JavaScript 字串索引從 0 開始，所以要減 1
    const index = position - 1;
    
    if (index < 0 || index >= boardOrder.length) {
      throw new ValidationError(`位置 ${position} 超出範圍`);
    }

    const pieceName = boardOrder[index];
    const color = config.business.redPieces.includes(pieceName) ? 'red' : 'black';

    pieces.push({
      name: pieceName,
      color
    });
  }

  return pieces;
}

module.exports = router;

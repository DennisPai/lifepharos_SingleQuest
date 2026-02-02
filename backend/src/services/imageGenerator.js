const { createCanvas } = require('canvas');
const logger = require('../utils/logger');

/**
 * 圖片生成服務
 */
class ImageGenerator {
  constructor() {
    // 畫布配置
    this.scale = 10; // 高解析度
    this.canvasSize = 500; // 邏輯尺寸
    this.actualSize = this.canvasSize * this.scale; // 實際尺寸 5000x5000

    // 顏色配置
    this.colors = {
      background: '#D2D2D2',
      pieceBackground: '#FFFFFF',
      red: '#FF0000',
      black: '#000000',
      text: '#000000'
    };

    // 棋子配置
    this.pieceRadius = 45;
    this.pieceBorderWidth = 3;
    this.pieceFontSize = 50;

    // 文字配置
    this.questionFontSize = 35;
    this.questionMaxWidth = 450;
    this.questionLineHeight = 50;
    this.questionStartY = 25;

    // 棋子位置（十字排列）
    this.positions = [
      { x: 250, y: 300, label: '中' }, // 棋子1
      { x: 130, y: 300, label: '左' }, // 棋子2
      { x: 370, y: 300, label: '右' }, // 棋子3
      { x: 250, y: 180, label: '上' }, // 棋子4
      { x: 250, y: 420, label: '下' }  // 棋子5
    ];
  }

  /**
   * 生成卦象圖片
   * @param {string} question - 用戶問題
   * @param {Array<Object>} pieces - 棋子陣列 [{name: '士', color: 'red'}, ...]
   * @returns {Promise<Buffer>} 圖片 Buffer
   */
  async generateDivinationImage(question, pieces) {
    try {
      logger.info('Generating divination image...');

      // 建立畫布
      const canvas = createCanvas(this.actualSize, this.actualSize);
      const ctx = canvas.getContext('2d');

      // 縮放以使用邏輯尺寸
      ctx.scale(this.scale, this.scale);

      // 1. 繪製背景
      this.drawBackground(ctx);

      // 2. 繪製問題文字
      if (question) {
        this.drawQuestion(ctx, question);
      }

      // 3. 繪製棋子
      this.drawPieces(ctx, pieces);

      // 4. 返回 Buffer
      const buffer = canvas.toBuffer('image/png');
      logger.success('Image generated successfully');
      
      return buffer;

    } catch (error) {
      logger.error('Image generation error:', error);
      throw new Error('圖片生成失敗');
    }
  }

  /**
   * 繪製背景
   * @param {CanvasRenderingContext2D} ctx
   */
  drawBackground(ctx) {
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
  }

  /**
   * 繪製問題文字
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} question
   */
  drawQuestion(ctx, question) {
    ctx.font = `bold ${this.questionFontSize}px "Noto Sans CJK TC", "WenQuanYi Zen Hei", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = this.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 支援文字換行
    this.drawWrappedText(
      ctx,
      question,
      this.canvasSize / 2,
      this.questionStartY,
      this.questionMaxWidth,
      this.questionLineHeight
    );
  }

  /**
   * 繪製換行文字
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} maxWidth
   * @param {number} lineHeight
   */
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const characters = text.split('');
    let line = '';
    let yOffset = y;

    for (let i = 0; i < characters.length; i++) {
      const testLine = line + characters[i];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, yOffset);
        line = characters[i];
        yOffset += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, yOffset);
  }

  /**
   * 繪製棋子
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<Object>} pieces
   */
  drawPieces(ctx, pieces) {
    pieces.forEach((piece, index) => {
      if (index >= this.positions.length) {
        logger.warn(`Too many pieces, skipping piece ${index + 1}`);
        return;
      }

      const { x, y } = this.positions[index];
      const isRed = piece.color === 'red';

      // 繪製圓形背景
      ctx.beginPath();
      ctx.arc(x, y, this.pieceRadius, 0, 2 * Math.PI);
      ctx.fillStyle = this.colors.pieceBackground;
      ctx.fill();

      // 繪製邊框
      ctx.strokeStyle = isRed ? this.colors.red : this.colors.black;
      ctx.lineWidth = this.pieceBorderWidth;
      ctx.stroke();

      // 繪製棋子文字
      ctx.font = `bold ${this.pieceFontSize}px "Noto Sans CJK TC", "WenQuanYi Zen Hei", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isRed ? this.colors.red : this.colors.black;
      ctx.fillText(piece.name, x, y + 3); // +3 微調垂直對齊
    });
  }
}

module.exports = new ImageGenerator();

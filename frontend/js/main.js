// 主應用程式邏輯
const App = {
  // 應用狀態
  state: {
    currentPage: 'checking',
    taskId: null,
    userId: null,
    question: '',
    selectedNumbers: [],
    boardOrder: '',
    result: null
  },

  // 頁面狀態常數
  PAGES: {
    CHECKING: 'checking',
    INPUT_QUESTION: 'input-question',
    INPUT_NUMBERS: 'input-numbers',
    PROCESSING: 'processing',
    RESULT: 'result',
    ALREADY_USED: 'already-used',
    ERROR: 'error'
  },

  /**
   * 初始化應用程式
   */
  async init() {
    try {
      // 顯示檢查頁面
      this.showPage(this.PAGES.CHECKING);
      
      // 初始化 LIFF
      const liffData = await LIFFManager.init();
      
      if (!liffData) {
        // 登入中，等待重定向
        return;
      }
      
      this.state.taskId = liffData.taskId;
      this.state.userId = liffData.userId;
      
      // 檢查棋盤狀態
      await this.checkBoardStatus();
      
      // 綁定事件監聽器
      this.bindEvents();
      
    } catch (error) {
      console.error('應用程式初始化失敗:', error);
      this.showError(error.message || '初始化失敗，請稍後再試');
    }
  },

  /**
   * 檢查棋盤狀態
   */
  async checkBoardStatus() {
    try {
      const data = await API.checkBoardStatus(this.state.taskId, this.state.userId);
      
      if (data.used) {
        // 已使用，顯示之前的結果
        this.state.result = data.previousResult;
        this.showPage(this.PAGES.ALREADY_USED);
        this.renderPreviousResult();
      } else {
        // 未使用，可以開始抽卦
        this.state.boardOrder = data.boardOrder;
        this.showPage(this.PAGES.INPUT_QUESTION);
      }
      
    } catch (error) {
      console.error('檢查狀態失敗:', error);
      this.showError(error.message || '檢查狀態失敗，請稍後再試');
    }
  },

  /**
   * 綁定事件監聽器
   */
  bindEvents() {
    // 問題輸入頁面
    const questionInput = document.getElementById('input-question');
    const btnNextQuestion = document.getElementById('btn-next-question');
    
    questionInput.addEventListener('input', () => {
      const charCount = questionInput.value.length;
      document.getElementById('char-count').textContent = charCount;
      btnNextQuestion.disabled = charCount === 0;
    });
    
    btnNextQuestion.addEventListener('click', () => {
      this.state.question = questionInput.value.trim();
      // 在數字頁面顯示問題
      const questionReminder = document.getElementById('question-reminder');
      if (questionReminder) {
        questionReminder.textContent = this.state.question;
      }
      this.showPage(this.PAGES.INPUT_NUMBERS);
    });
    
    // 數字輸入頁面 - 使用5個獨立輸入框
    const numberInputs = [
      document.getElementById('number-1'),
      document.getElementById('number-2'),
      document.getElementById('number-3'),
      document.getElementById('number-4'),
      document.getElementById('number-5')
    ];
    const btnSubmit = document.getElementById('btn-submit-divination');
    const btnBackNumbers = document.getElementById('btn-back-numbers');
    
    // 監聽所有數字輸入框
    numberInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        this.validateNumberInputs();
        
        // 自動跳到下一個輸入框
        if (input.value && index < numberInputs.length - 1) {
          numberInputs[index + 1].focus();
        }
      });
    });
    
    btnBackNumbers.addEventListener('click', () => {
      this.showPage(this.PAGES.INPUT_QUESTION);
    });
    
    btnSubmit.addEventListener('click', () => {
      this.submitDivination();
    });
    
    // 完成按鈕
    document.getElementById('btn-close').addEventListener('click', () => {
      LIFFManager.close();
    });
    
    document.getElementById('btn-close-used').addEventListener('click', () => {
      LIFFManager.close();
    });
    
    // 重試按鈕
    document.getElementById('btn-retry').addEventListener('click', () => {
      window.location.reload();
    });
  },

  /**
   * 驗證所有數字輸入框
   */
  validateNumberInputs() {
    const numberInputs = [
      document.getElementById('number-1'),
      document.getElementById('number-2'),
      document.getElementById('number-3'),
      document.getElementById('number-4'),
      document.getElementById('number-5')
    ];
    
    const btnSubmit = document.getElementById('btn-submit-divination');
    const validationEl = document.getElementById('number-validation');
    
    // 收集所有數字
    const numbers = numberInputs.map(input => input.value.trim()).filter(v => v !== '');
    
    // 檢查是否都填寫了
    if (numbers.length < 5) {
      validationEl.textContent = numbers.length === 0 ? '' : `請填寫全部 5 個數字（已填 ${numbers.length}/5）`;
      validationEl.className = 'validation-message';
      btnSubmit.disabled = true;
      return { valid: false };
    }
    
    // 解析數字
    const parsedNumbers = numbers.map(n => parseInt(n, 10));
    
    // 檢查是否都是有效數字
    if (parsedNumbers.some(isNaN)) {
      validationEl.textContent = '❌ 請輸入有效的數字';
      validationEl.className = 'validation-message error';
      btnSubmit.disabled = true;
      return { valid: false };
    }
    
    // 檢查範圍
    const outOfRange = parsedNumbers.filter(n => n < CONFIG.NUMBER_RANGE.min || n > CONFIG.NUMBER_RANGE.max);
    if (outOfRange.length > 0) {
      validationEl.textContent = `❌ 數字必須在 ${CONFIG.NUMBER_RANGE.min}-${CONFIG.NUMBER_RANGE.max} 之間`;
      validationEl.className = 'validation-message error';
      btnSubmit.disabled = true;
      return { valid: false };
    }
    
    // 檢查重複
    const uniqueNumbers = new Set(parsedNumbers);
    if (uniqueNumbers.size !== parsedNumbers.length) {
      validationEl.textContent = '❌ 數字不可重複';
      validationEl.className = 'validation-message error';
      btnSubmit.disabled = true;
      return { valid: false };
    }
    
    // 全部通過
    validationEl.textContent = '✅ 格式正確';
    validationEl.className = 'validation-message success';
    btnSubmit.disabled = false;
    return { valid: true, numbers: parsedNumbers };
  },

  /**
   * 提交抽卦
   */
  async submitDivination() {
    try {
      // 禁用按鈕防止重複提交
      document.getElementById('btn-submit-divination').disabled = true;
      
      // 顯示處理中頁面
      this.showPage(this.PAGES.PROCESSING);
      
      // 從5個獨立輸入框獲取數字
      const numberInputs = [
        document.getElementById('number-1'),
        document.getElementById('number-2'),
        document.getElementById('number-3'),
        document.getElementById('number-4'),
        document.getElementById('number-5')
      ];
      
      const numbers = numberInputs.map(input => parseInt(input.value.trim(), 10));
      
      // 最終驗證
      const validation = this.validateNumberInputs();
      if (!validation.valid) {
        throw new Error('數字輸入有誤，請重新檢查');
      }
      
      this.state.selectedNumbers = numbers;
      
      // 提交到後端
      const result = await API.submitDivination({
        taskId: this.state.taskId,
        userId: this.state.userId,
        question: this.state.question,
        selectedNumbers: this.state.selectedNumbers
      });
      
      this.state.result = result;
      
      // 顯示結果
      this.showPage(this.PAGES.RESULT);
      this.renderResult();
      
    } catch (error) {
      console.error('提交失敗:', error);
      this.showError(error.message || '提交失敗，請稍後再試');
    }
  },

  /**
   * 渲染抽卦結果
   */
  renderResult() {
    const { pieces, question } = this.state.result;
    
    // 顯示問題
    document.getElementById('result-question-text').textContent = question;
    
    // 渲染棋子
    const container = document.getElementById('result-pieces');
    container.innerHTML = '';
    
    const positions = ['center', 'left', 'right', 'top', 'bottom'];
    
    pieces.forEach((piece, index) => {
      const pieceEl = document.createElement('div');
      pieceEl.className = `piece piece-${positions[index]} ${piece.color}`;
      pieceEl.textContent = piece.name;
      container.appendChild(pieceEl);
    });
  },

  /**
   * 渲染之前的結果
   */
  renderPreviousResult() {
    const { question, pieces } = this.state.result;
    
    // 顯示問題
    document.getElementById('previous-question-text').textContent = question;
    
    // 渲染棋子
    const container = document.getElementById('previous-pieces');
    container.innerHTML = '';
    
    const positions = ['center', 'left', 'right', 'top', 'bottom'];
    
    pieces.forEach((piece, index) => {
      const pieceEl = document.createElement('div');
      pieceEl.className = `piece piece-${positions[index]} ${piece.color}`;
      pieceEl.textContent = piece.name;
      container.appendChild(pieceEl);
    });
  },

  /**
   * 顯示錯誤頁面
   * @param {string} message - 錯誤訊息
   */
  showError(message) {
    document.getElementById('error-message').textContent = message;
    this.showPage(this.PAGES.ERROR);
  },

  /**
   * 切換頁面
   * @param {string} pageName - 頁面名稱
   */
  showPage(pageName) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
      page.style.display = 'none';
    });
    
    // 顯示指定頁面
    const pageId = `page-${pageName}`;
    const pageEl = document.getElementById(pageId);
    
    if (pageEl) {
      pageEl.style.display = 'flex';
      pageEl.classList.add('fade-in');
      this.state.currentPage = pageName;
    } else {
      console.error('找不到頁面:', pageId);
    }
  }
};

// 當 DOM 載入完成後初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

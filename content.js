// 使用一個變數來確保按鈕只被創建一次
let exportButtonCreated = false;

// 創建並注入「匯出」按鈕的函數
function createExportButton() {
  // 如果按鈕已經存在，則不執行任何操作
  if (document.getElementById('export-convo-button')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'export-convo-button';
  button.textContent = '匯出純文字對話';
  
  // 為按鈕設計一個簡單、清晰的樣式
  Object.assign(button.style, {
    backgroundColor: '#10A37F', // ChatGPT 的代表色之一
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginLeft: '12px',
    fontSize: '14px',
    fontWeight: 'bold'
  });

  // 找到 ChatGPT 頁面上方模型選擇器所在的工具列
  const targetToolbar = document.querySelector('div[class*="StickyContainer"]');

  if (targetToolbar) {
    // 將按鈕添加到工具列中
    targetToolbar.appendChild(button);
    // 為按鈕綁定點擊事件
    button.addEventListener('click', exportConversation);
    exportButtonCreated = true;
  }
}

// 提取並格式化對話內容的函數
function exportConversation() {
  // 選取所有對話回合的容器
  const conversationTurns = document.querySelectorAll('[data-testid^="conversation-turn-"]');
  let conversationText = '';
  
  conversationTurns.forEach(turn => {
    // 透過 data-message-author-role 屬性判斷發言者
    const authorRole = turn.getAttribute('data-message-author-role');
    const speaker = authorRole === 'user' ? '你說：' : 'ChatGPT 說：';
    
    // 對話文字通常被包在一個帶有 .prose class 的元素中
    const textContentElement = turn.querySelector('.prose'); 
    if (textContentElement) {
      // 使用 .innerText 獲取純文字，並組合成指定格式
      conversationText += speaker + '
' + textContentElement.innerText + '

';
    }
  });

  if (conversationText) {
    // 如果頁面有標題，則使用標題作為檔名，否則使用預設名稱
    const filename = document.title ? document.title + '.txt' : 'chatgpt-conversation.txt';
    // 將整理好的檔名與內容，發送給 background.js 進行下載
    chrome.runtime.sendMessage({
      action: "downloadConversation",
      filename: filename,
      content: conversationText
    });
  } else {
    // 如果沒有找到任何對話，給予提示
    alert('找不到任何對話內容可以匯出！');
  }
}

// ChatGPT 是一個動態載入內容的單頁應用 (SPA)，我們需要監聽頁面變化
const observer = new MutationObserver((mutations, obs) => {
  // 當我們偵測到頁面上有對話輸入框，且按鈕尚未被創建時，就執行注入操作
  if (document.querySelector('textarea[id="prompt-textarea"]') && !exportButtonCreated) {
    createExportButton();
  }
});

// 開始監聽整個 body 的子節點變化
observer.observe(document.body, {
  childList: true,
  subtree: true
});

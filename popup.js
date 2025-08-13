// 此函數將被注入頁面，以完全符合你提供的 HTML 結構
function extractAllConversations() {
    const conversations = document.querySelectorAll('div.conversation');
    const results = [];

    conversations.forEach(convo => {
        const titleElement = convo.querySelector('h4');
        const title = titleElement ? titleElement.innerText.trim() : 'Untitled Conversation';
        
        let fullText = title + '\n\n';
        const messages = convo.querySelectorAll('pre.message');
        
        messages.forEach(msg => {
            const authorElement = msg.querySelector('div.author');
            const contentElement = authorElement ? authorElement.nextElementSibling : null;
            
            if (authorElement && contentElement) {
                const author = authorElement.innerText.trim();
                const content = contentElement.innerText.trim();
                fullText += `${author}:\n${content}\n\n`;
            }
        });
        
        results.push({
            filename: `${title}.txt`,
            content: fullText
        });
    });
    return results;
}

// 通用的下載觸發函數
async function triggerDownloads(limit = 0) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractAllConversations,
    });

    let allConversations = injectionResults[0].result;

    if (!allConversations || allConversations.length === 0) {
        alert('在當前頁面找不到任何 class="conversation" 的對話內容！');
        return;
    }

    const conversationsToDownload = limit > 0 ? allConversations.slice(0, limit) : allConversations;

    if (conversationsToDownload.length === 0) {
        alert('沒有符合條件的對話可以匯出！');
        return;
    }

    conversationsToDownload.forEach(convo => {
        // 在 popup 端直接將文字內容轉換為 Data URL
        const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(convo.content);

        // 將準備好的 URL 和檔名發送到 background.js
        chrome.runtime.sendMessage({
            action: "downloadFromUrl",
            url: dataUrl,
            filename: convo.filename
        });
    });
    
    alert(`已送出 ${conversationsToDownload.length} 個檔案的下載請求。`);
    window.close();
}

// 為「匯出前 5 則」按鈕綁定事件
document.getElementById('export-some-btn').addEventListener('click', () => {
    triggerDownloads(5);
});

// 為「匯出全部」按鈕綁定事件
document.getElementById('export-all-btn').addEventListener('click', () => {
    triggerDownloads(0); // 傳入 0 代表全部下載
});

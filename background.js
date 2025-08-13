// background.js 現在變得非常簡單
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 只監聽一個包含現成 URL 的動作
  if (request.action === "downloadFromUrl") {
    chrome.downloads.download({
      url: request.url, // 直接使用傳過來的 Data URL
      filename: request.filename
    });
  }
});

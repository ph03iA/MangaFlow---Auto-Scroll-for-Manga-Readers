chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.sync.set({
            scrollSpeed: 5,
            pauseOnInteraction: true
        });
        console.log('MangaFlow extension installed successfully!');
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'stateChanged') {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, request).catch(() => {

                });
            });
        });
    }
    
    sendResponse({ success: true });
});

chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked on tab:', tab.id);
}); 
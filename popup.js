document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const scrollSpeedSlider = document.getElementById('scrollSpeed');
    const speedValue = document.getElementById('speedValue');
    const pauseOnInteraction = document.getElementById('pauseOnInteraction');
    const statusText = document.getElementById('statusText');
    const statusDiv = document.querySelector('.status');

    let currentState = 'stopped'; // stopped, scrolling, paused

    // Load saved settings
    chrome.storage.sync.get(['scrollSpeed', 'pauseOnInteraction'], function(result) {
        if (result.scrollSpeed) {
            scrollSpeedSlider.value = result.scrollSpeed;
            speedValue.textContent = result.scrollSpeed;
        }
        if (result.pauseOnInteraction !== undefined) {
            pauseOnInteraction.checked = result.pauseOnInteraction;
        }
    });

    // Safe message sending function
    function sendMessageToContentScript(message, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]) {
                statusText.textContent = '❌ Cannot access page';
                console.error('No active tab found');
                if (callback) callback({ error: 'No active tab' });
                return;
            }
            
            try {
                chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Chrome runtime error:', chrome.runtime.lastError.message);
                        statusText.textContent = '⚠️ Please refresh page and try again';
                        if (callback) callback({ error: chrome.runtime.lastError.message });
                        return;
                    }
                    if (callback) callback(response);
                });
            } catch (error) {
                console.error('Failed to send message:', error);
                if (callback) callback({ error: error.message });
            }
        });
    }

    // Update speed value display
    scrollSpeedSlider.addEventListener('input', function() {
        speedValue.textContent = this.value;
        chrome.storage.sync.set({ scrollSpeed: this.value });
        
        if (currentState === 'scrolling') {
            sendMessageToContentScript({
                action: 'updateSpeed',
                speed: parseInt(scrollSpeedSlider.value)
            });
        }
    });

    // Save pause on interaction setting
    pauseOnInteraction.addEventListener('change', function() {
        chrome.storage.sync.set({ pauseOnInteraction: this.checked });
        
        sendMessageToContentScript({
            action: 'updatePauseOnInteraction',
            pauseOnInteraction: this.checked
        });
    });

    // Start button
    startBtn.addEventListener('click', function() {
        sendMessageToContentScript({
            action: 'startScroll',
            speed: parseInt(scrollSpeedSlider.value),
            pauseOnInteraction: pauseOnInteraction.checked
        }, function(response) {
            if (!response || response.error) {
                statusText.textContent = '❌ Error starting. Please refresh page.';
                console.error('Start scroll failed:', response);
            } else {
                updateUI('scrolling');
            }
        });
    });

    // Pause button
    pauseBtn.addEventListener('click', function() {
        sendMessageToContentScript({
            action: 'pauseScroll'
        }, function(response) {
            if (!response || response.error) {
                statusText.textContent = '❌ Error pausing.';
            } else {
                updateUI('paused');
            }
        });
    });

    // Stop button
    stopBtn.addEventListener('click', function() {
        sendMessageToContentScript({
            action: 'stopScroll'
        }, function(response) {
            if (!response || response.error) {
                statusText.textContent = '❌ Error stopping.';
            } else {
                updateUI('stopped');
            }
        });
    });

    function updateUI(state) {
        currentState = state;
        
        startBtn.disabled = state === 'scrolling';
        pauseBtn.disabled = state === 'stopped' || state === 'paused';
        stopBtn.disabled = state === 'stopped';
        
        statusDiv.className = 'status';
        switch(state) {
            case 'scrolling':
                statusText.textContent = 'Auto-scrolling...';
                statusDiv.classList.add('scrolling');
                break;
            case 'paused':
                statusText.textContent = 'Paused';
                statusDiv.classList.add('paused');
                break;
            case 'stopped':
                statusText.textContent = 'Ready to start';
                break;
        }
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'stateChanged') {
            updateUI(request.state);
        }
    });

    // Check current state when popup opens
    sendMessageToContentScript({
        action: 'getState'
    }, function(response) {
        if (response && response.state) {
            updateUI(response.state);
        } else if (response && response.error) {
            statusText.textContent = '⚠️ Refresh page to start';
            console.error('Get state error:', response.error);
        } else {
            statusText.textContent = '⚠️ Refresh page to start';
            console.error('Could not get state from content script.');
        }
    });
}); 
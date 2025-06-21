class MangaFlow {
    constructor() {
        this.isScrolling = false;
        this.isPaused = false;
        this.scrollSpeed = 5;
        this.pauseOnInteraction = true;
        this.scrollInterval = null;
        this.lastUserInteraction = Date.now();
        this.interactionTimeout = 2000; // 2 seconds
        this.extensionContextValid = true;
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.setupMessageListener();
            console.log('MangaFlow content script initialized successfully');
        } catch (error) {
            console.error('MangaFlow initialization error:', error);
        }
    }

    setupEventListeners() {
        const interactionEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'wheel', 'scroll'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.lastUserInteraction = Date.now();
                if (this.pauseOnInteraction && this.isScrolling && !this.isPaused) {
                    this.pauseScroll();
                }
            }, { passive: true });
        });

        setInterval(() => {
            if (this.pauseOnInteraction && this.isPaused && 
                Date.now() - this.lastUserInteraction > this.interactionTimeout) {
                this.resumeScroll();
            }
        }, 500);
    }

    setupMessageListener() {
        try {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                try {
                    switch(request.action) {
                        case 'startScroll':
                            this.scrollSpeed = request.speed || 5;
                            this.pauseOnInteraction = request.pauseOnInteraction !== undefined ? request.pauseOnInteraction : true;
                            this.startScroll();
                            sendResponse({ success: true });
                            break;
                            
                        case 'pauseScroll':
                            this.pauseScroll();
                            sendResponse({ success: true });
                            break;
                            
                        case 'stopScroll':
                            this.stopScroll();
                            sendResponse({ success: true });
                            break;
                            
                        case 'updateSpeed':
                            this.scrollSpeed = request.speed;
                            sendResponse({ success: true });
                            break;
                            
                        case 'updatePauseOnInteraction':
                            this.pauseOnInteraction = request.pauseOnInteraction;
                            sendResponse({ success: true });
                            break;
                            
                        case 'getState':
                            sendResponse({
                                state: this.isScrolling ? (this.isPaused ? 'paused' : 'scrolling') : 'stopped'
                            });
                            break;
                            
                        default:
                            sendResponse({ error: 'Unknown action' });
                            break;
                    }
                } catch (error) {
                    console.error('MangaFlow message handler error:', error);
                    sendResponse({ error: error.message });
                }
                return true;
            });
        } catch (error) {
            console.error('Failed to setup message listener:', error);
            this.extensionContextValid = false;
        }
    }

    startScroll() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        this.isPaused = false;
        
        const baseStep = 1;
        const speedMultiplier = this.scrollSpeed / 5;
        const scrollStep = baseStep * speedMultiplier;
        
        this.scrollInterval = setInterval(() => {
            if (!this.isPaused) {
                window.scrollBy({
                    top: scrollStep,
                    behavior: 'smooth'
                });
            }
        }, 50);
        
        this.notifyStateChange();
    }

    pauseScroll() {
        if (!this.isScrolling || this.isPaused) return;
        
        this.isPaused = true;
        this.notifyStateChange();
    }

    resumeScroll() {
        if (!this.isScrolling || !this.isPaused) return;
        
        this.isPaused = false;
        this.notifyStateChange();
    }

    stopScroll() {
        if (!this.isScrolling) return;
        
        this.isScrolling = false;
        this.isPaused = false;
        
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
        
        this.notifyStateChange();
    }

    notifyStateChange() {
        if (!this.extensionContextValid) {
            console.warn('Extension context invalid, skipping state change notification');
            return;
        }
        
        const state = this.isScrolling ? (this.isPaused ? 'paused' : 'scrolling') : 'stopped';
        try {
            chrome.runtime.sendMessage({
                action: 'stateChanged',
                state: state
            }).catch(error => {
                if (error.message.includes('Extension context invalidated')) {
                    this.extensionContextValid = false;
                } else {
                    console.error('Failed to send state change message:', error);
                }
            });
        } catch (error) {
            if (error.message.includes('Extension context invalidated')) {
                this.extensionContextValid = false;
            } else {
                console.error('Failed to send state change message:', error);
            }
        }
    }
}

function initializeMangaFlow() {
    try {
        if (!window.mangaFlowInstance) {
            window.mangaFlowInstance = new MangaFlow();
        }
    } catch (error) {
        console.error('Failed to initialize MangaFlow:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMangaFlow);
} else {
    initializeMangaFlow();
} 
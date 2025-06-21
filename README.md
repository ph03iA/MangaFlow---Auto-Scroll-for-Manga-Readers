# MangaFlow - Auto Scroll for Manga Readers

Enjoy a hands-free manga reading experience with MangaFlow! This Chrome extension automatically scrolls your manga or comic pages at a smooth, customizable speed so you can relax and focus on the story.

## Features

- **Simple Auto-Scroll**: Automatically scrolls the page down while you read.
- **Adjustable Speed**: Control the scrolling pace with an easy-to-use slider.
- **Lightweight Design**: No floating panels or extra clutter on your screen.
- **Smart Pause**: Optionally pauses on user interaction (mouse, keyboard, touch).
- **Works Everywhere**: Designed for manga, webtoons, comics, and any scroll-based content.
- **Settings Persistence**: Your preferences are saved automatically.
- **Clean UI**: A simple popup interface to control everything.

## Installation

1.  Download or clone this repository.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** in the top-right corner.
4.  Click **"Load unpacked"** and select the extension's folder.
5.  Pin the MangaFlow icon to your toolbar for easy access!

## How to Use

1.  Navigate to any manga, webtoon, or long-form content website.
2.  Click the **MangaFlow extension icon** in your Chrome toolbar to open the popup.
3.  Adjust the **scroll speed** using the slider (1 = slowest, 10 = fastest).
4.  Toggle **"Pause on Interaction"** if you want auto-pause when you interact with the page.
5.  Click **"Start"** to begin auto-scrolling.

### Controls (in the popup)

-   **Start**: Begins auto-scrolling at the selected speed.
-   **Pause**: Temporarily pauses scrolling. It will resume automatically after 2 seconds if "Pause on Interaction" is enabled and you stop interacting with the page.
-   **Stop**: Completely stops auto-scrolling.
-   **Speed Slider**: Adjusts the scrolling speed from 1 (slow) to 10 (fast).
-   **Pause on Interaction**: A checkbox to enable or disable the smart pause feature.

## Technical Details

-   **Manifest Version**: 3
-   **Permissions**: `activeTab` (to run on the current page) and `storage` (to save your settings).
-   **Content Script**: A lightweight script injected into pages to handle the scrolling.
-   **Background Service Worker**: Manages the extension's lifecycle.

## Development

### File Structure

```
mangaflow/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup interface
├── popup.css           # Popup styles
├── popup.js            # Popup functionality
├── content.js          # Core content script for auto-scrolling
├── background.js       # Background service worker
├── icons/              # Extension icons (16, 32, 48, 128px)
└── README.md           # This file
```

---

**Enjoy your simplified, hands-free manga reading experience with MangaFlow!** 📚✨ 
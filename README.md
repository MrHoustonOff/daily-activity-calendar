# Daily Notes Viewer: Your Obsidian Activity Tracker

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

Do you keep all your notes in one massive folder, making it hard to track your daily working progress? Is the graph view too abstract, and the File Explorer not intuitive enough for tracking activity?

The **Daily Notes Viewer** is the solution: a native, interactive calendar that brings a new level of awareness to your knowledge system. It visualizes the pulse of your vault by instantly showing which notes were **Created** or **Updated** on any specific day, transforming your daily notes into a powerful command center.

## Key Features

### Interactive Activity Log
The plugin transforms your notes into a responsive, interactive calendar integrated directly into your sidebar. Click any date to immediately see two crucial activity lists: **Created Today** and **Updated Today**. This clear, sorted visualization is key to auditing your **daily progress, ensuring you never lose track of a developing thought or idea**.

### Visual Prioritization (Color Coding System)
The core power lies in the Color Coding System: right-click any file in the activity list to assign a visual marker, instantly turning your log into a customizable prioritization tool.

Customization: Easily define your own set of hex colors in the settings menu. Crucially, these colors are smart—they persist even when you rename or move files.

### Customization & Localization
* **Custom Palette:** Define your own set of hex colors in the settings tab.
* **Language Support:** Fully localized in **English** and **Russian**.
* **Language Override:** You can force the plugin language (e.g., use Russian interface even if Obsidian is set to English).
* **Reset Option:** "Danger Zone" button to restore default settings instantly.

---

## Installation

### Method 1: From Community Plugins (Coming Soon... i hope)
1.  Open **Settings** > **Community Plugins** in Obsidian.
2.  Turn on **Restricted Mode**.
3.  Click **Browse** and search for `Daily Notes Viewer`.
4.  Click **Install** and then **Enable**.

### Method 2: Manual Installation
1.  Download the latest release (`main.js`, `manifest.json`, `styles.css`) from the [Releases](https://github.com/MrHoustonOff/obsidian-daily-notes-viewer/releases) page.
2.  Navigate to your vault folder: `.obsidian/plugins/`.
3.  Create a new folder named `daily-notes-viewer`.
4.  Paste the downloaded files into this folder.
5.  Reload Obsidian and enable the plugin in Settings.

---

## Usage

1.  **Open the View:** Click the **Calendar Icon** in the right ribbon sidebar.
2.  **Select a Date:** Click any day on the calendar to view the activity for that specific day.
3.  **Open a Note:** Click any file in the list to open it in the active workspace.
4.  **Color a Note:** Right-click a file in the list -> Select a color circle.
5.  **Manage Colors:** Go to **Settings** -> **Daily Notes Viewer** to add, remove, or edit your color palette.

---

## Development

If you want to contribute or build the plugin from source:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MrHoustonOff/obsidian-daily-notes-viewer.git
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start development build (watch mode):**
    ```bash
    npm run dev
    ```
    *This command will compile `main.ts` to `main.js` automatically when you save changes.*

4.  **Build for production:**
    ```bash
    npm run build
    ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Daily Notes Viewer for Obsidian

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

**Daily Notes Viewer** is a robust, native-feeling sidebar plugin for Obsidian that visualizes your daily knowledge workflow. It provides an interactive calendar interface to instantly track which notes were **Created** or **Updated** on any specific day, organized in clean, sortable lists with powerful color-coding capabilities.

## ✨ Key Features

### 📅 Interactive Calendar
* **Grid Layout:** A responsive 7-column calendar that fits perfectly into the sidebar.
* **Native Design:** Built using Obsidian's internal CSS variables. It adapts seamlessly to Light Mode, Dark Mode, and custom themes.
* **Intuitive Navigation:** Jump between months and years effortlessly.

### 🗂 Activity Tracking
Click on any date to filter your vault's activity:
* **Created Today:** See notes created on the selected date.
* **Updated Today:** See notes modified on the selected date.
* **Smart Sorting:** Files are automatically sorted from newest to oldest modification time.
* **Active Context:** The currently opened file is highlighted in the list for better orientation.
* **Collapsible Sections:** Keep your view tidy using native accordion-style lists.

### 🎨 Color Coding System
Organize your notes visually without cluttering your file metadata:
* **Context Menu Integration:** Right-click any file in the list to assign a color.
* **Visual Indicators:** Notes get a colored border and icon, making high-priority items stand out instantly.
* **Smart Persistence:** Colors are stored internally by file path. They **automatically migrate** if you rename or move a file within Obsidian.

### ⚙️ Customization & Localization
* **Custom Palette:** Define your own set of hex colors in the settings tab.
* **Language Support:** Fully localized in **English** and **Russian**.
* **Language Override:** You can force the plugin language (e.g., use Russian interface even if Obsidian is set to English).
* **Reset Option:** "Danger Zone" button to restore default settings instantly.

---

## 🚀 Installation

### Method 1: From Community Plugins (Coming Soon)
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

## 🛠 Usage

1.  **Open the View:** Click the **Calendar Icon** in the right ribbon sidebar.
2.  **Select a Date:** Click any day on the calendar to view the activity for that specific day.
3.  **Open a Note:** Click any file in the list to open it in the active workspace.
4.  **Color a Note:** Right-click a file in the list -> Select a color circle.
5.  **Manage Colors:** Go to **Settings** -> **Daily Notes Viewer** to add, remove, or edit your color palette.

---

## 🧑‍💻 Development

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

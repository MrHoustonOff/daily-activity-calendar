import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DataManager } from './data/DataManager';
import { DailyNotesView, VIEW_TYPE_DAILY_NOTES } from './ui/DailyNotesView';

// 1. Определяем настройки плагина (Палитра)
export interface DailyNotesSettings {
    palette: string[];
}

const DEFAULT_SETTINGS: DailyNotesSettings = {
    // Дефолтные цвета (как в твоем оригинале + пара новых)
    palette: [
        '#e43d3d', // Red
        '#e4a83d', // Orange
        '#3de475', // Green
        '#3d82e4', // Blue
        '#8a3de4', // Purple
        '#e43dce', // Pink
    ]
}

export default class DailyNotesPlugin extends Plugin {
    public dataManager: DataManager;
    public settings: DailyNotesSettings;

    async onload() {
        console.log('Loading Daily Notes Viewer...');

        // 1. Загружаем настройки (палитру)
        await this.loadSettings();

        // 2. Инициализируем менеджер данных (цвета заметок)
        this.dataManager = new DataManager(this);
        await this.dataManager.load();
        this.dataManager.registerEvents();

        // 3. Регистрируем View
        this.registerView(
            VIEW_TYPE_DAILY_NOTES,
            (leaf) => new DailyNotesView(leaf, this)
        );

        // 4. Иконка
        this.addRibbonIcon('calendar-days', 'Open Daily Notes', () => {
            this.activateView();
        });
    }

    async onunload() {
        console.log('Unloading Daily Notes Viewer...');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_NOTES);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_DAILY_NOTES, active: true });
        }
        workspace.revealLeaf(leaf);
    }
}
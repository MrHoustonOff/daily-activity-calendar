import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DataManager } from './data/DataManager';
import { DailyNotesView, VIEW_TYPE_DAILY_NOTES } from './ui/DailyNotesView';
import { DailyNotesSettingTab } from './settings/SettingsTab'; // <--- Импорт

export interface DailyNotesSettings {
    palette: string[];
}

const DEFAULT_SETTINGS: DailyNotesSettings = {
    palette: [
        '#e43d3d', 
        '#e4a83d', 
        '#3de475', 
        '#3d82e4', 
        '#8a3de4', 
        '#e43dce', 
    ]
}

export default class DailyNotesPlugin extends Plugin {
    public dataManager: DataManager;
    public settings: DailyNotesSettings;

    async onload() {
        console.log('Loading Daily Notes Viewer...');

        await this.loadSettings();

        this.dataManager = new DataManager(this);
        await this.dataManager.load();
        this.dataManager.registerEvents();

        this.registerView(
            VIEW_TYPE_DAILY_NOTES,
            (leaf) => new DailyNotesView(leaf, this)
        );

        this.addRibbonIcon('calendar-days', 'Open Daily Notes', () => {
            this.activateView();
        });

        // --- РЕГИСТРАЦИЯ ВКЛАДКИ НАСТРОЕК ---
        this.addSettingTab(new DailyNotesSettingTab(this.app, this));
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
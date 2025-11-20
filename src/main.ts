import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DataManager } from './data/DataManager';
import { DailyNotesView, VIEW_TYPE_DAILY_NOTES } from './ui/DailyNotesView';
import { DailyNotesSettingTab } from './settings/SettingsTab';
import { t, setLanguageMode } from './i18n/locales';

/**
 * Interface defining user-configurable settings.
 */
export interface DailyNotesSettings {
    /** List of hex colors available in the context menu */
    palette: string[];
    /** Language override setting ('auto', 'en', 'ru') */
    language: string;
}

/**
 * Default settings applied on first install.
 */
export const DEFAULT_SETTINGS: DailyNotesSettings = {
    palette: [
        '#e43d3d', '#e4a83d', '#3de475', '#3d82e4', '#8a3de4', '#e43dce',
    ],
    language: 'auto'
}

/**
 * The main plugin class for "Daily Notes Viewer".
 * Handles lifecycle, settings loading, and view registration.
 */
export default class DailyNotesPlugin extends Plugin {
    public dataManager: DataManager;
    public settings: DailyNotesSettings;

    /**
     * Called when the plugin is enabled.
     * Initializes settings, data manager, UI views, and localization.
     */
    async onload() {
        // 1. Load Settings
        await this.loadSettings();

        // 2. Apply Language Preference immediately
        setLanguageMode(this.settings.language);

        // 3. Initialize Data Manager (Colors DB)
        this.dataManager = new DataManager(this);
        await this.dataManager.load();
        this.dataManager.registerEvents();

        // 4. Register the Custom View
        this.registerView(
            VIEW_TYPE_DAILY_NOTES,
            (leaf) => new DailyNotesView(leaf, this)
        );

        // 5. Add Ribbon Icon
        this.addRibbonIcon('calendar-days', t('ribbonTooltip'), async () => {
            await this.activateView();
        });

        // 6. Add Settings Tab
        this.addSettingTab(new DailyNotesSettingTab(this.app, this));
    }

    /**
     * Called when the plugin is disabled.
     * Cleanup is handled automatically by Obsidian for registered views and events.
     */
    async onunload() {
        // No specific manual cleanup required.
    }

    /**
     * Loads settings from disk, merging with defaults.
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * Saves settings to disk and updates the active language mode.
     */
    async saveSettings() {
        await this.saveData(this.settings);
        // Update locale immediately so UI can react if needed
        setLanguageMode(this.settings.language);
    }

    /**
     * Opens the Daily Notes View in the right sidebar.
     * If the view is already open, it reveals it instead of creating a duplicate.
     */
    async activateView() {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_NOTES);

        if (leaves.length > 0) {
            // View exists, use it
            leaf = leaves[0];
        } else {
            // Create new view in the right sidebar
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_DAILY_NOTES, active: true });
        }
        
        if (leaf) workspace.revealLeaf(leaf);
    }
}
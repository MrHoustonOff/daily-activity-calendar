import { Plugin } from 'obsidian';
import { DataManager } from './data/DataManager';

export default class DailyNotesPlugin extends Plugin {
    public dataManager: DataManager;

    async onload() {
        console.log('Loading Daily Notes Viewer...');

        // 1. Initialize DataManager
        this.dataManager = new DataManager(this);
        
        // 2. Load Data
        await this.dataManager.load();

        // 3. Register Vault Events (Rename/Delete handling)
        this.dataManager.registerEvents();

        // TODO: Initialize View
        // TODO: Add Settings Tab
        // TODO: Add Ribbon Icon
    }

    async onunload() {
        console.log('Unloading Daily Notes Viewer...');
    }
}
import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DataManager } from './data/DataManager';
import { DailyNotesView, VIEW_TYPE_DAILY_NOTES } from './ui/DailyNotesView';

export default class DailyNotesPlugin extends Plugin {
    public dataManager: DataManager;

    async onload() {
        console.log('Loading Daily Notes Viewer...');

        // 1. Initialize DataManager
        this.dataManager = new DataManager(this);
        await this.dataManager.load();
        this.dataManager.registerEvents();

        // 2. Register View
        this.registerView(
            VIEW_TYPE_DAILY_NOTES,
            (leaf) => new DailyNotesView(leaf, this)
        );

        // 3. Add Ribbon Icon to open the view
        this.addRibbonIcon('calendar-days', 'Open Daily Notes', () => {
            this.activateView();
        });
    }

    async onunload() {
        console.log('Unloading Daily Notes Viewer...');
    }

    /**
     * Opens the view in the right sidebar leaf.
     */
    async activateView() {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_NOTES);

        if (leaves.length > 0) {
            // A leaf with our view already exists, use that
            leaf = leaves[0];
        } else {
            // Our view could not be found in the workspace, create a new leaf
            // in the right sidebar
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_DAILY_NOTES, active: true });
        }

        // "Reveal" the leaf in case it is currently collapsed
        workspace.revealLeaf(leaf);
    }
}
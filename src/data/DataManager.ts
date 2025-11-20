import { Plugin, TAbstractFile, TFile } from 'obsidian';

/**
 * Interface defining the structure of our saved data.
 * We keep it compatible with the previous version to ensure seamless migration.
 */
export interface DailyNotesPluginData {
    noteColors: Record<string, string>; // Map: filePath -> hexColor
}

const DEFAULT_DATA: DailyNotesPluginData = {
    noteColors: {}
};

/**
 * Manages data persistence and handles vault events (renames/deletes)
 * to keep data synchronized with file changes.
 */
export class DataManager {
    private plugin: Plugin;
    private data: DailyNotesPluginData;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.data = { ...DEFAULT_DATA };
    }

    /**
     * Loads data from the disk.
     * Merges with default data to ensure all fields exist.
     */
    async load(): Promise<void> {
        const loadedData = await this.plugin.loadData();
        this.data = Object.assign({}, DEFAULT_DATA, loadedData);
        console.log('Daily Notes Viewer: Data loaded', this.data);
    }

    /**
     * Saves the current state of data to the disk.
     */
    async save(): Promise<void> {
        await this.plugin.saveData(this.data);
    }

    /**
     * Returns the color associated with a specific file path.
     */
    getColor(path: string): string | undefined {
        return this.data.noteColors[path];
    }

    /**
     * Sets a color for a specific file path and saves data.
     */
    async setColor(path: string, color: string): Promise<void> {
        this.data.noteColors[path] = color;
        await this.save();
    }

    /**
     * Removes the color association for a file path.
     */
    async removeColor(path: string): Promise<void> {
        if (this.data.noteColors[path]) {
            delete this.data.noteColors[path];
            await this.save();
        }
    }

    /**
     * Registers event listeners to handle file renames and deletions.
     * This ensures that metadata (colors) follows the file.
     */
    registerEvents(): void {
        // Handle File Rename
        this.plugin.registerEvent(
            this.plugin.app.vault.on('rename', async (file: TAbstractFile, oldPath: string) => {
                if (file instanceof TFile) {
                    await this.handleRename(oldPath, file.path);
                }
            })
        );

        // Handle File Deletion
        this.plugin.registerEvent(
            this.plugin.app.vault.on('delete', async (file: TAbstractFile) => {
                if (file instanceof TFile) {
                    await this.handleDelete(file.path);
                }
            })
        );
    }

    /**
     * Logic to migrate data when a file is renamed.
     */
    private async handleRename(oldPath: string, newPath: string): Promise<void> {
        const color = this.data.noteColors[oldPath];
        if (color) {
            // Move the color to the new path
            this.data.noteColors[newPath] = color;
            // Clean up the old path
            delete this.data.noteColors[oldPath];
            await this.save();
            console.log(`Daily Notes Viewer: Migrated color from ${oldPath} to ${newPath}`);
        }
    }

    /**
     * Logic to clean up data when a file is deleted.
     * This prevents the data.json from growing indefinitely with orphan records.
     */
    private async handleDelete(path: string): Promise<void> {
        if (this.data.noteColors[path]) {
            delete this.data.noteColors[path];
            await this.save();
            console.log(`Daily Notes Viewer: Cleaned up color for deleted file ${path}`);
        }
    }
}
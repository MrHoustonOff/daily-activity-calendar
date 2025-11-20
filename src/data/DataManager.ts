import { Plugin, TAbstractFile, TFile } from 'obsidian';

/**
 * Interface defining the structure of the data saved in `data.json`.
 * @property noteColors - A map where Key = FilePath and Value = HexColor.
 */
export interface DailyNotesPluginData {
    noteColors: Record<string, string>;
}

/**
 * Default data state used when the plugin is first installed
 * or when data is reset.
 */
const DEFAULT_DATA: DailyNotesPluginData = {
    noteColors: {}
};

/**
 * DataManager handles all persistence operations.
 * It acts as a layer between the plugin logic and the Obsidian file system.
 * * Key Responsibilities:
 * 1. Loading and saving color data.
 * 2. Listening to Vault events (Rename/Delete) to maintain data integrity.
 */
export class DataManager {
    private plugin: Plugin;
    private data: DailyNotesPluginData;

    /**
     * @param plugin - Reference to the main plugin instance.
     */
    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.data = { ...DEFAULT_DATA };
    }

    /**
     * Loads data from disk and merges it with defaults.
     * Should be called during `onload`.
     */
    async load(): Promise<void> {
        const loadedData = await this.plugin.loadData();
        this.data = Object.assign({}, DEFAULT_DATA, loadedData);
    }

    /**
     * Persists the current data state to `data.json`.
     */
    async save(): Promise<void> {
        await this.plugin.saveData(this.data);
    }

    /**
     * Retrieves the color associated with a specific file path.
     * Operation complexity: O(1).
     * * @param path - The relative path of the file (e.g., "Folder/Note.md").
     * @returns The hex color string or undefined if not set.
     */
    getColor(path: string): string | undefined {
        return this.data.noteColors[path];
    }

    /**
     * Assigns a color to a file and saves the data.
     * * @param path - The file path.
     * @param color - The hex color string.
     */
    async setColor(path: string, color: string): Promise<void> {
        this.data.noteColors[path] = color;
        await this.save();
    }

    /**
     * Removes the color association for a given file.
     * * @param path - The file path.
     */
    async removeColor(path: string): Promise<void> {
        if (this.data.noteColors[path]) {
            delete this.data.noteColors[path];
            await this.save();
        }
    }

    /**
     * Registers event listeners for 'rename' and 'delete' operations.
     * This ensures that color metadata follows the file if it is moved or renamed.
     */
    registerEvents(): void {
        // Handle File Rename: Migrate the color to the new path
        this.plugin.registerEvent(
            this.plugin.app.vault.on('rename', async (file: TAbstractFile, oldPath: string) => {
                if (file instanceof TFile) {
                    await this.handleRename(oldPath, file.path);
                }
            })
        );

        // Handle File Deletion: Cleanup data to prevent orphans
        this.plugin.registerEvent(
            this.plugin.app.vault.on('delete', async (file: TAbstractFile) => {
                if (file instanceof TFile) {
                    await this.handleDelete(file.path);
                }
            })
        );
    }

    /**
     * Internal handler for rename events.
     * Transfers the color from the old key to the new key.
     */
    private async handleRename(oldPath: string, newPath: string): Promise<void> {
        const color = this.data.noteColors[oldPath];
        if (color) {
            this.data.noteColors[newPath] = color;
            delete this.data.noteColors[oldPath];
            await this.save();
        }
    }

    /**
     * Internal handler for delete events.
     * Removes the key from the database.
     */
    private async handleDelete(path: string): Promise<void> {
        if (this.data.noteColors[path]) {
            delete this.data.noteColors[path];
            await this.save();
        }
    }
}
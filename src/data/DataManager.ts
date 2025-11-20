import { Plugin, TAbstractFile, TFile } from 'obsidian';

export interface DailyNotesPluginData {
    noteColors: Record<string, string>;
}

const DEFAULT_DATA: DailyNotesPluginData = {
    noteColors: {}
};

export class DataManager {
    private plugin: Plugin;
    private data: DailyNotesPluginData;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.data = { ...DEFAULT_DATA };
    }

    async load(): Promise<void> {
        const loadedData = await this.plugin.loadData();
        this.data = Object.assign({}, DEFAULT_DATA, loadedData);
    }

    async save(): Promise<void> {
        await this.plugin.saveData(this.data);
    }

    getColor(path: string): string | undefined {
        return this.data.noteColors[path];
    }

    async setColor(path: string, color: string): Promise<void> {
        this.data.noteColors[path] = color;
        await this.save();
    }

    async removeColor(path: string): Promise<void> {
        if (this.data.noteColors[path]) {
            delete this.data.noteColors[path];
            await this.save();
        }
    }

    registerEvents(): void {
        this.plugin.registerEvent(
            this.plugin.app.vault.on('rename', async (file: TAbstractFile, oldPath: string) => {
                if (file instanceof TFile) {
                    await this.handleRename(oldPath, file.path);
                }
            })
        );

        this.plugin.registerEvent(
            this.plugin.app.vault.on('delete', async (file: TAbstractFile) => {
                if (file instanceof TFile) {
                    await this.handleDelete(file.path);
                }
            })
        );
    }

    private async handleRename(oldPath: string, newPath: string): Promise<void> {
        const color = this.data.noteColors[oldPath];
        if (color) {
            this.data.noteColors[newPath] = color;
            delete this.data.noteColors[oldPath];
            await this.save();
        }
    }

    private async handleDelete(path: string): Promise<void> {
        if (this.data.noteColors[path]) {
            delete this.data.noteColors[path];
            await this.save();
        }
    }
}
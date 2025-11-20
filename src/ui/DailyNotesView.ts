import { ItemView, WorkspaceLeaf, setIcon, TFile, moment } from 'obsidian';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import DailyNotesPlugin from '../main';

export const VIEW_TYPE_DAILY_NOTES = 'daily-notes-view';

export class DailyNotesView extends ItemView {
    private plugin: DailyNotesPlugin;
    private calendarContainer: HTMLElement;
    private listsContainer: HTMLElement;
    private fcal: FlatpickrInstance | null = null;
    private currentDate: Date = new Date();

    constructor(leaf: WorkspaceLeaf, plugin: DailyNotesPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() { return VIEW_TYPE_DAILY_NOTES; }
    getDisplayText() { return 'Daily Notes'; }
    getIcon() { return 'calendar-days'; }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('daily-notes-view-container');

        // 1. Header
        this.renderHeader(container as HTMLElement);

        // 2. Calendar
        this.calendarContainer = container.createEl('div', { cls: 'daily-notes-calendar-container' });
        this.initCalendar();

        // 3. Lists
        this.listsContainer = container.createEl('div', { cls: 'daily-notes-lists-container' });
        
        this.refreshLists();
        this.registerEvents();
    }

    async onClose() {
        if (this.fcal) this.fcal.destroy();
    }

    private renderHeader(container: HTMLElement) {
        const headerEl = container.createEl('div', { cls: 'daily-notes-header' });
        headerEl.createEl('h4', { text: 'Daily Notes' });

        const refreshBtn = headerEl.createEl('div', { cls: 'clickable-icon daily-notes-refresh' });
        setIcon(refreshBtn, 'refresh-cw');
        refreshBtn.setAttribute('aria-label', 'Refresh');
        refreshBtn.onclick = () => {
            if (this.fcal) this.fcal.setDate(new Date(), true);
        };
    }

    private initCalendar() {
        this.fcal = flatpickr(this.calendarContainer, {
            inline: true,
            defaultDate: this.currentDate,
            dateFormat: 'Y-m-d',
            monthSelectorType: 'static',
            locale: { firstDayOfWeek: 1 },
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    this.currentDate = selectedDates[0];
                    this.refreshLists();
                }
            }
        });
    }

    private registerEvents() {
        // File changes
        this.registerEvent(this.app.vault.on('create', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('modify', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('delete', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('rename', () => this.refreshLists()));
        
        // NEW: Highlight active file when user switches tabs
        this.registerEvent(this.app.workspace.on('file-open', () => this.refreshLists()));
    }

    private refreshLists() {
        // Don't fully empty if we just want to re-highlight, but for MVP full re-render is safer/easier
        this.listsContainer.empty();
        const targetDate = moment(this.currentDate);

        const createdFiles: TFile[] = [];
        const updatedFiles: TFile[] = [];
        const allFiles = this.app.vault.getMarkdownFiles();

        for (const file of allFiles) {
            const ctime = moment(file.stat.ctime);
            const mtime = moment(file.stat.mtime);

            if (ctime.isSame(targetDate, 'day')) {
                createdFiles.push(file);
            } else if (mtime.isSame(targetDate, 'day')) {
                updatedFiles.push(file);
            }
        }

        createdFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);
        updatedFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        this.renderSection('Created Today', createdFiles, 'created');
        this.renderSection('Updated Today', updatedFiles, 'updated');
    }

    private renderSection(title: string, files: TFile[], type: 'created' | 'updated') {
        const details = this.listsContainer.createEl('details', { cls: 'daily-notes-section' });
        details.open = true;

        const summary = details.createEl('summary', { cls: 'daily-notes-section-header' });
        summary.createSpan({ text: `${title} (${files.length})` });

        const listBody = details.createEl('div', { cls: 'daily-notes-file-list' });

        if (files.length === 0) {
            listBody.createEl('div', { text: 'No notes found.', cls: 'daily-notes-empty' });
            return;
        }

        files.forEach((file, index) => {
            this.renderFileItem(listBody, file, index + 1);
        });
    }

    private renderFileItem(container: HTMLElement, file: TFile, index: number) {
        const item = container.createEl('div', { cls: 'daily-notes-item' });
        
        // NEW: Check if this file is the currently active one
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.path === file.path) {
            item.addClass('is-active');
        }
        
        item.createSpan({ text: `${index}.`, cls: 'daily-notes-item-index' });

        const iconContainer = item.createSpan({ cls: 'daily-notes-item-icon' });
        setIcon(iconContainer, 'file-text');

        const link = item.createEl('a', { 
            text: file.basename, 
            cls: 'daily-notes-item-link',
            href: '#' 
        });

        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(file.path, '', false);
        });

        item.addEventListener('contextmenu', (e) => {
            // Placeholder for colors
        });
    }
}
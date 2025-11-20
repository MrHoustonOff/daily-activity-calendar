import { ItemView, WorkspaceLeaf, setIcon, TFile, moment, Menu } from 'obsidian';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import DailyNotesPlugin from '../main';
import { t, getEffectiveLocale } from '../i18n/locales';

export const VIEW_TYPE_DAILY_NOTES = 'daily-notes-view';

/**
 * The core View component.
 * Renders the interactive Calendar and the list of files (Created/Updated).
 */
export class DailyNotesView extends ItemView {
    private plugin: DailyNotesPlugin;
    private calendarContainer: HTMLElement;
    private listsContainer: HTMLElement;
    private fcal: FlatpickrInstance | null = null;
    
    /** The currently selected date in the calendar. Defaults to Today. */
    private currentDate: Date = new Date();

    constructor(leaf: WorkspaceLeaf, plugin: DailyNotesPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() { return VIEW_TYPE_DAILY_NOTES; }
    getDisplayText() { return t('viewHeader'); }
    getIcon() { return 'calendar-days'; }

    /**
     * Lifecycle method called when the view is opened.
     * Sets up the DOM structure, initializes the calendar, and subscribes to events.
     */
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('daily-notes-view-container');

        // 1. Render Header
        this.renderHeader(container as HTMLElement);

        // 2. Render Calendar Wrapper
        this.calendarContainer = container.createEl('div', { cls: 'daily-notes-calendar-container' });
        this.initCalendar();

        // 3. Render Lists Wrapper
        this.listsContainer = container.createEl('div', { cls: 'daily-notes-lists-container' });
        
        // Initial Data Load
        this.refreshLists();
        this.registerEvents();
    }

    /**
     * Cleanup when view is closed.
     */
    async onClose() {
        if (this.fcal) this.fcal.destroy();
    }

    /**
     * Renders the top header with the plugin title and Refresh button.
     */
    private renderHeader(container: HTMLElement) {
        const headerEl = container.createEl('div', { cls: 'daily-notes-header' });
        headerEl.createEl('h4', { text: t('viewHeader') });

        const refreshBtn = headerEl.createEl('div', { cls: 'clickable-icon daily-notes-refresh' });
        setIcon(refreshBtn, 'refresh-cw');
        refreshBtn.setAttribute('aria-label', t('refreshTooltip'));
        refreshBtn.onclick = () => {
            if (this.fcal) this.fcal.setDate(new Date(), true); // Reset to Today
        };
    }

    /**
     * Initializes the Flatpickr calendar instance.
     * Configures locale based on settings (RU vs EN).
     */
    private initCalendar() {
        const localeCode = getEffectiveLocale();
        
        this.fcal = flatpickr(this.calendarContainer, {
            inline: true,
            defaultDate: this.currentDate,
            dateFormat: 'Y-m-d',
            monthSelectorType: 'static',
            locale: {
                // Set Monday (1) as start of week for Russian, Sunday (0) for English
                firstDayOfWeek: localeCode === 'ru' ? 1 : 0
            },
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    this.currentDate = selectedDates[0];
                    this.refreshLists();
                }
            }
        });
    }

    /**
     * Registers Obsidian Vault events to keep the UI in sync with file changes.
     */
    private registerEvents() {
        // Update lists on any file operation
        this.registerEvent(this.app.vault.on('create', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('modify', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('delete', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('rename', () => this.refreshLists()));
        
        // Highlight the active file when tab changes
        this.registerEvent(this.app.workspace.on('file-open', () => this.refreshLists()));
    }

    /**
     * Main Logic: Filters files by date and renders the 'Created' and 'Updated' sections.
     */
    private refreshLists() {
        this.listsContainer.empty();
        const targetDate = moment(this.currentDate);

        const createdFiles: TFile[] = [];
        const updatedFiles: TFile[] = [];
        const allFiles = this.app.vault.getMarkdownFiles();

        // Filter files O(N)
        for (const file of allFiles) {
            const ctime = moment(file.stat.ctime);
            const mtime = moment(file.stat.mtime);

            if (ctime.isSame(targetDate, 'day')) {
                createdFiles.push(file);
            } else if (mtime.isSame(targetDate, 'day')) {
                updatedFiles.push(file);
            }
        }

        // Sort by time (Newest first)
        createdFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);
        updatedFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        this.renderSection(t('createdToday'), createdFiles, 'created');
        this.renderSection(t('updatedToday'), updatedFiles, 'updated');
    }

    /**
     * Renders a collapsible section (details/summary) for a list of files.
     */
    private renderSection(title: string, files: TFile[], type: 'created' | 'updated') {
        const details = this.listsContainer.createEl('details', { cls: 'daily-notes-section' });
        details.open = true; // Default to expanded

        const summary = details.createEl('summary', { cls: 'daily-notes-section-header' });
        summary.createSpan({ text: `${title} (${files.length})` });

        const listBody = details.createEl('div', { cls: 'daily-notes-file-list' });

        if (files.length === 0) {
            listBody.createEl('div', { text: t('noNotes'), cls: 'daily-notes-empty' });
            return;
        }

        files.forEach((file, index) => {
            this.renderFileItem(listBody, file, index + 1);
        });
    }

    /**
     * Renders a single file item with icon, index, link, and context menu.
     */
    private renderFileItem(container: HTMLElement, file: TFile, index: number) {
        const item = container.createEl('div', { cls: 'daily-notes-item' });
        
        // 1. Highlight if active
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.path === file.path) {
            item.addClass('is-active');
        }
        
        // 2. Retrieve custom color
        const noteColor = this.plugin.dataManager.getColor(file.path);

        // 3. Index
        item.createSpan({ text: `${index}.`, cls: 'daily-notes-item-index' });

        // 4. Icon with Color Logic
        const iconContainer = item.createSpan({ cls: 'daily-notes-item-icon' });
        setIcon(iconContainer, 'file-text');

        if (noteColor) {
            iconContainer.style.color = noteColor;
            item.style.borderLeft = `3px solid ${noteColor}`;
            item.style.paddingLeft = '5px';
        } else {
            item.style.borderLeft = '3px solid transparent';
        }

        // 5. File Link
        const link = item.createEl('a', { 
            text: file.basename, 
            cls: 'daily-notes-item-link',
            href: '#' 
        });

        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(file.path, '', false);
        });

        // 6. Context Menu (Right Click)
        item.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const menu = new Menu();

            // Header
            menu.addItem((item) => {
                item.setTitle(t('ctxColorLabel')).setIsLabel(true);
            });

            // Generate Color Options from Settings Palette
            this.plugin.settings.palette.forEach((color) => {
                menu.addItem((menuItem) => {
                    menuItem
                        .setTitle(color)
                        .setIcon('circle')
                        .onClick(async () => {
                            await this.plugin.dataManager.setColor(file.path, color);
                            this.refreshLists();
                        });
                    
                    // Hack to colorize the menu icon
                    const iconEl = (menuItem as any).iconEl as HTMLElement;
                    if (iconEl) iconEl.style.color = color;
                });
            });

            menu.addSeparator();

            // Reset Option
            menu.addItem((menuItem) => {
                menuItem
                    .setTitle(t('ctxResetColor'))
                    .setIcon('x-circle')
                    .onClick(async () => {
                        await this.plugin.dataManager.removeColor(file.path);
                        this.refreshLists();
                    });
            });

            menu.showAtMouseEvent(event);
        });
    }
}
import { ItemView, WorkspaceLeaf, setIcon, TFile, moment, Menu, MenuItem } from 'obsidian';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import DailyNotesPlugin from '../main';
import { t, getEffectiveLocale } from '../i18n/locales';

export const VIEW_TYPE_DAILY_NOTES = 'daily-notes-view';

/**
 * Extends the standard MenuItem interface to include the 'iconEl' property.
 * This allows for type-safe manipulation of menu icons (e.g., coloring) 
 * without resorting to 'any', satisfying strict linter rules.
 */
interface InternalMenuItem extends MenuItem {
    iconEl: HTMLElement;
}

/**
 * The core View component responsible for rendering the interface.
 * Contains the Flatpickr calendar and the filtered lists of created/updated notes.
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
     * Initializes the DOM structure, calendar, and event listeners.
     * Returns a Promise to satisfy the parent class signature.
     */
    onOpen() {
        return Promise.resolve().then(() => {
            const container = this.containerEl.children[1];
            container.empty();
            container.addClass('daily-notes-view-container');

            this.renderHeader(container as HTMLElement);
            this.calendarContainer = container.createEl('div', { cls: 'daily-notes-calendar-container' });
            this.initCalendar();
            this.listsContainer = container.createEl('div', { cls: 'daily-notes-lists-container' });
            
            this.refreshLists();
            this.registerEvents();
        });
    }

    /**
     * Lifecycle method called when the view is closed.
     * Cleans up the Flatpickr instance to prevent memory leaks.
     */
    onClose() {
        if (this.fcal) this.fcal.destroy();
        return Promise.resolve();
    }

    /**
     * Renders the top header bar with the title and refresh button.
     */
    private renderHeader(container: HTMLElement) {
        const headerEl = container.createEl('div', { cls: 'daily-notes-header' });
        headerEl.createEl('h4', { text: t('viewHeader') });

        const refreshBtn = headerEl.createEl('div', { cls: 'clickable-icon daily-notes-refresh' });
        setIcon(refreshBtn, 'refresh-cw');
        refreshBtn.setAttribute('aria-label', t('refreshTooltip'));
        refreshBtn.onclick = () => {
            if (this.fcal) this.fcal.setDate(new Date(), true);
        };
    }

    /**
     * Initializes the Flatpickr calendar widget.
     * Configures localization based on the plugin settings (e.g., Monday start for RU).
     */
    private initCalendar() {
        const localeCode = getEffectiveLocale();
        
        this.fcal = flatpickr(this.calendarContainer, {
            inline: true,
            defaultDate: this.currentDate,
            dateFormat: 'Y-m-d',
            monthSelectorType: 'static',
            locale: {
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
     * Registers event listeners to sync the UI with Vault changes.
     */
    private registerEvents() {
        this.registerEvent(this.app.vault.on('create', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('modify', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('delete', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('rename', () => this.refreshLists()));
        
        // Highlight active file when switching tabs
        this.registerEvent(this.app.workspace.on('file-open', () => this.refreshLists()));
    }

    /**
     * Scans the vault for files matching the selected date and updates the lists.
     */
    private refreshLists() {
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

        // Sort: Newest first
        createdFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);
        updatedFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        this.renderSection(t('createdToday'), createdFiles, 'created');
        this.renderSection(t('updatedToday'), updatedFiles, 'updated');
    }

    /**
     * Renders a collapsible section for a specific list of files.
     */
    private renderSection(title: string, files: TFile[], _type: 'created' | 'updated') {
        const details = this.listsContainer.createEl('details', { cls: 'daily-notes-section' });
        details.open = true;

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
     * Renders a single file item.
     * Handles active state, color indicators, file opening, and context menu.
     */
    private renderFileItem(container: HTMLElement, file: TFile, index: number) {
        const item = container.createEl('div', { cls: 'daily-notes-item' });
        
        // 1. Check if file is active
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.path === file.path) {
            item.addClass('is-active');
        }
        
        // 2. Apply Custom Color
        const noteColor = this.plugin.dataManager.getColor(file.path);

        if (noteColor) {
            item.addClass('has-color');
            item.style.setProperty('--dn-note-color', noteColor);
        }

        // 3. Index
        item.createSpan({ text: `${index}.`, cls: 'daily-notes-item-index' });

        // 4. Icon
        const iconContainer = item.createSpan({ cls: 'daily-notes-item-icon' });
        setIcon(iconContainer, 'file-text');

        // 5. Link
        const link = item.createEl('a', { 
            text: file.basename, 
            cls: 'daily-notes-item-link',
            href: '#' 
        });

        // Handle click with async/await to ensure errors are caught
        link.addEventListener('click', (e) => {
            e.preventDefault();
            void this.app.workspace.openLinkText(file.path, '', false);
        });

        // 6. Context Menu (Right Click)
        item.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const menu = new Menu();

            menu.addItem((item) => {
                item.setTitle(t('ctxColorLabel')).setIsLabel(true);
            });

            this.plugin.settings.palette.forEach((color) => {
                menu.addItem((menuItem) => {
                    menuItem
                        .setTitle(color)
                        .setIcon('circle')
                        .onClick(() => {
                            void (async () => {
                                await this.plugin.dataManager.setColor(file.path, color);
                                this.refreshLists();
                            })();
                        });
                    
                    // Use custom interface to safely access iconEl
                    const iconEl = (menuItem as InternalMenuItem).iconEl;
                    if (iconEl) {
                        // Apply color via CSS class and variable
                        iconEl.addClass('daily-notes-menu-icon-color');
                        iconEl.style.setProperty('--dn-menu-icon-color', color);
                    }
                });
            });

            menu.addSeparator();

            menu.addItem((menuItem) => {
                menuItem
                    .setTitle(t('ctxResetColor'))
                    .setIcon('x-circle')
                    .onClick(() => {
                        void (async () => {
                            await this.plugin.dataManager.removeColor(file.path);
                            this.refreshLists();
                        })();
                    });
            });

            menu.showAtMouseEvent(event);
        });
    }
}
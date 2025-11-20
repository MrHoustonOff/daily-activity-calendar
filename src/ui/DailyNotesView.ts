import { ItemView, WorkspaceLeaf, setIcon, TFile, moment, Menu } from 'obsidian';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import DailyNotesPlugin from '../main';
import { t } from '../i18n/locales'; // <--- Импортируем переводчик

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
    getDisplayText() { return t('viewHeader'); } 
    getIcon() { return 'calendar-days'; }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('daily-notes-view-container');

        this.renderHeader(container as HTMLElement);
        this.calendarContainer = container.createEl('div', { cls: 'daily-notes-calendar-container' });
        this.initCalendar();
        this.listsContainer = container.createEl('div', { cls: 'daily-notes-lists-container' });
        
        this.refreshLists();
        this.registerEvents();
    }

    async onClose() {
        if (this.fcal) this.fcal.destroy();
    }

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

    private initCalendar() {
        // Определяем язык для календаря (flatpickr требует отдельного конфига для локали)
        const localeCode = moment.locale();
        // Flatpickr имеет встроенную локализацию, но для MVP оставим авто-детект дней недели (locale.firstDayOfWeek)
        // Если нужно полностью перевести месяцы flatpickr'а на русский, нужно импортировать Russian из flatpickr/l10n
        // Но пока оставим простую настройку начала недели.
        
        this.fcal = flatpickr(this.calendarContainer, {
            inline: true,
            defaultDate: this.currentDate,
            dateFormat: 'Y-m-d',
            monthSelectorType: 'static',
            locale: {
                firstDayOfWeek: localeCode === 'en' ? 0 : 1 // Воскресенье для EN, Понедельник для остальных (RU)
            },
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    this.currentDate = selectedDates[0];
                    this.refreshLists();
                }
            }
        });
    }

    private registerEvents() {
        this.registerEvent(this.app.vault.on('create', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('modify', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('delete', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('rename', () => this.refreshLists()));
        this.registerEvent(this.app.workspace.on('file-open', () => this.refreshLists()));
    }

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

        createdFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);
        updatedFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        this.renderSection(t('createdToday'), createdFiles, 'created'); 
        this.renderSection(t('updatedToday'), updatedFiles, 'updated'); 
    }

    private renderSection(title: string, files: TFile[], type: 'created' | 'updated') {
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

    private renderFileItem(container: HTMLElement, file: TFile, index: number) {
        const item = container.createEl('div', { cls: 'daily-notes-item' });
        
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.path === file.path) {
            item.addClass('is-active');
        }
        
        const noteColor = this.plugin.dataManager.getColor(file.path);

        item.createSpan({ text: `${index}.`, cls: 'daily-notes-item-index' });

        const iconContainer = item.createSpan({ cls: 'daily-notes-item-icon' });
        setIcon(iconContainer, 'file-text');

        if (noteColor) {
            iconContainer.style.color = noteColor;
            item.style.borderLeft = `3px solid ${noteColor}`;
            item.style.paddingLeft = '5px';
        } else {
            item.style.borderLeft = '3px solid transparent';
        }

        const link = item.createEl('a', { 
            text: file.basename, 
            cls: 'daily-notes-item-link',
            href: '#' 
        });

        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(file.path, '', false);
        });

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
                        .onClick(async () => {
                            await this.plugin.dataManager.setColor(file.path, color);
                            this.refreshLists();
                        });
                    
                    const iconEl = (menuItem as any).iconEl as HTMLElement;
                    if (iconEl) iconEl.style.color = color;
                });
            });

            menu.addSeparator();

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
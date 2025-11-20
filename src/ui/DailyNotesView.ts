import { ItemView, WorkspaceLeaf, setIcon, TFile, moment, Menu } from 'obsidian';
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
        headerEl.createEl('h4', { text: 'Daily Notes' });
        const refreshBtn = headerEl.createEl('div', { cls: 'clickable-icon daily-notes-refresh' });
        setIcon(refreshBtn, 'refresh-cw');
        refreshBtn.setAttribute('aria-label', 'Refresh');
        refreshBtn.onclick = () => { if (this.fcal) this.fcal.setDate(new Date(), true); };
    }

    private initCalendar() {
        this.fcal = flatpickr(this.calendarContainer, {
            inline: true, defaultDate: this.currentDate, dateFormat: 'Y-m-d', monthSelectorType: 'static',
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
            if (ctime.isSame(targetDate, 'day')) createdFiles.push(file);
            else if (mtime.isSame(targetDate, 'day')) updatedFiles.push(file);
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
        files.forEach((file, index) => this.renderFileItem(listBody, file, index + 1));
    }

    private renderFileItem(container: HTMLElement, file: TFile, index: number) {
        const item = container.createEl('div', { cls: 'daily-notes-item' });
        
        // 1. Проверяем активный файл
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.path === file.path) item.addClass('is-active');
        
        // 2. Получаем сохраненный цвет
        const noteColor = this.plugin.dataManager.getColor(file.path);

        // 3. Рендер номера
        item.createSpan({ text: `${index}.`, cls: 'daily-notes-item-index' });

        // 4. Рендер иконки (с цветом)
        const iconContainer = item.createSpan({ cls: 'daily-notes-item-icon' });
        setIcon(iconContainer, 'file-text');
        
        if (noteColor) {
            iconContainer.style.color = noteColor; // Красим иконку
            item.style.borderLeft = `3px solid ${noteColor}`; // Добавляем цветной бордер слева для красоты
            item.style.paddingLeft = '5px'; // Компенсируем бордер
        } else {
            item.style.borderLeft = '3px solid transparent';
        }

        // 5. Ссылка
        const link = item.createEl('a', { 
            text: file.basename, 
            cls: 'daily-notes-item-link',
            href: '#' 
        });
        // Если есть цвет, можно покрасить и текст, но лучше оставить текст читабельным (нативным), а красить иконку/бордер.
        // if (noteColor) link.style.color = noteColor; 

        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(file.path, '', false);
        });

        // 6. КОНТЕКСТНОЕ МЕНЮ (ПКМ)
        item.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const menu = new Menu();

            menu.addItem((item) => {
                item.setTitle('Color Label').setIsLabel(true);
            });

            // Генерируем пункты меню из палитры
            this.plugin.settings.palette.forEach((color) => {
                menu.addItem((menuItem) => {
                    menuItem
                        .setTitle(color) // Можно заменить на название, если хранить {hex, name}
                        .setIcon('circle')
                        .onClick(async () => {
                            // Сохраняем цвет
                            await this.plugin.dataManager.setColor(file.path, color);
                            // Обновляем список, чтобы увидеть изменения сразу
                            this.refreshLists();
                        });
                    
                    // Хак для TypeScript: приводим к any, чтобы достать iconEl
                    const iconEl = (menuItem as any).iconEl as HTMLElement;
                    if (iconEl) iconEl.style.color = color;
                });
            });

            menu.addSeparator();

            menu.addItem((menuItem) => {
                menuItem
                    .setTitle('Reset Color')
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
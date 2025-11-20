import { ItemView, WorkspaceLeaf, setIcon, TFile, moment } from 'obsidian';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import DailyNotesPlugin from '../main';

export const VIEW_TYPE_DAILY_NOTES = 'daily-notes-view';

export class DailyNotesView extends ItemView {
    private plugin: DailyNotesPlugin;
    private calendarContainer: HTMLElement;
    private listsContainer: HTMLElement; // Общий контейнер для списков
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

        // 2. Calendar Wrapper
        this.calendarContainer = container.createEl('div', { cls: 'daily-notes-calendar-container' });
        this.initCalendar();

        // 3. Lists Container (Created & Updated)
        this.listsContainer = container.createEl('div', { cls: 'daily-notes-lists-container' });
        
        // Первичная отрисовка списков
        this.refreshLists();

        // Подписываемся на изменения в хранилище, чтобы списки обновлялись сами
        this.registerVaultEvents();
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
            if (this.fcal) this.fcal.setDate(new Date(), true); // Reset to today
        };
    }

    private initCalendar() {
        this.fcal = flatpickr(this.calendarContainer, {
            inline: true,
            defaultDate: this.currentDate,
            dateFormat: 'Y-m-d',
            monthSelectorType: 'static',
            locale: {
                firstDayOfWeek: 1 // Start week on Monday
            },
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    this.currentDate = selectedDates[0];
                    this.refreshLists();
                }
            }
        });
    }

    private registerVaultEvents() {
        // Обновляем списки при любом чихе с файлами
        this.registerEvent(this.app.vault.on('create', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('modify', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('delete', () => this.refreshLists()));
        this.registerEvent(this.app.vault.on('rename', () => this.refreshLists()));
    }

    // --- ГЛАВНАЯ ЛОГИКА СПИСКОВ ---

    private refreshLists() {
        this.listsContainer.empty();
        const targetDate = moment(this.currentDate);

        const createdFiles: TFile[] = [];
        const updatedFiles: TFile[] = [];

        const allFiles = this.app.vault.getMarkdownFiles();

        for (const file of allFiles) {
            const ctime = moment(file.stat.ctime);
            const mtime = moment(file.stat.mtime);

            // Проверяем день создания
            if (ctime.isSame(targetDate, 'day')) {
                createdFiles.push(file);
            }
            // Проверяем день обновления (исключая те, что только что созданы, чтобы не дублировать, если хочешь)
            // Логика: если файл создан сегодня, он и обновлен сегодня. 
            // Обычно люди хотят видеть файл в Updated, только если он создан РАНЬШЕ, а обновлен СЕГОДНЯ.
            // Но твое ТЗ: "вывести заметки которые ты в этот день редачил".
            else if (mtime.isSame(targetDate, 'day')) {
                updatedFiles.push(file);
            }
        }

        // Сортировка: от новых к старым
        createdFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);
        updatedFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        // Рендерим секции
        this.renderSection('Created Today', createdFiles, 'created');
        this.renderSection('Updated Today', updatedFiles, 'updated');
    }

    private renderSection(title: string, files: TFile[], type: 'created' | 'updated') {
        // Используем нативный details/summary для выпадающего списка
        const details = this.listsContainer.createEl('details', { cls: 'daily-notes-section' });
        details.open = true; // По умолчанию открыт

        const summary = details.createEl('summary', { cls: 'daily-notes-section-header' });
        // Добавляем счетчик файлов
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
        
        // 1. Номер
        item.createSpan({ text: `${index}.`, cls: 'daily-notes-item-index' });

        // 2. Иконка файла
        const iconContainer = item.createSpan({ cls: 'daily-notes-item-icon' });
        setIcon(iconContainer, 'file-text');

        // 3. Название (ссылка)
        const link = item.createEl('a', { 
            text: file.basename, 
            cls: 'daily-notes-item-link',
            href: '#' 
        });

        // Обработка клика -> Открыть файл
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(file.path, '', false);
        });

        // TODO: Здесь будет контекстное меню (ПКМ) для цвета
        item.addEventListener('contextmenu', (e) => {
            // e.preventDefault();
            // console.log('Right click on', file.path);
        });
    }
}
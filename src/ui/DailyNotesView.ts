import { ItemView, WorkspaceLeaf, setIcon } from 'obsidian';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import DailyNotesPlugin from '../main';

export const VIEW_TYPE_DAILY_NOTES = 'daily-notes-view';

/**
 * The main view class responsible for rendering the Calendar and Note Lists.
 */
export class DailyNotesView extends ItemView {
    private plugin: DailyNotesPlugin;
    private calendarContainer: HTMLElement;
    private createdListContainer: HTMLElement;
    private updatedListContainer: HTMLElement;
    private fcal: FlatpickrInstance | null = null;
    // Храним текущую выбранную дату (по умолчанию сегодня)
    private currentDate: Date = new Date();

    constructor(leaf: WorkspaceLeaf, plugin: DailyNotesPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_DAILY_NOTES;
    }

    getDisplayText() {
        return 'Daily Notes';
    }

    getIcon() {
        return 'calendar-days';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('daily-notes-view-container');

        // 1. Header Section
        this.renderHeader(container as HTMLElement);

        // 2. Calendar Section
        this.calendarContainer = container.createEl('div', { cls: 'daily-notes-calendar-container' });
        this.initCalendar();

        // 3. Lists Section
        const listsWrapper = container.createEl('div', { cls: 'daily-notes-lists-wrapper' });
        
        // Placeholder for Created Notes
        listsWrapper.createEl('h4', { text: 'Created Today' });
        this.createdListContainer = listsWrapper.createEl('div', { cls: 'daily-notes-list' });
        this.createdListContainer.createEl('p', { text: 'Waiting for implementation...', cls: 'nav-folder-title-content' });

        // Placeholder for Updated Notes
        listsWrapper.createEl('h4', { text: 'Updated Today' });
        this.updatedListContainer = listsWrapper.createEl('div', { cls: 'daily-notes-list' });
        this.updatedListContainer.createEl('p', { text: 'Waiting for implementation...', cls: 'nav-folder-title-content' });
    }

    async onClose() {
        if (this.fcal) {
            this.fcal.destroy();
        }
    }

    /**
     * Renders the top header with title and refresh button.
     */
    private renderHeader(container: HTMLElement) {
        const headerEl = container.createEl('div', { cls: 'daily-notes-header' });
        headerEl.createEl('h4', { text: 'Daily Notes' });

        const refreshBtn = headerEl.createEl('button', { cls: 'clickable-icon' });
        setIcon(refreshBtn, 'refresh-cw');
        refreshBtn.setAttribute('aria-label', 'Refresh');
        refreshBtn.onclick = () => this.refresh();
    }

    /**
     * Initializes the Flatpickr calendar instance.
     */
    private initCalendar() {
        this.fcal = flatpickr(this.calendarContainer, {
            inline: true,
            defaultDate: this.currentDate,
            dateFormat: 'Y-m-d',
            monthSelectorType: 'static',
            // Важно: при смене даты обновляем состояние
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    this.currentDate = selectedDates[0];
                    console.log('Date changed to:', this.currentDate);
                    this.refresh();
                }
            }
        });
    }

    /**
     * Refreshes the lists based on the currently selected date.
     */
    private refresh() {
        // TODO: Connect this to the actual file logic
        console.log('Refreshing view for date:', this.currentDate);
    }
}
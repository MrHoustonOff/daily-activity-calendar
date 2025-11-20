import { App, PluginSettingTab, Setting, setIcon } from 'obsidian';
import DailyNotesPlugin from '../main';

export class DailyNotesSettingTab extends PluginSettingTab {
    plugin: DailyNotesPlugin;

    constructor(app: App, plugin: DailyNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Daily Notes Viewer Settings' });

        // --- Секция Палитры ---
        containerEl.createEl('h3', { text: 'Color Palette' });
        containerEl.createEl('p', { text: 'Define colors available in the right-click context menu.', cls: 'setting-item-description' });

        // Рендерим каждый цвет из настроек
        this.plugin.settings.palette.forEach((color, index) => {
            const div = containerEl.createEl('div', { cls: 'setting-item' });
            
            // Левая часть: Название (Color #N)
            const info = div.createEl('div', { cls: 'setting-item-info' });
            info.createEl('div', { text: `Color #${index + 1}`, cls: 'setting-item-name' });

            // Правая часть: Контролы
            const controls = div.createEl('div', { cls: 'setting-item-control' });

            // 1. Color Picker (Визуальный выбор)
            const colorInput = controls.createEl('input', { type: 'color' });
            colorInput.value = color;
            colorInput.onchange = async (e) => {
                const newValue = (e.target as HTMLInputElement).value;
                this.plugin.settings.palette[index] = newValue;
                textInput.value = newValue; // Обновляем текстовое поле
                await this.plugin.saveSettings();
            };

            // 2. Text Input (Hex код)
            const textInput = controls.createEl('input', { type: 'text' });
            textInput.value = color;
            textInput.style.width = '80px';
            textInput.style.marginLeft = '10px';
            textInput.onchange = async (e) => {
                const newValue = (e.target as HTMLInputElement).value;
                this.plugin.settings.palette[index] = newValue;
                colorInput.value = newValue; // Обновляем пипетку
                await this.plugin.saveSettings();
            };

            // 3. Кнопка Удалить
            const deleteBtn = controls.createEl('button', { cls: 'clickable-icon', attr: { 'aria-label': 'Remove color' } });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.color = 'var(--text-error)';
            deleteBtn.onclick = async () => {
                // Удаляем элемент из массива
                this.plugin.settings.palette.splice(index, 1);
                await this.plugin.saveSettings();
                // Перерисовываем настройки
                this.display();
            };
        });

        // Кнопка "Добавить цвет"
        new Setting(containerEl)
            .setName('Add New Color')
            .setDesc('Add a new color slot to the palette.')
            .addButton(button => button
                .setButtonText('Add Color')
                .setCta() // Делаем кнопку "Call To Action" (акцентной)
                .onClick(async () => {
                    this.plugin.settings.palette.push('#ffffff'); // Добавляем белый по умолчанию
                    await this.plugin.saveSettings();
                    this.display();
                }));
    }
}
import { App, PluginSettingTab, Setting, setIcon, Notice } from 'obsidian';
import DailyNotesPlugin, { DEFAULT_SETTINGS } from '../main'; // Импортируем дефолтные настройки

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

        this.plugin.settings.palette.forEach((color, index) => {
            const div = containerEl.createEl('div', { cls: 'setting-item' });
            
            const info = div.createEl('div', { cls: 'setting-item-info' });
            info.createEl('div', { text: `Color #${index + 1}`, cls: 'setting-item-name' });

            const controls = div.createEl('div', { cls: 'setting-item-control' });

            // Color Picker
            const colorInput = controls.createEl('input', { type: 'color' });
            colorInput.value = color;
            colorInput.onchange = async (e) => {
                const newValue = (e.target as HTMLInputElement).value;
                this.plugin.settings.palette[index] = newValue;
                textInput.value = newValue;
                await this.plugin.saveSettings();
            };

            // Text Input
            const textInput = controls.createEl('input', { type: 'text' });
            textInput.value = color;
            textInput.style.width = '80px';
            textInput.style.marginLeft = '10px';
            textInput.onchange = async (e) => {
                const newValue = (e.target as HTMLInputElement).value;
                this.plugin.settings.palette[index] = newValue;
                colorInput.value = newValue;
                await this.plugin.saveSettings();
            };

            // Delete Button
            const deleteBtn = controls.createEl('button', { cls: 'clickable-icon', attr: { 'aria-label': 'Remove color' } });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.color = 'var(--text-error)';
            deleteBtn.onclick = async () => {
                this.plugin.settings.palette.splice(index, 1);
                await this.plugin.saveSettings();
                this.display();
            };
        });

        // Кнопка "Добавить цвет"
        new Setting(containerEl)
            .setName('Add New Color')
            .setDesc('Add a new color slot to the palette.')
            .addButton(button => button
                .setButtonText('Add Color')
                .setCta()
                .onClick(async () => {
                    this.plugin.settings.palette.push('#ffffff');
                    await this.plugin.saveSettings();
                    this.display();
                }));

        containerEl.createEl('h3', { text: 'Danger Zone' });

        // Кнопка "Сбросить настройки"
        new Setting(containerEl)
            .setName('Reset Palette to Defaults')
            .setDesc('Restores the original color palette. This cannot be undone.')
            .addButton(button => button
                .setButtonText('Reset Palette')
                .setWarning() // Делает кнопку красной/предупреждающей
                .onClick(async () => {
                    // Копируем массив, чтобы не ссылаться на константу
                    this.plugin.settings.palette = [...DEFAULT_SETTINGS.palette];
                    await this.plugin.saveSettings();
                    this.display(); // Перерисовываем
                    new Notice('Color palette has been reset to defaults.');
                }));
    }
}
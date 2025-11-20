import { App, PluginSettingTab, Setting, setIcon, Notice } from 'obsidian';
import DailyNotesPlugin, { DEFAULT_SETTINGS } from '../main';
import { t } from '../i18n/locales';

/**
 * Represents the Settings Tab in Obsidian's configuration window.
 * Allows users to manage the Color Palette and Language preferences.
 */
export class DailyNotesSettingTab extends PluginSettingTab {
    plugin: DailyNotesPlugin;

    constructor(app: App, plugin: DailyNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    /**
     * Renders the settings UI.
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: t('settingsHeader') });

        // ============================================================
        // SECTION 1: Language Settings
        // ============================================================
        new Setting(containerEl)
            .setName(t('languageHeader'))
            .setDesc(t('languageDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('auto', t('langAuto'))
                .addOption('en', t('langEn'))
                .addOption('ru', t('langRu'))
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                    // Refresh display to show translated headers instantly
                    this.display();
                }));

        // ============================================================
        // SECTION 2: Color Palette Management
        // ============================================================
        containerEl.createEl('h3', { text: t('paletteHeader') });
        containerEl.createEl('p', { text: t('paletteDesc'), cls: 'setting-item-description' });

        // Render controls for each existing color
        this.plugin.settings.palette.forEach((color, index) => {
            const div = containerEl.createEl('div', { cls: 'setting-item' });
            
            const info = div.createEl('div', { cls: 'setting-item-info' });
            info.createEl('div', { text: `${t('colorPrefix')} #${index + 1}`, cls: 'setting-item-name' });

            const controls = div.createEl('div', { cls: 'setting-item-control' });

            // 1. Color Picker Input
            const colorInput = controls.createEl('input', { type: 'color' });
            colorInput.value = color;
            colorInput.onchange = async (e) => {
                const newValue = (e.target as HTMLInputElement).value;
                this.plugin.settings.palette[index] = newValue;
                textInput.value = newValue; // Sync text input
                await this.plugin.saveSettings();
            };

            // 2. Hex Text Input
            const textInput = controls.createEl('input', { type: 'text' });
            textInput.value = color;
            textInput.style.width = '80px';
            textInput.style.marginLeft = '10px';
            textInput.onchange = async (e) => {
                const newValue = (e.target as HTMLInputElement).value;
                this.plugin.settings.palette[index] = newValue;
                colorInput.value = newValue; // Sync color picker
                await this.plugin.saveSettings();
            };

            // 3. Delete Button
            const deleteBtn = controls.createEl('button', { cls: 'clickable-icon', attr: { 'aria-label': 'Remove color' } });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.color = 'var(--text-error)';
            deleteBtn.onclick = async () => {
                this.plugin.settings.palette.splice(index, 1);
                await this.plugin.saveSettings();
                this.display(); // Re-render list
            };
        });

        // Button: Add New Color
        new Setting(containerEl)
            .setName(t('addColor'))
            .setDesc(t('addColorDesc'))
            .addButton(button => button
                .setButtonText(t('btnAddColor'))
                .setCta()
                .onClick(async () => {
                    this.plugin.settings.palette.push('#ffffff');
                    await this.plugin.saveSettings();
                    this.display();
                }));

        // ============================================================
        // SECTION 3: Danger Zone (Reset)
        // ============================================================
        containerEl.createEl('h3', { text: t('dangerZone') });

        new Setting(containerEl)
            .setName(t('resetPalette'))
            .setDesc(t('resetPaletteDesc'))
            .addButton(button => button
                .setButtonText(t('btnReset'))
                .setWarning()
                .onClick(async () => {
                    // Reset to hardcoded defaults
                    this.plugin.settings.palette = [...DEFAULT_SETTINGS.palette];
                    await this.plugin.saveSettings();
                    this.display();
                    new Notice(t('noticeReset'));
                }));
    }
}
import { moment } from 'obsidian';

/**
 * English translation dictionary (Default).
 * Serves as the fallback for any missing keys in other languages.
 */
const en = {
    // Main View Headers & Tooltips
    viewHeader: 'Daily Activity',
    refreshTooltip: 'Refresh to today',
    createdToday: 'Created Today',
    updatedToday: 'Updated Today',
    noNotes: 'No notes found.',
    
    // Context Menu Items
    ctxColorLabel: 'Color Label',
    ctxResetColor: 'Reset Color',
    
    // Settings: Header & Palette Section
    settingsHeader: 'Daily Activity Settings',
    paletteHeader: 'Color Palette',
    paletteDesc: 'Define colors available in the right-click context menu.',
    colorPrefix: 'Color',
    addColor: 'Add New Color',
    addColorDesc: 'Add a new color slot to the palette.',
    btnAddColor: 'Add Color',
    
    // Settings: Danger Zone
    dangerZone: 'Danger Zone',
    resetPalette: 'Reset Palette to Defaults',
    resetPaletteDesc: 'Restores the original color palette. This cannot be undone.',
    btnReset: 'Reset Palette',
    noticeReset: 'Color palette has been reset to defaults.',

    // Ribbon Icon
    ribbonTooltip: 'Open Daily Notes',

    // Settings: Language Overrides
    languageHeader: 'Interface Language',
    languageDesc: 'Force the plugin to use a specific language regardless of Obsidian settings.',
    langAuto: 'Auto (Same as Obsidian)',
    langEn: 'English',
    langRu: 'Russian'
};

/**
 * Russian translation dictionary.
 */
const ru: typeof en = {
    viewHeader: 'Активность заметок',
    refreshTooltip: 'Вернуться к сегодня',
    createdToday: 'Создано сегодня',
    updatedToday: 'Изменено сегодня',
    noNotes: 'Заметок не найдено.',
    
    ctxColorLabel: 'Цветовая метка',
    ctxResetColor: 'Сбросить цвет',
    
    settingsHeader: 'Настройки Daily Activity Calendar',
    paletteHeader: 'Палитра цветов',
    paletteDesc: 'Настройте цвета, доступные в контекстном меню (ПКМ по заметке).',
    colorPrefix: 'Цвет',
    addColor: 'Добавить новый цвет',
    addColorDesc: 'Добавляет новый слот для цвета в палитру.',
    btnAddColor: 'Добавить',
    
    dangerZone: 'Опасная зона',
    resetPalette: 'Сбросить палитру',
    resetPaletteDesc: 'Восстанавливает цвета по умолчанию. Это действие нельзя отменить.',
    btnReset: 'Сбросить',
    noticeReset: 'Палитра цветов сброшена к настройкам по умолчанию.',

    ribbonTooltip: 'Открыть ежедневные заметки',

    languageHeader: 'Язык интерфейса',
    languageDesc: 'Принудительно установить язык плагина, игнорируя настройки Obsidian.',
    langAuto: 'Авто (Как в Obsidian)',
    langEn: 'English',
    langRu: 'Русский'
};

/**
 * Internal state to hold the user's preferred language setting.
 * Can be 'auto', 'en', or 'ru'.
 */
let currentMode = 'auto';

/**
 * Sets the active language mode for the plugin.
 * This should be called during plugin initialization and when settings change.
 * * @param mode - The language code ('auto', 'en', 'ru').
 */
export function setLanguageMode(mode: string) {
    currentMode = mode;
}

/**
 * Resolves the actual locale code to be used by components (like Flatpickr).
 * * @returns 'ru' if mode is Russian, otherwise 'en' (or whatever Moment.js uses if Auto).
 */
export function getEffectiveLocale(): string {
    if (currentMode === 'auto') {
        return moment.locale();
    }
    return currentMode;
}

/**
 * Translates a given key into the active language.
 * Falls back to English if the key is missing in the target language.
 * * @param key - The key from the translation dictionary.
 * @returns The translated string.
 */
export function t(key: keyof typeof en): string {
    const effectiveLocale = getEffectiveLocale();
    
    if (effectiveLocale === 'ru') {
        return ru[key];
    }
    
    // Default fallback to English
    return en[key];
}
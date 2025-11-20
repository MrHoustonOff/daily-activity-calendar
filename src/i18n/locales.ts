import { moment } from 'obsidian';

const en = {
    // View
    viewHeader: 'Daily Notes',
    refreshTooltip: 'Refresh to today',
    createdToday: 'Created Today',
    updatedToday: 'Updated Today',
    noNotes: 'No notes found.',
    
    // Context Menu
    ctxColorLabel: 'Color Label',
    ctxResetColor: 'Reset Color',
    
    // Settings - Palette
    settingsHeader: 'Daily Notes Viewer Settings',
    paletteHeader: 'Color Palette',
    paletteDesc: 'Define colors available in the right-click context menu.',
    colorPrefix: 'Color',
    addColor: 'Add New Color',
    addColorDesc: 'Add a new color slot to the palette.',
    btnAddColor: 'Add Color',
    
    // Settings - Danger Zone
    dangerZone: 'Danger Zone',
    resetPalette: 'Reset Palette to Defaults',
    resetPaletteDesc: 'Restores the original color palette. This cannot be undone.',
    btnReset: 'Reset Palette',
    noticeReset: 'Color palette has been reset to defaults.',

    // Ribbon
    ribbonTooltip: 'Open Daily Notes'
};

const ru: typeof en = {
    // View
    viewHeader: 'Ежедневные заметки',
    refreshTooltip: 'Вернуться к сегодня',
    createdToday: 'Создано сегодня',
    updatedToday: 'Изменено сегодня',
    noNotes: 'Заметок не найдено.',
    
    // Context Menu
    ctxColorLabel: 'Цветовая метка',
    ctxResetColor: 'Сбросить цвет',
    
    // Settings - Palette
    settingsHeader: 'Настройки Daily Notes Viewer',
    paletteHeader: 'Палитра цветов',
    paletteDesc: 'Настройте цвета, доступные в контекстном меню (ПКМ по заметке).',
    colorPrefix: 'Цвет',
    addColor: 'Добавить новый цвет',
    addColorDesc: 'Добавляет новый слот для цвета в палитру.',
    btnAddColor: 'Добавить',
    
    // Settings - Danger Zone
    dangerZone: 'Опасная зона',
    resetPalette: 'Сбросить палитру',
    resetPaletteDesc: 'Восстанавливает цвета по умолчанию. Это действие нельзя отменить.',
    btnReset: 'Сбросить',
    noticeReset: 'Палитра цветов сброшена к настройкам по умолчанию.',

    // Ribbon
    ribbonTooltip: 'Открыть ежедневные заметки'
};

export function t(key: keyof typeof en): string {
    const locale = moment.locale();
    
    if (locale === 'ru') {
        return ru[key];
    }
    
    return en[key];
}
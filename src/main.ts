import { Plugin } from 'obsidian';

export default class DailyNotesPlugin extends Plugin {
    async onload() {
        console.log('Daily Notes Viewer loaded');
    }
}
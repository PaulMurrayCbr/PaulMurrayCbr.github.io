import {App, AppState} from "./app.js";

export class Save {

    static SAVE_KEY = "torchbearer.save";

    constructor() {
        throw new Error("Static class");
    }

    /**
     * @type {void}
     * @param {App} app
     */
    static saveApp(app) {
        localStorage.setItem(Save.SAVE_KEY, JSON.stringify(app.toJson()));
    }

    /**
     * @type {AppSave|undefined}
     */
    static readSave() {
        const save = localStorage.getItem(Save.SAVE_KEY);
        if (save) {
            return JSON.parse(save);
        } else {
            return undefined;
        }
    }
}
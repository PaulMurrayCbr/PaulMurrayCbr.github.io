/* © Paul Murray 2026 https://github.com/PaulMurrayCbr/Torchbearer */

import {concat, delay, of, Subject, takeUntil} from "https://esm.sh/rxjs";
import {App} from "./app.js";

export class Toaster {
    destroy$ = new Subject();

    /**
     * @param {App} app
     * @param {HTMLElement} element
     */
    constructor(app, element) {
        this.app = app;
        this.element = element;
    }

    start() {

    }

    static FADEIN = "fadein";
    static FADEOUT = "fadeout";
    static REMOVE = "remove";

    /**
     *
     * @param {string} message
     */
    show(message) {
        /**
         * @type {HTMLElement}
         */
        let toastElement;

        concat(
            of(Toaster.FADEIN),
            of(Toaster.FADEOUT).pipe(delay(4000)),
            of(Toaster.REMOVE).pipe(delay(2000)),
        ).pipe(
            takeUntil(this.destroy$)
        ).subscribe((state) => {
            switch (state) {
                case Toaster.FADEIN:
                    const template = document.getElementById("toast-template");
                    const clone = template.content.cloneNode(true);
                    toastElement = clone.firstElementChild;
                    toastElement.textContent = message;
                    this.element.appendChild(toastElement);
                    // allow CSS transition to see the initial opacity
                    requestAnimationFrame(() => {
                        toastElement.classList.add("fadein");
                    });
                    break;
                case Toaster.FADEOUT:
                    toastElement.classList.remove("fadein");
                    toastElement.classList.add("fadeout");
                    break;
                case Toaster.REMOVE:
                    toastElement.remove()
                    break;
            }
        });
    }

}

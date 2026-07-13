/* © Paul Murray 2026 https://github.com/PaulMurrayCbr/Torchbearer */

import {BehaviorSubject, fromEvent, of, Subject, switchAll} from "https://esm.sh/rxjs";
import {Torch} from "./torch.js";
import {Toaster} from "./toaster.js";

export class AppState {

    static PAUSED = new AppState("PAUSED");
    static RUNNING = new AppState("RUNNING");

    /**
     * @param {string} name
     */
    constructor(name) {
        this.name = name;
    }

    isPaused() {
        return this === AppState.PAUSED;
    }

    isRunning() {
        return this === AppState.RUNNING;
    }

    toggle() {
        return this === AppState.PAUSED ? AppState.RUNNING : AppState.PAUSED;
    }

    toString() {
        return this.name;
    }

}

export class Illumination {
    /**
     * @param {boolean} dark
     * @param {number} percent
     */
    constructor(dark, percent) {
        this.dark = dark;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        this.percent = percent;
    }
}

export class App {
    /**
     * @type {[Torch]}
     */
    torches = [];

    selectedTorch$ = new BehaviorSubject(null);

    selectedIllumination$ = new BehaviorSubject(of(null));

    appState = AppState.RUNNING;
    appState$ = new BehaviorSubject(this.appState);
    illumination$ = new BehaviorSubject(new Illumination(true, 0));

    timePasses$ = new Subject();
    timeMark = new Date();

    timeMenuOpen = false

    /**
     * @param {HTMLElement} element
     */

    constructor(element) {
        this.element = element;
        this.toaster = new Toaster(this, document.getElementById("toaster"));
    }

    start() {
        fromEvent(this.element.querySelector("#pause"), "click")
            .subscribe(() => {
                this.markTime();
                this.appState = this.appState.toggle();

                if (this.appState.isPaused()) {
                    this.element.querySelector("#pause").classList.add("on");
                    this.element.querySelector("#paused").classList.remove("hidden");
                    this.selectedTorch$.next(null);
                    this.toaster.show("The passage of time has halted!");
                } else {
                    this.element.querySelector("#pause").classList.remove("on");
                    this.element.querySelector("#paused").classList.add("hidden");
                    this.toaster.show("The passage of time is resumed …");
                }

                this.appState$.next(this.appState);
            });
        fromEvent(this.element.querySelector("#addTorch"), "click")
            .subscribe(() => {
                this.addTorch();
            });
        fromEvent(this.element.querySelector("#close-panel"), "click")
            .subscribe(() => {
                this.selectTorch(null);
            });
        fromEvent(this.element.querySelector("#discard-torch"), "click")
            .subscribe(() => {
                if (this.selectedTorch$.getValue()) {
                    this.removeTorch(this.selectedTorch$.getValue());
                }
            });
        fromEvent(this.element.querySelector("#recharge-torch"), "click")
            .subscribe(() => {
                if (this.selectedTorch$.getValue()) {
                    this.selectedTorch$.getValue().recharge();
                }
            });

        fromEvent(this.element.querySelector("#time-passes"), "click")
            .subscribe(() => {
                this.timeMenuOpen = !this.timeMenuOpen;
                if (this.timeMenuOpen) {
                    this.element.querySelector("#time-passes").classList.add("on");
                    this.element.querySelector("#time-passes-container").classList.add("open");
                } else {
                    this.element.querySelector("#time-passes").classList.remove("on");
                    this.element.querySelector("#time-passes-container").classList.remove("open");
                }
            });

        this.element.querySelectorAll(".set-minutes").forEach(button => {
            fromEvent(button, "click").subscribe(() => {
                if (this.selectedTorch$.getValue()) {
                    const min = Number(button.dataset.min);
                    this.selectedTorch$.getValue().setMaxMinutes(min);
                    this.toaster.show("Torch set to " + min + " minute" + (min > 1 ? "s" : "") + "");
                }
            });
        });


        this.element.querySelectorAll(".minutes-pass").forEach(button => {
            fromEvent(button, "click").subscribe(() => {
                const min = Number(button.dataset.min);
                this.markTime();
                this.timePasses$.next(min);
                this.toaster.show(min + " minute" + (min > 1 ? "s" : "") + " pass" + (min > 1 ? "" : "es") + "…");
            });
        });

        this.checkTorchState();

        this.illumination$.subscribe(illumination => {
            if (illumination.dark) {
                this.element.querySelector("#darkness").classList.add("visible");
            } else {
                this.element.querySelector("#darkness").classList.remove("visible");
            }

            document.documentElement.style.setProperty(
                "--brightness",
                Math.trunc(20 + illumination.percent * .6).toString()
            );

        });

        this.selectedTorch$.subscribe(torch => {
            if (torch) {
                this.element.querySelector("#panel-container").classList.add("open");
                this.selectedIllumination$.next(torch.state$);
            } else {
                this.element.querySelector("#panel-container").classList.remove("open");
                this.selectedIllumination$.next(of(null));
            }
        })

        this.selectedIllumination$
            .pipe(
                switchAll()
            )
            .subscribe(illumination => {
                if (illumination) {
                    this.element.querySelector("#time-remaining").textContent = illumination.getTimeDisplay();
                } else {
                    // this almost never happens
                    this.element.querySelector("#time-remaining").textContent = "No selection";
                }
            })

        this.toaster.start();

        const timer = setInterval(() => {
            this.markTime();
        }, 10000);


    }

    addTorch() {
        const template = document.getElementById("torch-template");
        const clone = template.content.cloneNode(true);
        const element = clone.firstElementChild;
        document.getElementById("torches-grid").appendChild(element);
        const torch = new Torch(this, element);
        this.torches.push(torch);
        this.markTime();
        torch.start();

        // I'll just jam this subscription into the torch object
        torch.appSubscription = torch.state$.subscribe(state => {
            this.checkTorchState();
        })
    }

    /**
     * @param {Torch} torch
     */
    removeTorch(torch) {
        if (this.selectedTorch$.getValue() == torch) {
            this.selectedTorch$.next(null);
        }
        torch.appSubscription.unsubscribe();
        torch.stop();
        torch.element.remove();
        this.torches = this.torches.filter(t => t !== torch);
        this.checkTorchState();
    }

    /**
     * @param {Torch} torch
     */
    selectTorch(torch) {
        this.selectedTorch$.next(torch);
    }

    checkTorchState() {
        /** @type {TorchState[]} */
        const state = this.torches.map(torch => torch.state$.getValue());

        let dark = true;
        let remainingPercent = 0;
        for (const i of state) {
            if (i.ignited && i.remainingPercent > 0) {
                dark = false;
                remainingPercent = Math.max(remainingPercent, i.remainingPercent);
            }
        }

        this.illumination$.next(new Illumination(dark, remainingPercent));
    }

    markTime() {
        const now = new Date();
        if (this.appState.isRunning()) {
            const diff = now.getTime() - this.timeMark.getTime();
            this.timePasses$.next(diff / 1000 / 60); // minutes
        }
        this.timeMark = now;
    }
}
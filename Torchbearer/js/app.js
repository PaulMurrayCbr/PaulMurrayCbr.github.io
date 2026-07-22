/* © Paul Murray 2026 https://github.com/PaulMurrayCbr/Torchbearer */

// TODO duration mechanic - make it pro-rata
// TODO info panel
// TODO remove all spent and unlit torches?
// TODO leave panel open to stop sizing bouncing around. disable all buttons.
// TODO dont add torch until after resize is done. Pss the lambda into the resize methods as an 'oncomplete' parm.
// TODO package app.

import {
    BehaviorSubject,
    debounceTime,
    delay,
    filter,
    first,
    fromEvent,
    map,
    merge,
    Observable,
    of,
    Subject,
    switchAll,
    timer
} from "https://esm.sh/rxjs";
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

    timePassesTimeout$ = new Subject();

    timeMenuOpen = false

    static aspect = 331 / 980;

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
                /** @type {Torch} */
                const torch = this.selectedTorch$.getValue();
                if (torch) {
                    this.removeTorch(torch);
                }
            });
        fromEvent(this.element.querySelector("#recharge-torch"), "click")
            .subscribe(() => {
                /** @type {Torch} */
                const torch = this.selectedTorch$.getValue();
                if (torch) {
                    torch.recharge();
                }
            });

        fromEvent(this.element.querySelector("#ignite-torch"), "click")
            .subscribe(() => {
                /** @type {Torch} */
                const torch = this.selectedTorch$.getValue();
                if (torch && !torch.ignited && torch.minutesRemaining > 0) {
                    torch.ignite();
                    this.toaster.show("You may also double or long tap a torch to ignite or extinguish it.");
                }
            });

        fromEvent(this.element.querySelector("#extinguish-torch"), "click")
            .subscribe(() => {
                /** @type {Torch} */
                const torch = this.selectedTorch$.getValue();
                if (torch && torch.ignited) {
                    torch.extinguish();
                    this.toaster.show("You may also double or long tap a torch to ignite or extinguish it.");
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
                this.timePassesTimeout$.next('MENU');
            });

        this.element.querySelectorAll(".set-minutes").forEach(button => {
            fromEvent(button, "click").subscribe(() => {
                if (this.selectedTorch$.getValue()) {
                    const min = Number(button.dataset.min);
                    this.selectedTorch$.getValue().setMaxMinutes(min);
                }
            });
        });

        this.timePassesTimeout$.pipe(
            map(z => z === 'BUTTON' ? of(z).pipe(delay(3000)) : of(z)),
            switchAll(),
            filter(z => z === 'BUTTON'),
        ).subscribe(
            () => {
                if (this.timeMenuOpen) {
                    this.timeMenuOpen = false;
                    this.element.querySelector("#time-passes").classList.remove("on");
                    this.element.querySelector("#time-passes-container").classList.remove("open");
                }
            }
        )


        this.element.querySelectorAll(".minutes-pass").forEach(button => {
            fromEvent(button, "click").subscribe(() => {
                const min = Number(button.dataset.min);
                this.markTime();
                this.timePasses$.next(min);
                this.toaster.show(min + " minute" + (min > 1 ? "s" : "") + " pass" + (min > 1 ? "" : "es") + "…");
                this.timePassesTimeout$.next('BUTTON');
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
            .subscribe(
                /** @param {TorchState} illumination */
                illumination => {
                    if (illumination) {
                        this.element.querySelector("#time-remaining").textContent = illumination.getTimeDisplay();

                        if (illumination.ignited) {
                            this.element.querySelector("#ignite-torch").classList.add("disabled");
                            this.element.querySelector("#extinguish-torch").classList.remove("disabled");
                        } else if (illumination.minutesRemaining <= 0) {
                            this.element.querySelector("#ignite-torch").classList.add("disabled");
                            this.element.querySelector("#extinguish-torch").classList.add("disabled");
                        } else {
                            this.element.querySelector("#ignite-torch").classList.remove("disabled");
                            this.element.querySelector("#extinguish-torch").classList.add("disabled");
                        }

                        this.element.querySelector("#recharge-torch").classList.remove("disabled");
                        this.element.querySelector("#discard-torch").classList.remove("disabled");


                    } else {
                        // this almost never happens
                        this.element.querySelector("#time-remaining").textContent = "No selection";

                        this.element.querySelector("#ignite-torch").classList.add("disabled");
                        this.element.querySelector("#extinguish-torch").classList.add("disabled");
                        this.element.querySelector("#recharge-torch").classList.add("disabled");
                        this.element.querySelector("#discard-torch").classList.add("disabled");

                    }
                })

        this.toaster.start();

        const timer = setInterval(() => {
            this.markTime();
        }, 10000);

        this.handleSplash();

        const resizePipe$ = new Observable(subscriber => {
            const observer = new ResizeObserver(elements => {
                subscriber.next(elements);
            });
            observer.observe(document.getElementById("torches-grid"));
            observer.observe(document.getElementById("torches-sizing-grid"));
            return () => observer.disconnect();
        });

        resizePipe$.pipe(
            debounceTime(100)
        ).subscribe(() => this.doTorchResizing());
    }

    addTorch() {
        const template = document.getElementById("torch-template");
        const clone = template.content.cloneNode(true);
        const element = clone.firstElementChild;
        document.getElementById("torches-grid").appendChild(element);

        const sizingClone = template.content.cloneNode(true);
        const sizingElement = sizingClone.firstElementChild;
        document.getElementById("torches-sizing-grid").appendChild(sizingElement);

        element.style.setProperty("display", 'none');

        const torch = new Torch(this, element);

        torch.sizingElement = sizingElement; // this is my own business

        this.torches.push(torch);
        this.doTorchResizing(() => element.style.setProperty("display", 'inline-block'));

        this.markTime();
        torch.start();
        document.getElementById("start-hint").classList.add("hidden");
        document.getElementById("help").classList.remove("hidden");

        // I'll just jam this subscription into the torch object
        torch.appSubscription = torch.state$.subscribe(
            /** @param {TorchState} state */
            state => {
                if (state.ignited) {
                    // remove this, b/c the user now knows they can select a torch
                    document.getElementById("help").classList.add("hidden");
                }


                this.checkTorchState();
            })

    }

    /**
     * @param {Torch} torch
     */
    removeTorch(torch) {
        if (this.selectedTorch$.getValue() === torch) {
            this.selectedTorch$.next(null);
        }
        torch.appSubscription.unsubscribe();
        torch.stop();
        torch.element.remove();
        torch.sizingElement.remove();

        this.torches = this.torches.filter(t => t !== torch);
        this.doTorchResizing();

        if (this.torches.length === 0) {
            document.getElementById("start-hint").classList.remove("hidden");
            document.getElementById("help").classList.add("hidden");
        }

        this.checkTorchState();
    }

    /**
     * @param {Torch} torch
     */
    selectTorch(torch) {
        // remove this, b/c the user now knows they can select a torch
        document.getElementById("help").classList.add("hidden");
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

    handleSplash() {

        /** @type {HTMLImageElement} */
        const splash = document.getElementById("splash");
        /** @type {HTMLDivElement} */
        const splashFade = document.getElementById("splash-fade");
        /** @type {HTMLDivElement} */
        const splashContainer = document.getElementById("splash-container");

        const container = splashContainer.getBoundingClientRect();

        const subscription = merge(
            fromEvent(splash, "load"),
            fromEvent(splash, "error")
        )
            .pipe(
                first()
            )
            .subscribe(event => {
                if (event.type === "load" && splash.naturalWidth > 0 && splash.naturalHeight > 0) {

                    const fitx = container.width / splash.naturalWidth;
                    const fity = container.height / splash.naturalHeight;

                    const imageAspect = Math.min(fitx, fity);

                    splash.width = splash.naturalWidth * imageAspect;
                    splash.height = splash.naturalHeight * imageAspect;
                }

                subscription.unsubscribe();

                timer(500).subscribe(() => {
                    splash.style.setProperty("opacity", "0");
                    const sub = fromEvent(splash, "transitionend").subscribe(event => {
                        sub.unsubscribe();
                        splashContainer.style.setProperty("display", "none");
                        splashContainer.remove();
                    });
                });

                timer(1500).subscribe(() => {
                    splashFade.style.setProperty("opacity", "0");
                    const sub2 = fromEvent(splashFade, "transitionend").subscribe(event => {
                        sub2.unsubscribe();
                        splashFade.style.setProperty("display", "none");
                        splashFade.remove();
                    });
                });
            })

        splash.src = "images/splash.png";


    }

    doTorchResizing(onComplete) {
        if (this.torches.length === 0) {
            onComplete && onComplete();
            return;
        }

        document.documentElement.style.setProperty(
            "--torch-sizing-height", '1rem'
        );
        document.documentElement.style.setProperty(
            "--torch-sizing-width", App.aspect + 'rem'
        );

        requestAnimationFrame(() => {
            this.resizedUpTo(1, 1, 0, onComplete)
        });
    }

    resizedUpTo(lastGoodHeight, newHeight, steps, onComplete) {
        // kill this method if it loops too long
        if (steps > 100) {
            this.setTorchSizing(lastGoodHeight, true);
            onComplete && onComplete();
            return;
        }

        const overflowing = this.isOverflowing();

        if (overflowing) {
            this.resizedInTo(lastGoodHeight, newHeight, newHeight, steps, onComplete);
        } else {
            const nextHeight = newHeight * 1.616;
            this.setTorchSizing(nextHeight);

            requestAnimationFrame(() => {
                this.resizedUpTo(newHeight, nextHeight, steps + 1, onComplete);
            });
        }
    }

    resizedInTo(lastGoodHeight, lastTooBig, newHeight, steps, onComplete) {
        // kill this method if it loops too long
        if (steps > 100 || (lastTooBig - lastGoodHeight) < .25) {
            this.setTorchSizing(lastGoodHeight, true);

            onComplete && onComplete();
            return;
        }

        let nextHeight;
        if (this.isOverflowing()) {
            nextHeight = (lastGoodHeight + newHeight) / 2;
            this.setTorchSizing(nextHeight);

            requestAnimationFrame(() => {
                this.resizedInTo(lastGoodHeight, newHeight, nextHeight, steps + 1, onComplete);
            });
        } else {
            nextHeight = (newHeight + lastTooBig) / 2;
            this.setTorchSizing(nextHeight);

            requestAnimationFrame(() => {
                this.resizedInTo(newHeight, lastTooBig, nextHeight, steps + 1, onComplete);
            });
        }

    }

    /**
     *
     * @param nextHeight {number} height in rem. Width is calculated from aspect ratio.
     * @param finalSize {boolean} if true, set the final size of the torch in the "real" window.
     */
    setTorchSizing(nextHeight, finalSize = false) {
        const style = document.documentElement.style;
        style.setProperty("--torch-sizing-height", nextHeight + 'rem');
        style.setProperty("--torch-sizing-width", (nextHeight * App.aspect) + 'rem');
        if (finalSize) {
            style.setProperty("--torch-height", nextHeight + 'rem');
            style.setProperty("--torch-width", (nextHeight * App.aspect) + 'rem');
        }

    }

    isOverflowing() {
        const grid = document.getElementById("torches-sizing-grid");

        let right = 0;
        let bottom = 0;

        for (const torch of grid.children) {
            const r = torch.getBoundingClientRect();
            right = Math.max(r.right, right);
            bottom = Math.max(r.bottom, bottom);
        }

        return right >= grid.getBoundingClientRect().right ||
            bottom >= grid.getBoundingClientRect().bottom;
    }
}
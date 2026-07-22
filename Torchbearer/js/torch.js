/* © Paul Murray 2026 https://github.com/PaulMurrayCbr/Torchbearer */

const {BehaviorSubject, Subject, takeUntil} = rxjs;

import {App} from "./app.js";
import {clickListener$, LONG} from "./clicklistener.js";

export class TorchState {
    constructor(ignited, maxMinutes, minutesRemaining) {
        this.maxMinutes = maxMinutes;
        this.minutesRemaining = minutesRemaining;
        this.ignited = ignited;
        this.remainingPercent = this.minutesRemaining / this.maxMinutes * 100;
    }

    static blockMinutes = 5;

    getTimeDisplay() {
        if (this.minutesRemaining <= 0) {
            return `Torch spent. Recharge for ${this.maxMinutes} minute${this.maxMinutes > 1 ? 's' : ''}`;
        }

        if (this.minutesRemaining > this.maxMinutes) {
            return `Torch overcharged. Recharge to reset to ${this.maxMinutes} minute${this.maxMinutes > 1 ? 's' : ''}.`;
        }

        const blocks = this.getRemainingBlocks();

        if (blocks <= 0) {
            return `${this.maxMinutes} minute${this.maxMinutes > 1 ? 's' : ''} almost done`;
        }

        return `About ${blocks * TorchState.blockMinutes} minutes remaining of ${this.maxMinutes}`;
    }

    getRemainingBlocks() {
        return Math.floor(this.minutesRemaining / TorchState.blockMinutes + .5);
    }
}

export class Torch {

    destroy$ = new Subject();

    ignited = false;
    maxMinutes = 60;
    minutesRemaining = this.maxMinutes;

    state = new TorchState(this.ignited, this.maxMinutes, this.minutesRemaining);
    state$ = new BehaviorSubject(this.state);

    /**
     * @param {App} app
     * @param {HTMLElement} element
     */
    constructor(app, element) {
        this.app = app;
        this.element = element;

        this.torch0 = element.querySelector(".torch0");
        this.torch1 = element.querySelector(".torch1");
        this.torch2 = element.querySelector(".torch2");
        this.torch3 = element.querySelector(".torch3");
    }

    emitState() {
        this.state = new TorchState(this.ignited, this.maxMinutes, this.minutesRemaining);
        this.state$.next(this.state);
    }

    start() {
        clickListener$(this.element)
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe(clicks => {
                    if (clicks.length > 1 || clicks[0] === LONG) {
                        if (this.ignited) {
                            this.extinguish();
                        } else {
                            if (this.minutesRemaining <= 0) {
                                this.app.toaster.show("This torch is spent and cannot be re-lit.");
                            } else {
                                this.ignite();
                            }
                        }
                    } else {
                        if (this.app.selectedTorch$.getValue() !== this) {
                            this.app.selectTorch(this);
                        } else {
                            this.app.selectTorch(null);
                        }
                    }
                }
            )

        this.app.selectedTorch$
            .pipe(
                takeUntil(this.destroy$)
            )
            .subscribe(selected => {
                if (selected === this) {
                    this.element.classList.add("selected");
                } else {
                    this.element.classList.remove("selected");
                }
            });

        this.app.timePasses$.pipe(takeUntil(this.destroy$)).subscribe(minutes => {
            if (this.ignited) {
                this.minutesRemaining -= minutes;

                if (this.minutesRemaining <= 0) {
                    this.ignited = false;
                    this.minutesRemaining = 0;
                }

                this.update();
            }
        });

        this.update();
    }

    stop() {
        this.state$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    ignite() {
        this.ignited = true;
        this.update();
        this.app.toaster.show(this.state.getTimeDisplay());

    }

    extinguish() {
        this.ignited = false;
        this.update();
    }

    recharge() {
        this.app.toaster.show("Torch recharged.");
        if (this.minutesRemaining <= this.maxMinutes && this.state.getRemainingBlocks() > 0) {
            this.app.toaster.show("You have wasted about " + (this.state.getRemainingBlocks() * TorchState.blockMinutes) + " minutes worth of oil.");
        }
        this.minutesRemaining = this.maxMinutes;
        this.update();
    }

    setMaxMinutes(minutes) {
        this.minutesRemaining *= minutes / this.maxMinutes;
        this.maxMinutes = minutes;
        this.update();
//        this.app.toaster.show("Torch set to " + minutes + " minute" + (minutes > 1 ? "s" : "") + "");
    }

    update() {
        this.recheckOpacity();
        this.emitState()
    }

    recheckOpacity() {
        const remainingPercent = (this.minutesRemaining / this.maxMinutes) * 100;

        if (this.ignited && remainingPercent > 0) {
            this.torch0.style.opacity = 0;
            this.torch1.style.opacity = 0;
            this.torch2.style.opacity = 0;
            this.torch3.style.opacity = 0;

            if (remainingPercent > 50) {
                this.torch2.style.opacity = 1;
                this.torch3.style.opacity = (remainingPercent - 50) / 50;
            } else if (remainingPercent > 25) {
                this.torch1.style.opacity = 1;
                this.torch2.style.opacity = (remainingPercent - 25) / 25;
            } else {
                this.torch0.style.opacity = 1;
                this.torch1.style.opacity = remainingPercent / 25;
            }
        } else {
            this.torch0.style.opacity = 1;
            this.torch1.style.opacity = 0;
            this.torch2.style.opacity = 0;
            this.torch3.style.opacity = 0;
        }

    }


}
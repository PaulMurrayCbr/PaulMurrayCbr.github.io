/* © Paul Murray 2026 https://github.com/PaulMurrayCbr/Torchbearer */

import {BehaviorSubject, bufferWhen, fromEvent, Subject, switchAll, takeUntil, tap, timer} from "https://esm.sh/rxjs";

import {App} from "./app.js";

export class TorchState {
    constructor(ignited, maxMinutes, minutesRemaining) {
        this.maxMinutes = maxMinutes;
        this.minutesRemaining = minutesRemaining;
        this.ignited = ignited;
        this.remainingPercent = this.minutesRemaining / this.maxMinutes * 100;
    }

    getTimeDisplay() {
        if (this.minutesRemaining <= 0) {
            return `Torch consumed. Recharge for ${this.maxMinutes} minute${this.maxMinutes > 1 ? 's' : ''}`;
        }

        const blocks = Math.floor((this.minutesRemaining + 2.5) / 5);

        if (blocks <= 0) {
            return `${this.maxMinutes} minute${this.maxMinutes > 1 ? 's' : ''} almost done`;
        }

        return `About ${blocks * 5} minutes remaining of ${this.maxMinutes}`;
    }
}

export class Torch {

    destroy$ = new Subject();

    ignited = false;
    maxMinutes = 1;
    minutesRemaining = 1;

    state$ = new BehaviorSubject(new TorchState(this.ignited, this.maxMinutes, this.minutesRemaining));

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
        this.state$.next(new TorchState(this.ignited, this.maxMinutes, this.minutesRemaining));
    }

    start() {

        const multiclick$ = new Subject();

        fromEvent(this.element, "click")
            .pipe(
                takeUntil(this.destroy$),
                tap(() => multiclick$.next(timer(300))),
                bufferWhen(() => multiclick$.pipe(switchAll())),
            )
            .subscribe(
                /** @param {MouseEvent[]} clicks */
                (clicks) => {
                    if (clicks.length === 1) {
                        this.ignited = !this.ignited;
                        this.update();
                    } else {
                        if (this.app.selectedTorch$.getValue() !== this) {
                            this.app.selectTorch(this);
                        } else {
                            this.app.selectTorch(null);
                        }
                    }
                })

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

    recharge() {
        this.minutesRemaining = this.maxMinutes;
        this.update();
    }

    setMaxMinutes(minutes) {
        this.maxMinutes = minutes;
        this.update();
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
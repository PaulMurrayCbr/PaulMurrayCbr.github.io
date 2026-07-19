/* © Paul Murray 2026 https://github.com/PaulMurrayCbr/Torchbearer */

import {
    buffer,
    debounceTime,
    delay,
    filter,
    finalize,
    fromEvent,
    map,
    merge,
    of,
    Subject,
    Subscription,
    switchAll,
    takeUntil
} from "https://esm.sh/rxjs";

export const SHORT = 'SHORT', LONG = 'LONG';
const START = 'START', CANCEL = 'CANCEL';

export function clickListener$(element) {
    const finalizeMe$ = new Subject();

    const click$ = new Subject();

    let isDown = false;
    const down$ = fromEvent(element, "pointerdown").pipe(takeUntil(finalizeMe$));
    const up$ = fromEvent(element, "pointerup").pipe(takeUntil(finalizeMe$));

    /** @type {Subscription[]} */

    fromEvent(element, "click")
        .pipe(takeUntil(finalizeMe$))
        .subscribe(event => event.cancelable && event.preventDefault());

    const cancel$ = merge(
        fromEvent(element, "pointerleave"),
        fromEvent(element, "pointerout"),
        fromEvent(element, "pointercancel"),
        fromEvent(window, "blur"),
        fromEvent(document, "visibilitychange")
            .pipe(filter(() => document.hidden))
    ).pipe(
        takeUntil(finalizeMe$)
    );

    const startLongClick$ = new Subject();
    const endLongClick$ = startLongClick$.pipe(
        map(eventType =>
            (eventType === START) ?
                of(eventType).pipe(delay(600))
                :
                of(eventType)
        ), // long click interval
        switchAll(),
        filter(eventType => eventType === START),
        takeUntil(finalizeMe$),
    );

    down$.subscribe(event => {
        event.cancelable && event.preventDefault();
        isDown = true;
        startLongClick$.next(START);
    });

    cancel$.subscribe(() => {
        startLongClick$.next(CANCEL);
        isDown = false;
    });

    up$.subscribe(event => {
        event.cancelable && event.preventDefault();
        if (isDown) {
            click$.next(SHORT);
        }
        startLongClick$.next(CANCEL);
        isDown = false;
    });

    endLongClick$.subscribe(() => {
        if (isDown) {
            click$.next(LONG);
        }
        startLongClick$.next(CANCEL);
        isDown = false;
    });

    return click$.pipe(
        buffer(
            click$.pipe(
                debounceTime(250)
            )
        ),
        finalize(() => {
            finalizeMe$.next();
        })
    );

}
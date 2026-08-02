/* © Paul Murray 2026 https://github.com/PaulMurrayCbr/Torchbearer */

export class Sound {

    static torchOnSound;
    static torchOffSound;
    static bellSound;

    constructor() {
        throw new Error("Static class");
    }

    static loadSounds() {
        try {
            Sound.torchOnSound = new Audio("media/ignite.ogg");
            Sound.torchOnSound.preload = "auto";
        } catch (e) {
            console.error(e);
        }

        try {
            Sound.torchOffSound = new Audio("media/extinguish.ogg");
            Sound.torchOffSound.preload = "auto";
        } catch (e) {
            console.error(e);
        }

        try {
            Sound.bellSound = new Audio("media/darkness.ogg");
            Sound.bellSound.preload = "auto";
        } catch (e) {
            console.error(e);
        }
    }

    static ignite() {
        try {
            Sound.torchOnSound.currentTime = 0;
            Sound.torchOnSound.play();
        } catch (e) {
            console.error(e);
        }
    }

    static extinguish() {
        try {
            Sound.torchOffSound.currentTime = 0;
            Sound.torchOffSound.play();
        } catch (e) {
            console.error(e);
        }
    }

    static alarm() {
        try {
            Sound.bellSound.currentTime = 0;
            Sound.bellSound.play();
        } catch (e) {
            console.error(e);
        }
    }
}
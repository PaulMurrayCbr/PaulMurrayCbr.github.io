/**
 * This file contains code that deals with the selection of which game we are playing:
 * lewdle, nyt wordle, hard mode yes/no, etc.
 *
 * Code interested in such things should subscribe to 
 * 		GameChange.$gameChange: Observable<GameChange> 
 */

class Games {
	static none = Symbol('none');
	static l5 = Symbol('Lewdle 5');
	static l6 = Symbol('Lewdle 6');
	static nyt = Symbol('NYT');
}

class Guesses {
	static none = Symbol('none');
	static l5 = Symbol('Lewdle 5');
	static l6 = Symbol('Lewdle 6');
	static l56 = Symbol('Lewdle 6 and 5');
	static nytC = Symbol('NYT Common Words');
	static nytA = Symbol('NYT All Words');
}

class GameChange {
	static $gameChange = new rxjs.Subject();

	static #pushGameChange = new rxjs.Subject();

	static #validCombos = {
		[Games.none]: { [Guesses.none]: true },
		[Games.l5]: { [Guesses.none]: true, [Guesses.l5]: true },
		[Games.l6]: { [Guesses.none]: true, [Guesses.l6]: true, [Guesses.l56]: true },
		[Games.nyt]: { [Guesses.none]: true, [Guesses.nytC]: true, [Guesses.nytA]: true }
	};

	static {
		let startgame = new GameChange(null, Games.none, Guesses.none, false);
		startgame.prev = startgame; // an inital loop

		GameChange.#pushGameChange.pipe(
			rxjs.scan((prev, next) => {
				// we could leave this to create a memento chain, but 
				// there's no 'back' functionality, so why leave 
				// things laying about?
				prev.prev = null;
				// but we want to tie the new one to the old one so that 'whatschanged?' works
				// we could use a new valueobject, but there's no need
				next.prev = prev;
				return next;
			}, startgame)
		).subscribe(GameChange.$gameChange);
	}

	static set(game, guesses, hardmode) {

		// enforce valid combinations. Should never happen if the UI is behavng itself.

		if (!GameChange.#validCombos[game]) {
			game = Games.none;
			guesses = Guesses.none;
			console.log(game.toString() + " is not a valid game");
		}
		else if (!GameChange.#validCombos[game][guesses]) {
			guesses = Guesses.none;
			console.log(guesses.toString() + " is not a valid guess selection for " + game.toString());
		}

		GameChange.#pushGameChange.next(new GameChange(null, game, guesses, hardmode));
	}

	/////// Instance variables and methods 

	prev;
	game;
	guesses;
	hardmode;

	constructor(prev, game, guesses, hardmode) {
		this.prev = prev;
		this.game = game;
		this.guesses = guesses;
		this.hardmode = hardmode;
	}

	targetsChanged() { return this.game !== this.prev.game; }

	guessesChanged() {
		return this.guesses !== this.prev.guesses
			|| this.hardmode !== this.prev.hardmode;
	}

	toString() {
		return 'GameChange '
			+ this.prev
			+ " -> "
			+ this.game.toString() + '/' + this.guesses.toString() + '/' + this.hardmode;
	}
}

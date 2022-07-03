/**
 * 
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
	static #currentgame = new GameChange(
		Games.none,
		Guesses.none,
		false,
		Games.none,
		Guesses.none,
		false);

	static $gameChange = new rxjs.Subject(GameChange.#currentgame);

	static #validCombos = {
		[Games.none]: { [Guesses.none]: true },
		[Games.l5]: { [Guesses.none]: true, [Guesses.l5]: true },
		[Games.l6]: { [Guesses.none]: true, [Guesses.l6]: true, [Guesses.l56]: true },
		[Games.nyt]: { [Guesses.none]: true, [Guesses.nytC]: true, [Guesses.nytA]: true }
	};

	prevgame;
	prevguesses;
	prevhardmode;
	game;
	guesses;
	hardmode;

	constructor(prevgame, prevguesses, prevhardmode, game, guesses, hardmode) {
		this.prevgame = prevgame;
		this.prevguesses = prevguesses;
		this.prevhardmode = prevhardmode;
		this.game = game;
		this.guesses = guesses;
		this.hardmode = hardmode;
	}

	static set(game, guesses, hardmode) {

		// enforce valid combinations

		if (!GameChange.#validCombos[game]) {
			game = Games.none;
			guesses = Guesses.none;
			console.log(game.toString() + " is not a valid game");
		}
		else if (!GameChange.#validCombos[game][guesses]) {
			guesses = Guesses.none;
			console.log(guesses.toString() + " is not a valid guess selection for " + game.toString());
		}

		GameChange.#currentgame = new GameChange(
			this.#currentgame.game,
			this.#currentgame.guesses,
			this.#currentgame.hardmode,
			game,
			guesses,
			hardmode
		);

		GameChange.$gameChange.next(GameChange.#currentgame)
	}

	targetsChanged() { return this.game !== this.prevgame; }

	guessesChanged() {
		return this.guesses !== this.prevguesses
			|| this.hardmode !== this.prevhardmode;
	}

	toString() {
		return 'GameChange '
			+ this.prevgame.toString() + '/' + this.prevguesses.toString() + '/' + this.prevhardmode
			+ " -> "
			+ this.game.toString() + '/' + this.guesses.toString() + '/' + this.hardmode;
	}
}


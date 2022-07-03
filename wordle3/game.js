/**
 * This file contains code that actually know how to play wordle.
 * the word list javascript and wordle.js need to be loaded before this file.
 *
 */

/**
 * This class has lists of words and can count the number of each letter in a word.
 */
class Words {
	static guessList = {
		[Guesses.none]: new Set(),
		[Guesses.l5]: new Set(),
		[Guesses.l6]: new Set(),
		[Guesses.l56]: new Set(),
		[Guesses.nytC]: new Set(),
		[Guesses.nytA]: new Set()
	};

	static targetList = {
		[Games.none]: Words.guessList[Guesses.none],
		[Games.l5]: Words.guessList[Guesses.l5],
		[Games.l6]: Words.guessList[Guesses.l6],
		[Games.nyt]: Words.guessList[Guesses.nytC]
	}


	static az = [];
	static isletter = {};

	static done = false;

	static initAll() {
		if (Words.done) throw "done??";
		Words.done = true;

		for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
			Words.az.push(String.fromCharCode(i));
			Words.isletter[String.fromCharCode(i)] = true;
		}

		// not 100% sure what's going on with the lewdle word lists. I'll just
		// put them all in. Even if they are not on the game list, they are all
		// pretty lewd, and the gui gives options if the first one is not valid.

		const lood = (w) => {
			const ww = w.toUpperCase().trim();
			if (ww.length === 6 || ww.length === 5) {
				Words.guessList[Guesses.l56].add(ww);
			}
			if (ww.length === 6) {
				Words.guessList[Guesses.l6].add(ww);
			}
			if (ww.length === 5) {
				Words.guessList[Guesses.l5].add(ww);
			}

		};

		for (const w of lewd5Words) {
			lood(w);
		}
		for (const w of lewd6Words) {
			lood(w);
		}

		// the NYT words are a bit better behaved

		for (const w of nytCommonWords) {
			const ww = w.toUpperCase().trim();
			Words.guessList[Guesses.nytC].add(ww);
			Words.guessList[Guesses.nytA].add(ww);
		}

		for (const w of nytUncommonWords) {
			const ww = w.toUpperCase().trim();
			Words.guessList[Guesses.nytA].add(ww);
		}
	}

	static #letterCount = new Map();

	static countOf(s) {
		if (!s) return {};
		s = s.toUpperCase();
		if (!Words.#letterCount.has(s)) {
			let ct = {};
			for (let ch of s) {
				if (Words.isletter[ch]) {
					if (ct[ch]) ct[ch]++; else ct[ch] = 1;
				}
			}
			Words.#letterCount.set(s, ct);
		}
		return Words.#letterCount.get(s);
	}
}

Words.initAll();

/** 
 * This class watches the current dictionary selection and has a method for the gui to call so that the gui
 * can announce that the user has entered some stuff into the wordle grid. When either of these things change,
 * it compiles a new list of possible matching words and announces it on $targets .
 */

class PossibleTargets {
	static $targets = new rxjs.Subject();

	static #currentGrid = [];
	static #currentGame;

	static {
		GameChange.$gameChange.subscribe(g => {
			if (g.targetsChanged()) {
				PossibleTargets.#currentGame = g;
				PossibleTargets.#process();
			}
		});
	}

	/**
	 * @param grid array of GridItem
	 */
	static newGrid(grid) {
		try {
			if (grid.length !== PossibleTargets.#currentGrid.length) throw 'len';
			for (i in grid) {
				if (grid[i].guess !== PossibleTargets.#currentGrid[i].guess) throw 'guess';
				if (grid[i].result !== PossibleTargets.#currentGrid[i].result) throw 'rslt';
			}
			return;
		} catch (e) { }

		PossibleTargets.#currentGrid = grid;
		PossibleTargets.#process();

	}

	static #process() {
		// clear targets and notify everyone to stop processing
		PossibleTargets.$targets.next(null);

		const targets = Words.targetList[PossibleTargets.#currentGame.game];

		OutputGui.targetListClear();

		let f = new Filter();
		for (const g of PossibleTargets.#currentGrid) {
			f = f.intersection(Filter.fromGridItem(g))
		}

		rxjs.from(asyncof(targets, 100)).pipe(
			rxjs.tap(OutputGui.targetListStatus),
			rxjs.filter(v => f.permits(v)),
			rxjs.tap(OutputGui.targetListItem),
			rxjs.reduce(
				(acc, val) => {
					acc.push(val);
					OutputGui.targetListBitsRequired(Math.log2(acc.length))
					return acc;
				},
				[]
			),
			rxjs.takeUntil(PossibleTargets.$targets),
			rxjs.finalize(() => OutputGui.targetListStatus(''))
		).subscribe(v => PossibleTargets.$targets.next(v));

	}
}

class GridItem {
	guess;
	result;

	constructor(guess, result) {
		this.guess = GridItem.cleanGuess(guess);
		this.result = GridItem.cleanResult(result);
	}

	static cleanGuess(s) {
		if (!s) return '';
		let ss = '';

		for (let ch of s.toUpperCase()) {
			if (Words.isletter[ch]) ss += ch; else ss += ' ';
		}
		return ss;
	}

	static cleanResult(s) {
		if (!s) return '';
		let ss = '';

		for (let ch of s.toUpperCase()) {
			if (ch === 'G' || ch === 'Y' || ch == '-') ss += ch; else ss += ' ';

		}
		return ss;
	}

}

class Filter {
	mustBe = [];
	cantBe = [];
	atLeast = {};
	noMoreThan = {};

	constructor() {
		for (const i of Words.az) {
			this.atLeast[i] = 0;
			this.noMoreThan[i] = 100;
		}
	}

	static fromGridItem(g) {
		return Filter.fromGuess(g.guess, g.result);
	}

	static fromGuess(guess, pattern) {
		const f = new Filter();

		for (let i = 0; i < guess.length; i++) {
			const p = pattern.charAt(i);
			const g = guess.charAt(i);

			if (p === 'G') {
				f.mustBe[i] = g;
				f.atLeast[g]++;
			}
		}
		for (let i = 0; i < guess.length; i++) {
			const p = pattern.charAt(i);
			const g = guess.charAt(i);

			if (p === 'Y') {
				if (!f.cantBe[i]) f.cantBe[i] = {};
				f.cantBe[i][g] = true;
				f.atLeast[g]++;
			}
		}
		for (let i = 0; i < guess.length; i++) {
			const p = pattern.charAt(i);
			const g = guess.charAt(i);

			if (p === '-') {
				if (!f.cantBe[i]) f.cantBe[i] = {};
				f.cantBe[i][g] = true;
				f.noMoreThan[g] = f.atLeast[g];
			}
		}

		return f;
	}

	static resultOf(guess, target) {
		guess = GridItem.cleanGuess(guess);
		target = GridItem.cleanGuess(target);

		const ct = {};
		Object.assign(ct, Words.countOf(target));

		let result = '';

		for (let i = 0; i < guess.length; i++) {
			const g = guess.charAt(i);
			const t = target.charAt(i);
			if (g === t) {
				ct[g]--;
			}
		}
		for (let i = 0; i < guess.length; i++) {
			const g = guess.charAt(i);
			const t = target.charAt(i);
			if (!Words.isletter[g]) {
				result += ' ';
			}
			else if (g === t) {
				result += 'G';
			} else if (ct[g]) {
				result += 'Y';
				ct[g]--;
			} else {
				result += '-';
			}
		}

		// this is just a sanity check
		const filter = Filter.fromGuess(guess, result);
		if (!filter.permits(target)) throw { guess: guess, target: target, result: result, filter: filter };

		return result;
	}

	permits(guess) {
		let ct = {};
		for (i of Words.az) {
			ct[i] = 0;
		}

		for (i = 0; i < guess.length; i++) {
			const g = guess.charAt(i);
			if (!Words.isletter[g]) continue;
			if (this.mustBe[i] && this.mustBe[i] !== g) return false;
			if (this.cantBe[i] && this.cantBe[i][g]) return false;
			if (++ct[g] > this.noMoreThan[g]) return false;
		}

		for (i of Words.az) {
			if (ct[i] < this.atLeast[i]) return false;
		}

		return true;
	}

	intersection(f) {
		if (!f) throw ['intersection(f)', arguments];

		const ff = new Filter();

		for (let i = 0; i < Math.max(f.mustBe.length, this.mustBe.length); i++) {
			if (!f.mustBe[i] && !this.mustBe[i]) continue;

			if (f.mustBe[i] && this.mustBe[i] && f.mustBe[i] !== this.mustBe[i]) {
				ff.mustBe[i] = '?';
			} else {
				ff.mustBe[i] = f.mustBe[i] || this.mustBe[i];
			}
		}

		for (let i = 0; i < Math.max(f.cantBe.length, this.cantBe.length); i++) {
			if (!f.cantBe[i] && !this.cantBe[i]) continue;

			if (f.cantBe[i] && this.cantBe[i]) {
				ff.cantBe[i] = {};
				Object.assign(ff.cantBe[i], f.cantBe[i]);
				Object.assign(ff.cantBe[i], this.cantBe[i]);
			} else {
				ff.cantBe[i] = f.cantBe[i] || this.cantBe[i];
			}
		}

		for (i of Words.az) {
			ff.atLeast[i] = Math.max(f.atLeast[i], this.atLeast[i]);
			ff.noMoreThan[i] = Math.min(f.noMoreThan[i], this.noMoreThan[i]);
		}

		return ff;
	}
}

class Analyzer {
	static {
		const onGameChange = GameChange.$gameChange.pipe(
			rxjs.map(g => { return { game: g }; })
		);
		const onTargetChange = PossibleTargets.$targets.pipe(
			rxjs.map(t => { return { targets: t }; })
		);
		rxjs.merge(onGameChange, onTargetChange).pipe(
			rxjs.scan((acc, val) => Object.assign(acc, val), { game: null, targets: [] }
			)
		).subscribe(v => Analyzer.analyze(v.game, v.targets));
	}

	static analyze(game, targets) {
		OutputGui.clearAnalysis();
		if (!game || !targets || game.game === Games.none || game.guesses === Guesses.none) {
			return;
		}
		if (targets.length == 0) {
			OutputGui.noSolutions();
			return;
		} else if (targets.length == 1) {
			OutputGui.solved(targets[0]);
			return;
		}

		const guesses = game.hardmode ? targets : Words.guessList[game.guesses];
		let guessesDone = 0;

		rxjs.from(asyncof(guesses)).pipe(
			rxjs.tap(v => OutputGui.analysisStatus(v + " " + ++guessesDone + "/" + guesses.size)),
			rxjs.map(guess =>
				rxjs.from(asyncof(targets, 100)).pipe(
					rxjs.reduce(
						(partitions, target) => {
							const result = Filter.resultOf(guess, target);
							if (!partitions.has(result)) partitions.set(result, new Set());
							partitions.get(result).add(target);
							return partitions;
						},
						new Map()
					),
					rxjs.map(partitions => {
						let entropy = 0;

						for (let partition of partitions.values()) {
							const p = partition.size / targets.length;
							entropy += -Math.log2(p) * p;
						}

						return { guess: guess, entropy: entropy, partitions: partitions };
					}
					)
				)
			),
			rxjs.mergeAll(),
			rxjs.scan((acc, val) => {
				if (acc.list.length === 5 && (acc.list[4].entropy >= val.entropy)) {
					return { change: false, list: acc.list };
				} else {
					acc.list.push(val);
					acc.list.sort((a, b) => b.entropy - a.entropy);
					if (acc.list.length > 5) acc.list.pop();
					return {
						change: true, list: acc.list
					};
				}
			}, { change: true, list: [] }),
			rxjs.filter(v => v.change),
			rxjs.map(v => v.list),
			rxjs.takeUntil(GameChange.$gameChange),
			rxjs.takeUntil(PossibleTargets.$targets),
			rxjs.finalize(() => OutputGui.analysisStatus(''))
		).subscribe(OutputGui.showBestGuesses)
	}
}

async function* asyncof(o, blocksize) {
	if (!blocksize) blocksize = 31;
	let n = blocksize;
	for (i of o) {
		if (!--n) {
			n = blocksize;
			await new Promise(callback => window.setTimeout(callback, 0));
		}
		yield i;
	}
}

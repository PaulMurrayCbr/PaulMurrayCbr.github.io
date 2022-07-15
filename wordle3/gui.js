/**
 * This file should be the only javascript that knows about how our screen is arranged 
 * and what the ids and classes of the components are.
 */

$(() => { GameOptionsGui.init(); })
$(() => { GameBlocksGui.init(); })

class GameOptionsGui {
	static init() {
		GameOptionsGui.#init_infobutton();
		GameOptionsGui.#init_gameselection();
	}

	static #init_infobutton() {
		$('#infobutton').on('click', (evt) => {
			if ($('.info').is(':hidden')) {
				$('.info').show();
			} else {
				$('.info').hide();
			}

		});
	}

	static #init_gameselection() {
		$('#options-game input').on('change', GameOptionsGui.#gameOptionsChanged);
		$('#control-form input').on('change', GameOptionsGui.#gameOptionsChanged);

		GameOptionsGui.#gameOptionsChanged();
	}


	static #gameOptionsChanged() {
		let gameSelection = $('#control input[name=game]:checked').val();
		if (!gameSelection) gameSelection = 'none'
		let guessSelection = 'none';

		$('#guesses-control>div').hide()

		$('#guesses-for-' + gameSelection).show()

		if (gameSelection == 'none') {
			guessSelection = 'none';
		} else if (gameSelection == 'l5') {
			guessSelection = 'l5';
		} else {
			guessSelection = $('#control input[name=guesses-for-' + gameSelection + ']:checked').val();
			if (!guessSelection) {
				guessSelection = 'none';
			}
		}

		GameChange.set(Games[gameSelection], Guesses[guessSelection], !!$('#hard-mode:checked').val());
	}


}

class GameBlocksGui {
	static init() {
		$('#newblock-button').on('click', GameBlocksGui.#newBlock);
		GameBlocksGui.#newBlock();
	}

	static #newBlock() {
		const b = $('#block-template .block').clone();
		b.find('.close-button').on('click', () => { b.remove(); GameBlocksGui.#fireChange()});
		const gui = new GameBlocksGui(b);
		b.data('controller', gui);
		$('#blocks').append(b);
	}
	
	block$;
	guess$;
	response$;
	
	g = '';
	r = '';
	
	constructor(block$) {
		this.block$ = block$;
		this.guess$ = block$.find('input.guess');
		this.response$ = block$.find('input.response');
		block$.find('input').on('change', () => this.#checkChange());
		block$.find('input').on('keyup', () => this.#checkChange());
	}
	
	#checkChange() {
		if(this.guess$.val() === this.g && this.response$.val() === this.r) {
			return;
		}
		
		let nextGuess = "";
		if(this.guess$.val()) {
			for(let ch of this.guess$.val().toUpperCase()) {
				if(ch < 'A' || ch > 'Z') {
					ch = ' ';
				}
				nextGuess += ch;
			}
		}
		
		let nextResponse = "";
		if(this.response$.val()) {
			for(let ch of this.response$.val().toUpperCase()) {
				switch(ch) {
					case 'Y': case 'G': case '-': break;
					default: ch = ' '; break;
				}
				nextResponse += ch;
			}
		}
		
		const n = Math.max(this.g.length, this.r.length, nextGuess.length, nextResponse.length)
		
		nextGuess = nextGuess.padEnd(n);
		nextResponse = nextResponse.padEnd(n);
		const thisGuess = this.g.padEnd(n);
		const thisResponse = this.r.padEnd(n);
		
		
		// if a guess letter has changed, then the grid has changed if there is a YG- in the esponse
		// if a response value has changed, then the grid has changed if there is a corresponding a-z in the guess
		
		let change = false;
		
		for(let i = 0; i< n; i++) {
			const ngch = nextGuess.charAt(i);
			const tgch = thisGuess.charAt(i);
			const nrch = nextResponse.charAt(i);
			const trch = thisResponse.charAt(i);
			
			if(ngch != tgch && (nrch!=' ' || trch != ' ')) {
				change = true;
				break;
			}
			
			if(nrch != trch && (ngch!=' ' || tgch != ' ')) {
				change = true;
				break;
			}
		}
		
		if(!change) return;
		
		this.g = nextGuess;
		this.r = nextResponse;
		
		GameBlocksGui.#fireChange();
	}
	
	static #fireChange () {
		let grid = [];
		$('#blocks .block').each((idx, b) => {
			const item = $(b).data('controller');
			grid.push(new GridItem(item.g, item.r));
		});
	
		$grid.next(grid);
	}
	
}

class OutputGui {
	static targetListStatus(s) {
		$('#target-list-status').text(s);
	}  

	static targetListClear() {
		$('#target-list').empty();
		$('#target-list-status').empty();
		$('#additional-bits-required').text('0.000');
	}  
	
	static targetListItem(s) {
		const item = $('#target-list-item-template>*').clone();
		$(item).text(s);
		$('#target-list').append(s.toLowerCase());
		$('#target-list').append(' ');
	}  
	
	static targetListBitsRequired(n) {
		$('#additional-bits-required').text(n.toFixed(3));
	}  
	
	static clearAnalysis(){
		$('.empty-to-clear').empty();
		$('.hide-to-clear').hide();
	}
	
	static solved(solution){
		$('.solution-found').show();
		$('#solution').text(solution);
	}
	
	static noSolutions(){
		$('#no-solutions').show();
	}
	
	static analysisStatus(s) {
		$('#analysis-status').text(s);
	}
	
	static showBestGuesses(v) {
		$('#best-guesses').show();
		$('.best-guess').text(v && v.length ? v[0].guess : '');
		$('#best-guesses-list').empty();
		
		for(let i of v) {
			const b = $('#best-guesses-list-template>*').clone();
			b.find('.guess').text(i.guess.toLowerCase());
			b.find('.entropy').text(i.entropy.toFixed(3));
			$('#best-guesses-list').append(b);
		}
		
		$('#best-guess-analysis').empty();
		
		if(v.length) {
			
			let kk = [];
			for(let k of v[0].partitions.keys()) kk.push(k);
			kk.sort();
			
			for(let k of kk) {
				const b = $('#best-guess-analysis-template>*').clone();
				b.find('.result').text(k);
				
				const list = b.find('.list');
				
				for(let w of v[0].partitions.get(k) ) {
					list.append(w.toLowerCase());
					list.append(' ');
				}
				
				$('#best-guess-analysis').append(b);
			}
		}
	}				
}



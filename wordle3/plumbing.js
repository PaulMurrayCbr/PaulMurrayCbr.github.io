/**
 * This file contains the top-level, global Subject objects that tie the app together.
 */
 
 
/**
 * Observable<String[]> - the current list of possible target words permitted by the grid.
 * A value of null means that the target list is being recomputed. It will be folloed in due course
 * by a non null value. An empty list is possible, if the use types weird stuff into the grid. So
 * check for null, not falsy.
 */ 
const $targets = new rxjs.Subject();

/**
 * Observable<GameChange> - the current selections in the game selection menus 
 */

const $gameChange = new rxjs.Subject();

/**
 * Observable<GridItem[]> - the array of guess/result items input by the user
 */

const $grid =  new rxjs.Subject();


/** operator that removes duplicates from a observable, according to a equaliy function. 
 * The observable must be a proper rxjs obserable with a pipe() method 
 */

function zapduplicates(equals) {
	return observable => observable.pipe(
		rxjs.scan( (acc, val) => 
			acc.first 
				? { isDuplicate: false, item: val} 
				: { isDuplicate: equals(val, acc.item), item: val},
			{ first: true}
		),
		rxjs.filter(v => !v.isDuplicate),
		rxjs.map(v => v.item)
	)
}
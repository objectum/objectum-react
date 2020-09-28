/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

let store;
let data = {};
let value = {};
let record = {};
let records = {};
let listeners = {};

function init (opts) {
	store = opts.store;
};

async function set (a, v, opts) {
	value [a] = v;
	callListeners ("change", {option: a, value: v, opts});
};

function get (a) {
	return value [a];
};

function addListener (e, fn) {
	listeners [e] = listeners [e] || [];
	listeners [e].push (fn);
};

function removeListener (e, fn) {
	listeners [e] = listeners [e] || [];
	
	for (let i = 0; i < listeners [e].length; i ++) {
		if (listeners [e][i] == fn) {
			listeners [e].splice (i, 1);
			break;
		}
	}
};

function callListeners (e, opts) {
	if (listeners [e]) {
		for (let i = 0; i < listeners [e].length; i ++) {
			listeners [e][i] (opts);
		}
	}
};

export default {
	init,
	data,
	records,
	record,
	set,
	get,
	value,
	store,
	addListener,
	removeListener
};
export {
	init,
	data,
	records,
	record,
	set,
	get,
	value,
	store,
	addListener,
	removeListener
};

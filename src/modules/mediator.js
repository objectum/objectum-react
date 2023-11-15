/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

let data = {};
let value = {};
let record = {};
let records = {};
let listeners = {};

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
	data,
	records,
	record,
	set,
	get,
	value,
	addListener,
	removeListener
};
export {
	data,
	records,
	record,
	set,
	get,
	value,
	addListener,
	removeListener
};

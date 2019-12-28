"use strict";

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

function timeout (ms = 500) {
	return new Promise (resolve => setTimeout (() => resolve (), ms));
};

function pad (number) {
	let r = String (number);
	
	if (r.length === 1) {
		r = "0" + r;
	}
	return r;
};

function getDateString (d) {
	if (!d || typeof d == "string") {
		return d;
	}
	return d.getFullYear () + "-" + pad (d.getMonth () + 1) + "-" + pad (d.getDate ());
};

function getTimestampString (d) {
	if (!d || typeof d == "string") {
		return d;
	}
	let s = `${d.getFullYear ()}-${pad (d.getMonth () + 1)}-${pad (d.getDate ())}`;
	
	if (d.getHours () || d.getMinutes () || d.getSeconds ()) {
		s += ` ${pad (d.getHours ())}:${pad (d.getMinutes ())}:${pad (d.getSeconds ())}`;
	}
	return s;
};

let localHash = {};
let hashListeners = [];

function getHash (cmp) {
	if (cmp && cmp.props && cmp.props.localHash) {
		return localHash;
	}
	try {
		let s = decodeURI (window.location.hash.substr (1) || "{}");
		return JSON.parse (s);
	} catch (err) {
		console.log (err);
		return {};
	}
};

function setHash (cmp, next) {
	let hash = getHash (cmp);
	
	for (let key in next) {
		hash [key] = hash [key] || {};
		
		let o1 = next [key];
		let o2 = hash [key];
		
		for (let a in o1) {
			o2 [a] = o1 [a];
		}
	}
	if (cmp.props && cmp.props.localHash) {
		localHash = hash;

		for (let i = 0; i < hashListeners.length; i ++) {
			hashListeners [i] ();
		}
	} else {
		window.location.hash = encodeURI (JSON.stringify (hash));
	}
};

function addHashListener (cmp, fn) {
	if (cmp.props && cmp.props.localHash) {
		hashListeners.push (fn);
	} else {
		window.addEventListener ("hashchange", fn);
	}
};

function removeHashListener (cmp, fn) {
	if (cmp.props && cmp.props.localHash) {
		for (let i = 0; i < hashListeners.length; i ++) {
			if (hashListeners [i] == fn) {
				hashListeners.splice (i, 1);
				break;
			}
		}
	} else {
		window.removeEventListener ("hashchange", fn);
	}
};

function loadCSS (file) {
	return new Promise (resolve => {
		let link = document.createElement ("link");
		
		link.setAttribute ("rel", "stylesheet");
		link.setAttribute ("type", "text/css");
		link.setAttribute ("href", file);
		
		if (link.onreadystatechange === undefined) {
			link.onload = resolve;
		} else {
			link.onreadystatechange = function () {
				if (this.readyState == "complete" || this.readyState == "loaded") {
					resolve ();
				}
			}
		}
		document.getElementsByTagName ("head")[0].appendChild (link)
	});
};

function loadJS (file) {
	return new Promise (resolve => {
		let script = document.createElement ("script");
		
		script.src = file;
		script.type = "text/javascript";
		script.language = "javascript";
		
		let head = document.getElementsByTagName ("head")[0];
		
		if (script.onreadystatechange === undefined) {
			script.onload = resolve;
		} else {
			script.onreadystatechange = function () {
				if (this.readyState == "complete" || this.readyState == "loaded") {
					resolve ();
				}
			}
		}
		head.appendChild (script);
	});
};

function goRidLocation (props, rid) {
	let location = decodeURI (window.location.pathname + window.location.hash);
	let tokens = location.split ("/new");
	
	location = tokens.join (`/${rid}`);
	props.history.push (location)
};

let lastId = 0;

function newId (prefix = "id") {
	lastId ++;
	return `${prefix}-${lastId}`;
};

module.exports = {
	getHash,
	setHash,
	addHashListener,
	removeHashListener,
	loadCSS,
	loadJS,
	getDateString,
	getTimestampString,
	goRidLocation,
	timeout,
	newId
};

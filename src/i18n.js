"use strict";

let locales = {
	"en": require ("./locales/en.json"),
	"ru": require ("./locales/ru.json")
};
let map = {};
let lang;

function setLocale (_lang) {
	lang = _lang;
	map = locales [_lang];
};

function getLocale () {
	return lang || "en";
}

function i18n (s) {
	if (!s || typeof (s) != "string") {
		return s;
	}
	let r = map [s.toLowerCase ()] || s;
	
	if (s [0] === s [0].toUpperCase ()) {
		r = `${r [0].toUpperCase ()}${r.substr (1)}`;
	} else
	if (s [0] === s [0].toLowerCase ()) {
		r = `${r [0].toLowerCase ()}${r.substr (1)}`;
	}
	return r;
};

module.exports = {
	locales,
	map,
	setLocale,
	getLocale,
	i18n
};

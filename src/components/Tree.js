/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Fade} from "../index";
import _keys from "lodash.keys";
import _isEmpty from "lodash.isempty";

export default class Tree extends Component {
	constructor (props) {
		super (props);
		
		this.state = Object.assign ({
			parent: 0
		}, this.processRecs (this.props.recs || this.props.records || [], this.props.opened));
	}
	
	processRecs (recs, opened = []) {
		let map = {"0": {childs: []}};
		
		recs.forEach (rec => {
			rec.childs = [];
			
			if (!rec.parent) {
				rec.parent = 0;
			}
			map [rec.id] = rec;
		});
		recs.forEach (rec => {
			if (rec.parent && !map [rec.parent]) {
				throw new Error ("unknown parent: " + rec.parent);
			}
			map [rec.parent].childs.push (rec);
		});
		let state = {recs, map, opened};
		
		opened.forEach (id => state [`opened-${id}`] = true);
		
		return state;
	}
	
	async componentDidUpdate (prevProps) {
		let state = {};
		let recs = this.props.recs || this.props.records;
		
		if (recs && recs.map (rec => rec.id).join () != this.state.recs.map (rec => rec.id).join ()) {
			if (this.props.opened && this.props.opened.join () != this.state.opened.join ()) {
				state.opened = this.props.opened;
			}
			Object.assign (state, this.processRecs (recs, state.opened));
			state.parent = 0;
		}
		if (!_isEmpty (state)) {
			this.setState (state);
		}
	}
	
	highlightText (v) {
		if (this.props.highlightText) {
			let idx = (v || "").toLowerCase ().indexOf (this.props.highlightText.toLowerCase ());
			
			if (idx > -1) {
				v = `${v.substr (0, idx)}<span class="text-warning">${v.substr (idx, this.props.highlightText.length)}</span>${v.substr (idx + this.props.highlightText.length)}`;
			}
		}
		return v;
	}
	
	renderNodes (parent, level = 0) {
		let recs = this.state.map [parent].childs;
		let items = [];
		
		recs.forEach ((rec, i) => {
			let v = this.highlightText (rec.getLabel ? rec.getLabel () : rec.name);
			let td = [];
			
			for (let i = 0; i < level; i ++) {
				td.push (<td key={i} width="1em"><img height={1} width="2em"/></td>);
			}
			td.push (<td key="button" width="1em">{rec.childs.length ?
				<button className="btn btn-link btn-sm p-0" onClick={() => this.setState ({["opened-" + rec.id]: !this.state ["opened-" + rec.id]})}>
					<i className={`fa-lg fas ${this.state ["opened-" + rec.id] ? "fa-folder-open" : "fa-folder"} mr-1`} />
				</button> : <img height={1} width="2em"/>}
			</td>);
			td.push (<td key="value" colSpan={this.levelNum - level}><div className="dictfield-option" onClick={() => {
				if (this.props.onChoose) {
					this.props.onChoose ({id: rec.id, rec});
				}
			}} dangerouslySetInnerHTML={{__html: v}} /></td>);
			
			let node = <tr key={rec.id}>{td}</tr>;
			
			if (rec.childs.length && this.state ["opened-" + rec.id]) {
				items = [...items, node, ...this.renderNodes (rec.id, level + 1)];
			} else {
				items.push (node);
			}
		});
		return items;
	}
	
	calcLevelNum (parent = 0, level = 1) {
		if (!parent) {
			this.levelNum = 1;
		}
		if (this.levelNum < level) {
			this.levelNum = level;
		}
		this.state.map [parent].childs.forEach (rec => {
			if (rec.childs.length) {
				this.calcLevelNum (rec.id, level + 1);
			}
		});
	}
	
	render () {
		this.calcLevelNum ();
		console.log (this.levelNum);
		return <table className="table table-sm table-striped"><tbody>{this.renderNodes (0)}</tbody></table>;
	}
};
Tree.displayName = "Tree";

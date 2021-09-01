/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import _isEmpty from "lodash.isempty";

export default class Tree extends Component {
	constructor (props) {
		super (props);
		
		this.state = Object.assign ({
			parent: null
		}, this.processRecs (this.props.recs || this.props.records || [], this.props.opened));
	}
	
	processRecs (recs, opened = []) {
		let map = {null: {childs: []}};
		
		recs.forEach (rec => {
			rec.childs = [];
			
			if (!rec.parent) {
				rec.parent = null;
			}
			map [rec.id] = rec;
		});
		recs.forEach (rec => {
			if (rec.parent && !map [rec.parent]) {
				throw new Error ("unknown parent: " + rec.parent);
			}
			if (rec.hasOwnProperty ("parent")) {
				map [rec.parent].childs.push (rec);
			}
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
			state.parent = null;
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
	
	check (id, checked) {
		let state = {};
		let process = (id) => {
			state [`checked-${id}`] = checked;
			this.checkedNodes = this.checkedNodes || [];
			
			if (checked) {
				if (this.checkedNodes.indexOf (id) == -1) {
					this.checkedNodes.push (id);
				}
			} else {
				let idx = this.checkedNodes.indexOf (id);
				
				if (idx > -1) {
					this.checkedNodes.splice (idx, 1);
				}
			}
			if (this.state [`opened-${id}`]) {
				let recs = this.state.map [id].childs;
				recs.forEach (rec => process (rec.id));
			}
		};
		process (id);
		this.setState (state);
		
		if (this.props.onCheck) {
			this.props.onCheck ({checkedNodes: this.checkedNodes});
		}
	}
	
	renderNodes (parent, level = 0) {
		let recs = this.state.map [parent].childs;
		let items = [];
		
		recs.forEach (rec => {
			let v = this.highlightText (rec.getLabel ? rec.getLabel () : rec.name);
			let td = [];
			
			for (let i = 0; i < level; i ++) {
				td.push (<td key={i} />);
			}
			td.push (<td key="button" style={{width: "2.5em", paddingRight: 0}}>{rec.childs.length ?
				<div className="d-flex align-items-center">
					<button className="btn btn-link btn-sm p-0" onClick={() => this.setState ({["opened-" + rec.id]: !this.state ["opened-" + rec.id]})}>
						<i className={`fa-lg fas ${this.state ["opened-" + rec.id] ? "fa-folder-open" : "fa-folder"} mr-1`} />
					</button>
				</div> : null}
			</td>);
			td.push (<td key="value" colSpan={this.levelNum - level} style={{paddingLeft: 0}}>
				<div className="d-flex align-items-center">
					{this.props.selectMulti && <input type="checkbox" className="mr-1" checked={this.state [`checked-${rec.id}`] || false} onChange={val => {
						this.check (rec.id, val.target.checked);
					}} />}
					<div className="dictfield-option" onClick={() => {
						if (this.props.onChoose) {
							this.props.onChoose ({id: rec.id, rec});
						}
					}} dangerouslySetInnerHTML={{__html: v}} />
				</div>
			</td>);
			
			let node = <tr key={rec.id}>{td}</tr>;
			
			if (rec.childs.length && this.state ["opened-" + rec.id]) {
				items = [...items, node, ...this.renderNodes (rec.id, level + 1)];
			} else {
				items.push (node);
			}
		});
		return items;
	}
	
	calcLevelNum (parent = null, level = 1) {
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
		return <table className="table table-sm table-striped"><tbody>{this.renderNodes (null)}</tbody></table>;
	}
};
Tree.displayName = "Tree";

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
		if (this.props.highlightText && v.indexOf (this.props.highlightText) > -1) {
			let tokens = v.split (this.props.highlightText);
			v = tokens.join (`<span class="text-warning">${this.props.highlightText}</span>`);
		}
		return v;
	}
	
	renderNodes (parent, level = 0) {
		let recs = this.state.map [parent].childs;
		
		return (
			<Fade>
				{recs.map ((rec, i) => {
					let v = this.highlightText (rec.getLabel ? rec.getLabel () : rec.name);
					let node = <div key={i} className="p-1 d-flex" style={{marginLeft: level + "em", height: "2em"}}>
						<div style={{width: "2em"}}>{rec.childs.length ?
							<button className="btn btn-link btn-sm p-0" onClick={() => this.setState ({["opened-" + rec.id]: !this.state ["opened-" + rec.id]})}>
								<i className={`fa-lg fas ${this.state ["opened-" + rec.id] ? "fa-folder-open" : "fa-folder"} mr-1`} />
							</button> : null}
						</div>
						<div className="dictfield-option" onClick={() => {
							if (this.props.onChoose) {
								this.props.onChoose ({id: rec.id, rec});
							}
						}} dangerouslySetInnerHTML={{__html: v}} />
					</div>;
					
					if (rec.childs.length && this.state ["opened-" + rec.id]) {
						return (
							<div key={i}>
								{node}
								{this.renderNodes (rec.id, level + 1)}
							</div>
						);
					} else {
						return node;
					}
				})}
			</Fade>
		);
	}
	
	render () {
		return this.renderNodes (0);
	}
};
Tree.displayName = "Tree";

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Fade} from "../index";

class Tree extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let recs = me.props.recs, map = {"0": {childs: []}};
		
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
		me.state = {
			recs,
			map,
			parent: 0
		};
	}
	
	renderNodes (parent, level = 0) {
		let me = this;
		let recs = me.state.map [parent].childs;
		
		return (
			<Fade>
				{recs.map ((rec, i) => {
					let node = (
						<div key={i} className="d-flex" style={{marginLeft: level + "em"}}>
							<div style={{width: "1.5em"}}>{rec.childs.length ?
								<button className="btn btn-link btn-sm p-0" onClick={() => me.setState ({["opened-" + rec.id]: !me.state ["opened-" + rec.id]})}>
									<i className={`fas ${me.state ["opened-" + rec.id] ? "fa-folder-open" : "fa-folder"} mr-1`} />
								</button> : null}
							</div>
							<div className="dictfield-option" onClick={() => {
								if (me.props.onChoose) {
									me.props.onChoose ({id: rec.id, rec});
								}
							}}>{rec.getLabel ? rec.getLabel () : rec.name}</div>
						</div>
					);
					if (rec.childs.length && me.state ["opened-" + rec.id]) {
						return (
							<div key={i}>
								{node}
								{me.renderNodes (rec.id, level + 1)}
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
		let me = this;
		
		return me.renderNodes (0);
	}
};
Tree.displayName = "Tree";

export default Tree;

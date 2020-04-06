/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getTimestampString} from "./helper";

class Cell extends Component {
	constructor (props) {
		super (props);
	}
	
	render () {
		let me = this;
		let value = me.props.value;
		let col = me.props.col;
		
		if (value === null) {
			return (<span />);
		} else {
			if (col.type == 3) {
				// Date
				return (<span>{getTimestampString (value)}</span>);
			} else
			if (col.type == 4) {
				// Boolean
				return (<input type="checkbox" checked={value} disabled />);
			} else
			if (col.type == 5) {
				// File
				return (
					<span>
						<a target="_blank" rel="noopener noreferrer"
						   href={`${me.props.store.getUrl ()}/files/${me.props.rec.id}-${me.props.col.property}-${value}`}>{value}
						</a>
					</span>
				);
			} else
			if (col.type == 6) {
				// Class
				let cls = me.props.store.getModel (value);
				
				return (<span>{`${cls.get ("name")} (${cls.getPath ()} : ${cls.get ("id")})`}</span>);
			} else
			if (col.recs) {
				let rec = col.recs.find ((rec) => {
					if (rec.id == value) {
						return true;
					}
				});
				if (rec) {
					let label = `${rec.name} (id: ${value})`;
					
					if (rec.getLabel) {
						label = rec.getLabel ();
					}
					return (<span>{label}</span>);
				} else {
					return (<span>{`${value}`}</span>);
				}
			} else {
				return (<span>{value}</span>);
			}
		}
	}
};
Cell.displayName = "Cell";

export default Cell;

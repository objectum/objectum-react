/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getDateString} from "./helper";

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
				return (<span>{getDateString (value)}</span>);
			} else
			if (col.type == 4) {
				// Boolean
				return (<input type="checkbox" checked={value} readOnly={true} />);
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
				return (<span>{`${rec.name} (${value})`}</span>);
			} else {
				return (<span>{value}</span>);
			}
		}
	}
};

export default Cell;

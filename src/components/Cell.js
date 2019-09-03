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
				let cls = me.props.store.getClass (value);
				
				return (<span>{`${cls.get ("name")} (${cls.getPath ()} : ${cls.get ("id")})`}</span>);
			} else {
				return (<span>{value}</span>);
			}
		}
	}
};

export default Cell;

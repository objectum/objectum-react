/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";

class Action extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
		me.onClick = me.onClick.bind (me);
	}
	
	onClick () {
		let me = this;
		
		if (me.props.onClick) {
			me.props.onClick ();
		} else
		if (me.props.onClickSelected) {
			me.props.onClickSelected ();
		}
	}
	
	render () {
		let me = this;
		
		return (
			<button type="button" className="btn btn-primary btn-labeled mr-1" onClick={me.onClick} disabled={me.props.disabled}>{me.props.children}</button>
		);
	}
};
Action.displayName = "Action";

export default Action;

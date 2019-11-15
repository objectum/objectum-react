/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";

class Tab extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
	}
	
	render () {
		let me = this;
		
		return (
			<div className="border border-top-0 p-1 bg-white shadow-sm">
				{me.props.children}
			</div>
		);
	}
};
Tab.displayName = "Tab";

export default Tab;

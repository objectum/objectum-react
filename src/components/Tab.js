/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Fade from "react-reveal/Fade";

class Tab extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
	}
	
	render () {
		let me = this;

		if (me.props.children) {
			return (
				<Fade>
					<div className="border border-top-0">
						{me.props.children}
					</div>
				</Fade>
			);
		} else {
			return null;
		}
	}
};
Tab.displayName = "Tab";

export default Tab;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Fade from "./Fade";

export default class Tab extends Component {
	constructor (props) {
		super (props);
	}
	
	render () {
		if (this.props.children) {
			return <Fade className={this.props.className || ""}>
				<div className="border border-top-0 bg-white">
					{this.props.children}
				</div>
			</Fade>;
		} else {
			return null;
		}
	}
};
Tab.displayName = "Tab";

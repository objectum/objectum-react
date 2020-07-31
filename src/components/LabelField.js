/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n, newId} from "..";

class LabelField extends Component {
	constructor (props) {
		super (props);

		this.id = newId ();
	}
	
	render () {
		return (
			<div className={this.props.className}>
				{me.props.label && i18n (me.props.label)}
			</div>
		);
	}
};
LabelField.displayName = "LabelField";

export default LabelField;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n, newId} from "..";

export default class LabelField extends Component {
	constructor (props) {
		super (props);

		this.id = newId ();
	}
	
	render () {
		return <div className={this.props.className}>
			{this.props.label && i18n (this.props.label)}
		</div>;
	}
};
LabelField.displayName = "LabelField";

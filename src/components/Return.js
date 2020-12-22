/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Action from "./Action";
import {i18n} from "../i18n";

export default class Return extends Component {
	constructor (props) {
		super (props);
	}
	
	onBack = () => {
		let location = this.props.app.state.locations [this.props.app.state.locations.length - 2];
		
		if (location) {
			let {pathname, hash} = location;
			
			this.props.app.popLocation ();
			this.props.history.push (pathname + hash);
		}
	}
	
	render () {
		if (!this.props.app || !this.props.history) {
			return <div />;
		}
		return <Action btnClassName="btn btn-link ml-0 pl-0 mr-1 mb-1" label={i18n ("Return")} icon="fas fa-arrow-left" onClick={this.onBack} />;
	}
};


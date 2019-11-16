/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import {popLocation} from "./helper";

class Back extends Component {
	constructor (props) {
		super (props);
	}
	
	render () {
		let me = this;
		let from = sessionStorage.getItem ("_from");
		
		if (from) {
			return (
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (popLocation ())}><i className="fas fa-arrow-left mr-2"></i>{i18n ("Back")}</button>
			);
		} else {
			return (<div />);
		}
	}
};
Back.displayName = "Back";

export default Back;

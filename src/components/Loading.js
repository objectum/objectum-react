/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

export default class Loading extends Component {
	constructor (props) {
		super (props);
	}
	
	render () {
		let label = this.props.hasOwnProperty ("label") ? this.props.label : (i18n ("Loading") + " ...");

		if (this.props.container) {
			return <div className="container">
				<div className="mt-2 p-4 border shadow-sm d-flex bg-white">
					<div className="spinner-border spinner-border-sm mr-2 my-auto" role="status" aria-hidden="true" />
					<div className="my-auto">{label}</div>
				</div>
			</div>;
		}
		return <div className="d-flex">
			<div className="spinner-border spinner-border-sm mr-2 my-auto" role="status" aria-hidden="true" />
			<div className="my-auto">{label}</div>
		</div>;
	}
};
Loading.displayName = "Loading";

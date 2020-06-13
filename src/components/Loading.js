/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

class Loading extends Component {
	constructor (props) {
		super (props);
	}
	
	render () {
		if (this.props.container) {
			return (
				<div className="container">
					<div className="mt-2 p-4 border shadow-sm">
						<span className="spinner-border objectum-spinner mr-2" role="status" aria-hidden="true" />
						{i18n ("Loading") + " ..."}
					</div>
				</div>
			);
		}
		return (
			<span>
				<span className="spinner-border objectum-spinner mr-2" role="status" aria-hidden="true" />
				{i18n ("Loading") + " ..."}
			</span>
		);
	}
};
Loading.displayName = "Loading";

export default Loading;

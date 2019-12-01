/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

class Loading extends Component {
	constructor (props) {
		super (props);
	}
	
	render () {
		return (
			<span>
				<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
				{i18n ("Loading") + " ..."}
			</span>
		);
	}
};
Loading.displayName = "Loading";

export default Loading;

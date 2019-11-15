/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Route} from "react-router-dom";

class ObjectumRoute extends Component {
	constructor (props) {
		super (props);
	}
	
	render () {
		return (
			<Route {...this.props.path} />
		);
	}
};
ObjectumRoute.displayName = "ObjectumRoute";

export default ObjectumRoute;

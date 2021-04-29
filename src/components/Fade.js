import React, {Component} from "react";

export default class Fade extends Component {
	render () {
		return <div className={`${this.props.className || ""} fade-in`}>
			{this.props.children}
		</div>;
	}
};


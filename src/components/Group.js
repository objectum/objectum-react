/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

export default class Group extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			expanded: this.props.collapsible ? this.props.expanded : true
		};
	}
	
	render () {
		let opts = {
			className: "d-flex my-auto"
		};
		if (this.props.collapsible) {
			opts.className += " select-tab";
			opts.onClick= () => this.setState ({expanded: !this.state.expanded});
		}
		return <div className={this.props.className}>
			<div className="d-flex" style={{height: "2em"}}>
				<div className="border-top border-left h-50 mt-auto"  style={{width: "2em"}} />
				<div {...opts}>
					{this.props.collapsible && <i className={`far ${this.state.expanded ? "fa-caret-square-down" : "fa-caret-square-up"} ml-2 my-auto text-primary`} />}
					<div className="mx-2 text-nowrap">{i18n (this.props.label) || ""}</div>
				</div>
				<div className="border-top border-right w-100 h-50 mt-auto" />
			</div>
			<div className="border-left border-right border-bottom">
				{this.state.expanded && <div className="p-1">{this.props.children}</div>}
			</div>
		</div>;
	}
};
Group.displayName = "Group";

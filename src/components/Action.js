/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import _ from "lodash";

class Action extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			processing: false,
			label: "",
			value: "",
			max: ""
		};
		me.onClick = me.onClick.bind (me);
	}
	
	async onClick () {
		let me = this;
		let handler = me.props.onClick || me.props.onClickSelected;
		let state = {processing: false};
		
		if (handler) {
			me.setState ({processing: true, label: "", value: "", max: ""});
			
			try {
				let promise = handler ({
					progress: ({label, value, max}) => {
						me.setState ({label, value, max});
					}
				});
				if (promise && promise.then) {
					promise.then (() => {
						me.setState (state);
					}).catch (err => {
						state.error = err.message;
						me.setState (state);
					});
				} else {
					me.setState (state);
				}
			} catch (err) {
				console.error (err);
				state.error = err.message;
				me.setState (state);
			}
		}
	}
	
	render () {
		let me = this;
		let text;
		
		if (me.state.processing) {
			text = me.state.label ? (me.state.label + ": ") : "";
			text += me.state.value ? me.state.value : "";
			text += me.state.max ? (" / " + me.state.max) : "";
		}
		text = text || i18n ("Processing") + " ...";
		
		return (
			me.state.processing ?
				<span className="text-primary ml-2 mr-2">
					<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />{text}
				</span> :
				<span>
					<button type="button" className="btn btn-primary btn-labeled btn-sm mr-1" onClick={me.onClick} disabled={me.props.disabled}>{me.props.children}</button>
					{me.state.error && <span className="text-danger ml-1">{me.state.error}</span>}
				</span>
		);
	}
};
Action.displayName = "Action";

export default Action;

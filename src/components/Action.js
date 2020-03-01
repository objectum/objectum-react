/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

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
					},
					confirm: (text) => {
					
					}
				});
				if (promise && promise.then) {
					promise.then (result => {
						if (typeof (result) == "string") {
							state.result = result;
						}
						me.setState (state);
					}).catch (err => {
						console.error (err);
						state.error = err.message;
						me.setState (state);
					});
				} else {
					if (typeof (promise) == "string") {
						state.result = promise;
					}
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
		
		if (me.state.processing) {
			return (
				<span className="text-primary ml-2 mr-2">
					<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />{text}
				</span>
			);
		}
		return (
			<span>
				<button
					type="button"
					className="btn btn-primary btn-labeled btn-sm mr-1"
					onClick={me.onClick}
					disabled={me.props.disabled || me.props.disableActions}
				>
					{me.props.children}
				</button>
				{me.state.error && <span className="text-danger ml-1">{me.state.error}</span>}
				{me.state.result && <span className="text-success ml-1">{me.state.result}</span>}
			</span>
		);
	}
};
Action.displayName = "Action";

export default Action;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import Fade from "react-reveal/Fade";

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
		me.onClose = me.onClose.bind (me);
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
						return new Promise (resolve => {
							me.confirmResolve = resolve;
							me.setState ({confirm: text || i18n ("Are you sure?")});
						});
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
	
	confirm (result) {
		let me = this;
		
		me.setState ({confirm: null});
		me.confirmResolve (result);
	}
	
	getDisabled () {
		let me = this;
		let disabled;
		
		if (me.props.disabled) {
			if (typeof (me.props.disabled) == "function") {
				disabled = me.props.disabled ();
			} else {
				disabled = me.props.disabled;
			}
		} else {
			disabled = me.props.disableActions
		}
		return disabled;
	}
	
	onClose () {
		this.setState ({error: "", result: ""});
	}
	
	render () {
		let me = this;

		if (me.state.confirm) {
			return (
				<Fade>
					<span className="text-danger ml-1 p-1">
						{me.state.confirm}
						<button type="button" className="btn btn-danger btn-sm ml-2" onClick={() => me.confirm (true)}><i className="fas fa-check mr-2" />{i18n ("Yes")}</button>
						<button type="button" className="btn btn-success btn-sm ml-2" onClick={() => me.confirm (false)}><i className="fas fa-times mr-2" />{i18n ("No")}</button>
					</span>
				</Fade>
			);
		}
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
					disabled={me.getDisabled ()}
				>
					{me.props.children}
				</button>
				{me.state.error && <span>
					<span className="text-danger ml-1">{me.state.error}</span>
					<button type="button" className="btn btn-link btn-sm mx-1" onClick={me.onClose}>{i18n ("Close")}</button>
				</span>}
				{me.state.result && <span>
					<span className="text-success ml-1">{me.state.result}</span>
					<button type="button" className="btn btn-link btn-sm mx-1" onClick={me.onClose}>{i18n ("Close")}</button>
				</span>}
			</span>
		);
	}
};
Action.displayName = "Action";

export default Action;

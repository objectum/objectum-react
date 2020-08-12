/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import Fade from "./Fade";
import Modal from "react-modal";

class Action extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			processing: false,
			label: "",
			value: "",
			max: "",
			showModal: false,
			recordId: me.props.recordId
		};
		me.onClick = me.onClick.bind (me);
		me.onClose = me.onClose.bind (me);
	}
	
	componentDidMount () {
		Modal.setAppElement ("body");
	}
	
	componentDidUpdate (prevProps) {
		if (prevProps.recordId != this.props.recordId) {
			this.setState ({recordId: this.props.recordId});
		}
	}
	
	componentWillUnmount () {
		this.unmounted = true;
	}
	
	async onClick () {
		let me = this;
		let execute = () => {
			let handler = me.props.onClick || me.props.onClickSelected;
			let state = {processing: false};
			
			if (me.props.modalComponent) {
				me.setState ({showModal: true});
			} else
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
							if (!me.unmounted) {
								me.setState (state);
							}
						}).catch (err => {
							console.error (err);
							state.error = err.message;

							if (!me.unmounted) {
								me.setState (state);
							}
						});
					} else {
						if (typeof (promise) == "string") {
							state.result = promise;
						}
						if (!me.unmounted) {
							me.setState (state);
						}
					}
				} catch (err) {
					console.error (err);
					state.error = err.message;
					me.setState (state);
				}
			}
		};
		if (me.props.confirm) {
			me.confirmResolve = result => {
				if (result) {
					execute ();
				}
			};
			me.setState ({confirm: typeof (me.props.confirm) == "string" ? me.props.confirm : i18n ("Are you sure?")});
		} else {
			execute ();
		}
	}
	
	async confirm (result) {
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
		let text;
		
		if (me.state.processing) {
			text = me.state.label ? (me.state.label + ": ") : "";
			text += me.state.value ? me.state.value : "";
			text += me.state.max ? (" / " + me.state.max) : "";
		}
		text = text || i18n ("Processing") + " ...";
		
		if (me.state.processing && !me.state.confirm) {
			return (
				<div className="text-primary p-1 mb-1 mx-1">
					<span className="spinner-border objectum-spinner mr-2" role="status" aria-hidden="true" />{text}
				</div>
			);
		}
		let ModalComponent = me.props.modalComponent;
		
		return (
			<div className={me.props.className}>
				<button
					type="button"
					className={me.props.btnClassName || "btn btn-primary btn-labeled mr-1 mb-1"}
					onClick={me.onClick}
					disabled={me.getDisabled ()}
				>
					{me.props.icon && <i className={me.props.icon + " mr-2"} />}
					{me.props.children ? me.props.children : (me.props.label || "")}
				</button>
{/*
				{me.state.error && <span>
					<span className="text-danger ml-1">{me.state.error}</span>
					<button type="button" className="btn btn-outline-primary btn-sm mx-1" onClick={me.onClose}>{i18n ("Close")}</button>
				</span>}
*/}
				{me.state.error && <Fade className="popup">
					<div className="popup-content bg-white shadow text-danger p-1">
						<div className="mb-1">{i18n (me.state.error)}</div>
						<button type="button" className="btn btn-outline-primary btn-sm" onClick={me.onClose}>{i18n ("Close")}</button>
					</div>
				</Fade>}
{/*
				{me.state.result && <span>
					<span className="text-success ml-1">{i18n (me.state.result)}</span>
					<button type="button" className="btn btn-outline-primary btn-sm mx-1" onClick={me.onClose}>{i18n ("Close")}</button>
				</span>}
*/}
				{me.state.result && <Fade className="popup">
					<div className="popup-content bg-white shadow text-success p-1">
						<div className="mb-1">{i18n (me.state.result)}</div>
						<button type="button" className="btn btn-outline-primary btn-sm" onClick={me.onClose}>{i18n ("Close")}</button>
					</div>
				</Fade>}
				{me.state.confirm && <Fade className="popup">
					<div className="popup-content bg-white shadow text-danger p-1">
						<div className="mb-1">{me.state.confirm}</div>
						<button type="button" className="btn btn-danger" onClick={() => me.confirm (true)}><i className="fas fa-check mr-2" />{i18n ("Yes")}</button>
						<button type="button" className="btn btn-success ml-1" onClick={() => me.confirm (false)}><i className="fas fa-times mr-2" />{i18n ("No")}</button>
					</div>
				</Fade>}
				{ModalComponent && <Modal
					isOpen={me.state.showModal}
					style={
						{
							content: me.props.modalStyle || OBJECTUM_APP.sidebar ? {
								marginLeft: "21em"
							} : {}
						}
					}
				>
					<div className="pb-2 mb-3 border-bottom">
						<button
							type="button" className="btn btn-link"
							onClick={() => me.setState ({showModal: false})}
						>
							<i className="fas fa-window-close fa-lg mr-2" /><span className="text-dark">{i18n ("Close")}</span>
						</button>
					</div>
					<ModalComponent recordId={me.state.recordId} store={me.props.store} grid={me.props.grid} />
				</Modal>}
			</div>
		);
	}
};
Action.displayName = "Action";

export default Action;

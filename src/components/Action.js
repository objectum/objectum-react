/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import Fade from "./Fade";
import Modal from "react-modal";

export default class Action extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			processing: false,
			label: "",
			value: "",
			max: "",
			showModal: false,
			showPopup: false,
			recordId: this.props.recordId
		};
		this._refs = {
			"confirm": React.createRef (),
			"popup": React.createRef (),
			"button": React.createRef ()
		};
	}
	
	onDocumentClick = (event) => {
		if (this.state.confirm && !this._refs ["confirm"].current.contains (event.target)) {
			this.confirm (false);
		}
	}
	
	componentDidMount () {
		Modal.setAppElement ("body");
		document.addEventListener ("mousedown", this.onDocumentClick)
	}
	
	componentDidUpdate (prevProps, prevState) {
		if (prevProps.recordId != this.props.recordId) {
			this.setState ({recordId: this.props.recordId});
		}
/*
		if (this.state.confirm && !prevState.confirm) {
			this._refs ["confirm"].current.scrollIntoView ();
		}
		if (this.state.showPopup && !prevState.showPopup) {
			this._refs ["popup"].current.scrollIntoView ();
		}
*/
	}
	
	componentWillUnmount () {
		this.unmounted = true;
		document.removeEventListener ("mousedown", this.onDocumentClick);
	}
	
	onClick = async () => {
		let execute = async () => {
			let handler = this.props.onClick || this.props.onClickSelected;
			let state = {processing: false, abort: false};
			
			if (this.props.popupComponent) {
				this.setState ({showPopup: !this.state.showPopup});
			} else
			if (this.props.modalComponent) {
				this.setState ({showModal: true});
			} else
			if (handler) {
				this.setState ({processing: true, label: "", value: "", max: "", start: new Date (), current: new Date ()});
				this.intervalId = setInterval (() => {
					if (this.unmounted) {
						return clearInterval (this.intervalId);
					}
					this.setState ({current: new Date ()});
				}, 200);
				
				try {
					if (this.props.transaction) {
						if (!this.props.store) {
							throw new Error ("Action.props.store not exist");
						}
						await this.props.store.startTransaction (typeof (this.props.transaction) == "string" ? this.props.transaction : undefined);
					}
					let promise = handler.call (this, {
						store: this.props.store,
						progress: ({label, value, max}) => {
							this.setState ({label, value, max});
						},
						confirm: (text) => {
							return new Promise (resolve => {
								this.confirmResolve = resolve;
								this.setState ({confirm: text || i18n ("Are you sure?")});
							});
						}
					});
					if (promise && promise.then) {
						promise.then (async (result) => {
							if (this.props.transaction && this.props.store) {
								await this.props.store.commitTransaction ();
							}
							if (typeof (result) == "string") {
								state.result = result;
							}
							if (!this.unmounted) {
								this.setState (state);
								clearInterval (this.intervalId);

								if (this.props.store) {
									this.props.store.abort = false;
								}
							}
						}).catch (async (err) => {
							console.error (err);

							if (this.props.transaction && this.props.store) {
								await this.props.store.rollbackTransaction ();
							}
							state.error = err.message;

							if (!this.unmounted) {
								this.setState (state);
								clearInterval (this.intervalId);

								if (this.props.store) {
									this.props.store.abort = false;
								}
							}
						});
					} else {
						if (typeof (promise) == "string") {
							state.result = promise;
						}
						if (!this.unmounted) {
							this.setState (state);
							clearInterval (this.intervalId);

							if (this.props.store) {
								this.props.store.abort = false;
							}
						}
					}
				} catch (err) {
					clearInterval (this.intervalId);

					if (this.props.store) {
						this.props.store.abort = false;
					}
					console.error (err);
					state.error = err.message;
					this.setState (state);
				}
			}
		};
		if (this.props.confirm) {
			this.confirmResolve = result => {
				if (result) {
					execute ();
				}
			};
			this.setState ({confirm: typeof (this.props.confirm) == "string" ? this.props.confirm : i18n ("Are you sure?")});
		} else {
			execute ();
		}
	}
	
	async confirm (result) {
		this.setState ({confirm: null});
		this.confirmResolve (result);
	}
	
	getDisabled () {
		let disabled;
		
		if (this.props.disabled) {
			if (typeof (this.props.disabled) == "function") {
				disabled = this.props.disabled ();
			} else {
				disabled = this.props.disabled;
			}
		} else {
			disabled = this.props.disableActions
		}
		if (this.state.processing) {
			disabled = true;
		}
		return disabled;
	}
	
	onClose = () => {
		this.setState ({error: "", result: ""});
	}
	
	onCancel = () => {
		this.setState ({abort: true});
		this.props.store.abortAction ();
	}
	
	render () {
		let progressText;
		
		if (this.state.processing) {
			progressText = this.state.label ? (this.state.label + ": ") : "";
			progressText += this.state.value ? this.state.value : "";
			progressText += this.state.max ? (" / " + this.state.max) : "";
		}
		progressText = progressText || i18n ("Processing") + " ...";
		
		let ModalComponent = this.props.modalComponent;
		let PopupComponent = this.props.popupComponent;
		let duration = (this.state.current && this.state.start) ? ((this.state.current.getTime () - this.state.start.getTime ()) / 1000) : 0;
		
		return <div className={this.props.className}>
			<button
				type="button"
				className={this.props.btnClassName || "btn btn-primary btn-labeled mr-1"}
				onClick={this.onClick}
				disabled={this.getDisabled ()}
				ref={this._refs ["button"]}
				title={this.props.title}
			>
				{this.props.icon && <i className={this.props.icon + (this.props.label ? " mr-2" : "")} />}
				{this.props.children ? this.props.children : (this.props.label || "")}
			</button>
			{this.state.error && <Fade className="popup">
				<div className="popup-content bg-white shadow-sm text-danger p-1 my-1">
					<div className="mb-1">{i18n (this.state.error)}</div>
					<button type="button" className="btn btn-outline-primary btn-sm" onClick={this.onClose}>{i18n ("Close")}</button>
				</div>
			</Fade>}
			{this.state.result && <Fade className="popup">
				<div className="popup-content bg-white shadow-sm text-success p-1 my-1">
					<div className="border p-1">
						{i18n (this.state.result)}
					</div>
					{duration > 2 ? <div className="p-1 my-1 text-info">
						{i18n ("Duration")}: {duration.toFixed (1)} {i18n ("sec.")}
					</div> : null}
					<button type="button" className="btn btn-outline-primary btn-sm mt-1" onClick={this.onClose}>{i18n ("Close")}</button>
				</div>
			</Fade>}
			{this.state.confirm && <Fade className="popup">
				<div className="popup-content bg-white shadow-sm text-danger p-1 my-1" ref={this._refs ["confirm"]}>
					<div className="mb-1">{this.state.confirm}</div>
					<button type="button" className="btn btn-danger" onClick={() => this.confirm (true)}><i className="fas fa-check mr-2" />{i18n ("Yes")}</button>
					<button type="button" className="btn btn-success ml-1" onClick={() => this.confirm (false)}><i className="fas fa-times mr-2" />{i18n ("No")}</button>
				</div>
			</Fade>}
			{this.state.processing && !this.state.confirm && !this.props.hideProgress && <Fade className="popup">
				<div className="popup-content bg-white shadow-sm text-primary p-1 my-1">
					<div className="border p-1">
						<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"/>{progressText}
					</div>
					{duration > 2 ? <div className="p-1 mt-1 text-info">
						{duration.toFixed (1)} {i18n ("sec.")}
					</div> : null}
					{this.props.store && <button type="button" className="btn btn-outline-danger btn-sm mt-1" onClick={this.onCancel} disabled={this.state.abort}>
						{i18n ("Cancel")}
					</button>}
				</div>
			</Fade>}
			{this.state.showPopup && <Fade className="popup">
				<div className="popup-component bg-white shadow-sm p-1 my-1" ref={this._refs ["popup"]}>
					<div className="mb-2 border-bottom d-flex justify-content-end">
						<button
							type="button" className="btn btn-link btn-sm"
							onClick={() => this.setState ({showPopup: false})}
						>{i18n ("Close")}</button>
					</div>
					<PopupComponent {...this.props} recordId={this.state.recordId} store={this.props.store} grid={this.props.grid} />
				</div>
			</Fade>}
			{ModalComponent && <Modal
				isOpen={this.state.showModal}
				style={
					{
						content: this.props.modalStyle || (window.OBJECTUM_APP && window.OBJECTUM_APP.sidebar) ? {
							marginLeft: "21em"
						} : {},
						overlay: {zIndex: 1000}
					}
				}
			>
				<div className="mb-2 pb-2 border-bottom d-flex justify-content-end">
					<button
						type="button" className="btn btn-link"
						onClick={() => this.setState ({showModal: false})}
					>{i18n ("Close")}</button>
				</div>
				<ModalComponent recordId={this.state.recordId} store={this.props.store} grid={this.props.grid} />
			</Modal>}
		</div>;
	}
};
Action.displayName = "Action";

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";
import {Grid, Tooltip, i18n, newId} from "..";

export default class ChooseField extends Component {
	constructor (props) {
		super (props);
		
		let choose = this.props.choose || {};
		
		this.state = {
			rsc: this.props.rsc || "record",
			code: this.props.property,
			value: this.props.value,
			visible: false,
			name: "",
			cmp: choose.cmp,
			query: choose.query,
			ref: choose.query ? "list" : choose.ref
		};
		if (!choose.ref && choose.cmp && choose.cmp.displayName == "ModelList") {
			this.state.ref = "list";
		}
		if (!this.props.disabled) {
			if (!choose.query && !choose.model && (!this.state.cmp || !this.state.ref)) {
				this.state.invalid = true;
			}
		}
		this._refs = {
			"component": React.createRef (),
			"list": React.createRef ()
		};
		this.id = newId ();
	}
	
	async updateName (value) {
		let name = "";
		
		if (value) {
			let o = await this.props.store.getRsc (this.state.rsc, value);
			
			name = o.getLabel ();
		}
		if (!this.unmounted) {
			this.setState ({name});
		}
	}
	
	onVisible = () => {
		this.setState ({visible: !this.state.visible});
	}
	
	onClear = () => {
		this.setState ({value: null, name: ""});
		
		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value: null, id: this.props.id});
		}
	}
	
	onChoose = () => {
		let cmp = this._refs ["list"].current;
		
		if (this.props.choose.cmp) {
			if (this._refs ["component"].current._refs) {
				cmp = this._refs ["component"].current._refs [this.state.ref].current;
			} else {
				cmp = this._refs ["component"].current.refs [this.state.ref];
			}
		}
		if (!cmp) {
			throw new Error (`not found choose.ref: ${this.state.ref}`);
		}
		let selected = cmp.state.selected;
		let value = "";
		
		if (selected !== null) {
			let recs = cmp.recs || cmp.state.recs;
			
			if (recs) {
				value = recs [selected].id;
			} else {
				value = selected;
			}
		}
		this.setState ({value, visible: false});
		this.updateName (value);

		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
	}
	
	async componentDidMount () {
		await this.updateName (this.state.value);
		Modal.setAppElement ("body");
	}
	
	componentWillUnmount () {
		this.unmounted = true;
	}
	
	async componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState ({value: this.props.value});
			await this.updateName (this.props.value);
		}
	}
	
	render () {
		let disabled = this.props.disabled;
		let addCls = this.props.error ? " is-invalid" : "";
		
		if (this.state.invalid) {
			return <div className="form-group">
				<label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>
				<div className="alert alert-danger">"choose: cmp, ref" or "choose: query" or "choose: model" not exist</div>
			</div>;
		}
		if (this.props.disabled) {
			return <div className="form-group">
				<label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>
				<Tooltip label={this.state.name}>
					<input type="text" className={"form-control" + addCls} id={this.id} value={this.state.name} disabled />
				</Tooltip>
			</div>;
		}
		let ChooseComponent = this.state.cmp;
		let props = {
			...this.props, addCls, disabled, value: this.state.value, localHash: true
		};
		let gridId = "list";
		
		if (this.props.choose.query) {
			gridId = "list-" + this.props.choose.query;
		}
		if (this.props.choose.model) {
			gridId = "list-" + this.props.choose.model;
		}
		return <div>
			<div className={(this.props.label || this.props.error) ? "form-group" : ""}>
				{this.props.label && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
				
				<div className="input-group dictfield">
					<input
						type="text"
						className={`form-control ${this.props.disabled ? "rounded" : "bg-white dictfield-input rounded-left border-primary"} dictfield-option ${addCls} ${this.props.sm ? "form-control-sm" : ""}`}
						id={this.id}
						value={this.state.name}
						title={this.state.name}
						onClick={this.onVisible}
						ref={this._refs ["inputDiv"]}
						readOnly
					/>
					{!this.props.disabled && <div className="input-group-append" style={{zIndex: 0}}>
						<button
							type="button"
							className={`btn btn-outline-primary ${this.props.sm ? "btn-sm" : ""}`}
							onClick={this.onClear}
							title={i18n ("Clear")}
						>
							<i className="fas fa-times" />
						</button>
					</div>}
				</div>
				{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
			</div>
			<Modal
				isOpen={this.state.visible}
				style={
					document.documentElement.clientWidth > 1000 ? {
						content: {
							left: "270px"
						}
					} : {}
				}
			>
				<div className="row">
					<div className="col-md mb-1">
						<button type="button" className="btn btn-primary mr-1" onClick={this.onChoose}><i className="fas fa-check mr-1" />{i18n ("Choose")}</button>
						<button type="button" className="btn btn-primary" onClick={() => this.setState ({visible: !this.state.visible})}><i className="fas fa-window-close mr-1" />{i18n ("Cancel")}</button>
					</div>
				</div>
				{this.props.choose.cmp ?
					<ChooseComponent {...props} {...this.props.choose} ref={this._refs ["component"]} disableActions /> :
					<Grid
						id={gridId}
						ref={this._refs ["list"]}
						store={this.props.store}
						{...this.props.choose}
					/>
				}
			</Modal>
		</div>;
	}
};
ChooseField.displayName = "ChooseField";

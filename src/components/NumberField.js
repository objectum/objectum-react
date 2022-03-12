/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n, newId} from "..";

export default class NumberField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			rsc: this.props.rsc || "record",
			code: this.props.property,
			value: (this.props.value === null || this.props.value === undefined) ? "" : this.props.value
		};
		this.id = newId ();
	}
	
	onChange = (val) => {
		let value = (val.target.value || "").match (/[0123456789.-]+/g) || "";
		
		if (value) {
			value = value [0];

			if (value.indexOf ("-") > -1) {
				value = `-${value.split ("-").join ("")}`;
			}
			let idx = value.indexOf (".");
			
			if (idx > -1) {
				value = value.split (".").join ("");
				value = `${value.substr (0, idx)}.${value.substr (idx)}`;
			}
		}
		this.setState ({value});
		
		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
	}

	onBlur = () => {
		let value = this.state.value;
		let changed = false;

		if (value) {
			let n = Number (value);

			if (this.props.hasOwnProperty ("min") && n < this.props.min) {
				value = this.props.min;
				changed = true;
			}
			if (this.props.hasOwnProperty ("max") && n > this.props.max) {
				changed = true;
				value = this.props.max;
			}
		}
		if (changed) {
			this.setState ({value});

			if (this.props.onChange) {
				this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
			}
		}
	}

	async componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState ({value: this.props.value === null || this.props.value === undefined ? "" : this.props.value});
		}
	}
	
	render () {
		let disabled = this.props.disabled;
		let addCls = this.props.error ? "is-invalid" : "";
		
		if (this.props.label || this.props.error) {
			return <div className="form-group">
				{this.props.label && !this.props.hideLabel && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
				<input type="text" className={`form-control ${addCls} numberfield`} id={this.id} value={this.state.value}
					   placeholder={i18n (this.props.placeholder || this.props.label)}
					   onChange={this.onChange} onBlur={this.onBlur} disabled={disabled} autoComplete="off" />
				{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
			</div>;
		} else {
			return <input type="text" className="form-control numberfield" value={this.state.value}
						  placeholder={i18n (this.props.placeholder || this.props.label)}
						  onChange={this.onChange} onBlur={this.onBlur} disabled={disabled} autoComplete="off" />;
		}
	}
};
NumberField.displayName = "NumberField";

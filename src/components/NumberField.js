/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "./../i18n";
import {newId} from "./helper";

class NumberField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value === null ? "" : me.props.value
		};
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = val.target.value;
		
		me.setState ({value});

		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
		}
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value});
		}
	}
	
	render () {
		let me = this;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? "is-invalid" : "";

		if (me.props.label || me.props.error) {
			return (
				<div className="form-group">
					{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
					<input type="number" className={`form-control form-control-sm ${addCls} numberfield`} id={me.id} value={me.state.value} onChange={me.onChange} disabled={disabled} min={me.props.min} max={me.props.max} />
					{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
				</div>
			);
		} else {
			return (
				<input type="number" className="form-control form-control-sm numberfield" value={me.state.value} onChange={me.onChange} disabled={disabled} min={me.props.min} max={me.props.max} />
			);
		}
	}
};
NumberField.displayName = "NumberField";

export default NumberField;

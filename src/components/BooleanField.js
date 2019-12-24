import React, {Component} from "react";
import {i18n} from "./../i18n";
import {newId} from "./helper";

class BooleanField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			code: me.props.property,
			value: me.props.value
		};
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = val.target.checked;
		
		me.setState ({value});

		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value, id: me.props.id});
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
		
		return (
			<div className="form-check mb-2">
				<input type="checkbox" className={`form-check-input ${addCls}`} id={me.id} checked={me.state.value} onChange={me.onChange} disabled={disabled} />
				<label className="form-check-label booleanfield" htmlFor={me.id}>
					{i18n (me.props.label)}
				</label>
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
BooleanField.displayName = "BooleanField";

export default BooleanField;

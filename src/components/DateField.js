import {getDateString} from "./helper";
import React, {Component} from "react";
import {i18n} from "./../i18n";
import {newId} from "./helper";

class DateField extends Component {
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
			me.props.onChange ({...me.props, code: me.state.code, value: value ? new Date (value) : value, id: me.props.id});
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
			<div className={(me.props.label || me.props.error) ? "form-group objectum-date" : ""}>
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
				<input type="date" className={`form-control ${addCls} datefield`} id={me.id} value={getDateString (me.state.value)} onChange={me.onChange} disabled={disabled} />
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
DateField.displayName = "DateField";

export default DateField;

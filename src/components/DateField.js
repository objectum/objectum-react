import {getDateString} from "./helper";
import React, {Component} from "react";
import {i18n} from "./../i18n";

class DateField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			value: me.props.value
		};
	}
	
	onChange (val) {
		let me = this;
		let v = val.target.value;
		
		me.setState ({value: v});
		me.props.onChange (val);
	}
	
	render () {
		let me = this;
		let id = me.props.attr || me.props.property || me.props.prop;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? "is-invalid" : "";
		
		return (
			<div className="form-group objectum-date">
				<label htmlFor={id}>{i18n (me.props.label)}</label>
				<input type="date" className={`form-control ${addCls} datefield`} id={id} value={getDateString (me.state.value)} onChange={me.onChange} disabled={disabled} />
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
DateField.displayName = "DateField";

export default DateField;

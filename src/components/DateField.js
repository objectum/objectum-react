import React, {Component} from "react";
import DatePicker from "react-datepicker";
import {i18n} from "./../i18n";
import {newId} from "./helper";
import "react-datepicker/dist/react-datepicker.css";

class DateField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value === null ? "" : (typeof (me.props.value) == "string" ? new Date (me.props.value) : me.props.value)
		};
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = val.target.value;
		let tokens = value.split ("-");
		
		if (Number (tokens [0]) < 1800) {
			return;
		}
		me.setState ({value});
		
		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value: value ? new Date (value) : value, id: me.props.id});
		}
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: typeof (me.props.value) == "string" ? new Date (me.props.value) : me.props.value});
		}
	}
	
	render () {
		let me = this;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? "is-invalid" : "";
		
		return (
			<div className={(me.props.label || me.props.error) ? "form-group objectum-date" : ""}>
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}{me.props.notNull && <span className="text-danger ml-1">*</span>}</label>}
				{/*<input type="date" className={`form-control ${addCls} datefield`} id={me.id} value={me.state.value} onChange={me.onChange} disabled={disabled} />*/}
				<div>
					<DatePicker
						className={`form-control ${addCls}`}
						dateFormat="dd.MM.yyyy"
						selected={me.state.value}
						onChange={date => {
							me.setState ({value: date});
	
							if (me.props.onChange) {
								me.props.onChange ({...me.props, code: me.state.code, value: date ? new Date (value) : value, id: me.props.id});
							}
						}}
					/>
				</div>
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
DateField.displayName = "DateField";

export default DateField;

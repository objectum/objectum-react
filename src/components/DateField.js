import React, {Component} from "react";
import DatePicker from "react-datepicker";
import {i18n} from "./../i18n";
import {newId} from "./helper";
import "react-datepicker/dist/react-datepicker.css";

class DateField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let value = me.props.value === null ? "" : me.props.value;
		
		if (value && typeof (value) == "string") {
			value = new Date (value);
		}
		console.log (value);
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value
		};
		me.id = newId ();
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			let value = me.props.value === null ? "" : me.props.value;
			
			if (value && typeof (value) == "string") {
				value = new Date (value);
			}
			me.setState ({value});
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
						onChange={value => {
							me.setState ({value});

							if (me.props.onChange) {
								me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
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

import React, {Component} from "react";
import {i18n} from "./../i18n";
import {newId} from "./helper";

class SelectField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value
		};
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = Number (val.target.value);
		
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
		let addCls = me.props.error ? " is-invalid" : "";

		if (!me.props.recs && !me.props.records) {
			return <div>recs or records not exist</div>
		}
		return (
			<div className={(me.props.label || me.props.error) ? "form-group" : ""}>
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}{me.props.notNull && <span className="text-danger ml-1">*</span>}</label>}
				<select className={"form-control custom-select" + addCls} id={me.id} value={me.state.value} onChange={me.onChange} disabled={disabled}>
					{[{id: "", name: "-"}, ...(me.props.recs || me.props.records)].map ((rec, i) => {
						return (
							<option value={rec.id} key={i}>{rec.getLabel ? rec.getLabel () : rec.name}</option>
						);
					})}
				</select>
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
SelectField.displayName = "SelectField";

export default SelectField;

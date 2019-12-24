import React, {Component} from "react";
import {i18n} from "./../i18n";
import {newId} from "./helper";

class SelectField extends Component {
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
		let value = val.target.value;
		
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
		let addCls = me.props.error ? " is-invalid" : "";

		return (
			<div className="form-group">
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
				<select className={"form-control custom-select" + addCls} id={me.id} value={me.state.value} onChange={me.onChange} disabled={disabled}>
					{[{id: "", name: "-"}, ...me.props.recs].map ((rec, i) => {
						return (
							<option value={rec.id} key={i}>{rec.name}</option>
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

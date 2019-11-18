import React, {Component} from "react";
import {i18n} from "./../i18n";

class SelectField extends Component {
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
		let addCls = me.props.error ? " is-invalid" : "";

		return (
			<div className="form-group">
				<label htmlFor={id}>{i18n (me.props.label)}</label>
				<select className={"form-control custom-select" + addCls} id={id} value={me.state.value} onChange={me.onChange} disabled={disabled}>
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

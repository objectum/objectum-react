import React, {Component} from "react";
import {i18n} from "./../i18n";

class BooleanField extends Component {
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
		
		if (val.target.type === "checkbox") {
			v = val.target.checked;
		}
		me.setState ({value: v});
		me.props.onChange (val);
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value});
		}
	}
	
	render () {
		let me = this;
		let id = me.props.id || me.props.attr || me.props.property || me.props.prop;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? "is-invalid" : "";
		
		return (
			<div className="form-check mb-2">
				<input type="checkbox" className={`form-check-input ${addCls}`} id={id} checked={me.state.value} onChange={me.onChange} disabled={disabled} />
				<label className="form-check-label booleanfield" htmlFor={id}>
					{i18n (me.props.label)}
				</label>
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
BooleanField.displayName = "BooleanField";

export default BooleanField;

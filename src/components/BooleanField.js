import React, {Component} from "react";

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
	
	render () {
		let me = this;
		let id = me.props.attr;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";
		
		return (
			<div className="form-check">
				<input type="checkbox" className={"form-check-input" + addCls} id={id} checked={me.state.value} onChange={me.onChange} disabled={disabled} />
				<label className="form-check-label" htmlFor={id}>
					{me.props.label}
				</label>
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};

export default BooleanField;

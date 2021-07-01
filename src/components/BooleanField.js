import React, {Component} from "react";
import {i18n, newId} from "..";

export default class BooleanField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			rsc: this.props.rsc || "record",
			code: this.props.property,
			value: this.props.value || ""
		};
		this.id = newId ();
	}
	
	onChange = (val) => {
		let value = val.target.checked;
		
		this.setState ({value});

		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
	}
	
	async componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState ({value: this.props.value || ""});
		}
	}
	
	render () {
		let disabled = this.props.disabled;
		let addCls = this.props.error ? "is-invalid" : "";
		
		return <div className="form-check mb-2">
			<input type="checkbox" className={`form-check-input boolean-check ${addCls}`} id={this.id} checked={this.state.value} onChange={this.onChange} disabled={disabled} />
			<label className="form-check-label" htmlFor={this.id}>
				{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}
			</label>
			{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
		</div>;
	}
};
BooleanField.displayName = "BooleanField";

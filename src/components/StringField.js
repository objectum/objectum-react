/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {loadCSS, loadJS} from "./helper";
import {i18n} from "./../i18n";

class StringField extends Component {
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
	
	async componentDidMount () {
		let me = this;
		
		if (me.props.codemirror) {
			if (!window.CodeMirror) {
				await loadCSS ("/public/codemirror/codemirror.css");
				await loadJS ("/public/codemirror/codemirror.js");
			}
			if (window.CodeMirror) {
				me.codemirror = window.CodeMirror.fromTextArea (me.refs.codemirror, {
					lineNumbers: true,
					indentUnit: 4,
					readOnly: !!me.props.disabled,
					mode: "javascript"
				});
				me.codemirror.on ("change", function () {
					me.onChange ({
						target: {
							id: me.props.attr || me.props.property || me.props.prop,
							value: me.codemirror.getValue ()
						}
					});
				});
			}
		}
	}
	
	render () {
		let me = this;
		let id = me.props.attr || me.props.property || me.props.prop;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";
		let cmp = <input type={me.props.secure ? "password" : "text"} className={"form-control" + addCls} id={id} value={me.state.value} onChange={me.onChange} disabled={disabled} />;
		
		if (me.props.textarea) {
			cmp = <textarea className={"form-control" + addCls} id={id} value={me.state.value} onChange={me.onChange} disabled={disabled} rows={me.props.rows || 5} />;
		}
		if (me.props.codemirror) {
			cmp = (
				<div className="border">
					<textarea ref="codemirror" className={"form-control" + addCls} id={id} value={me.state.value} onChange={me.onChange} />
				</div>
			);
		}
		return (
			<div className="form-group">
				{me.props.label && <label htmlFor={id}>{i18n (me.props.label)}</label>}
				{cmp}
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
StringField.displayName = "StringField";

export default StringField;

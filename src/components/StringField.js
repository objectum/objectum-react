/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {loadCSS, loadJS} from "./helper";
import {i18n} from "./../i18n";
import {newId} from "./helper";

class StringField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);

		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value === null ? "" : me.props.value
		};
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = val.target.value;
		
		me.setState ({value});

		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
		}
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.props.codemirror) {
			if (!window.CodeMirror) {
				await loadCSS (`${me.props.store.getUrl ()}/public/codemirror/codemirror.css`);
				await loadJS (`${me.props.store.getUrl ()}/public/codemirror/codemirror.js`);
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
		let cmp = <input type={me.props.secure ? "password" : "text"} className={"form-control form-control-sm" + addCls} id={me.id} value={me.state.value} onChange={me.onChange} disabled={disabled} />;
		
		if (me.props.textarea) {
			cmp = <textarea className={"form-control" + addCls} id={me.id} value={me.state.value} onChange={me.onChange} disabled={disabled} rows={me.props.rows || 5} />;
		}
		if (me.props.codemirror) {
			cmp = (
				<div className="border">
					<textarea ref="codemirror" className={"form-control" + addCls} id={me.id} value={me.state.value} onChange={me.onChange} />
				</div>
			);
		}
		return (
			<div className={(me.props.label || me.props.error) ? "form-group stringfield" : ""}>
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
				{cmp}
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
StringField.displayName = "StringField";

export default StringField;

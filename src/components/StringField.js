/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {loadCSS, loadJS, i18n, getLocale, newId, getStore} from "..";

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
		me.store = getStore ();
		me.id = "stringfield-" + newId ();
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
		
		if (me.props.wysiwyg && !window.Quill) {
			await loadCSS (`${me.store.getUrl ()}/public/quill/quill.snow.css`);
			await loadJS (`${me.store.getUrl ()}/public/quill/quill.js`);
		}
		if (document.getElementById (me.id)) {
			me.quill = new Quill (`#${me.id}`, {
				theme: "snow"
			});
			if (me.state.value) {
				me.quill.clipboard.dangerouslyPasteHTML (me.state.value);
			}
			me.quill.on ("text-change", function (delta, oldDelta, source) {
				let value = me.quill.root.innerHTML;
				me.setState ({value});
				
				if (me.props.onChange) {
					me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
				}
			});
		}
	}

	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value === null ? "" : me.props.value});
		}
	}
	
	onKeyDown (e) {
		let ta = e.target;
		
		if (e.key === "Tab") {
			let val = ta.value, start = ta.selectionStart, end = ta.selectionEnd;
			
			ta.value = val.substring (0, start) + "\t" + val.substring (end);
			ta.selectionStart = ta.selectionEnd = start + 1;
			
			e.preventDefault ();
		}
	}
	
	render () {
		let me = this;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";
		let cmp = <input type={me.props.secure ? "password" : "text"} className={"form-control" + addCls} id={me.id} value={me.state.value || ""} onChange={me.onChange} disabled={disabled} />;
		
		if (me.props.textarea) {
			cmp = (
				<textarea
					className={`form-control${addCls} ${me.props.monospace ? "text-monospace" : ""}`}
					id={me.id}
					value={me.state.value || ""}
					onKeyDown={me.onKeyDown}
					onChange={me.onChange}
					disabled={disabled}
					rows={me.props.rows || 5}
				/>
			);
		}
		if (me.props.wysiwyg) {
			cmp = (
				<div className="border p-1" id={me.id} />
			);
		}
		return (
			<div className={(me.props.label || me.props.error) ? "form-group stringfield" : "stringfield"}>
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}{me.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
				{cmp}
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
StringField.displayName = "StringField";

export default StringField;

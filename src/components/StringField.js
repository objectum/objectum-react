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
		
		if (me.props.regexp) {
			value = ((value || "").match (me.props.regexp) || []).join ("");
		}
		me.setState ({value});
		
		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
		}
	}
	
	onChangeTime = ({hour, minute}) => {
		hour = hour || this.state.hour || "00";
		minute = minute || this.state.minute || "00";
		
		if (hour) {
			this.setState ({hour});
		}
		if (minute) {
			this.setState ({minute});
		}
		this.onChange ({target: {value: `${hour}:${minute}`}});
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.props.wysiwyg) {
			if (!window.Quill) {
				await loadCSS (`${me.store.getUrl ()}/public/quill/quill.snow.css`);
				await loadJS (`${me.store.getUrl ()}/public/quill/quill.js`);
			}
			if (document.getElementById (me.id)) {
				me.quill = new Quill (`#${me.id}`, {
					modules: me.props.modules || {
						toolbar: [
							["bold", "italic", "underline", "strike"],
							[{"list": "ordered"}, {"list": "bullet"}, {"script": "sub"}, {"script": "super"}],
							[{"indent": "-1"}, {"indent": "+1"}],
							[{"align": []}],
							[{"header": [1, 2, 3, 4, 5, 6, false]}],
							[{"color": []}, {"background": []}],
							["link", "image", "code"]
						]
					},
					readOnly: me.props.disabled || me.props.readOnly,
					placeholder: me.props.placeholder,
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
		let cmp = <input
			type={me.props.secure ? "password" : "text"}
			className={"form-control" + addCls}
			id={me.id} value={me.state.value || ""}
			onChange={me.onChange}
			disabled={disabled}
			placeholder={me.props.placeholder}
		/>;
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
					placeholder={me.props.placeholder}
				/>
			);
		}
		if (me.props.wysiwyg) {
			cmp = (
				<div className="border p-1" id={me.id} />
			);
		}
		if (me.props.time) {
			console.log (me.state.value, me.props);
			let hours = [], minutes = [];
			
			for (let i = 0; i < 60; i ++) {
				if (i < 24) {
					hours.push (String (i).padStart (2, "0"));
				}
				minutes.push (String (i).padStart (2, "0"));
			}
			let hour = "", minute = "";
			
			if (me.state.value) {
				let tokens = me.state.value.split (":");
				
				if (tokens.length == 2) {
					hour = tokens [0];
					minute = tokens [1];
				}
			}
			cmp = (
				<div className="d-flex">
					<select
						className="custom-select" style={{width: "5em"}}
						value={hour}
						onChange={val => this.onChangeTime ({hour: val.target.value})}
					>
						{hours.map ((v, i) => {
							return <option key={i} value={v}>{v}</option>;
						})}
					</select>
					<select
						className="custom-select" style={{width: "5em"}}
						value={minute}
						onChange={val => this.onChangeTime ({minute: val.target.value})}
					>
						{minutes.map ((v, i) => {
							return <option key={i} value={v}>{v}</option>;
						})}
					</select>
				</div>
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

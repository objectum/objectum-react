/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {loadCSS, loadJS, i18n, getLocale, newId, getStore, Tree} from "..";
import _isEmpty from "lodash.isempty";

export default class StringField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			rsc: this.props.rsc || "record",
			code: this.props.property,
			value: this.props.value === null ? "" : this.props.value,
			regexp: this.props.regexp,
			showDialog: false
		};
		if (this.state.regexp && typeof (this.state.regexp) == "string") {
			this.state.regexp = eval (this.state.regexp);
		}
		this.state.lastValidValue = this.state.value;
		this.store = getStore () || this.props.store;
		this.id = "stringfield-" + newId ();
	}
	
	onChange = (val) => {
		let value = val.target.value;
		let valid = true;
		let state = {value, showDialog: true};
		
		if (this.state.regexp && !this.state.regexp.test (value)) {
			valid = false;
		} else {
			state.lastValidValue = value;
		}
		if (this.props.onChange && valid) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
		this.setState (state);
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
		if (!this.store && this.props.store) {
			this.store = this.props.store;
		}
		if (this.props.wysiwyg) {
			if (!window.Quill) {
				await loadCSS (`${this.store.getUrl ()}/public/quill/quill.snow.css`);
				await loadJS (`${this.store.getUrl ()}/public/quill/quill.js`);
			}
			if (document.getElementById (this.id)) {
				this.quill = new Quill (`#${this.id}`, {
					modules: this.props.modules || {
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
					readOnly: this.props.disabled || this.props.readOnly,
					placeholder: this.props.placeholder,
					theme: "snow"
				});
				if (this.state.value) {
					this.quill.clipboard.dangerouslyPasteHTML (this.state.value);
				}
				this.quill.on ("text-change", (delta, oldDelta, source) => {
					let value = this.quill.root.innerHTML;
					this.setState ({value});
					
					if (this.props.onChange) {
						this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
					}
				});
			}
		}
	}

	async componentDidUpdate (prevProps) {
		let state = {};
		
		if (prevProps.value !== this.props.value) {
			state.value = this.props.value === null ? "" : this.props.value;
		}
		if (prevProps.regexp !== this.props.regexp) {
			let regexp = this.props.regexp;
			
			if (regexp && typeof (regexp) == "string") {
				regexp = eval (regexp);
			}
			state.regexp = regexp;
		}
		if (!_isEmpty (state)) {
			this.setState (state);
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
	
	onBlur = () => {
		let state = {showDialog: false};
		if (this.state.regexp && this.state.value && !this.state.regexp.test (this.state.value)) {
			state.value = this.state.lastValidValue;
		}
		this.setState (state);
	}

	renderValues () {
		if (this.state.showDialog && this.props.values && this.state.value) {
			let values = this.props.values.filter (v => v.indexOf (this.state.value) > -1);
			if (values.length) {
				if (values.length == 1 && values [0] == this.state.value) {
					return;
				}
				let records = values.map (v => {
					return {id: v, name: v};
				});
				return <div className="dictfield-dialog text-left">
					<div className="dictfield-tree border p-1 bg-white shadow">
						<Tree records={records} highlightText={this.state.value} onChoose={({id}) => {
							this.onChange ({target: {value: id}});
						}} />
					</div>
				</div>;
			}
		}
	}

	render () {
		let disabled = this.props.disabled;
		let valid = true;
		let error = this.props.error;

		if (this.state.regexp && this.state.value && !this.state.regexp.test (this.state.value)) {
			valid = false;
			error = i18n ("Invalid value");
			
			if (this.props.exampleValue) {
				error += `. ${i18n ("Example")}: ${this.props.exampleValue}`;
			}
		}
		let addCls = (error || !valid) ? " is-invalid" : "";

		let cmp = <input
			type={this.props.secure ? "password" : "text"}
			className={"form-control" + addCls}
			id={this.id} value={this.state.value || ""}
			onChange={this.onChange}
			onBlur={this.onBlur}
			disabled={disabled}
			placeholder={this.props.placeholder}
		/>;
		if (this.props.textarea) {
			cmp = <textarea
				className={`form-control${addCls} ${this.props.monospace ? "text-monospace" : ""}`}
				id={this.id}
				value={this.state.value || ""}
				onKeyDown={this.onKeyDown}
				onChange={this.onChange}
				disabled={disabled}
				rows={this.props.rows || 5}
				placeholder={this.props.placeholder}
			/>;
		}
		if (this.props.wysiwyg) {
			cmp = <div className="border p-1" id={this.id} />;
		}
		if (this.props.time) {
			let hours = [], minutes = [];
			
			for (let i = 0; i < 60; i ++) {
				if (i < 24) {
					hours.push (String (i).padStart (2, "0"));
				}
				minutes.push (String (i).padStart (2, "0"));
			}
			let hour = "", minute = "";
			
			if (this.state.value) {
				let tokens = this.state.value.split (":");
				
				if (tokens.length == 2) {
					hour = tokens [0];
					minute = tokens [1];
				}
			}
			cmp = <div className="d-flex">
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
			</div>;
		}
		return <div className={(this.props.label || error) ? "form-group stringfield" : "stringfield"}>
			{this.props.label && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
			{cmp}
			{this.renderValues ()}
			{error && <div className="invalid-feedback">{error}</div>}
		</div>;
	}
};
StringField.displayName = "StringField";

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {EditorState, convertToRaw, ContentState} from "draft-js";
import {Editor} from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {loadCSS, loadJS} from "./helper";
import {i18n, getLocale} from "./../i18n";
import {newId} from "./helper";

class StringField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onEditorStateChange = me.onEditorStateChange.bind (me);

		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value === null ? "" : me.props.value
		};
		if (me.props.wysiwyg) {
			const html = me.state.value || "<p />";
			const contentBlock = htmlToDraft (html);
			
			if (contentBlock) {
				const contentState = ContentState.createFromBlockArray (contentBlock.contentBlocks);
				
				me.state.editorState = EditorState.createWithContent (contentState);
			}
		}
		me.id = newId ();
	}
	
/*
	onEditorStateChange: Function = (editorState) => {
		let me = this;
		let value = draftToHtml (convertToRaw (editorState.getCurrentContent ()));
		
		me.setState ({
			editorState,
			value
		});
		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value});
		}
	}
*/
	onEditorStateChange (editorState) {
		let me = this;
		let value = draftToHtml (convertToRaw (editorState.getCurrentContent ()));
		
		me.setState ({
			editorState,
			value
		});
		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value});
		}
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
		if (me.props.codemirror) {
			cmp = (
				<div className="border">
					<textarea ref="codemirror" className={"form-control" + addCls} id={me.id} value={me.state.value} onChange={me.onChange} />
				</div>
			);
		}
		if (me.props.wysiwyg) {
			cmp = (
				<div className="border p-1">
					<Editor
						editorState={me.state.editorState}
						wrapperClassName="demo-wrapper"
						editorClassName="demo-editor"
						onEditorStateChange={me.onEditorStateChange}
						localization={{
							locale: getLocale ()
						}}
					/>
				</div>
			);
		}
		return (
			<div className={(me.props.label || me.props.error) ? "form-group stringfield" : "stringfield"}>
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}{me.props.notNull && <span className="text-danger ml-1">*</span>}</label>}
				{cmp}
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
StringField.displayName = "StringField";

export default StringField;

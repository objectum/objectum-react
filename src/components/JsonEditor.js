/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {loadCSS, loadJS} from "./helper";
import {i18n} from "../i18n";
import _ from "lodash";

class JsonEditor extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onChangeTag = me.onChangeTag.bind (me);
		me.onChangeTagValue = me.onChangeTagValue.bind (me);
		
		me.state = {
			value: me.props.value,
			tags: [],
			tag: "",
			tagValue: ""
		};
	}
	
	async componentDidMount () {
		let me = this;
		
		if (!window.CodeMirror) {
			await loadCSS (`${me.props.store.getUrl ()}/public/codemirror/codemirror.css`);
			await loadJS (`${me.props.store.getUrl ()}/public/codemirror/codemirror.js`);
		}
		if (window.CodeMirror && me.refs.codemirror) {
			me.codemirror = window.CodeMirror.fromTextArea (me.refs.codemirror, {
				lineNumbers: true,
				indentUnit: 4,
				readOnly: !!me.props.disabled,
				mode: "javascript"
			});
			me.codemirror.on ("change", function () {
				me.onChange (me.codemirror.getValue ());
			});
			me.codemirror.setSize ("100%", 298);
			me.codemirrorTag = window.CodeMirror.fromTextArea (me.refs.codemirrorTag, {
				lineNumbers: true,
				indentUnit: 4,
				readOnly: !!me.props.disabled,
				mode: "javascript"
			});
			me.codemirrorTag.setSize ("100%", 262);
			me.codemirrorTag.on ("change", me.onChangeTagValue);
		}
		me.updateTags ();
	}
	
	updateTags (s) {
		let me = this;
		let l = [];
		
		function process (opts, prefix = "") {
			for (let a in opts) {
				let o = opts [a];
				
				if (typeof (o) == "object") {
					process (o, prefix ? (prefix + "." + a) : a);
				}
				if (typeof (o) == "string") {
					l.push ((prefix ? (prefix + ".") : "") + a);
				}
			}
		};
		let opts = s || me.state.value || "{}";
		
		try {
			opts = JSON.parse (opts);
			process (opts);
		} catch (err) {
		}
		let state = {
			tags: l.map (s => {
				return {id: s, name: s};
			})
		};
		if (!l.length) {
			state.tag = "";
			state.tagValue = "";
			
			if (me.codemirrorTag) {
				me.codemirrorTag.setValue ("");
			}
		}
		me.setState (state);
	}

	onChange (s) {
		let me = this;

		me.updateTags (s);
		me.setState ({value: s});
		me.props.onChange ({target: {id: me.id, value: s}});
	}
	
	onChangeTag (val) {
		let me = this;
		let v = val.target.value;
		let tagValue = "";
		
		try {
			tagValue = _.get (JSON.parse (me.state.value), v) || "";
		} catch (err) {
		}
		me.codemirrorTag.off ("change", me.onChangeTagValue);
		me.codemirrorTag.setValue (tagValue);
		me.codemirrorTag.on ("change", me.onChangeTagValue);
		me.setState ({tag: v, tagValue});
	}
	
	onChangeTagValue () {
		let me = this;
		let s = me.codemirrorTag.getValue ();
		
		if (me.state.tag) {
			let v = me.codemirror.getValue ();
			
			try {
				let opts = JSON.parse (v);
				
				_.set (opts, me.state.tag, s);
				
				v = JSON.stringify (opts, null, "\t");
				me.codemirror.setValue (v);
				me.setState ({tagValue: s, value: s});
			} catch (err) {
			}
		}
	}
	
	render () {
		let me = this;
		
		me.id = me.props.attr || me.props.property || me.props.prop;
		
		let cls = me.state.tag ? "visible" : "invisible";
		
		return (
			<div className="form-group border p-1">
				<label htmlFor={me.id}><h6>{i18n (me.props.label)}</h6></label>
				<div className="row">
					<div className="col-sm-6 pr-1" id={me.id}>
						<div className="border jsoneditor-codemirror">
							<textarea ref="codemirror" value={me.state.value} onChange={() => {}} />
						</div>
					</div>
					<div className="col-sm-6 pl-1">
						<select className={"form-control custom-select"} value={me.state.tag} onChange={me.onChangeTag}>
							{[{id: "", name: i18n ("Select tag to edit")}, ...me.state.tags].map ((rec, i) => {
								return (
									<option value={rec.id} key={i}>{rec.name}</option>
								);
							})}
						</select>
						<div className={"border mt-1 " + cls}>
							<textarea ref="codemirrorTag" value={me.state.tagValue} onChange={() => {}} />
						</div>
					</div>
				</div>
			</div>
		);
	}
};
JsonEditor.displayName = "JsonEditor";

export default JsonEditor;

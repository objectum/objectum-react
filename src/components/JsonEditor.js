/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import _set from "lodash.set";
import _get from "lodash.get";
import {newId} from "./helper";

class JsonEditor extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onChangeTag = me.onChangeTag.bind (me);
		me.onChangeTagValue = me.onChangeTagValue.bind (me);
		
		me.state = {
			code: me.props.property,
			value: me.props.value || "",
			tags: [],
			tag: "",
			tagValue: ""
		};
		me.id = newId ();
	}
	
	async componentDidMount () {
		this.updateTags ();
	}
	
	updateTags (s) {
		let me = this;
		let l = [];
		
		function process (opts, prefix = "") {
			for (let a in opts) {
				let o = opts [a];
				
				if (typeof (o) == "object" && !Array.isArray (o)) {
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
		}
		me.setState (state);
	}

	onChange (val) {
		let value = val.target.value;
		let me = this;

		me.updateTags (value);
		me.setState ({value});

		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value, id: me.props.id});
		}
	}
	
	onChangeTag (val) {
		let me = this;
		let v = val.target.value;
		let tagValue = "";
		
		try {
			tagValue = _get (JSON.parse (me.state.value), v) || "";
		} catch (err) {
		}
		me.setState ({tag: v, tagValue});
	}
	
	onChangeTagValue (val) {
		let me = this;
		let value = val.target.value;
		
		if (me.state.tag) {
			try {
				let opts = JSON.parse (me.state.value);
				
				_set (opts, me.state.tag, value);
				opts = JSON.stringify (opts, null, "\t");
				
				me.setState ({tagValue: value, value: opts});

				if (me.props.onChange) {
					me.props.onChange ({code: me.state.code, value: opts, id: me.props.id});
				}
			} catch (err) {
			}
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
		let cls = me.state.tag ? "visible" : "invisible";
		
		return (
			<div className="form-group border p-1">
				<label htmlFor={me.id}><h5>{i18n (me.props.label)}</h5></label>
				<div className="row">
					<div className="col-sm-6 pr-1" id={me.id}>
						<div className="">
							<textarea className="form-control text-monospace" rows={10} style={{width: "100%", height: "100%"}} value={me.state.value} onKeyDown={me.onKeyDown} onChange={me.onChange} />
						</div>
					</div>
					<div className="col-sm-6 pl-1">
						<select className={"form-control custom-select"} value={me.state.tag} onChange={me.onChangeTag}>
							{[{id: "", name: i18n ("Select text tag to edit")}, ...me.state.tags].map ((rec, i) => {
								return (
									<option value={rec.id} key={i}>{rec.name}</option>
								);
							})}
						</select>
						<div className={"mt-1 " + cls}>
							<textarea className="form-control text-monospace" rows={8} style={{width: "100%", height: "100%"}} value={me.state.tagValue} onKeyDown={me.onKeyDown} onChange={me.onChangeTagValue} />
						</div>
					</div>
				</div>
			</div>
		);
	}
};
JsonEditor.displayName = "JsonEditor";

export default JsonEditor;

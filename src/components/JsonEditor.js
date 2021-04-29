/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import _set from "lodash.set";
import _get from "lodash.get";
import {i18n, newId} from "..";

export default class JsonEditor extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			code: this.props.property,
			value: this.props.value || "",
			tags: [],
			tag: "",
			tagValue: ""
		};
		this.id = newId ();
	}
	
	async componentDidMount () {
		this.updateTags ();
	}
	
	updateTags (s) {
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
		let opts = s || this.state.value || "{}";
		
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
		this.setState (state);
	}

	onChange = (val) => {
		let value = val.target.value;

		this.updateTags (value);
		this.setState ({value});

		if (this.props.onChange) {
			this.props.onChange ({code: this.state.code, value, id: this.props.id});
		}
	}
	
	onChangeTag = (val) => {
		let v = val.target.value;
		let tagValue = "";
		
		try {
			tagValue = _get (JSON.parse (this.state.value), v) || "";
		} catch (err) {
		}
		this.setState ({tag: v, tagValue});
	}
	
	onChangeTagValue = (val) => {
		let value = val.target.value;
		
		if (this.state.tag) {
			try {
				let opts = JSON.parse (this.state.value);
				
				_set (opts, this.state.tag, value);
				opts = JSON.stringify (opts, null, "\t");
				
				this.setState ({tagValue: value, value: opts});

				if (this.props.onChange) {
					this.props.onChange ({code: this.state.code, value: opts, id: this.props.id});
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
		let cls = this.state.tag ? "visible" : "invisible";
		
		return <div className="form-group border p-1">
			<label htmlFor={this.id}><h5>{i18n (this.props.label)}</h5></label>
			<div className="row">
				<div className="col-sm-6 pr-1" id={this.id}>
					<div className="">
						<textarea className="form-control text-monospace" rows={10} style={{width: "100%", height: "100%"}} value={this.state.value} onKeyDown={this.onKeyDown} onChange={this.onChange} />
					</div>
				</div>
				<div className="col-sm-6 pl-1">
					<select className={"form-control custom-select"} value={this.state.tag} onChange={this.onChangeTag}>
						{[{id: "", name: i18n ("Select text tag to edit")}, ...this.state.tags].map ((rec, i) => {
							return (
								<option value={rec.id} key={i}>{rec.name}</option>
							);
						})}
					</select>
					<div className={"mt-1 " + cls}>
						<textarea className="form-control text-monospace" rows={8} style={{width: "100%", height: "100%"}} value={this.state.tagValue} onKeyDown={this.onKeyDown} onChange={this.onChangeTagValue} />
					</div>
				</div>
			</div>
		</div>;
	}
};
JsonEditor.displayName = "JsonEditor";

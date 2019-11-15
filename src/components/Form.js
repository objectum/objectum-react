/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import NumberField from "./NumberField";
import DateField from "./DateField";
import BooleanField from "./BooleanField";
import SelectField from "./SelectField";
import ChooseField from "./ChooseField";
import FileField from "./FileField";
import {i18n} from "./../i18n";

class Form extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			ready: false,
			rid: me.props.rid
		};
		me.fileMap = {};
		me.onChange = me.onChange.bind (me);
		me.onSave = me.onSave.bind (me);
		me.onCreate = me.onCreate.bind (me);
		me.onRefresh = me.onRefresh.bind (me);
		me.map = {};
	}
	
	async componentDidMount () {
		let me = this;
		let state = {};

		try {
			if (me.props.rsc && me.props.rid) {
				me.object = await me.props.store.getRsc (me.props.rsc, me.props.rid);
				
				if (me.props.rsc == "record") {
					me.cls = me.props.store.getModel (me.object.get ("model"));
				}
			}
			if (!me.cls && me.props.rsc == "record" && me.props.mid) {
				me.cls = me.props.store.getModel (me.props.mid);
			}
			for (let attr in me.map) {
				let value = me.map [attr].value || "";
				
				if (me.object) {
					value = me.object.get (attr) || "";
				}
				state [attr] = value;
				
				if (me.cls) {
					let ca = me.cls.attrs [attr];

					if (!ca) {
						throw new Error (`unknown property: ${attr}`);
					}
					me.map [attr].type = ca.get ("type");
					me.map [attr].label = me.map [attr].label || ca.get ("name");
					me.map [attr].notNull = ca.get ("notNull");
					me.map [attr].secure = ca.get ("secure");

					if (ca.get ("type") >= 1000 && me.map [attr].dict) {
						let cls = me.props.store.getModel (ca.get ("type"));
						
						me.map [attr].recs = await me.props.store.getDict (cls.getPath ());
					}
				} else {
					me.map [attr].notNull = me.map [attr].notNull || false;
				}
				me.map [attr].value = value;
			}
			state.ready = true;
		} catch (err) {
			state.error = err.message;
			console.log (err.stack);
		}
		me.setState (state);
	}
	
	onChange (val, file) {
		let me = this;
		let id = val.target.id;
		let v = val.target.value;
		
		if (val.target.type === "checkbox") {
			v = val.target.checked;
		}
		if (file) {
			me.fileMap [id] = file;
		}
		me.setState ({[id]: v});
		
		if (me.props.onChange) {
			me.props.onChange (id, v);
		}
	}
	
	async upload ({sessionId, objectId, classAttrId, name, file}) {
		let formData = new FormData ();
		
		formData.append ("objectId", objectId);
		formData.append ("classAttrId", classAttrId);
		formData.append ("name", name);
		formData.append ("file", file);
		
		let url = this.props.store.getUrl ();
		
		if (url [url.length - 1] == "/") {
			url = url.substr (0, url.length - 1);
		}
		await fetch (`${url}/upload?sessionId=${sessionId}`, {
			method: "POST",
			body: formData
		});
	};
	
	async onSave () {
		let me = this;
		
		if (!me.isValid ()) {
			return;
		}
		me.setState ({saving: true});
		await me.props.store.startTransaction (`Saving rsc: ${me.props.rsc}, rid: ${me.state.rid}`);
		
		let state = {saving: false};
		
		try {
			for (let attr in me.map) {
				let ma = me.map [attr];
				
				if (me.state.hasOwnProperty (attr) && me.state [attr] !== me.map [attr].value) {
					let v = me.state [attr];
					
					if (v && (ma.type == 2 || ma.type >= 1000)) {
						v = Number (v);
					}
					if (ma.secure) {
						v = require ("crypto").createHash ("sha1").update (String (v)).digest ("hex").toUpperCase ();
					}
					ma.value = v;
					
					if (v === "") {
						v = null;
					}
					me.object.set (attr, v);
				}
			}
			await me.object.sync ();

			for (let attr in me.map) {
				if (me.fileMap [attr]) {
					let cls = me.props.store.getModel (me.object.get ("model"));
					
					await me.upload ({
						sessionId: me.props.store.getSessionId (),
						objectId: me.object.get ("id"),
						classAttrId: cls.attrs [attr].get ("id"),
						name: me.object.get (attr),
						file: me.fileMap [attr]
					});
				}
			}
			await me.props.store.commitTransaction ();
			state.error = "";
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			state.error = err.message;
			console.error (err.stack);
		}
		me.setState (state);
	}
	
	async onCreate () {
		let me = this;
		
		if (!me.isValid ()) {
			return;
		}
		me.setState ({creating: true});
		
		await me.props.store.startTransaction (`Creating rsc: ${me.props.rsc}${me.props.mid ? `, mid: ${me.props.mid}` : ""}`);
		
		let state = {creating: false};
		
		try {
			let attrs = {};
			
			if (me.props.rsc == "record") {
				attrs ["model"] = me.props.mid;
			}
			for (let attr in me.map) {
				let ma = me.map [attr];
				
				if (me.state.hasOwnProperty (attr)) {
					let v = me.state [attr];
					
					if (v && (ma.type == 2 || ma.type >= 1000)) {
						v = Number (v);
					}
					if (ma.secure) {
						v = require ("crypto").createHash ("sha1").update (String (v)).digest ("hex").toUpperCase ();
					}
					ma.value = v;
					
					if (v === "") {
						v = null;
					}
					attrs [attr] = v;
				}
			}
			me.object = await me.props.store.createRsc (me.props.rsc, attrs);
			state.rid = me.object.get ("id");
			state.error = "";
			await me.props.store.commitTransaction ();
			
			if (me.props.onCreate) {
				me.props.onCreate (state.rid);
			}
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			state.error = err.message;
			console.log (err.stack);
		}
		me.setState (state);
	}
	
	async onRefresh () {
		let me = this;
		let state = {};
		
		for (let attr in me.map) {
			if (me.state.hasOwnProperty (attr) && me.map [attr]) {
				state [attr] = me.map [attr].value;
			}
		}
		me.setState (state);
	}
	
	isValid () {
		let me = this;
		let valid = true;
		
		for (let attr in me.map) {
			let ma = me.map [attr];
			
			if (ma.notNull && me.state [attr] === "") {
				ma.error = "Please enter value";
				valid = false;
			} else {
				ma.error = "";
			}
		}
		if (!valid) {
			me.setState ({error: "Form contains errors"});
		}
		return valid;
	}
	
	isChanged () {
		let me = this;
		let changed = false;
		
		for (let attr in me.map) {
			if (me.state.hasOwnProperty (attr) && me.state [attr] != me.map [attr].value) {
				changed = true;
			}
		}
		return changed;
	}
	
	renderChildren (children) {
		let me = this;
		
		return React.Children.map (children, child => {
			if (!child.props) {
				return child;
			}
			let attr = child.props.attr || child.props.property || child.props.prop;
			
			if (attr) {
				let value = me.state [attr] || child.props.value || "";
				let type = child.props.type || (me.map [attr] && me.map [attr].type);
				
				me.map [attr] = me.map [attr] || {...child.props};
				
				if (child.type.name == "Field" && !type) {
					return (<div />);
				}
				let props2 = {
					...me.map [attr],
					onChange: me.onChange,
					value,
					object: me.object,
					cls: me.cls,
					store: me.props.store
				};
				props2.rsc = props2.rsc || me.props.rsc;
				
				if (child.type.name == "Field") {
					if (type == 1) {
						return (<StringField {...props2} />);
					}
					if (type == 2) {
						return (<NumberField {...props2} />);
					}
					if (type == 3) {
						return (<DateField {...props2} />);
					}
					if (type == 4) {
						return (<BooleanField {...props2} />);
					}
					if (type >= 1000) {
						if (child.props.dict) {
							return (<SelectField {...props2} />);
						} else {
							return (<ChooseField {...props2} />);
						}
					}
					if (type == 5) {
						return (<FileField {...props2} />);
					}
					return (<div>unsupported type</div>);
				}
				return React.cloneElement (child, props2);
			}
			if (child.props.children) {
				let o = {};
				
				o.children = me.renderChildren (child.props.children);
				return React.cloneElement (child, o);
			} else {
				return child;
			}
		});
	}
	
	render () {
		let me = this;
		let formChildren = me.renderChildren (me.props.children);
		let createDisabled = me.state.creating;
		let saveDisabled = !me.isChanged () || me.state.saving;
		
		if (!me.props.store || !me.props.rsc || (!me.props.rid && !me.props.mid && me.props.rsc == "record")) {
			return (<div className="alert alert-danger" role="alert">need props: store, rsc, rid or mid (record)</div>);
		}
		return (
			<div className="bg-white">
				{me.props.title && <h5>{me.props.title}</h5>}
				{me.state.ready && <div className="mb-3">
					{!me.state.rid && <button type="button" className="btn btn-primary mr-1" onClick={me.onCreate} disabled={createDisabled}><i className="fas fa-plus-circle mr-2"></i> {i18n (me.state.creating ? "Creating" : "Create")}</button>}
					{me.state.rid && <button type="button" className="btn btn-primary mr-1" onClick={me.onSave} disabled={saveDisabled}><i className="fas fa-save mr-2"></i> {i18n (me.state.saving ? "Saving" : "Save")}</button>}
					<button type="button" className="btn btn-primary" onClick={me.onRefresh}><i className="fas fa-sync mr-2"></i>{i18n ("Refresh")}</button>
				</div>}
				{me.state.error && <div className="alert alert-danger" role="alert">{me.state.error}</div>}
				{me.state.ready && formChildren}
			</div>
		);
	}
}
Form.displayName = "Form";

export default Form;

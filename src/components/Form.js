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
import ModelList from "./ModelList";
import Log from "./Log";
import Loading from "./Loading";
import {timeout} from "./helper";
import Fade from "react-reveal/Fade";

class Form extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.fileMap = {};
		me.map = {};
		
		me.onChange = me.onChange.bind (me);
		me.onSave = me.onSave.bind (me);
		me.onCreate = me.onCreate.bind (me);
		me.onRefresh = me.onRefresh.bind (me);

		me.state = {
			loading: false,
			saving: false,
			creating: false,
			rid: me.props.rid,
			showLog: false
		};
	}
	
	getValues (children) {
		let me = this;
		let values = {};

		React.Children.forEach (children, (child, i) => {
			if (!child.props) {
				return;
			}
			let attr = child.props.attr || child.props.property || child.props.prop;
			
			if (attr) {
				values [attr] = me.state [attr] || child.props.value || "";
			} else
			if (child.props.children) {
				Object.assign (values, me.getValues (child.props.children));
			}
		});
		return values;
	}
	
	async componentDidMount () {
		let me = this;
		let state = {loading: false};

		try {
			me.setState ({loading: true});
			
			await timeout (100);
			
			if (me.props.rsc && me.props.rid) {
				me.object = await me.props.store.getRsc (me.props.rsc, me.props.rid);
				
				if (me.props.rsc == "record") {
					me.cls = me.props.store.getModel (me.object.get ("_model"));
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
			//state.ready = true;
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
		me.setState ({[id]: v, currentField: id});
		
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

		await timeout (100);
		await me.props.store.startTransaction (`Saving rsc: ${me.props.rsc}, rid: ${me.state.rid}`);
		
		let state = {saving: false};
		let values = me.getValues (me.props.children);
		
		try {
			for (let attr in me.map) {
				let ma = me.map [attr];
				
//				if (me.state.hasOwnProperty (attr) && me.state [attr] !== me.map [attr].value) {
				if (values.hasOwnProperty (attr)) {
					let v = values [attr];
//				if (me.refs [attr].state.hasOwnProperty ("value")) {
//					let v = me.refs [attr].state.value;
					
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
					let cls = me.props.store.getModel (me.object.get ("_model"));
					
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

			for (let attr in me.map) {
				state [attr] = me.object.get (attr);
			}
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
		
		await timeout (100);
		await me.props.store.startTransaction (`Creating rsc: ${me.props.rsc}${me.props.mid ? `, mid: ${me.props.mid}` : ""}`);
		
		let state = {creating: false};
		let values = me.getValues (me.props.children);
		
		try {
			let attrs = {};
			
			if (me.props.rsc == "record") {
				attrs ["_model"] = me.props.mid;
			}
			for (let attr in me.map) {
				let ma = me.map [attr];
				
				if (values.hasOwnProperty (attr)) {
					let v = values [attr];
//				if (me.refs [attr].state.hasOwnProperty ("value")) {
//					let v = me.refs [attr].state.value;
					
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
			
			for (let attr in me.map) {
				state [attr] = me.object.get (attr);
			}
			if (me.props.onCreate) {
				me.props.onCreate (state.rid);
			}
		} catch (err) {
			console.error (err, err.stack);
			await me.props.store.rollbackTransaction ();
			state.error = err.message;
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
				ma.error = i18n ("Please enter value");
				valid = false;
			} else {
				ma.error = "";
			}
		}
		if (!valid) {
			me.setState ({error: i18n ("Form contains errors")});
		}
		return valid;
	}
	
	isChanged () {
		let me = this;
		let changed = false;
		
		for (let attr in me.map) {
			let stateValue = me.state [attr];
			let mapValue = me.map [attr].value;
			
			if (stateValue === "" || stateValue === undefined) {
				stateValue = null;
			}
			if (mapValue === "" || mapValue === undefined) {
				mapValue = null;
			}
			if (_.isNumber (stateValue) || _.isNumber (mapValue)) {
				stateValue = Number (stateValue);
				mapValue = Number (mapValue);
			}
			if (me.state.hasOwnProperty (attr) && stateValue !== mapValue) {
				changed = true;
			}
		}
		return changed;
	}
	
	renderChildren (children, parent = "") {
		let me = this;
		
		return React.Children.map (children, (child, i) => {
			if (!child.props) {
				return child;
			}
			let key = `${parent}-${i}`;
			let attr = child.props.attr || child.props.property || child.props.prop;
			
			if (attr) {
				let value = me.state [attr] || child.props.value || "";
				let type = child.props.type || (me.map [attr] && me.map [attr].type);
				
				me.map [attr] = me.map [attr] || {...child.props};
				
				if (child.type.name == "Field" && !type) {
					return (<div key={key} />);
				}
				let props2 = {
					...me.map [attr],
					onChange: me.onChange,
					value,
					object: me.object,
					cls: me.cls,
					store: me.props.store,
					disabled: child.props.disabled,
					ref: attr,
					key
				};
				props2.rsc = props2.rsc || me.props.rsc;
				
				if (child.props.hasOwnProperty ("label")) {
					props2.label = child.props.label;
				}
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
						} else
						if (child.props.chooseModel) {
							return (<ChooseField {...props2} choose={ModelList} chooseRef={`list-${child.props.chooseModel}`} model={child.props.chooseModel} />);
						} else {
							return (<ChooseField {...props2} />);
						}
					}
					if (type == 5) {
						return (<FileField {...props2} />);
					}
					return (<div key={key}>unsupported type</div>);
				}
				return (React.cloneElement (child, props2));
			}
			if (child.props.children) {
				let o = {};
				
				o.children = me.renderChildren (child.props.children);
				return (React.cloneElement (child, o));
			} else {
				return child;
			}
		});
	}
	
	render () {
		let me = this;
		let formChildren = me.renderChildren (me.props.children);
		
		if (!me.props.store || !me.props.rsc || (!me.props.rid && !me.props.mid && me.props.rsc == "record")) {
			return (<div className="alert alert-danger" role="alert">need props: store, rsc, rid or mid (record)</div>);
		}
		if (me.state.loading && !me.object) {
			return (
				<div className="alert alert-light text-primary" role="alert">
					<Loading />
				</div>
			);
		}
		return (
			<Fade>
				<div className="bg-white">
					{me.props.label && <h5 className="objectum-title ml-3">{me.props.label}</h5>}
					{me.state.rid && <Fade><div className="mb-1 actions border p-1 bg-white shadow-sm">
						<button type="button" className="btn btn-primary mr-1" onClick={me.onSave} disabled={!me.isChanged () || me.state.saving}>
							{me.state.saving ?
								<span><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"/>{i18n ("Saving")}</span> :
								<span><i className="fas fa-save mr-2"/>{i18n ("Save")}</span>
							}
						</button>
						{me.props.rsc == "record" && <button type="button" className="btn btn-primary" onClick={() => me.setState ({showLog: !me.state.showLog})}><i className="fas fa-history mr-2"></i>{i18n ("Log")}</button>}
					</div></Fade>}
					{me.state.showLog && <Fade><Log form={me} /></Fade>}
					{me.state.error && <div className="alert alert-danger" role="alert">{me.state.error}</div>}
					<div className="actions border p-1 bg-white shadow-sm">
						{formChildren}
					</div>
					{!me.state.rid && <Fade><div className="mt-1 actions border p-1 bg-white shadow-sm">
						<button type="button" className="btn btn-primary mr-1" onClick={me.onCreate} disabled={!me.isChanged () || me.state.creating}>
							{me.state.creating ?
								<span><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"/>{i18n ("Creating")}</span> :
								<span><i className="fas fa-plus-circle mr-2"/>{i18n ("Create")}</span>
							}
						</button>
					</div></Fade>}
				</div>
			</Fade>
		);
	}
}
Form.displayName = "Form";

export default Form;

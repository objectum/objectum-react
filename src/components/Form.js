/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {StringField, NumberField, DateField, BooleanField, DictField, ChooseField, FileField, ModelList, Log, Loading, EditForm} from "..";
import {i18n, timeout} from "..";
import {execute} from "objectum-client";
import _isNumber from "lodash.isnumber";
import _each from "lodash.foreach";
import _isEmpty from "lodash.isempty";

class Form extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.fileMap = {};
		me.record = null;
		me.model = null;
		
		me.onChange = me.onChange.bind (me);
		me.onSave = me.onSave.bind (me);
		me.onCreate = me.onCreate.bind (me);

		me.state = {
			_loading: true,
			_saving: false,
			_creating: false,
			_rid: me.props.rid,
			_showLog: false
		};
	}
	
	getValues (children) {
		let me = this;
		let values = {};

		React.Children.forEach (children, child => {
			if (!child || !child.props) {
				return;
			}
			let code = child.props.property;
			
			if (code) {
				values [code] = me.state [code];
			} else
			if (child.props.children) {
				Object.assign (values, me.getValues (child.props.children));
			}
		});
		return values;
	}
	
	getFields (children) {
		let me = this;
		let fields = {};
		
		React.Children.forEach (children, child => {
			if (!child || !child.props) {
				return;
			}
			let code = child.props.property;
			
			if (code) {
				fields [code] = child;
			} else
			if (child.props.children) {
				Object.assign (fields, me.getFields (child.props.children));
			}
		});
		return fields;
	}
	
	async componentDidMount () {
		let me = this;
		let state = {_loading: false};
		
		try {
			me.setState ({_loading: true});
			
			await timeout (100);
			
			if (me.props.rsc && me.props.rid) {
				me.record = await me.props.store.getRsc (me.props.rsc, me.props.rid);
				
				if (me.props.rsc == "record") {
					me.model = me.props.store.getModel (me.record.get ("_model"));
				}
			}
			if (!me.model && me.props.rsc == "record" && me.props.mid) {
				me.model = me.props.store.getModel (me.props.mid);
			}
			if (me.model) {
				me.regModel = me.props.store.getRegistered (me.model.getPath ());
			}
			if (!me.record && me.props.record) {
				me.record = me.props.record;
			}
			let fields = me.getFields (me.props.children);
			
			for (let code in fields) {
				let field = fields [code];
				
				if (me.record) {
					state [code] = me.record [code] === null ? "" : me.record [code];
				} else
				if (field.props.hasOwnProperty ("value")) {
					state [code] = field.props.value;
					
					if (me.props.defaults && me.props.defaults.hasOwnProperty (code)) {
						state [code] = me.props.defaults [code];
					}
				}
			}
		} catch (err) {
			state._error = err.message;
			console.error (err);
		}
		me.setState (state);
	}
	
	componentDidUpdate (prevProps, prevState) {
		let me = this;
		
		if (prevProps.record && me.props.record) {
			let fields = me.getFields (me.props.children);
			let state = {};
			
			me.record = me.props.record;
			
			for (let code in fields) {
				if (prevProps.record [code] !== me.props.record [code]) {
					state [code] = me.props.record [code];
				}
			}
			// поля исчезли
			for (let code in me.props.record) {
				if (!fields [code] && prevProps.record [code] !== me.props.record [code]) {
					state [code] = me.props.record [code];
				}
			}
			if (!_isEmpty (state)) {
				me.setState (state);
			}
		}
	}
	
	onChange ({code, value, file}) {
		let me = this;
		let state = {};
		
		if (file) {
			me.fileMap [code] = file;
		}
		state [code] = value;
		
		if (value && me.state [`${code}-error`]) {
			state [`${code}-error`] = "";

			let errors = false;
			
			_each (me.state, (v, a) => {
				if (v && a.endsWith ("-error") && a != `${code}-error`) {
					errors = true;
				}
			});
			if (!errors) {
				state._error = "";
			}
		}
		me.setState (state);
		
		if (me.props.onChange) {
			me.props.onChange ({property: code, code, value, file});
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
	}
	
	async onSave () {
		let me = this;
		
		if (!me.isValid ()) {
			return false;
		}
		me.setState ({_saving: true});

		await timeout (100);
		await me.props.store.startTransaction (`${i18n ("Saving")}, id: ${me.state._rid}`);
		
		let state = {_saving: false};
		let values = me.getValues (me.props.children);
		
		try {
			for (let code in values) {
				let value = values [code];
				let property = me.model && me.model.properties [code];
				
				if (value && property && (property.type == 2 || property.type >= 1000)) {
					value = Number (value);
				}
				if (property && property.secure) {
					let hash = require ("crypto").createHash ("sha1").update (String (value)).digest ("hex").toUpperCase ();
					
					if (hash != value) {
						value = hash;
					}
				}
				if (value === "") {
					value = null;
				}
				me.record.set (code, value);
			}
			await me.record.sync ();
			
			for (let code in values) {
				if (me.fileMap [code]) {
					await me.upload ({
						sessionId: me.props.store.getSessionId (),
						objectId: me.record.get ("id"),
						classAttrId: me.model.properties [code].get ("id"),
						name: me.record.get (code),
						file: me.fileMap [code]
					});
				}
			}
			await me.props.store.commitTransaction ();
			
			for (let code in values) {
				state [code] = me.record.get (code);
			}
			state._error = "";
		} catch (err) {
			state._error = err.message;
			console.error (err.stack);
			await me.props.store.rollbackTransaction ();
		}
		try {
			if (me.props.onSave) {
				await execute (me.props.onSave, {form: me, store: me.props.store});
			}
		} catch (err) {
			state._error = err.message;
			console.error (err.stack);
		}
		me.setState (state);
		
		return !state._error;
	}
	
	async onCreate () {
		let me = this;
		
		if (!me.isValid ()) {
			return false;
		}
		me.setState ({_creating: true});
		
		await timeout (100);
		await me.props.store.startTransaction (`${i18n ("Creating")}${me.props.mid ? `, ${i18n ("model")}: ${me.props.mid}` : ""}`);
		
		let state = {_creating: false};
		let values = me.getValues (me.props.children);
		
		try {
			let data = {};
			
			if (me.props.rsc == "record") {
				data ["_model"] = me.model.getPath ();
			}
			if (me.props.defaults) {
				Object.assign (data, me.props.defaults);
			}
			for (let code in values) {
				let value = values [code];
				let property = me.model && me.model.properties [code];
				
				if (value && property && (property.type == 2 || property.type >= 1000)) {
					value = Number (value);
				}
				if (property && property.secure) {
					value = require ("crypto").createHash ("sha1").update (String (value)).digest ("hex").toUpperCase ();
				}
				if (value === "") {
					value = null;
				}
				data [code] = value;
			}
			me.record = await me.props.store.createRsc (me.props.rsc, data);
			
			state._rid = me.record.get ("id");
			state._error = "";
			
			for (let code in values) {
				if (me.fileMap [code]) {
					await me.upload ({
						sessionId: me.props.store.getSessionId (),
						objectId: me.record.get ("id"),
						classAttrId: me.model.properties [code].get ("id"),
						name: me.record.get (code),
						file: me.fileMap [code]
					});
				}
			}
			await me.props.store.commitTransaction ();
			
			for (let code in values) {
				state [code] = me.record.get (code);
			}
			if (me.props.onCreate) {
				me.props.onCreate (state._rid);
			}
		} catch (err) {
			console.error (err, err.stack);
			await me.props.store.rollbackTransaction ();
			state._error = err.message;
		}
		me.setState (state);
		
		return !state._error;
	}
	
	isValid () {
		let me = this;
		let valid = true;
		let fields = me.getFields (me.props.children);
		let state = {};
		
		for (let code in fields) {
			let field = fields [code];
			let notNull = field.props.notNull;
			
			if (me.model && me.model.properties [code] && me.model.properties [code].notNull) {
				notNull = true;
			}
			if (notNull && (!me.state.hasOwnProperty (code) || me.state [code] === "" || me.state [code] === null || me.state [code] === undefined)) {
				state [`${code}-error`] = i18n ("Please enter value");
				valid = false;
			} else {
				state [`${code}-error`] = "";
			}
		}
		if (!valid) {
			state._error = i18n ("Form contains errors");
			me.setState (state);
		}
		return valid;
	}
	
	isChanged () {
		let me = this;
		let changed = false;
		let values = me.getValues (me.props.children);
		
		for (let code in values) {
			let stateValue = me.state [code];
			let recordValue = me.record && me.record [code];
			
			if (stateValue === "" || stateValue === undefined) {
				stateValue = null;
			}
			if (recordValue === "" || recordValue === undefined) {
				recordValue = null;
			}
			if (_isNumber (stateValue) || _isNumber (recordValue)) {
				stateValue = Number (stateValue);
				recordValue = Number (recordValue);
			}
			if (me.state.hasOwnProperty (code) && stateValue !== recordValue) {
				changed = true;
			}
		}
		return changed;
	}
	
	renderChildren (children, parent = "") {
		let me = this;
		
		return React.Children.map (children, (child, i) => {
			if (!child || !child.props) {
				return child;
			}
			let key = `${parent}-${i}`;
			let code = child.props.property;
			
			if (code) {
				let value = me.state.hasOwnProperty (code) ? me.state [code] : (child.props.value || "");
				let props = {
					...child.props,
					onChange: (opts) => {
						if (child.props.onChange) {
							child.props.onChange (opts);
						}
						me.onChange (opts);
					},
					property: code,
					value,
					record: me.record,
					model: me.model && me.model.getPath (),
					store: me.props.store,
					//ref: code,
					key,
					disabled: child.props.disabled || me.props.disabled,
					error: me.state [`${code}-error`]
				};
				props.rsc = props.rsc || me.props.rsc;
				
				let field;
				
				if (child.type.displayName == "Field") {
					let type = child.props.type;
					
					if (!type && me.model && me.model.properties [code]) {
						let property = me.model.properties [code];
						
						type = property.type;
						
						if (property.secure) {
							props.secure = true;
						}
						let opts = property.getOpts ();
						
/*
						if (opts.wysiwyg) {
							props.wysiwyg = true;
						}
						if (opts.textarea) {
							props.textarea = true;
						}
						if (opts.rows) {
							props.rows = opts.rows;
						}
*/
						Object.assign (props, opts);
						props.label = props.label || property.name;
					}
					if (!type) {
						return (<div key={key} />);
					}
					if (type == 1) {
						field = <StringField {...props} />;
					}
					if (type == 2) {
						field = <NumberField {...props} />;
					}
					if (type == 3) {
						field = <DateField {...props} />;
					}
					if (type == 4) {
						field = <BooleanField {...props} />;
					}
					if (type >= 1000) {
						let property = me.model.properties [code];
						let model = me.props.store.getModel (property.type);
						
						if (child.props.dict || model.isDictionary () || me.props.store.dict [model.getPath ()] || me.props.store.dict [model.id]) {
							field = <DictField {...props} />;
						} else
						if (child.props.chooseModel) {
							field = <ChooseField
								{...props}
								choose={{cmp: ModelList, ref: `list-${child.props.chooseModel}`, model: child.props.chooseModel}}
							/>;
						} else {
							field = <ChooseField {...props} />;
						}
					}
					if (type == 5) {
						field = <FileField {...props} />;
					}
					if (!field) {
						return (<div key={key}>unsupported type: {code}</div>);
					}
				}
				if (!field) {
					field = React.cloneElement (child, props);
				}
				if (me.regModel) {
					if (me.record) {
						if (me.record._renderField) {
							field = me.record._renderField ({field, form: me, store: me.props.store});
						}
					} else if (me.regModel._renderField) {
						field = me.regModel._renderField ({field, form: me, store: me.props.store});
					}
				}
				return field;
			}
			if (child.props.children) {
				let o = {};
				
				o.children = me.renderChildren (child.props.children);
				return (
					React.cloneElement (child, {
						children: me.renderChildren (child.props.children)
					})
				);
			} else {
				return child;
			}
		});
	}
	
	render () {
		let me = this;
		if (!me.props.record && (!me.props.store || !me.props.rsc || (!me.props.rid && !me.props.mid && me.props.rsc == "record"))) {
			return <EditForm {...me.props} />;
		}
		if (me.state._loading && !me.record) {
			return (
				<div className="alert alert-light text-primary" role="alert">
					<Loading />
				</div>
			);
		}
		let formChildren = me.renderChildren (me.props.children);

		return (
			<div className={me.props.className}>
				{me.props.label && <div>
					<h5 className="pl-3 py-2 ml-3">{me.props.label}</h5>
				</div>}
				{me.state._rid && !me.props.hideButtons && <div className="actions p-1 border-bottom">
					<button type="button" className="btn btn-primary mr-1" onClick={me.onSave} disabled={!me.isChanged () || me.state._saving || me.props.disableActions}>
						{me.state._saving ?
							<span><span className="spinner-border objectum-spinner mr-2" role="status" aria-hidden="true"/>{i18n ("Saving")}</span> :
							<span><i className="fas fa-check mr-2"/>{i18n ("Save")}</span>
						}
					</button>
					{me.props.rsc == "record" && !me.props.hideLogButton &&
						<button type="button" className="btn btn-primary" onClick={() => me.setState ({_showLog: !me.state._showLog})}>
							<i className="fas fa-history mr-2" />{i18n ("Log")}
						</button>
					}
				</div>}
				{me.state._showLog && <div className="border-bottom p-1"><Log form={me} /></div>}
				{me.state._error && <div className="alert alert-danger" role="alert">{me.state._error}</div>}
				<div className="actions p-1">
					{formChildren}
				</div>
				{!me.state._rid && !me.props.hideButtons && <div className="mt-1 actions border-top p-1">
					<button type="button" className="btn btn-primary mr-1" onClick={me.onCreate} disabled={!me.isChanged () || me.state._creating}>
						{me.state._creating ?
							<span><span className="spinner-border objectum-spinner mr-2" role="status" aria-hidden="true"/>{i18n ("Creating")}</span> :
							<span><i className="fas fa-plus-circle mr-2"/>{i18n ("Create")}</span>
						}
					</button>
				</div>}
			</div>
		);
	}
}
Form.displayName = "Form";

export default Form;

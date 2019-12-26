/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Loading from "./Loading";
import {newId, timeout} from "./helper";
import {i18n} from "../i18n";

class EditForm extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onSave = me.onSave.bind (me);
		
		me.state = {
			loading: false,
			saving: false
		};
		me.recordMap = {};
	}
	
	getFields (children) {
		let me = this;
		let fields = [];
		
		React.Children.forEach (children, child => {
			let cp = child.props;
			
			if (!cp) {
				return;
			}
			if (cp.property && cp.rid) {
				fields.push (child);
			} else
			if (cp.children) {
				fields = [...fields, ...me.getFields (cp.children)];
			}
		});
		return fields;
	}
	
	onChange ({rid, property, value}) {
		let me = this;
		
		me.setState ({
			[`${rid}-${property}`]: value
		});
	}
	
	async load () {
		let me = this;
		let state = {loading: false};
		
		try {
			me.setState ({loading: true});
			await timeout ();
			
			me.recordMap = {};
			
			let fields = me.getFields (me.props.children);
			
			for (let i = 0; i < fields.length; i ++) {
				let field = fields [i];
				let record = await me.props.store.getRecord (field.props.rid);
				
				me.recordMap [field.props.rid] = record;
				state [`${field.props.rid}-${field.props.property}`] = record [field.props.property];
			}
		} catch (err) {
			state.error = err.message;
		}
		me.setState (state);
	}
	
	componentDidMount () {
		this.load ();
	}
	
	componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.refresh != me.props.refresh) {
			me.load ();
		}
	}
	
	renderChildren (children) {
		let me = this;
		
		return React.Children.map (children, (child, i) => {
			let cp = child.props;
			
			if (!cp || !cp.property || !cp.rid) {
				if (cp && cp.children) {
					return React.cloneElement (child, {
						children: me.renderChildren (cp.children)
					});
				} else {
					return child;
				}
			}
			if (!me.recordMap [cp.rid]) {
				return <div key={newId ()} />;
			}
			let record = me.recordMap [cp.rid];
			let model = me.props.store.getModel (record._model);
			let fieldCode = `${cp.rid}-${cp.property}`;
			let value = me.state [fieldCode] || cp.value || "";
			let props = {
				...cp,
				rsc: "record",
				type: model.properties [cp.property].type,
				model: model.getPath (),
				onChange: me.onChange,
				value,
				store: me.props.store,
				key: i,
				error: me.state [`${fieldCode}-error`]
			};
			return (React.cloneElement (child, props));
		});
	}
	
	isValid () {
		let me = this;
		let valid = true;
		let fields = me.getFields (me.props.children);
		let state = {};
		
		fields.forEach (field => {
			let fp = field.props;
			let fieldCode = `${fp.rid}-${fp.property}`;
			let notNull = fp.notNull;
			let record = me.recordMap [fp.rid];
			let model = me.props.store.getModel (record._model);
			let property = model.properties [fp.property];
			
			if (property && property.notNull) {
				notNull = true;
			}
			if (notNull && (!me.state.hasOwnProperty (fieldCode) || me.state [fieldCode] === "" || me.state [fieldCode] === null)) {
				state [`${fieldCode}-error`] = i18n ("Please enter value");
				valid = false;
			} else {
				state [`${fieldCode}-error`] = "";
			}
		});
		if (!valid) {
			state.error = i18n ("Form contains errors");
			me.setState (state);
		}
		return valid;
	}
	
	isChanged () {
		let me = this;
		let changed = false;
		let fields = me.getFields (me.props.children);
		
		fields.forEach (field => {
			let fp = field.props;
			let fieldCode = `${fp.rid}-${fp.property}`;
			let stateValue = me.state [fieldCode];
			let recordValue = me.recordMap [fp.rid] && me.recordMap [fp.rid][fp.property];
			
			if (stateValue === "" || stateValue === undefined) {
				stateValue = null;
			}
			if (recordValue === "" || recordValue === undefined) {
				recordValue = null;
			}
			if (_.isNumber (stateValue) || _.isNumber (recordValue)) {
				stateValue = Number (stateValue);
				recordValue = Number (recordValue);
			}
			if (me.state.hasOwnProperty (fieldCode) && stateValue !== recordValue) {
				changed = true;
			}
		});
		return changed;
	}
	
	async onSave () {
		let me = this;
		
		if (!me.isValid ()) {
			return;
		}
		me.setState ({saving: true});
		
		await timeout (100);
		await me.props.store.startTransaction (`Saving EditForm`);
		
		let state = {saving: false};
		let fields = me.getFields (me.props.children);
		
		try {
			for (let i = 0; i < fields.length; i ++) {
				let fp = fields [i].props;
				let fieldCode = `${fp.rid}-${fp.property}`;
				let record = me.recordMap [fp.rid];
				
				if (me.state.hasOwnProperty (fieldCode)) {
					let value = me.state [fieldCode];
					
					if (value === "") {
						value = null;
					}
					record [fp.property] = value;
				}
			}
			for (let id in me.recordMap) {
				await me.recordMap [id].sync ();
			}
			await me.props.store.commitTransaction ();
			
			for (let i = 0; i < fields.length; i ++) {
				let fp = fields [i].props;
				let fieldCode = `${fp.rid}-${fp.property}`;
				let record = await me.props.store.getRecord (fp.rid);
				
				state [fieldCode] = record [fp.property];
			}
			state.error = "";
			
			if (me.props.onSave) {
				me.props.onSave ();
			}
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			state.error = err.message;
		}
		me.setState (state);
	}
	
	render () {
		let me = this;

		if (me.state.loading) {
			return (
				<div className="alert alert-light text-primary" role="alert">
					<Loading />
				</div>
			);
		} else {
			return (
				<div>
					<button type="button" className="btn btn-primary mb-1" onClick={me.onSave} disabled={!me.isChanged () || me.state.saving}>
						{me.state.saving ?
							<span>
								<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"/>{i18n ("Saving")}
							</span> :
							<span><i className="fas fa-check mr-2"/>{i18n ("Save")}</span>
						}
					</button>
					{me.state.error && <div className="alert alert-danger" role="alert">{me.state.error}</div>}
					{me.renderChildren (me.props.children)}
				</div>
			);
		}
	}
}
EditForm.displayName = "EditForm";

export default EditForm;

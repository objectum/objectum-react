/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Loading from "./Loading";
import {newId, timeout} from "..";
import {i18n} from "../i18n";
import _isNumber from "lodash.isnumber";
import _map from "lodash.map";
import _uniq from "lodash.uniq";

export default class EditForm extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			loading: false,
			saving: false
		};
		this.recordMap = {};
	}
	
	getFields (children) {
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
				fields = [...fields, ...this.getFields (cp.children)];
			}
		});
		return fields;
	}
	
	onChange = ({rid, property, value}) => {
		this.setState ({
			[`${rid}-${property}`]: value
		});
	}
	
	async load () {
		let state = {loading: false};
		
		try {
			this.setState ({loading: true});
			await timeout ();
			
			this.recordMap = {};
			
			let fields = this.getFields (this.props.children);
			let ids = _uniq (_map (fields, f => f.props.rid));
			let promises = _map (ids, id => this.props.store.getRecord (id));
			let records = await Promise.all (promises);
			
			records.forEach (record => this.recordMap [record.id] = record);
			fields.forEach (field => state [`${field.props.rid}-${field.props.property}`] = this.recordMap [field.props.rid][field.props.property]);
		} catch (err) {
			state.error = err.message;
		}
		this.setState (state);
	}
	
	async componentDidMount () {
		await this.load ();
	}
	
	async componentDidUpdate (prevProps) {
		if (prevProps.refresh != this.props.refresh) {
			await this.load ();
		}
	}
	
	renderChildren (children) {
		return React.Children.map (children, (child, i) => {
			let cp = child.props;
			
			if (!cp || !cp.property || !cp.rid) {
				if (cp && cp.children) {
					return React.cloneElement (child, {
						children: this.renderChildren (cp.children)
					});
				} else {
					return child;
				}
			}
			if (!this.recordMap [cp.rid]) {
				return <div key={newId ()} />;
			}
			let record = this.recordMap [cp.rid];
			let model = this.props.store.getModel (record._model);
			let fieldCode = `${cp.rid}-${cp.property}`;
			let value = this.state [fieldCode] || cp.value || "";
			let props = {
				...cp,
				rsc: "record",
				type: model.properties [cp.property].type,
				model: model.getPath (),
				onChange: this.onChange,
				value,
				store: this.props.store,
				key: i,
				error: this.state [`${fieldCode}-error`],
				disabled: cp.disabled || this.props.disabled
			};
			return (React.cloneElement (child, props));
		});
	}
	
	isValid () {
		let valid = true;
		let fields = this.getFields (this.props.children);
		let state = {};
		
		fields.forEach (field => {
			let fp = field.props;
			let fieldCode = `${fp.rid}-${fp.property}`;
			let notNull = fp.notNull;
			let record = this.recordMap [fp.rid];
			let model = this.props.store.getModel (record._model);
			let property = model.properties [fp.property];
			
			if (property && property.notNull) {
				notNull = true;
			}
			if (notNull && (!this.state.hasOwnProperty (fieldCode) || this.state [fieldCode] === "" || this.state [fieldCode] === null)) {
				state [`${fieldCode}-error`] = i18n ("Please enter value");
				valid = false;
			} else {
				state [`${fieldCode}-error`] = "";
			}
		});
		if (!valid) {
			state.error = i18n ("Form contains errors");
			this.setState (state);
		}
		return valid;
	}
	
	isChanged () {
		let changed = false;
		let fields = this.getFields (this.props.children);
		
		fields.forEach (field => {
			let fp = field.props;
			let fieldCode = `${fp.rid}-${fp.property}`;
			let stateValue = this.state [fieldCode];
			let recordValue = this.recordMap [fp.rid] && this.recordMap [fp.rid][fp.property];
			
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
			if (this.state.hasOwnProperty (fieldCode) && stateValue !== recordValue) {
				changed = true;
			}
		});
		return changed;
	}
	
	onSave = async () => {
		if (!this.isValid ()) {
			return;
		}
		this.setState ({saving: true});
		
		await timeout (100);
		await this.props.store.startTransaction (`Saving EditForm`);
		
		let state = {saving: false};
		let fields = this.getFields (this.props.children);
		
		try {
			for (let i = 0; i < fields.length; i ++) {
				let fp = fields [i].props;
				let fieldCode = `${fp.rid}-${fp.property}`;
				let record = this.recordMap [fp.rid];
				
				if (this.state.hasOwnProperty (fieldCode)) {
					let value = this.state [fieldCode];
					
					if (value === "") {
						value = null;
					}
					record [fp.property] = value;
				}
			}
			for (let id in this.recordMap) {
				await this.recordMap [id].sync ();
			}
			await this.props.store.commitTransaction ();
			
			for (let i = 0; i < fields.length; i ++) {
				let fp = fields [i].props;
				let fieldCode = `${fp.rid}-${fp.property}`;
				let record = await this.props.store.getRecord (fp.rid);
				
				state [fieldCode] = record [fp.property];
			}
			state.error = "";
			
			if (this.props.onSave) {
				this.props.onSave ();
			}
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			state.error = err.message;
		}
		this.setState (state);
	}
	
	render () {
		if (this.state.loading) {
			return <div className="alert alert-light text-primary" role="alert">
				<Loading />
			</div>;
		} else {
			return <div>
				{!this.props.hideButtons && <button type="button" className="btn btn-primary mb-1" onClick={this.onSave} disabled={!this.isChanged () || this.state.saving || this.props.disableActions}>
					{this.state.saving ?
						<span>
							<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"/>{i18n ("Saving")}
						</span> :
						<span><i className="fas fa-check mr-2"/>{i18n ("Save")}</span>
					}
				</button>}
				{this.state.error && <div className="alert alert-danger" role="alert">{this.state.error}</div>}
				{this.renderChildren (this.props.children)}
			</div>;
		}
	}
}
EditForm.displayName = "EditForm";

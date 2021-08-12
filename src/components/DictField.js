/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Tree, i18n, newId} from "..";
import _isEmpty from "lodash.isempty";

export default class DictField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			loading: true,
			showDialog: false,
			filter: "",
			value: null,
			label: "",
			records: []
		};
		this._refs = {
			"treeDialog": React.createRef (),
			"inputDiv": React.createRef ()
		};
		this.id = newId ();
	}
	
	onClear = () => {
		this.setState ({value: null, label: ""});

		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value: null, id: this.props.id});
		}
	}
	
	updateState = async (prevProps = {}) => {
		let state = {};
		let getValue = (a) => state.hasOwnProperty (a) ? state [a] : this.state [a];
		
		if (this.props.model && this.props.model !== prevProps.model) {
			state.model = this.props.store.getModel (this.props.model);
		}
		if (this.props.property && this.props.property !== prevProps.property) {
			state.code = this.props.property;
			
			if (getValue ("model")) {
				state.property = getValue ("model").properties [this.props.property];
			}
		}
		let records = this.props.recs || this.props.records;
		
		if (records && (!getValue ("records") || records.map (record => record.id).join () != getValue ("records").map (record => record.id).join ())) {
			state.records = records;
		}
		if (state.model || state.property) {
			if (!state.records) {
				state.records = await this.props.store.getDict (getValue ("property").get ("type"));
			}
			let m = this.props.store.getModel (getValue ("property").get ("type"));
			
			for (let code in m.properties) {
				let property = m.properties [code];
				
				if (property.get ("type") >= 1000) {
					if ((property.code == "group" && !this.props.hasOwnProperty ("groupProperty")) || property.code == this.props.groupProperty) {
						let pm = this.props.store.getModel (property.get ("type"));
						
						if (pm.isDictionary ()) {
							let groupRecords = await this.props.store.getDict (property.get ("type"));
							let records = getValue ("records");
							
							groupRecords.forEach (groupRecord => groupRecord.unselectable = true);
							records.forEach (record => record.parent = record [property.code]);
							state.records = [...groupRecords, ...records];
							break;
						}
					}
				}
			}
		}
		if (this.props.hasOwnProperty ("value") && this.props.value !== prevProps.value) {
			state.value = this.props.value;
			state.label = await this.getValueLabel ({value: this.props.value, model: getValue ("model"), records: getValue ("records")});
		}
		if (this.state.loading) {
			state.loading = false;
		}
		if (!_isEmpty (state)) {
			this.setState (state);
		}
	}
	
	async componentDidMount () {
		await this.updateState ();
		document.addEventListener ("mousedown", this.onDocumentClick)
	}
	
	async componentDidUpdate (prevProps) {
		await this.updateState (prevProps);
	}
	
	componentWillUnmount () {
		document.removeEventListener ("mousedown", this.onDocumentClick);
	}
	
	async getValueLabel ({value, model, records}) {
		let label = "";
		
		if (value && model) {
			let record = await this.props.store.getRecord (value);
			
			label = record.getLabel ();
		} else {
			let record = records.find (record => record.id == value);
			
			if (record) {
				if (record.getLabel) {
					label = record.getLabel ();
				} else {
					label = record.name;
				}
			}
		}
		return label;
	}
	
	onDocumentClick = event => {
		let dialog = this._refs ["treeDialog"];
		
		if (dialog) {
			dialog = dialog.current;
		}
		if (dialog && !dialog.contains (event.target) &&
			this._refs ["inputDiv"].current && !this._refs ["inputDiv"].current.contains (event.target)
		) {
			this.setState ({
				showDialog: false,
				filter: ""
			});
		}
	}
	
	onFilter = val => {
		let v = val.target.value;
		
		if (!this.state.filter && this.state.label) {
			if (v.length > this.state.label.length) {
				v = v.substr (this.state.label.length);
			} else {
				v = "";
			}
		}
		this.setState ({filter: v});
	}
	
	onShowDialog = () => {
		if (this.props.disabled) {
			return;
		}
		if (this.state.showDialog) {
			return this.setState ({
				showDialog: false,
				filter: ""
			});
		}
		this.setState ({showDialog: true});
	}
	
	onClick = async (val) => {
		let value = val.target.id;
		
		if (!isNaN (value)) {
			if (this.state.records && this.state.records.find (record => record.id == value)?.unselectable) {
				return;
			}
			value = Number (value);
		}
		let state = {
			showDialog: false,
			value,
			filter: "",
			label: await this.getValueLabel ({value, model: this.state.model, records: this.state.records})
		};
		this.setState (state);
		
		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
	}
	
	filter (inRecords) {
		let map = {}, filteredMap = {};

		inRecords.forEach (record => map [record.id] = record);
		
		let collectParents = (parent) => {
			if (!parent) {
				return;
			}
			filteredMap [parent] = true;
			let record = map [parent];
			collectParents (record.parent);
		};
		inRecords.forEach (record => {
			if (this.state.filter && (record.name.toLowerCase () || "").indexOf (this.state.filter.toLowerCase ()) == -1) {
				return;
			}
			filteredMap [record.id] = true;
			collectParents (record.parent);
		});
		return inRecords.filter (record => filteredMap [record.id]);
	}

	renderTree () {
		let records = this.filter (this.state.records);
		let opened = [];
		
		if (this.state.filter) {
			opened = records.map (record => record.id);
		}
/*
		return <div className="dictfield-dialog text-left" ref={this._refs ["treeDialog"]}>
			<div className={`dictfield-tree border p-1 bg-white shadow dictfield-items-hidden ${this.state.showDialog ? "dictfield-items-visible" : ""}`}>
				{records.length ? <Tree records={records} highlightText={this.state.filter} opened={opened} onChoose={({id, name}) => this.onClick ({target: {id, name}})}/> :
					<div className="p-1">{i18n ("No parameters")}</div>
				}
			</div>
		</div>;
*/
		return <div className="dictfield-dialog text-left" ref={this._refs ["treeDialog"]}>
			{this.state.showDialog ? <div className="dictfield-tree border p-1 bg-white shadow ">
				{records.length ? <Tree records={records} highlightText={this.state.filter} opened={opened} onChoose={({id, name}) => this.onClick ({target: {id, name}})}/> :
					<div className="p-1">{i18n ("No parameters")}</div>
				}
			</div> : <div />}
		</div>;
	}
	
	render () {
		if (this.state.loading) {
			return null;
		}
		let addCls = this.props.error ? " is-invalid" : "";
		
		return <div>
			<div className={(this.props.label || this.props.error) ? "form-group" : ""}>
				{this.props.label && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
				<div className="input-group dictfield">
					<input
						type="text"
						className={`form-control ${this.props.disabled ? "rounded" : "bg-white dictfield-input rounded-left border-primary"} dictfield-option ${addCls} ${this.props.sm ? "form-control-sm" : ""} ${this.state.filter ? "text-warning" : ""}`}
						id={this.id}
						title={this.state.label}
						value={this.state.filter || this.state.label}
						onChange={this.onFilter}
						onClick={this.onShowDialog}
						ref={this._refs ["inputDiv"]}
						readOnly={!!this.props.disabled}
						placeholder={this.props.placeholder}
					/>
					{!this.props.disabled && <div className="input-group-append" style={{zIndex: 0}}>
						<button
							type="button"
							className={`btn btn-outline-primary ${this.props.sm ? "btn-sm" : ""}`}
							onClick={this.onClear}
							title={i18n ("Clear")}
						>
							<i className="fas fa-times" />
						</button>
					</div>}
				</div>
				{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
				{this.renderTree ()}
			</div>
		</div>;
	}
};
DictField.displayName = "DictField";

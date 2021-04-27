/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Tree, i18n, newId} from "..";
import _isEmpty from "lodash.isempty";
import _filter from "lodash.filter";
import _keys from "lodash.keys";

export default class DictField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			code: this.props.property,
			value: this.props.value === null ? "" : this.props.value,
			label: "",
			showDialog: false,
			records: this.props.records || this.props.recs || [],
			filter: ""
		};
		if (this.props.model) {
			this.model = this.props.store.getModel (this.props.model);
			this.property = this.model.properties [this.props.property];
		}
		this._refs = {
			"optionDialog": React.createRef (),
			"groupDialog": React.createRef (),
			"treeDialog": React.createRef (),
			"button": React.createRef (),
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
	
	async componentDidMount () {
		let state = {
			label: ""
		};
		if (!this.state.records.length && !(this.props.recs || this.props.records)) {
			state.records = await this.props.store.getDict (this.property.get ("type"));
		}
		state.label = await this.getValueLabel (this.state.value);
		
		if (this.props.model) {
			let m = this.props.store.getModel (this.property.get ("type"));
			
			for (let code in m.properties) {
				let property = m.properties [code];
				
				if (property.get ("type") >= 1000) {
					if ((property.code == "group" && !this.props.hasOwnProperty ("groupProperty")) || property.code == this.props.groupProperty) {
						let pm = this.props.store.getModel (property.get ("type"));
						
						if (pm.isDictionary ()) {
							this.groupProperty = property;
							
							let groupRecords = await this.props.store.getDict (property.get ("type"));
							let records = state.records || this.state.records;
							
							groupRecords.forEach (groupRecord => groupRecord.unselectable = true);
							records.forEach (record => record.parent = record [property.code]);
							state.records = [...groupRecords, ...records];
							break;
						}
					}
					if (property.code == "parent") {
						state.treeMode = true;
					}
				}
			}
		}
		document.addEventListener ("mousedown", this.onDocumentClick)
		this.setState (state);
	}
	
	async componentDidUpdate (prevProps) {
		let state = {};
		
		if (prevProps.value !== this.props.value) {
			state.value = this.props.value;
			state.label = await this.getValueLabel (this.props.value);
		}
		let records = this.props.recs || this.props.records;
		
		if (records && records.map (record => record.id).join () != this.state.records.map (record => record.id).join ()) {
			state.records = records;
		}
		if (!_isEmpty (state)) {
			this.setState (state);
		}
	}
	
	componentWillUnmount () {
		document.removeEventListener ("mousedown", this.onDocumentClick);
	}
	
	async getValueLabel (value) {
		let label = "";
		
		if (value && this.model) {
			let record = await this.props.store.getRecord (value);
			
			label = record.getLabel ();
		} else {
			let record = this.state.records.find (record => record.id == value);
			
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
		let dialog = this._refs ["optionDialog"] || this._refs ["groupDialog"] || this._refs ["treeDialog"];
		
		if (dialog) {
			dialog = dialog.current;
		}
		if (dialog && !dialog.contains (event.target) &&
			this._refs ["inputDiv"].current && !this._refs ["inputDiv"].current.contains (event.target)
		) {
			this.setState ({
				showDialog: false,
				filter: "",
				group: null
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
				filter: "",
				group: null
			});
		}
		this.setState ({showDialog: true});
	}
	
	onClick = async (val) => {
		let value = val.target.id;
		
		if (!isNaN (value)) {
			value = Number (value);
		}
		let state = {
			showDialog: false,
			value,
			filter: "",
			group: null,
			label: await this.getValueLabel (value)
		};
		this.setState (state);
		
		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
	}
	
	onGroupClick = (val) => {
		this.setState ({group: val.target.id});
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

	renderParameters () {
		let recs = this.filter (this.state.recs);
		
		if (this.state.group) {
			recs = recs.filter (rec => rec [this.groupProperty.code] == this.state.group);
		}
		return (
			<div className="dictfield-dialog text-left" ref={this._refs ["optionDialog"]}>
				<div className="dictfield-selector border bg-white shadow">
					{(recs.length > 10 || this.state.filter) && <div className="sticky-top p-1 bg-white border-bottom">
						<input type="text" className="form-control" value={this.state.filter} onChange={this.onFilter} placeholder={i18n ("Filter parameters") + " ..."} />
					</div>}
					<ul className="list-group">
						{recs.map ((rec, i) => {
							let label = `${rec.name} (id: ${rec.id})`;
							
							if (rec.getLabel) {
								label = rec.getLabel ();
							}
							return (
								<li className="border-bottom p-1 dictfield-option" id={rec.id} key={i} onClick={this.onClick}>{label}</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
	
	renderGroup () {
		let recs = this.filter (this.state.groupRecs);
		
		return (
			<div className="dictfield-dialog text-left" ref={this._refs ["groupDialog"]}>
				<div className="dictfield-selector border bg-white shadow">
					{(recs.length > 10 || this.state.filter) && <div className="sticky-top p-1 bg-white border-bottom">
						<input type="text" className="form-control" value={this.state.filter} onChange={this.onFilter} placeholder={i18n ("Filter groups") + " ..."} />
					</div>}
					<ul className="list-group">
						{recs.map ((rec, i) => {
							let label = rec.name;
							
							if (rec.getLabel) {
								label = rec.getLabel ();
							}
							let num = _filter (this.state.recs, {[this.groupProperty.get ("code")]: rec.id}).length;
							
							label += ` (${i18n ("Amount")}: ${num})`;
							
							return (
								<li className="border-bottom p-1 dictfield-option" id={rec.id} key={i} onClick={this.onGroupClick}>{label}</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
	
	renderTree () {
		let records = this.filter (this.state.records);
		let opened = [];
		
		if (this.state.filter) {
			opened = records.map (record => record.id);
		}
		return <div className="dictfield-dialog text-left" ref={this._refs ["optionDialog"]}>
			<div className="dictfield-tree border p-1 bg-white shadow">
				<Tree records={records} highlightText={this.state.filter} opened={opened} onChoose={({id, name}) => this.onClick ({target: {id, name}})} />
			</div>
		</div>;
	}
	
	render () {
		let addCls = this.props.error ? " is-invalid" : "";
		
		return (
			<div>
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
					{this.state.showDialog ? this.renderTree () : <div />}
				</div>
			</div>
		);
	}
};
DictField.displayName = "DictField";

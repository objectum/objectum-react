/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Return from "./Return";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import ModelList from "./ModelList";
import {getHash, goRidLocation} from "../modules/common";
import {i18n} from "./../i18n";
import _each from "lodash.foreach";
import _values from "lodash.values";
import _chunk from "lodash.chunk";
import _isObject from "lodash.isobject";
import _sortBy from "lodash.sortby";
import Loading from "./Loading";

export default class ModelRecord extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		this.state = {
			rid: rid == "new" ? null : rid,
			model: hash.opts.model,
			label: "",
			loading: true
		};
		if (this.state.rid) {
			this.state.disableActions = true;
		}
		this.regModel = this.props.store.getRegistered (hash.opts.model) || {};
	}
	
	async componentDidMount () {
		let state = {loading: false};
		
		if (this.state.rid) {
			this.record = await this.props.store.getRecord (this.state.rid);
			
			state.label = this.record.getLabel ();
			state.disableActions = false;
			
			if (this.record._accessUpdate) {
				state.disableActions = !(await this.record._accessUpdate ());
			}
		}
		this.setState (state);
	}
	
	onCreate = async (rid) => {
		this.record = await this.props.store.getRecord (rid);
		this.setState ({rid, label: this.record.getLabel ()});
		goRidLocation (this.props, rid);
	}
	
	getTables () {
		let m = this.props.store.getModel (this.state.model);
		
		if (m.isTable ()) {
			return [];
		}
		try {
			let t = this.props.store.getModel (`t.${m.getPath ()}`);
			let tables = [], has = {};
			
			_each (this.props.store.map ["model"], m => {
				if (m.get ("parent") == t.get ("id") && !has [m.getPath ()]) {
					tables.push (m);
					has [m.getPath ()] = true;
				}
			});
			return tables;
		} catch (err) {
			return [];
		}
	}
	
	async componentDidUpdate () {
		let rid = this.props.match.params.rid.split ("#")[0];
		
		rid = rid == "new" ? null : rid;
		
		if (this.state.rid != rid) {
			let hash = getHash ();
			let label = "";
			
			if (rid) {
				let o = await this.props.store.getRecord (rid);
				
				label = o.getLabel ();
			}
			this.regModel = this.props.store.getRegistered (hash.opts.model) || {};
			
			this.setState ({
				rid,
				model: hash.opts.model,
				label
			});
		}
	}
	
	renderProperty (p, key, o, props = {}) {
		let dict = false;
		let chooseModel;
		
		if (p.get ("type") >= 1000) {
			let m = this.props.store.getModel (p.get ("type"));
			
			dict = m.isDictionary ();
			
			if (!dict) {
				chooseModel = m.getPath ();
			}
		}
		let value;
		let disabled = false;
		let hash = getHash ();
		let rm = this.props.store.getRegistered (this.state.model);
		
		if (o && o.disabled) {
			if (this.record && typeof (this.record [o.disabled]) == "function") {
				disabled = this.record [o.disabled] ();
			} else if (typeof (rm && rm [o.disabled]) == "function") {
				disabled = rm [o.disabled] ({store: this.props.store});
			}
		}
		if (o && o.groupProperty) {
			props.groupProperty = props.groupProperty || o.groupProperty;
		}
		if (hash.opts && hash.opts.parentModel) {
			let pm = this.props.store.getModel (hash.opts.parentModel);
			
			if (pm.get ("code") == p.get ("code")) {
				disabled = true;
				value = hash.opts.parentId;
			}
		}
		if (o && o.defaultValue && !this.record) {
			value = o.defaultValue;
		}
		if (chooseModel) {
			return (
				<Field
					{...props} key={key} property={p.get ("code")} disabled={disabled} value={value}
					choose={{cmp: ModelList, model: chooseModel}}
				/>
			);
		} else {
			return (
				<Field
					{...props} key={key} property={p.get ("code")} dict={dict} disabled={disabled} value={value}
				/>
			);
		}
	}
	
	renderCol (o, key, property, model, result) {
		let item;
		
		if ((typeof (o) == "string" && o.substr (0, 2) == "t.") || o.table) {
			result.type = "table";
			
			try {
				let tableModel = this.props.store.getModel (o.table || o);
				let opts = tableModel.getOpts ();
				let label = tableModel.getLabel ();
				
				if (opts.grid && opts.grid.hasOwnProperty ("label")) {
					label = opts.grid.label;
				}
				if (!this.state.rid) {
					return null;
				}
				item = (
					<div className="m-1">
						<ModelList
							{...this.props}
							disableActions={this.state.disableActions}
							id={key}
							label={i18n (label)}
							store={this.props.store}
							model={tableModel.getPath ()}
							isTable={true}
							parentModel={model.getPath ()}
							parentId={this.state.rid}
						/>
					</div>
				);
			} catch (err) {
				item = o;
			}
		} else {
			if (! property && typeof (o) == "string") {
				return o;
			}
			item = o.label;
			
			if (property || o.property) {
				result.type = "property";
				item = this.renderProperty (property || model.properties [o.property], key, o, o.props);
			}
		}
		if (o.tag) {
			if (! Array.isArray (o.tag)) {
				o.tag = [o.tag];
			}
			_each (o.tag, Tag => {
				item = <Tag>{item}</Tag>;
			});
		}
		if (!item) {
			o = React.cloneElement (o, {
				...this.props,
				parentModel: model.getPath (),
				parentId: this.state.rid
			});
		}
		return item || o;
	}
	
	renderLayout (layout, model, level = 0, result = {propertyNum: 0, tableNum: 0, newRecordFormNum: 0}) {
		let items = [];
		let gen = 0;
		
		if (Array.isArray (layout)) {
			if (!layout.length) {
				return (<div />);
			}
			let formItems = [];
			let rid = null;
			
			for (let i = 0; i < layout.length; i ++) {
				let row = layout [i];
				
				if (typeof (row) == "string" && this.record && this.record [row]) {
					rid = this.record [row];
				}
				if (Array.isArray (row)) {
					formItems.push (<div className="row no-gutters" key={`row-${i}`}>
						{row.map ((code, j) => {
							let property = model.properties [code];
							let cls = "";
							
							if (_isObject (code) && code ["class"]) {
								if (Array.isArray (code ["class"])) {
									cls = code ["class"].join (" ");
								} else {
									cls = code ["class"];
								}
							}
							if (j) {
								cls += " ml-1";
							}
							let colResult = {};
							let col = this.renderCol (code, `field-${j}`, property, model, colResult);
							
							if (colResult.type == "property") {
								result.propertyNum ++;
							}
							if (colResult.type == "table" && col !== null) {
								result.tableNum ++;
							}
							return (
								<div className={"col " + cls} key={`col-${j}`}>
									{col}
								</div>
							);
						})}
					</div>);
				}
			}
			if (formItems.length) {
				if (result.propertyNum) {
					if (!this.state.rid) {
						result.newRecordFormNum ++;
					}
					let form = <Form key={`form-${level}-${gen ++}`} store={this.props.store} rsc="record" rid={this.state.rid} mid={this.state.model} onCreate={this.onCreate} disableActions={this.state.disableActions}>
						{formItems}
					</Form>;
					
					if (this.regModel && this.regModel._renderForm) {
						form = this.regModel._renderForm ({form, store: this.props.store});
					}
					items.push (form);
				} else {
					items.push (<div key={`form-${level}-${gen ++}`}>{formItems}</div>);
				}
			}
		} else
		if (_isObject (layout)) {
			let tabs = [], newRecordFormNum = 0;
			
			Object.keys (layout).forEach ((tabName, i) => {
				let result = {propertyNum: 0, tableNum: 0, newRecordFormNum: 0};
				let tab = this.renderLayout (layout [tabName], model, level + 1, result);
				
				newRecordFormNum += result.newRecordFormNum;
				
				if (this.state.rid || (result.propertyNum && newRecordFormNum < 2) || (result.tableNum && (!result.propertyNum || newRecordFormNum < 2))) {
					tabs.push (<Tab key={`tab-${level}-${gen ++}`} label={tabName}>
						{tab}
					</Tab>);
				}
			});
			items.push (<div className="p-1" key={`tabs-${model ? model.id : "n"}-${level}-${gen}`}>
				<Tabs id={`tabs-${model ? model.id : "n"}-${level}-${gen}`}>
					{tabs}
				</Tabs>
			</div>);
		}
		return items;
	}
	
	render () {
		let m = this.props.store.getModel (this.state.model);
		let regModel = this.props.store.getRegistered (this.state.model) || {};
		let properties = _sortBy (_values (m.properties), ["order", "name"]);
		let label = i18n ("Record");
		let columns = 1;
		
		if (regModel._form) {
			let _form = regModel._form ();
		
			if (_form.label) {
				label = _form.label;
			}
			if (_form.columns) {
				columns = _form.columns;
			}
		}
		if (this.state.loading) {
			return <div className="container">
				<div className="p-4 border shadow-sm">
					<Loading />
				</div>
			</div>;
		}
		if (regModel._layout) {
			let form = <div className="container">
				<Return {...this.props} />
				<div className="text-white bg-info py-1">
					<strong className="pl-2">{label + ": " + this.state.label}</strong>
				</div>
				<div className="border shadow-sm">
					{this.renderLayout (regModel._layout ({store: this.props.store, id: this.state.rid}), m)}
				</div>
			</div>;
			return form;
		}
		properties = _chunk (properties, columns);
		
		let colWidth = 12 / columns | 0;
		let form = <Form key="form1" store={this.props.store} rsc="record" rid={this.state.rid} mid={this.state.model} onCreate={this.onCreate} disableActions={this.state.disableActions}>
			{properties.map ((properties2, i) => {
				return (
					<div key={`row-${i}`} className="row">
						{properties2.map ((p, j) => {
							return (
								<div key={`col-${i}-${j}`}className={`col-sm-${colWidth}`}>
									{this.renderProperty (p, `field-${i}-${j}`)}
								</div>
							);
						})}
					</div>
				);
			})}
		</Form>;
		
		if (this.regModel && this.regModel._renderForm) {
			form = this.regModel._renderForm ({form, store: this.props.store});
		}
		form = <div className="container">
			<Return {...this.props} />
			<div className="border shadow-sm">
				<Tabs key={`tabs-${this.state.model}`} id={`tabs-${this.state.model}`} label={label + ": " + this.state.label}>
					<Tab key={`tab1-${this.state.model}`} label="Information">
						{form}
					</Tab>
					{this.state.rid && this.getTables ().map ((t, i) => {
						let label = t.get ("name");
						let opts = t.getOpts ();
						
						if (opts.grid && opts.grid.label) {
							label = opts.grid.label;
						}
						return (
							<Tab key={`table-${this.state.model}-${i}`} label={label}>
								<div className="p-1">
									<ModelList
										{...this.props}
										id={`list-${i}`}
										/*ref={`list-${i}`}*/
										label=""
										store={this.props.store}
										model={t.getPath ()}
										parentModel={m.getPath ()}
										parentId={this.state.rid}
										disableActions={this.state.disableActions}
									/>
								</div>
							</Tab>
						);
					})}
				</Tabs>
			</div>
		</div>;
		return form;
	}
};
ModelRecord.displayName = "ModelRecord";

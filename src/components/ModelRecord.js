/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import ModelList from "./ModelList";
import {getHash, goRidLocation} from "./helper";
import {i18n} from "./../i18n";
import _ from "lodash";
import Loading from "./Loading";
import Fade from "react-reveal/Fade";

class ModelRecord extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			model: hash.opts.model,
			label: "",
			loading: true
		};
		if (me.state.rid) {
			me.state.disableActions = true;
		}
		me.onCreate = me.onCreate.bind (me);
	}
	
	async componentDidMount () {
		let me = this;
		let state = {loading: false};
		
		if (me.state.rid) {
			me.record = await me.props.store.getRecord (me.state.rid);
			
			state.label = me.record.getLabel ();
			state.disableActions = false;
			
			if (me.record._canChange) {
				state.disableActions = !(await me.record._canChange ());
			}
		}
		me.setState (state);
	}
	
	async onCreate (rid) {
		let me = this;
		
		me.record = await me.props.store.getRecord (rid);
		
		me.setState ({rid, label: me.record.getLabel ()});
		
		goRidLocation (me.props, rid);
	}
	
	getTables () {
		let me = this;
		let m = me.props.store.getModel (me.state.model);
		
		if (m.isTable ()) {
			return [];
		}
		try {
			let t = me.props.store.getModel (`t.${m.getPath ()}`);
			let tables = [], has = {};
			
			_.each (me.props.store.map ["model"], m => {
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
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		
		rid = rid == "new" ? null : rid;
		
		if (me.state.rid != rid) {
			let hash = getHash ();
			let label = "";
			
			if (rid) {
				let o = await me.props.store.getRecord (rid);
				
				label = o.getLabel ();
			}
			me.setState ({
				rid,
				model: hash.opts.model,
				label
			});
		}
	}
	
	renderProperty (p, key, o, props = {}) {
		let me = this;
		let dict = false;
		let chooseModel;
		
		if (p.get ("type") >= 1000) {
			let m = me.props.store.getModel (p.get ("type"));
			
			dict = m.isDictionary ();
			
			if (!dict) {
				chooseModel = m.getPath ();
			}
		}
		let value;
		let disabled = false;
		let hash = getHash ();
		
		if (o.disabled && typeof (me.record [o.disabled]) == "function") {
			disabled = me.record [o.disabled] ();
		}
		if (hash.opts && hash.opts.parentModel) {
			let pm = me.props.store.getModel (hash.opts.parentModel);
			
			if (pm.get ("code") == p.get ("code")) {
				disabled = true;
				value = hash.opts.parentId;
			}
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
		let me = this;
		let item;
		
		if (typeof (o) == "string" && o.substr (0, 2) == "t.") {
			result.type = "table";
			
			try {
				let tableModel = me.props.store.getModel (o);
				let opts = tableModel.getOpts ();
				let label = tableModel.getLabel ();
				
				if (opts.grid && opts.grid.hasOwnProperty ("label")) {
					label = opts.grid.label;
				}
				if (!me.state.rid) {
					return null;
				}
				item = (
					<div className="m-1">
						<ModelList
							{...me.props}
							disableActions={me.state.disableActions}
							id={key}
							label={i18n (label)}
							store={me.props.store}
							model={tableModel.getPath ()}
							parentModel={model.getPath ()}
							parentId={me.state.rid}
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
				item = me.renderProperty (property || model.properties [o.property], key, o, o.props);
			}
		}
		if (o.tag) {
			if (! _.isArray (o.tag)) {
				o.tag = [o.tag];
			}
			_.each (o.tag, Tag => {
				item = <Tag>{item}</Tag>;
			});
		}
		return item;
	}
	
	renderLayout (layout, model, level = 0, result = {propertyNum: 0, tableNum: 0, newRecordFormNum: 0}) {
		let me = this;
		let items = [];
		let gen = 0;
		
		if (_.isArray (layout)) {
			if (!layout.length) {
				return (<div />);
			}
			let formItems = [];
			let rid = null;
			
			for (let i = 0; i < layout.length; i ++) {
				let row = layout [i];
				
				if (typeof (row) == "string" && me.record && me.record [row]) {
					rid = me.record [row];
				}
				if (_.isArray (row)) {
					formItems.push (
						<div className="row no-gutters" key={`row-${i}`}>
							{row.map ((code, j) => {
								let property = model.properties [code];
								let cls = "";
								
								if (_.isObject (code) && code ["class"]) {
									if (_.isArray (code ["class"])) {
										cls = code ["class"].join (" ");
									} else {
										cls = code ["class"];
									}
								}
								if (j) {
									cls += " ml-1";
								}
								let colResult = {};
								let col = me.renderCol (code, `field-${j}`, property, model, colResult);
								
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
						</div>
					);
				}
			}
			if (formItems.length) {
				if (result.propertyNum) {
					if (!me.state.rid) {
						result.newRecordFormNum ++;
					}
					items.push (
						<Form key={`form-${level}-${gen ++}`} store={me.props.store} rsc="record" rid={me.state.rid} mid={me.state.model} onCreate={me.onCreate} disableActions={me.state.disableActions}>
							{formItems}
						</Form>
					);
				} else {
					items.push (
						<div key={`form-${level}-${gen ++}`}>{formItems}</div>
					);
				}
			}
		} else
		if (_.isObject (layout)) {
			let tabs = [], newRecordFormNum = 0;
			
			Object.keys (layout).forEach ((tabName, i) => {
				let result = {propertyNum: 0, tableNum: 0, newRecordFormNum: 0};
				let tab = me.renderLayout (layout [tabName], model, level + 1, result);
				
				newRecordFormNum += result.newRecordFormNum;
				
				if ((result.propertyNum && newRecordFormNum < 2) || (result.tableNum && (!result.propertyNum || newRecordFormNum < 2))) {
					tabs.push (
						<Tab key={`tab-${level}-${gen ++}`} label={tabName}>
							{tab}
						</Tab>
					);
				}
			});
			items.push (
				<Tabs key={`tabs-${level}-${gen}`} id={`tabs-${level}-${gen}`}>
					{tabs}
				</Tabs>
			);
		}
		return items;
	}
	
	render () {
		let me = this;
		let m = me.props.store.getModel (me.state.model);
		let regModel = me.props.store.getRegistered (me.state.model) || {};
		let properties = _.sortBy (_.values (m.properties), ["order", "name"]);
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
		if (me.state.loading) {
			return (
				<div className="container">
					<div className="border bg-white shadow-sm">
						<Loading />
					</div>
				</div>
			);
		}
		if (regModel._layout) {
			return (
				<div className="container">
					<div className="text-white bg-dark py-1">
						<strong className="pl-2">{label + ": " + me.state.label}</strong>
					</div>
					<div className="border bg-white shadow-sm">
						{me.renderLayout (regModel._layout (), m)}
					</div>
				</div>
			);
		}
		properties = _.chunk (properties, columns);
		
		let colWidth = 12 / columns | 0;
		
		return (
			<div className="container">
				<div className="bg-white shadow-sm">
					<Tabs key={`tabs-${me.state.model}`} id={`tabs-${me.state.model}`} label={label + ": " + me.state.label}>
						<Tab key={`tab1-${me.state.model}`} label="Information">
							<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid={me.state.model} onCreate={me.onCreate} disableActions={me.state.disableActions}>
								{properties.map ((properties2, i) => {
									return (
										<div key={`row-${i}`} className="row">
											{properties2.map ((p, j) => {
												return (
													<div key={`col-${i}-${j}`}className={`col-sm-${colWidth}`}>
														{me.renderProperty (p, `field-${i}-${j}`)}
													</div>
												);
											})}
										</div>
									);
								})}
							</Form>
						</Tab>
						{me.state.rid && me.getTables ().map ((t, i) => {
							let label = t.get ("name");
							let opts = t.getOpts ();
							
							if (opts.grid && opts.grid.label) {
								label = opts.grid.label;
							}
							return (
								<Tab key={`table-${me.state.model}-${i}`} label={label}>
									<ModelList
										{...me.props}
										id={`list-${i}`}
										ref={`list-${i}`}
										label=""
										store={me.props.store}
										model={t.getPath ()}
										parentModel={m.getPath ()}
										parentId={me.state.rid}
										disableActions={me.state.disableActions}
									/>
								</Tab>
							);
						})}
					</Tabs>
				</div>
			</div>
		);
	}
};
ModelRecord.displayName = "ModelRecord";

export default ModelRecord;

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

class ModelRecord extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			model: hash.opts.model,
			label: ""
		};
		me.onCreate = me.onCreate.bind (me);
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.state.rid) {
			me.record = await me.props.store.getRecord (me.state.rid);
			
			me.setState ({label: me.record.getLabel ()});
		}
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
	
	renderProperty (p, key, props = {}) {
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
					choose={{cmp: ModelList, ref: `list-${chooseModel}`, model: chooseModel}}
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
	
	renderCol (o, key, property, model) {
		let me = this;
		let item;
		
		if (typeof (o) == "string" && o.substr (0, 2) == "t.") {
			try {
				let tableModel = me.props.store.getModel (o);
				let opts = tableModel.getOpts ();
				let label = tableModel.getLabel ();
				
				if (opts.grid && opts.grid.hasOwnProperty ("label")) {
					label = opts.grid.label;
				}
				item = (
					<div className="mb-2">
						<h5>{i18n (label)}</h5>
						<ModelList
							{...me.props}
							id={key}
							label=""
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
				item = me.renderProperty (property || model.properties [o.property], key, o.props);
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
	
	renderLayout (layout, model, level = 0) {
		let me = this;
		let items = [];
		let gen = 0;
		
		if (_.isArray (layout)) {
			//if (!layout.length || typeof (layout [0]) != "string") {
			if (!layout.length) {
				return (<div />);
			}
			let formItems = [];
			let rid;
			
			for (let i = 0; i < layout.length; i ++) {
				let row = layout [i];
				
				if (typeof (row) == "string" && me.record [row]) {
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
								return (
									<div className={"col " + cls} key={`col-${j}`}>
										{me.renderCol (code, `field-${j}`, property, model)}
									</div>
								);
							})}
						</div>
					);
				}
			}
			if (rid) {
				items.push (
					<Form key={`form-${level}-${gen ++}`} store={me.props.store} rsc="record" rid={me.state.rid} mid={me.state.model} onCreate={me.onCreate}>
						{formItems}
					</Form>
				);
			} else {
				items.push (
					<div key={`div-${level}-${gen ++}`}>
						{formItems}
					</div>
				);
			}
		} else
		if (_.isObject (layout)) {
			items.push (
				<Tabs key={`tabs-${level}-${gen}`} id={`tabs-${level}-${gen}`}>
					{Object.keys (layout).map ((tabName, i) => {
						return (
							<Tab key={`tab-${level}-${gen ++}`} label={tabName}>
								{me.renderLayout (layout [tabName], model, level + 1)}
							</Tab>
						);
					})}
				</Tabs>
			);
		}
		return items;
	}
	
	render () {
		let me = this;
		let m = me.props.store.getModel (me.state.model);
		let opts = m.getOpts ();
		let properties = _.sortBy (_.values (m.properties), ["order", "name"]);
		let label = i18n ("Record");
		let columns = 1;
		
		if (opts.form) {
			if (opts.form.label) {
				label = opts.form.label;
			}
			if (opts.form.columns) {
				columns = opts.form.columns;
			}
		}
		if (opts.layout) {
			return (
				<div className="container">
					<h5 className="border bg-white shadow-sm pl-3 py-2 mb-1">{label + ": " + me.state.label}</h5>
					{!me.record ? <div /> : me.renderLayout (opts.layout, m)}
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
							<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid={me.state.model} onCreate={me.onCreate}>
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
									<ModelList {...me.props} id={`list-${i}`} ref={`list-${i}`} label="" store={me.props.store} model={t.getPath ()} parentModel={m.getPath ()} parentId={me.state.rid} />
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

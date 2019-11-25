/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import ModelList from "./ModelList";
import Back from "./Back";
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
			let o = await me.props.store.getRecord (me.state.rid);
			
			me.setState ({label: o.getLabel ()});
		}
	}
	
	async onCreate (rid) {
		let me = this;
		let o = await me.props.store.getRecord (rid);
		
		me.setState ({rid, label: o.getLabel ()});
		goRidLocation (me.props, rid);
	}
	
	renderProperty (p, key) {
		let me = this;
		let dict = false;
		let chooseModel;
		
		if (p.get ("type") >= 1000) {
			let m = me.props.store.getModel (p.get ("type"));
			
			dict = m.isDictionary ();
			
			if (!dict) {
				console.log ("renderProperty", m, m.getPath ());
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
		return (
			<Field key={key} property={p.get ("code")} dict={dict} chooseModel={chooseModel} disabled={disabled} value={value} />
		);
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
	
	render () {
		let me = this;
		let m = me.props.store.getModel (me.state.model);
		let properties = _.sortBy (_.values (m.properties), ["order", "name"]);
		let label = i18n ("Record");
		let columns = 1;
		let opts = m.getOpts ();
		
		if (opts.form) {
			if (opts.form.label) {
				label = opts.form.label;
			}
			if (opts.form.columns) {
				columns = opts.form.columns;
			}
		}
		properties = _.chunk (properties, columns);
		
		let colWidth = 12 / columns | 0;
		
		return (
			<div>
				<Back {...me.props} />
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
		);
	}
};
ModelRecord.displayName = "ModelRecord";

export default ModelRecord;

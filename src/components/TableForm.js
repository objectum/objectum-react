/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Action from "./Action";
import {i18n} from "../i18n";
import ModelList from "./ModelList";
import Field from "./Field";
import {timeout} from "./helper";
import _ from "lodash";
import Cell from "./Cell";
import {factory} from "objectum-client";

class TableForm extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onSave = me.onSave.bind (me);
		me.recMap = {};
		me.objectMap = {};
		me.state = {
			model: me.props.store.getModel (me.props.model),
			recs: [],
			saving: false,
			progress: 0
		};
	}
	async componentDidMount () {
		let me = this;
		let state = {};
		let result = await me.props.store.getData ({
			offset: 0,
			limit: 1000,
			filters: [["id", "in", me.props.records]],
			model: me.props.model
		});
		
		state.recs = result.recs;

		me.recMap = {};
		state.recs.forEach (rec => me.recMap [rec.id] = rec);
		
		for (let i = 0; i < me.props.properties.length; i ++) {
			let code = me.props.properties [i];
			let property = me.model.properties [code];
			
			if (property.get ("type") >= 1000 && me.props.store.getModel (property.get ("type")).isDictionary ()) {
				me.state [`dictRecs-${property.get ("type")}`] = await me.props.store.getDict (property.get ("type"));
			}
		}
		me.setState (state);
	}
	
	onChange ({value, file, id}) {
		let me = this;
		
		console.log (id, value);
		if (file) {
			me.fileMap [id] = file;
		}
		let state = {[id]: value};
		let [code] = id.split ("-");
		
		if (value == "" && me.model.properties [code].get ("notNull")) {
			state [`error-${id}`] = i18n ("Please enter value");
		} else {
			state [`error-${id}`] = null;
		}
		me.setState (state);
	}
	
	async onSave ({progress}) {
		let me = this;
		let records = [];
		
		for (let a in me.state) {
			let [code, id] = a.split ("-");
			
			if (id && me.objectMap [id] && me.objectMap [id][code] != me.state [a]) {
				if (records.indexOf (id) == -1) {
					records.push (id);
				}
			}
		}
		try {
			await timeout (200);
			await me.props.store.startTransaction (`Save TableForm: ${records.join (",")}`);
			
			for (let i = 0; i < records.length; i ++) {
				progress ({label: i18n ("Saving"), value: i + 1, max: records.length});
				
				let id = records [i];
				let record = me.objectMap [id];
				
				for (let a in me.state) {
					let [code, stateId] = a.split ("-");
					
					if (stateId == id && me.objectMap [id][code] != me.state [a]) {
						record.set (code, me.state [a]);
					}
				}
				await record.sync ();
			}
			await me.props.store.commitTransaction ();
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			throw err;
		}
	}
	
	isChanged () {
		let me = this;
		let result = false;
		
		for (let a in me.state) {
			let [code, id] = a.split ("-");
			
			if (id && me.objectMap [id] && me.objectMap [id][code] != me.state [a]) {
				result = true;
			}
		}
		return result;
	}
	
	renderProperty (p, value, object, cls, key) {
		let me = this;
		let opts = {
			type: p.get ("type"),
			id: key,
			key,
			property: p.get ("code"),
			object,
			cls,
			model: cls.getPath (),
			value,
			dict: false,
			onChange: me.onChange,
			error: me.state [`error-${key}`],
			recs: me.state [`dictRecs-${p.get ("type")}`] || [],
			rsc: "record",
			store: me.props.store
		};
		if (p.get ("type") >= 1000) {
			let m = me.props.store.getModel (p.get ("type"));
			
			opts.dict = m.isDictionary ();
			
			if (!opts.dict) {
				opts.choose = {
					cmp: ModelList,
					ref: `list-${m.getPath ()}`,
					model: m.getPath ()
				};
			}
		}
		return (
			<Field {...opts} />
		);
	}
	
	render () {
		let me = this;
		
		if (!me.props.colMap) {
			return (<div />);
		}
		me.model = me.model || me.props.store.getModel (me.props.model);
		
		return (
			<div>
				<div className="actions border p-1 bg-white shadow-sm">
					<Action onClick={me.onSave}	disabled={!me.isChanged () || me.state.saving}>
						<i className="fas fa-check mr-2"/>{i18n ("Save")}
					</Action>
				</div>
				<div>
					<table className="table table-bordered bg-white shadow-sm objectum-table px-1 pt-1 pb-5 mb-0 mt-1">
						<thead className="thead-dark">
						<tr>
							<th className="align-top">id</th>
							{me.props.properties.map ((code, i) => {
								let opts = {
									key: i,
									className: "align-top"
								};
								if (me.props.colMap [code].type >= 1000) {
									opts.style = {width: "250px"};
								}
								return (
									<th {...opts}>{me.props.colMap [code] ? me.props.colMap [code].name : ""}</th>
								);
							})}
						</tr>
						</thead>
						<tbody>
						{me.state.recs.length != me.props.records.length ? <tr><td colSpan={me.props.properties.length} className="text-primary"><Loading /></td></tr> :
							me.props.records.map ((id, i) => {
								let rec = me.recMap [id];
								let object = factory ({
									store: me.props.store,
									rsc: "record", data: {
										id,
										_model: me.model.getPath (),
										...rec
									}
								});
								me.objectMap [id] = object;
								
								return (
									<tr key={i}>
										<td key={`id-${i}`} className="align-top">{id}</td>
										{me.props.properties.map ((code, i) => {
											let editable = true;
											
											if (_.isArray (me.props.editable) && me.props.editable.indexOf (code) == -1) {
												editable = false;
											}
											if (!rec) {
												return (
													<td key={i} className="align-top pt-1 pb-0">
														rec not exist
													</td>
												);
											}
											return (
												<td key={i} className="align-top pt-1 pb-0">
													{editable ?
														me.renderProperty (me.model.properties [code], rec [code], object, me.model, `${code}-${id}`) :
														<Cell store={me.props.store} value={rec [code]} col={me.props.colMap [code]} rec={rec} />
													}
												</td>
											);
										})}
									</tr>
								);
							})
						}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
};
TableForm.displayName = "TableForm";

export default TableForm;

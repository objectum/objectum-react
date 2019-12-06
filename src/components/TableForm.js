/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Fade from "react-reveal/Fade";
import Loading from "./Loading";
import {i18n} from "../i18n";
import ModelList from "./ModelList";
import Field from "./Field";
import {timeout} from "./helper";

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
	
	onChange (val, file) {
		let me = this;
		let id = val.target.id;
		let v = val.target.value;
		
		if (val.target.type === "checkbox") {
			v = val.target.checked;
		}
		if (file) {
			me.fileMap [id] = file;
		}
		let state = {[id]: v};
		let [code] = id.split ("-");
		
		if (v == "" && me.model.properties [code].get ("notNull")) {
			state [`error-${id}`] = i18n ("Please enter value");
		} else {
			state [`error-${id}`] = null;
		}
		me.setState (state);
	}
	
	async onSave () {
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
		me.setState ({
			saving: true,
			progress: 0
		});
		let state = {
			saving: false,
			progress: 0
		};
		try {
			await timeout (200);
			
			me.props.store.startTransaction (`Save TableForm: ${records.join (",")}`);
			
			for (let i = 0; i < records.length; i ++) {
				me.setState ({progress: 100 / records.length * (i + 1)});
				
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
			me.props.store.commitTransaction ();
		} catch (err) {
			me.props.store.rollbackTransaction ();
			state.error = err.message;
		}
		me.setState (state);
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
			opts.chooseModel = m.getPath ();
			
			if (!opts.dict) {
				opts.choose = ModelList;
				opts.chooseRef = `list-${m.getPath ()}`;
				opts.model = m.getPath ();
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
			<Fade>
				<div className="actions border p-1 bg-white shadow-sm">
					<button type="button" className="btn btn-primary mr-1" onClick={me.onSave} disabled={!me.isChanged () || me.state.saving}>
						{me.state.saving ?
							<span><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"/>{i18n ("Saving")}</span> :
							<span><i className="fas fa-check mr-2"/>{i18n ("Save")}</span>
						}
					</button>
					<div className="progress mt-1">
						<div className="progress-bar" role="progressbar" style={{width: me.state.progress + "%"}} aria-valuenow={me.state.progress} aria-valuemin={0} aria-valuemax={100} />
					</div>
				</div>
				<div>
					<table className="table table-bordered bg-white shadow-sm objectum-table p-1 mb-0 mt-1">
						<thead className="thead-dark">
						<tr>
							<th className="align-top">id</th>
							{me.props.properties.map ((code, i) => {
								return (
									<th key={i} className="align-top">{me.props.colMap [code] ? me.props.colMap [code].name : ""}</th>
								);
							})}
						</tr>
						</thead>
						<tbody>
						{me.state.recs.length != me.props.records.length ? <tr><td colSpan={me.props.properties.length} className="text-primary"><Loading /></td></tr> :
							me.props.records.map ((id, i) => {
								let rec = me.recMap [id];
								let object = me.props.store.factory ({
									rsc: "record", data: {
										id,
										_model: me.model.getPath (),
										...rec
									}
								});
								me.objectMap [id] = object;
								
								return (
									<tr key={i}>
										<td key={`id-${i}`} className="align-middle">{id}</td>
										{me.props.properties.map ((code, i) => {
											return (
												<td key={i} className="align-middle pt-1 pb-0">
													{me.renderProperty (me.model.properties [code], rec [code], object, me.model, `${code}-${id}`)}
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
			</Fade>
		);
	}
};
TableForm.displayName = "TableForm";

export default TableForm;

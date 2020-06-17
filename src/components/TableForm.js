/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Loading, Action, ModelList, Field} from "..";
import {i18n, timeout} from "..";
import _find from "lodash.find"
import _map from "lodash.map";
import Cell from "./Cell";
import {execute} from "objectum-client";

class TableForm extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onSave = me.onSave.bind (me);
		me.recMap = {};
		me.objectMap = {};
		me.state = {
			loading: true,
			model: me.props.store.getModel (me.props.model),
			recs: me.props.recs,
			saving: false,
			progress: 0
		};
		me.model = me.model || me.props.store.getModel (me.props.model);
	}
	async componentDidMount () {
		let me = this;
		let state = {
			loading: false,
			recordMap: {}
		};
		state.records = await me.props.store.getRecords ({
			model: me.props.model,
			filters: [
				["id", "in", _map (me.state.recs, "id")]
			]
		});
		state.records.forEach (record => state.recordMap [record.id] = record);
		
		for (let i = 0; i < me.props.cols.length; i ++) {
			let code = me.props.cols [i].code;
			let property = me.model.properties [code];
			
			if (property && property.type >= 1000 && me.props.store.getModel (property.type).isDictionary ()) {
				me.state [`dictRecs-${property.type}`] = await me.props.store.getDict (property.type);
			}
		}
		me.setState (state);
	}
	
	onChange ({value, file, id}) {
		let me = this;
		
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
		
		me.setState ({saving: true});
		
		for (let a in me.state) {
			let [code, id] = a.split ("-");
			
			if (id && me.state.recordMap [id] && me.state.recordMap [id][code] != me.state [a]) {
				if (records.indexOf (id) == -1) {
					records.push (id);
				}
			}
		}
		try {
			await timeout (200);
			await me.props.store.startTransaction (`${i18n ("Saving")}, id: ${records.join (",")}`);
			
			for (let i = 0; i < records.length; i ++) {
				progress ({label: i18n ("Saving"), value: i + 1, max: records.length});
				
				let id = records [i];
				let record = me.state.recordMap [id];
				
				for (let a in me.state) {
					let [code, stateId] = a.split ("-");
					
					if (stateId == id && me.state.recordMap [id][code] != me.state [a]) {
						record.set (code, me.state [a]);
					}
				}
				await record.sync ();
			}
			await me.props.store.commitTransaction ();
			
			me.setState ({saving: false});
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			throw err;
		}
		if (me.props.onSave) {
			try {
				await execute (me.props.onSave, {tableForm: me, store: me.props.store});
			} catch (err) {
				throw err;
			}
		}
	}
	
	isChanged () {
		let me = this;
		let result = false;
		
		for (let a in me.state) {
			let [code, id] = a.split ("-");
			
			if (id && me.state.recordMap [id] && me.state.recordMap [id][code] != me.state [a]) {
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
		if (me.state.loading) {
			return (
				<div className="p-2 bg-white text-primary">
					<Loading />
				</div>
			);
		}
		let prevGroupColValue = null;
		let items = [], visibleColNum = 0;
		
		me.props.cols.forEach (col => {
			if (me.props.hideCols.indexOf (col.code) == - 1 && me.props.groupCol != col.code) {
				visibleColNum ++;
			}
		});
		me.state.records.forEach ((record, i) => {
			let rec = _find (me.state.recs, {id: record.id});
			
			if (me.props.groupCol) {
				if (rec [me.props.groupCol] != prevGroupColValue) {
					items.push (
						<tr key={"groupCol-" + i} className="table-secondary">
							<td
								className="align-top text-left"
								colSpan={visibleColNum}
							>
								<Cell
									store={me.props.store}
									value={rec [me.props.groupCol]}
									col={me.props.colMap [me.props.groupCol]}
									rec={rec}
								/>
							</td>
						</tr>
					);
				}
				prevGroupColValue = rec [me.props.groupCol];
			}
			items.push (
				<tr key={i}>
					{me.props.cols.map ((col, i) => {
						if (me.props.hideCols.indexOf (col.code) > -1 || me.props.groupCol == col.code) {
							return;
						}
						let code = col.code;
						let editable = true;
						
						if (Array.isArray (me.props.editable) && me.props.editable.indexOf (code) == -1) {
							editable = false;
						}
						if (!me.model.properties [code]) {
							editable = false;
						}
						return (
							<td key={i} className="align-top p-1">
								{editable ?
									me.renderProperty (me.model.properties [code], record [code], record, me.model, `${code}-${record.id}`) :
									me.model.properties [code] ?
										<Cell store={me.props.store} value={record [code]} col={me.props.colMap [code]} rec={record} /> :
										<Cell store={me.props.store} value={rec [code]} col={me.props.colMap [code]} rec={rec} />
								}
							</td>
						);
					})}
				</tr>
			);
		});
		
		return (
			<div className="p-1">
				<div className="actions pb-1">
					<Action onClick={me.onSave}	disabled={!me.isChanged () || me.state.saving}>
						<i className="fas fa-check mr-2"/>{i18n ("Save")}
					</Action>
				</div>
				<div>
					<table className="table objectum-table table-bordered pb-5 px-1 pt-1 mb-0">
						<thead className="bg-info text-white">
						<tr>
							{me.props.cols.map ((col, i) => {
								if (me.props.hideCols.indexOf (col.code) > -1 || me.props.groupCol == col.code) {
									return;
								}
								let label = i18n (col.name);
								
								return (
									<th key={i} scope="col" className="align-top">{label}</th>
								);
							})}
						</tr>
						</thead>
						<tbody>
						{items}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
};
TableForm.displayName = "TableForm";

export default TableForm;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Loading, Action, ModelList, Field} from "..";
import {i18n, timeout} from "..";
import _find from "lodash.find"
import _map from "lodash.map";
import Cell from "./Cell";
import {execute} from "objectum-client";

export default class TableForm extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			loading: true,
			model: this.props.store.getModel (this.props.model),
			recs: this.props.recs,
			saving: false,
			progress: 0
		};
		this.model = this.model || this.props.store.getModel (this.props.model);
	}
	async componentDidMount () {
		let state = {
			loading: false,
			recordMap: {}
		};
		state.records = await this.props.store.getRecords ({
			model: this.props.model,
			filters: [
				["id", "in", _map (this.state.recs, "id")]
			]
		});
		state.records.forEach (record => state.recordMap [record.id] = record);
		
		for (let i = 0; i < this.props.cols.length; i ++) {
			let code = this.props.cols [i].code;
			let property = this.model.properties [code];
			
			if (property && property.type >= 1000 && this.props.store.getModel (property.type).isDictionary ()) {
				this.state [`dictRecs-${property.type}`] = await this.props.store.getDict (property.type);
			}
		}
		this.setState (state);
	}
	
	onChange = ({value, file, id}) => {
		if (file) {
			this.fileMap [id] = file;
		}
		let state = {[id]: value};
		let [code] = id.split ("-");
		
		if (value == "" && this.model.properties [code].get ("notNull")) {
			state [`error-${id}`] = i18n ("Please enter value");
		} else {
			state [`error-${id}`] = null;
		}
		this.setState (state);
	}
	
	onSave = async ({progress}) => {
		let records = [];
		
		this.setState ({saving: true});
		
		for (let a in this.state) {
			let [code, id] = a.split ("-");
			
			if (id && this.state.recordMap [id] && this.state.recordMap [id][code] != this.state [a]) {
				if (records.indexOf (id) == -1) {
					records.push (id);
				}
			}
		}
		try {
			await timeout (200);
			await this.props.store.startTransaction (`${i18n ("Saving")}, id: ${records.join (",")}`);
			
			for (let i = 0; i < records.length; i ++) {
				progress ({label: i18n ("Saving"), value: i + 1, max: records.length});
				
				let id = records [i];
				let record = this.state.recordMap [id];
				
				for (let a in this.state) {
					let [code, stateId] = a.split ("-");
					
					if (stateId == id && this.state.recordMap [id][code] != this.state [a]) {
						record.set (code, this.state [a]);
					}
				}
				await record.sync ();
			}
			await this.props.store.commitTransaction ();
			
			this.setState ({saving: false});
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		if (this.props.onSave) {
			try {
				await execute (this.props.onSave, {tableForm: this, store: this.props.store});
			} catch (err) {
				throw err;
			}
		}
	}
	
	isChanged () {
		let result = false;
		
		for (let a in this.state) {
			let [code, id] = a.split ("-");
			
			if (id && this.state.recordMap [id] && this.state.recordMap [id][code] != this.state [a]) {
				result = true;
			}
		}
		return result;
	}
	
	renderProperty (p, value, object, cls, key) {
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
			onChange: this.onChange,
			error: this.state [`error-${key}`],
			recs: this.state [`dictRecs-${p.get ("type")}`] || [],
			rsc: "record",
			store: this.props.store
		};
		if (p.get ("type") >= 1000) {
			let m = this.props.store.getModel (p.get ("type"));
			
			opts.dict = m.isDictionary ();
			
			if (!opts.dict) {
				opts.choose = {
					cmp: ModelList,
					ref: `list-${m.getPath ()}`,
					model: m.getPath ()
				};
			}
		}
		return <Field {...opts} />;
	}
	
	render () {
		if (!this.props.colMap) {
			return <div />;
		}
		if (this.state.loading) {
			return <div className="p-2 bg-white text-primary">
				<Loading />
			</div>;
		}
		let prevGroupColValue = null;
		let items = [], visibleColNum = 0;
		
		this.props.cols.forEach (col => {
			if (this.props.hideCols.indexOf (col.code) == - 1 && this.props.groupCol != col.code) {
				visibleColNum ++;
			}
		});
		this.state.records.forEach ((record, i) => {
			let rec = _find (this.state.recs, {id: record.id});
			
			if (this.props.groupCol) {
				if (rec [this.props.groupCol] != prevGroupColValue) {
					items.push (<tr key={"groupCol-" + i} className="table-secondary">
						<td
							className="align-top text-left"
							colSpan={visibleColNum}
						>
							<Cell
								store={this.props.store}
								value={rec [this.props.groupCol]}
								col={this.props.colMap [this.props.groupCol]}
								rec={rec}
							/>
						</td>
					</tr>);
				}
				prevGroupColValue = rec [this.props.groupCol];
			}
			items.push (<tr key={i}>
				{this.props.cols.map ((col, i) => {
					if (this.props.hideCols.indexOf (col.code) > -1 || this.props.groupCol == col.code) {
						return;
					}
					let code = col.code;
					let editable = true;
					
					if (Array.isArray (this.props.editable) && this.props.editable.indexOf (code) == -1) {
						editable = false;
					}
					if (!this.model.properties [code]) {
						editable = false;
					}
					return (
						<td key={i} className="align-top p-1">
							{editable ?
								this.renderProperty (this.model.properties [code], record [code], record, this.model, `${code}-${record.id}`) :
								this.model.properties [code] ?
									<Cell store={this.props.store} value={record [code]} col={this.props.colMap [code]} rec={record} /> :
									<Cell store={this.props.store} value={rec [code]} col={this.props.colMap [code]} rec={rec} />
							}
						</td>
					);
				})}
			</tr>);
		});
		
		return <div className="p-1">
			<div className="actions pb-1">
				<Action onClick={this.onSave}	disabled={!this.isChanged () || this.state.saving}>
					<i className="fas fa-check mr-2"/>{i18n ("Save")}
				</Action>
			</div>
			<div>
				<table className="table objectum-table table-bordered pb-5 px-1 pt-1 mb-0">
					<thead className="bg-info text-white">
					<tr>
						{this.props.cols.map ((col, i) => {
							if (this.props.hideCols.indexOf (col.code) > -1 || this.props.groupCol == col.code) {
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
		</div>;
	}
};
TableForm.displayName = "TableForm";

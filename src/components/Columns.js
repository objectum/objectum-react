import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import {i18n} from "./../i18n";

export default class Columns extends Component {
	constructor (props) {
		super (props);
		
		this.query = this.props.query;
		this.state = {
			refresh: false
		};
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: "/column/new#" + JSON.stringify ({
				opts: {
					query: this.query
				}
			})
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: "/column/" + id
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing column: " + id);
			await this.props.store.removeColumn (id);
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.setState (state);
	}

	onSynchronize = async () => {
		let state = {synchronizing: false, refresh: !this.state.refresh};
		
		try {
			this.setState ({synchronizing: true});
			
			await this.props.store.startTransaction ("Synchronize columns");
			
			let query = this.props.store.getQuery (this.query);
			
			if (!query.get ("query")) {
				return;
			}
			// remove duplicates
			let columnResult = await this.props.store.getData ({
				query: "objectum.column",
				queryId: this.query,
				offset: 0, limit: 1000
			});
			let columnRecs = columnResult.recs;
			let columnMap = {};
			
			for (let i = 0; i < columnRecs.length; i ++) {
				let rec = columnRecs [i];
				
				if (columnMap [rec.code]) {
					await this.props.store.removeColumn (rec.id);
				}
				columnMap [rec.code] = this.props.store.getColumn (rec.id);
			}
			// create columns
			let queryResult = await this.props.store.getData ({
				query: query.getPath (),
				getColumns: true
			});
			let queryCols = queryResult.cols;
			let colMap = {};

			for (let i = 0; i < queryCols.length; i ++) {
				colMap [queryCols [i].code] = queryCols [i];
			}
			let idCol = colMap ["id"];
			
			for (let i = 0; i < queryCols.length; i ++) {
				let col = queryCols [i];
				let column = columnMap [col.code];
				
				if (column) {
					column.set ("order", i + 1);
					await column.sync ();
				} else {
					let name = col.name;
					
					if (idCol && idCol.model && col.model && col.model != idCol.model) {
						let model = this.props.store.getModel (col.model);
						
						name = `${model.name}: ${name}`;
					}
					column = await this.props.store.createColumn ({
						query: query.getPath (),
						name,
						code: col.code,
						order: i + 1,
						area: 1
					});
					columnMap [col.code] = column;
				}
			}
			// remove columns
			for (let code in columnMap) {
				let column = columnMap [code];
				let col = colMap [column.get ("code")];
				
				if (!col) {
					await this.props.store.removeColumn (column.get ("id"));
				}
			}
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.setState (state);
	}
	
	render () {
		return <Grid id="Columns" store={this.props.store} query="objectum.column" system refresh={this.state.refresh} params={{queryId: this.query}} inlineActions>
			<div className="d-flex">
				<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
				<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
				<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClick={this.onRemove} selected />
				<Action onClick={this.onSynchronize} disabled={this.state.synchronizing}>
					<i className="fas fa-wrench mr-2" />{this.state.synchronizing ? i18n ("Synchronizing") : i18n ("Synchronize")}
				</Action>
			</div>
		</Grid>;
	}
};
Columns.displayName = "Columns";

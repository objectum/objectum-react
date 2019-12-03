import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import Confirm from "./Confirm";
import {i18n} from "./../i18n";

class Columns extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.query = me.props.query;
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.onSynchronize = me.onSynchronize.bind (me);
		me.state = {
			removeConfirm: false,
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;

		me.props.history.push ({
			pathname: "/column/new#" + JSON.stringify ({
				opts: {
					query: me.query
				}
			})
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/column/" + id
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing column: " + me.state.removeId);
			await me.props.store.removeColumn (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	async onSynchronize () {
		let me = this;
		
		try {
			me.setState ({synchronizing: true});
			
			await me.props.store.startTransaction ("Synchronize columns");
			
			let query = me.props.store.getQuery (me.query);
			
			if (!query.get ("query")) {
				return;
			}
			// remove duplicates
			let columnResult = await me.props.store.getData ({
				query: "objectum.column",
				queryId: me.query,
				offset: 0, limit: 1000
			});
			let columnRecs = columnResult.recs;
			let columnMap = {};
			
			for (let i = 0; i < columnRecs.length; i ++) {
				let rec = columnRecs [i];
				
				if (columnMap [rec.code]) {
					await me.props.store.removeColumn (rec.id);
				}
				columnMap [rec.code] = me.props.store.getColumn (rec.id);
			}
			// create columns
			let queryResult = await me.props.store.getData ({
				query: query.getPath (),
				offset: 0, limit: 1
			});
			let queryCols = queryResult.cols;
			let colMap = {};
			
			for (let i = 0; i < queryCols.length; i ++) {
				let col = queryCols [i];
				let column = columnMap [col.code];
				
				colMap [col.code] = col;
				
				if (column) {
					column.set ("order", i + 1);
					await column.sync ();
				} else {
					column = await me.props.store.createColumn ({
						query: query.getPath (),
						name: col.name,
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
					await me.props.store.removeColumn (column.get ("id"));
				}
			}
			await me.props.store.commitTransaction ();
		} catch (err) {
			console.error (err);
			await me.props.store.rollbackTransaction ();
		}
		me.setState ({synchronizing: false, refresh: !me.state.refresh});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid id="Columns" store={me.props.store} query="objectum.column" system={true} refresh={me.state.refresh} params={{queryId: me.query}}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>{i18n ("Edit")}</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>{i18n ("Remove")}</Action>
						<Action onClick={me.onSynchronize} disabled={me.state.synchronizing}>
							<i className="fas fa-wrench mr-2" />{me.state.synchronizing ? i18n ("Synchronizing") : i18n ("Synchronize")}
						</Action>
					</Grid>
				</div>
				<Confirm label={i18n ("Are you sure?")} visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};
Columns.displayName = "Columns";

export default Columns;

import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import Confirm from "./Confirm";
import {i18n} from "./../i18n";
import {pushLocation} from "./helper";

class Columns extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.query = me.props.query;
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			removeConfirm: false,
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;

		pushLocation ();
		
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
		
		pushLocation ();
		
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
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid id="Columns" store={me.props.store} query="objectum.column" system={true} refresh={me.state.refresh} params={{queryId: me.query}}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>{i18n ("Edit")}</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>{i18n ("Remove")}</Action>
					</Grid>
				</div>
				<Confirm label={i18n ("Are you sure?")} visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};
Columns.displayName = "Columns";

export default Columns;

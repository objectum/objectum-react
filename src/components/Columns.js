import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import Confirm from "./Confirm";

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
		
		me.props.history.push ({
			pathname: "/column/new#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash),
					query: me.query
				}
			})
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/column/" + id + "#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash)
				}
			})
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
					<Grid id="Columns" store={me.props.store} query="objectum.column" pageRecs={10} refresh={me.state.refresh} params={{queryId: me.query}}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>Create</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>Edit</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>Remove</Action>
					</Grid>
				</div>
				<Confirm title="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};

export default Columns;

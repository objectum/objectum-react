import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import Confirm from "./Confirm";
import {i18n} from "./../i18n";
import {pushLocation} from "./helper";

class Queries extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.parent = null;
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.onChange = me.onChange.bind (me);
		me.state = {
			removeConfirm: false,
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;

		pushLocation ();
		
		me.props.history.push ({
			pathname: "/query/new#" + JSON.stringify ({
				opts: {
					parent: me.parent
				}
			})
		});
	}
	
	onEdit (id) {
		let me = this;

		pushLocation ();
		
		me.props.history.push ({
			pathname: "/query/" + id
		});
	}
	
	onChange (val) {
		this.setState ({taValue: val.target.value});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing query: " + me.state.removeId);
			await me.props.store.removeQuery (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...me.props} id="queries" ref="queries" label="Queries" store={me.props.store} query="objectum.query" tree={true} system={true} refresh={me.state.refresh} onSelectParent={(parent) => me.parent = parent}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>{i18n ("Edit")}</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>{i18n ("Remove")}</Action>
					</Grid>
				</div>
				<Confirm label="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};
Queries.displayName = "Queries";

export default Queries;

import React, {Component} from "react";
import Action from "./Action";
import Confirm from "./Confirm";
import Grid from "./Grid";
import {i18n} from "./../i18n";
import {pushLocation} from "./helper";

class ModelList extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.model = me.props.model || me.props.match.params.model.split ("#")[0];
		
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
		let opts = {
			model: me.model
		};
		if (me.props.parentModel) {
			opts.parentModel = me.props.parentModel;
			opts.parentId = me.props.parentId;
		}
		pushLocation ();
		
		me.props.history.push ({
			pathname: "/model_record/new#" + JSON.stringify ({opts})
		});
	}
	
	onEdit (id) {
		let me = this;
		let opts = {
			model: me.model
		};
		if (me.props.parentModel) {
			opts.parentModel = me.props.parentModel;
			opts.parentId = me.props.parentId;
		}
		pushLocation ();
		
		me.props.history.push ({
			pathname: "/model_record/" + id + "#" + JSON.stringify ({opts})
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing record: " + me.state.removeId);
			await me.props.store.removeRecord (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	componentDidUpdate () {
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
	}
	
	render () {
		let me = this;
		let m = me.props.store.getModel (me.model);
		let label = (m.isDictionary () ? i18n ("Dictionary") : i18n ("List")) + ": " + m.get ("name");
		let opts = m.getOpts ();

		if (opts.grid && opts.grid.label) {
			label = opts.grid.label;
		}
		if (me.props.hasOwnProperty ("label")) {
			label = me.props.label;
		}
		let params = {};
		
		if (m.isTable () && me.props.parentModel && me.props.parentId) {
			let pm = me.props.store.getModel (me.props.parentModel);
			
			params [pm.get ("code")] = me.props.parentId;
		}
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...me.props} id={`list-${me.model}`} ref={`list-${me.model}`} label={label} store={me.props.store} model={me.model} refresh={me.state.refresh} params={params}>
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
ModelList.displayName = "ModelList";

export default ModelList;

import React, {Component} from "react";
import Action from "./Action";
import Confirm from "./Confirm";
import Grid from "./Grid";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";

class ModelTree extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.model = me.props.model || me.props.match.params.model.split ("#")[0];
		
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			refresh: false
		};
		let id = me.props.id || `tree-${me.model}`;
		
		me._refs = {[id]: React.createRef ()};
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
		me.props.history.push ({
			pathname: "/model_record/new#" + JSON.stringify ({opts})
		});
	}
	
	onEdit ({id}) {
		let me = this;
		let opts = {
			model: me.model
		};
		if (me.props.parentModel) {
			opts.parentModel = me.props.parentModel;
			opts.parentId = me.props.parentId;
		}
		me.props.history.push ({
			pathname: "/model_record/" + id + "#" + JSON.stringify ({opts})
		});
	}
	
	async onRemove ({id}) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing record: " + id);
			await me.props.store.removeRecord (id);
			await me.props.store.commitTransaction ();
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		me.setState (state);
	}

	componentDidUpdate () {
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
	}
	
	render () {
		let me = this;
		let m = me.props.store.getModel (me.model);
		let label = (m.isDictionary () ? i18n ("Dictionary") : i18n ("List")) + ": " + m.get ("name");
		let opts = m.getOpts ();
		let params = {};
		
		if (opts.grid && opts.grid.label) {
			label = opts.grid.label;
		}
		if (me.props.hasOwnProperty ("label")) {
			label = me.props.label;
		}
		if (m.isTable () && me.props.parentModel && me.props.parentId) {
			let pm = me.props.store.getModel (me.props.parentModel);
			
			params [pm.get ("code")] = me.props.parentId;
		}
		let id = me.props.id || `tree-${me.model}`;
		let gridOpts = {
			...me.props,
			id,
			ref: me._refs [id],
			label,
			store: me.props.store,
			model: me.model,
			tree: true,
			refresh: me.state.refresh,
			params,
			inlineActions: true
		};
		let grid = <Grid {...gridOpts}>
			<div className="d-flex">
				<Action onClick={me.onCreate} icon="fas fa-plus" label={i18n ("Create")} />
				<Action onClick={me.onEdit} icon="fas fa-edit" label={i18n ("Edit")} selected />
				<Action onClick={me.onRemove} confirm icon="fas fa-minus" label={i18n ("Remove")} selected />
			</div>
			{me.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</div>}
		</Grid>;
		
		if (me.model._renderGrid) {
			grid = me.model._renderGrid ({grid, store: me.props.store});
		}
		return (
			<div className="bg-white shadow-sm">
				{grid}
			</div>
		);
	}
};
ModelTree.displayName = "ModelTree";

export default ModelTree;

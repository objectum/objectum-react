import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";

class ModelList extends Component {
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
	
	onEdit (id) {
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
	
	async onRemove (id) {
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
		let gridOpts = {
			...me.props,
			id: `list-${me.model}`,
			ref: `list-${me.model}`,
			store: me.props.store,
			label: (m.isDictionary () ? i18n ("Dictionary") : i18n ("List")) + ": " + m.get ("name"),
			refresh: me.state.refresh,
			model: me.model,
			params: {}
		};
		let opts = m.getOpts ();
		
		if (opts.grid) {
			gridOpts.label = opts.grid.label || gridOpts.label;

			if (opts.grid.query) {
				delete gridOpts.model;
				gridOpts.query = opts.grid.query;
			}
		}
		if (me.props.hasOwnProperty ("label")) {
			gridOpts.label = me.props.label;
		}
		if (m.isTable () && me.props.parentModel && me.props.parentId) {
			let pm = me.props.store.getModel (me.props.parentModel);
			
			gridOpts.params [pm.get ("code")] = me.props.parentId;
		}
		if (opts.grid && opts.grid.card) {
			gridOpts.card = JSON.parse (opts.grid.card);
			gridOpts.card.onEdit = me.onEdit;
		}
		if (m.isDictionary () || (opts.grid && opts.grid.editable)) {
			gridOpts.editable = true;
		}
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...gridOpts}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2" />{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</Action>
						<RemoveAction onRemove={me.onRemove} />
						{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
					</Grid>
				</div>
			</div>
		);
	}
};
ModelList.displayName = "ModelList";

export default ModelList;

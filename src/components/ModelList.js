import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import {i18n} from "./../i18n";
import {timeout} from "./helper";

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
			refresh: false,
			removing: false
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
	
	async onRemove () {
		let me = this;
		let state = {refresh: !me.state.refresh, removing: false, removeConfirm: false};
		
		me.setState ({removing: true});

		try {
			await timeout (100);

			await me.props.store.startTransaction ("Removing record: " + me.state.removeId);
			await me.props.store.removeRecord (me.state.removeId);
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
		let card;

		if (opts.grid && opts.grid.card) {
			card = JSON.parse (opts.grid.card);
			card.onEdit = me.onEdit;
		}
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...me.props} id={`list-${me.model}`} ref={`list-${me.model}`} label={label} store={me.props.store} model={me.model} refresh={me.state.refresh} params={params} card={card}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2" />{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</Action>
						{me.state.removing ?
							<span className="text-danger  ml-3 mt-1">
								<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
								{i18n ("Removing") + " ..."}
							</span> :
							me.state.removeConfirm ?
								<span className="text-danger ml-1 p-1">
									{i18n ("Are you sure?")}
									<button type="button" className="btn btn-danger btn-sm ml-2 mb-1" onClick={me.onRemove}><i className="fas fa-check mr-2" />{i18n ("Remove")}</button>
									<button type="button" className="btn btn-success btn-sm ml-2 mb-1" onClick={() => this.setState ({removeConfirm: false})}><i className="fas fa-times mr-2" />{i18n ("Cancel")}</button>
								</span> :
								<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"/>{i18n ("Remove")}</Action>
						}
						{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
					</Grid>
				</div>
			</div>
		);
	}
};
ModelList.displayName = "ModelList";

export default ModelList;

import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";
import Loading from "./Loading";
import _ from "lodash";

class ModelList extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.model = me.props.model || me.props.match.params.model.split ("#")[0];
		
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			refresh: false,
			actions: []
		};
		let m = me.props.store.getModel (me.model);
		let opts = m.getOpts ();
		
		if (opts.grid && opts.grid.actions) {
			me.state.actions = opts.grid.actions;
		}
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
	
	renderActions () {
		let me = this;
		let items = [];
		
		function updateActionState (i, action) {
			let actions = _.cloneDeep (me.state.actions);
			
			actions [i] = _.clone (action);
			
			me.setState ({actions});
		};
		async function actionHandler ({action, i, Model, method, id, grid}) {
			updateActionState (i, _.extend (action, {processing: true}));
			
			let state = {processing: false};
			
			try {
				let fn, self = grid;
				
				if (id) {
					let record = await me.props.store.getRecord (id);
					
					if (typeof (record [method]) != "function") {
						throw new Error (`Unknown method ${method}`);
					}
					fn = record [method];
					self = record;
				} else {
					if (typeof (Model [method]) != "function") {
						throw new Error (`Unknown static method ${method}`);
					}
					fn = Model [method];
				}
				let promise = fn.call (self, {
					store: me.props.store,
					id,
					grid,
					parentModel: me.props.parentModel,
					parentId: me.props.parentId,
					progressCallback: (progressValue, progressMax) => updateActionState (i, _.extend (action, {progressValue, progressMax}))
				});
				if (promise && promise.then) {
					promise.then (() => {
						updateActionState (i, _.extend (action, state));
						grid.setState ({refresh: !grid.state.refresh});
					}).catch (err => {
						state.error = err.message;
						updateActionState (i, _.extend (action, state));
					});
				} else {
					updateActionState (i, _.extend (action, state));
					grid.setState ({refresh: !grid.state.refresh});
				}
			} catch (err) {
				state.error = err.message;
				updateActionState (i, _.extend (action, state));
			}
		};
		for (let i = 0; i < me.state.actions.length; i ++) {
			try {
				let action = me.state.actions [i];
				let fn = action.onClick || action.onClickSelected;
				
				if (!fn) {
					throw new Error (`onClick, onClickSelected not exist`);
				}
				let tokens = fn.split (".");
				let method = tokens.splice (tokens.length - 1, 1)[0];
				let path = tokens.join (".");
				let Model = me.props.store.registered [path];
				
				if (!Model) {
					throw new Error (`Model "${path}" not registered`);
				}
				let actionOpts = {};
			
				if (action.onClick) {
					actionOpts.onClick = (grid) => {
						actionHandler ({action, i, Model, method, grid});
					};
				} else {
					actionOpts.onClickSelected = (id, grid) => {
						actionHandler ({action, i, Model, method, id, grid});
					};
				}
				let text = i18n ("Processing") + " ...";
				
				if (action.progressMax) {
					text = `${i18n ("Processing")}: ${action.progressValue} / ${action.progressMax}`;
				}
				items.push (
					action.processing ?
						<span className="text-primary ml-2" key={i}>
							<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />{text}
						</span> :
						<span key={i}>
							<Action {...actionOpts}>{action.icon ? <i className={action.icon + " mr-2"}/> : <span/>}{action.label}</Action>
							{action.error && <span className="text-danger ml-1">{action.error}</span>}
						</span>
				);
			} catch (err) {
				items.push (
					<span className="border p-1 text-danger ml-1" key={i}>{err.message}</span>
				);
			}
		}
		return items;
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
			if ((m.isDictionary () || m.isTable ()) && me.props.store.map ["query"][m.getPath ()]) {
				delete gridOpts.model;
				gridOpts.query = m.getPath ();
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
		let actions = me.renderActions ();
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...gridOpts}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2" />{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</Action>
						<RemoveAction onRemove={me.onRemove} />
						{actions}
						{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
					</Grid>
				</div>
			</div>
		);
	}
};
ModelList.displayName = "ModelList";

export default ModelList;

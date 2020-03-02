import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";
import {getHash, setHash} from "./helper";

class ModelList extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.model = me.props.model || me.props.match.params.model.split ("#")[0];
		
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.onSelect = me.onSelect.bind (me);
		me.state = {
			refresh: false,
			actions: [],
			canCreate: false,
			canRemove: false
		};
		let regModel = me.props.store.getRegistered (me.model) || {};
		
		if (regModel._gridActions) {
			me.state.actions = regModel._gridActions ();
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
	
	async componentDidMount () {
		let me = this;
		let regModel = me.props.store.getRegistered (me.model);
		
		if (regModel && regModel._canCreate) {
			me.setState ({canCreate: await regModel._canCreate ({store: me.props.store})});
		} else {
			me.setState ({canCreate: true});
		}
	}
	
	componentDidUpdate () {
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
	}
	
	renderActions () {
		let me = this;
		let items = [];
		
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
				if (action.onClick && typeof (Model [method]) != "function") {
					throw new Error (`Unknown static method ${method}`);
				}
				let actionOpts = {
					...me.props,
					key: i
				};
				if (action.onClick) {
					actionOpts.onClick = ({grid, progress}) => {
						return Model [method].call (grid, {
							grid,
							store: me.props.store,
							parentModel: me.props.parentModel,
							parentId: me.props.parentId,
							progress
						});
					};
				} else {
					actionOpts.onClickSelected = async ({id, grid, progress}) => {
						let record = await me.props.store.getRecord (id);
						
						if (typeof (record [method]) != "function") {
							throw new Error (`Unknown method: ${method}, record: ${id}`);
						}
						return record [method].call (record, {
							id,
							grid,
							store: me.props.store,
							parentModel: me.props.parentModel,
							parentId: me.props.parentId,
							progress
						});
					};
				}
				items.push (
					<Action {...actionOpts}>{action.icon ? <i className={action.icon + " mr-2"} /> : <span />}{action.label}</Action>
				);
			} catch (err) {
				items.push (
					<span className="border p-1 text-white bg-danger ml-1" key={i}>{err.message}</span>
				);
			}
		}
		return items;
	}
	
	async onSelect (id) {
		let me = this;
		let record = await me.props.store.getRecord (id);
		
		if (record._canRemove) {
			me.setState ({canRemove: await record._canRemove ()});
		} else {
			me.setState ({canRemove: true});
		}
	}
	
	render () {
		let me = this;
		let regModel = me.props.store.getRegistered (me.model) || {};
		let m = me.props.store.getModel (me.model);
		let gridOpts = {
			...me.props,
			id: me.props.id || `list-${me.model}`,
			ref: me.props.id || "list",
			store: me.props.store,
			label: (m.isDictionary () ? i18n ("Dictionary") : i18n ("List")) + ": " + m.get ("name"),
			refresh: me.state.refresh,
			model: me.model,
			onSelect: me.onSelect
		};
		gridOpts.params = gridOpts.params || {};
		
		if (regModel._gridLabel) {
			gridOpts.label = regModel._gridLabel ();
		}
		if (regModel._gridQuery) {
			delete gridOpts.model;
			gridOpts.query = regModel._gridQuery ();
		}
		if (regModel._gridFilters) {
			let hash = getHash (me) [gridOpts.id];
			
			if (!hash || !hash.filters) {
				setHash (me, {
					[gridOpts.id]: {
						"showFilters": true,
						"dockFilters": "top",
						"filters": regModel._gridFilters ()
					}
				});
			}
		}
		if ((m.isDictionary () || m.isTable ()) && me.props.store.map ["query"][m.getPath ()]) {
			delete gridOpts.model;
			gridOpts.query = m.getPath ();
		}
		if (me.props.hasOwnProperty ("label")) {
			gridOpts.label = me.props.label;
		}
		if (m.isTable () && me.props.parentModel && me.props.parentId) {
			let pm = me.props.store.getModel (me.props.parentModel);
			
			gridOpts.params [pm.get ("code")] = me.props.parentId;
		}
		gridOpts.editable = m.isDictionary ();
		
		if (regModel._gridEditable) {
			gridOpts.editable = regModel._gridEditable ();
		}
		let actions = me.renderActions ();
		
		return (
			<Grid {...gridOpts}>
				<Action {...me.props} onClick={me.onCreate} disabled={!me.state.canCreate}>
					<i className="fas fa-plus mr-2" />{i18n ("Create")}
				</Action>
				<Action {...me.props} onClickSelected={me.onEdit}>
					<i className="fas fa-edit mr-2" />{i18n ("Edit")}
				</Action>
				<RemoveAction {...me.props} onRemove={me.onRemove} disabled={!me.state.canRemove} />
				{actions}
				{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
			</Grid>
		);
	}
};
ModelList.displayName = "ModelList";

export default ModelList;

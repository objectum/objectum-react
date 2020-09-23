import React, {Component} from "react";
import {Action, Grid, RemoveAction} from "..";
import {i18n, getHash, setHash} from "..";

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
			canRemove: false,
			_grid: {}
		};
		me.regModel = me.props.store.getRegistered (me.model) || {};
		
		if (me.regModel._grid) {
			me.state._grid = me.regModel._grid ();
			
			if (me.state._grid.actions) {
				me.state.actions = me.state._grid.actions;
			}
		}
		me._refs = {[me.props.id || "list"]: React.createRef ()};
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
			console.error (err);
			await me.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		me.setState (state);
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.regModel && me.regModel._accessCreate) {
			me.setState ({canCreate: await me.regModel._accessCreate ({store: me.props.store})});
		} else {
			me.setState ({canCreate: true});
		}
	}
	
	componentDidUpdate (prevProps) {
		let me = this;
		
		me.model = me.props.model || me.props.match.params.model.split ("#")[0];
		
		if (me.props.hasOwnProperty ("refresh") && me.props.refresh != prevProps.refresh) {
			me.setState ({refresh: !me.state.refresh});
		}
	}
	
	renderActions () {
		let me = this;
		let items = [];
		
		for (let i = 0; i < me.state.actions.length; i ++) {
			try {
				let action = me.state.actions [i];
				let fn = action.onClick || action.onClickSelected;
				
				if (!fn && !action.modalComponent) {
					throw new Error (`onClick, onClickSelected, modalComponent not exist`);
				}
				if (fn) {
					let tokens = fn.split (".");
					let method = tokens.splice (tokens.length - 1, 1)[0];
					let path = tokens.join (".");
					let Model = me.props.store.registered [path];
					
					if (!Model && !action.modalComponent) {
						throw new Error (`Model "${path}" not registered`);
					}
					if (action.onClick && !action.selected && typeof (Model [method]) != "function") {
						throw new Error (`Unknown static method ${method}`);
					}
				}
				let actionOpts = {
					...me.props,
					selected: action.selected,
					modalComponent: action.modalComponent,
					key: i
				};
/*
				if (action.onClick) {
					actionOpts.onClick = (opts) => {
						return Model [method].call (opts.grid, Object.assign (opts, {
							parentModel: me.props.parentModel,
							parentId: me.props.parentId
						}));
					};
				} else {
					actionOpts.onClickSelected = async (opts) => {
						let record = await me.props.store.getRecord (opts.id);
						
						if (typeof (record [method]) != "function") {
							throw new Error (`Unknown method: ${method}, record: ${opts.id}`);
						}
						return record [method].call (record, Object.assign (opts, {
							parentModel: me.props.parentModel,
							parentId: me.props.parentId
						}));
					};
				}
*/
				actionOpts.onClick = async (opts) => {
					if (actionOpts.onClickSelected || actionOpts.selected) {
						let record = await me.props.store.getRecord (opts.id);
						
						if (typeof (record [method]) != "function") {
							throw new Error (`Unknown method: ${method}, record: ${opts.id}`);
						}
						return record [method].call (record, Object.assign (opts, {
							parentModel: me.props.parentModel,
							parentId: me.props.parentId
						}));
					} else {
						return Model [method].call (opts.grid, Object.assign (opts, {
							parentModel: me.props.parentModel,
							parentId: me.props.parentId
						}));
					}
				};
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
		
		if (id) {
			let record = await me.props.store.getRecord (id);
			
			if (record._accessDelete) {
				me.setState ({canRemove: await record._accessDelete ()});
			} else {
				me.setState ({canRemove: true});
			}
		}
	}
	
	render () {
		let me = this;
		let m = me.props.store.getModel (me.model);
		let gridOpts = {
			...me.props,
			id: me.props.id || `list-${me.model}`,
			ref: me._refs [me.props.id || "list"],
			store: me.props.store,
			label: (m.isDictionary () ? i18n ("Dictionary") : i18n ("List")) + ": " + m.get ("name"),
			refresh: me.state.refresh,
			model: me.model,
			onSelect: me.onSelect,
			inlineActions: true
		};
		gridOpts.params = gridOpts.params || {};
		
		if (me.state._grid.label) {
			gridOpts.label = me.state._grid.label;
		}
		if (me.state._grid.query) {
			delete gridOpts.model;
			gridOpts.query = me.state._grid.query;
		}
		if (me.state._grid.filters) {
			let hash = getHash (me) [gridOpts.id];
			
			if (!hash || !hash.filters) {
				setHash (me, {
					[gridOpts.id]: {
						"showFilters": true,
						"dockFilters": "top",
						"filters": me.state._grid.filters
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
		if ((m.isTable () || me.props.isTable) && me.props.parentModel && me.props.parentId) {
			let pm = me.props.store.getModel (me.props.parentModel);
			
			gridOpts.params [pm.get ("code")] = me.props.parentId;
		}
		gridOpts.editable = m.isDictionary ();
		
		if (me.state._grid.editable) {
			gridOpts.editable = me.state._grid.editable;
			delete me.state._grid.editable;
		}
		Object.assign (gridOpts, me.state._grid);
		
		let actions = me.renderActions ();
		let grid = <Grid {...gridOpts}>
			<div className="d-flex">
				<Action {...me.props} icon="fas fa-plus" label={i18n ("Create")} onClick={me.onCreate} disabled={!me.state.canCreate} />
				<Action {...me.props} icon="fas fa-edit" label={i18n ("Edit")} onClick={me.onEdit} selected />
				<Action {...me.props} icon="fas fa-minus" label={i18n ("Remove")} onClick={me.onRemove} confirm selected disabled={gridOpts.inlineActions ? false : !me.state.canRemove} />
				{actions}
			</div>
			{me.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</div>}
		</Grid>;
		
		if (me.regModel && me.regModel._renderGrid) {
			grid = me.regModel._renderGrid ({grid, store: me.props.store});
		}
		return grid;
	}
};
ModelList.displayName = "ModelList";

export default ModelList;

import React, {Component} from "react";
import {Action, Grid} from "..";
import {i18n, getHash, setHash} from "..";

export default class ModelList extends Component {
	constructor (props) {
		super (props);
		
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
		
		this.state = {
			refresh: false,
			actions: [],
			canCreate: false,
			canRemove: false,
			removeControlled: true,
			_grid: {}
		};
		this.regModel = this.props.store.getRegistered (this.model) || {};
		
		if (this.regModel._grid) {
			this.state._grid = this.regModel._grid ();
			
			if (this.state._grid.actions) {
				this.state.actions = this.state._grid.actions;
			}
		}
		this._refs = {[this.props.id || "list"]: React.createRef ()};
	}
	
	onCreate = () => {
		let opts = {
			model: this.model
		};
		if (this.props.parentModel) {
			opts.parentModel = this.props.parentModel;
			opts.parentId = this.props.parentId;
		}
		this.props.history.push ({
			pathname: this.props.prefix + "/model_record/new#" + JSON.stringify ({opts})
		});
	}
	
	onEdit = ({id}) => {
		let opts = {
			model: this.model
		};
		if (this.props.parentModel) {
			opts.parentModel = this.props.parentModel;
			opts.parentId = this.props.parentId;
		}
		this.props.history.push ({
			pathname: this.props.prefix + "/model_record/" + id + "#" + JSON.stringify ({opts})
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing record: " + id);
			await this.props.store.removeRecord (id);
			await this.props.store.commitTransaction ();
		} catch (err) {
			console.error (err);
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.setState (state);
	}
	
	async componentDidMount () {
		if (this.regModel && this.regModel._accessCreate) {
			this.setState ({canCreate: await this.regModel._accessCreate ({store: this.props.store})});
		} else {
			this.setState ({canCreate: true});
		}
	}
	
	componentDidUpdate (prevProps) {
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
		
		if (this.props.hasOwnProperty ("refresh") && this.props.refresh != prevProps.refresh) {
			this.setState ({refresh: !this.state.refresh});
		}
	}
	
	renderActions () {
		let items = [];
		
		for (let i = 0; i < this.state.actions.length; i ++) {
			try {
				let action = this.state.actions [i];
				let fn = action.onClick || action.onClickSelected;
				
				if (!fn && !action.modalComponent) {
					throw new Error (`onClick, onClickSelected, modalComponent not exist`);
				}
				if (fn) {
					let tokens = fn.split (".");
					let method = tokens.splice (tokens.length - 1, 1)[0];
					let path = tokens.join (".");
					let Model = this.props.store.registered [path];
					
					if (!Model && !action.modalComponent) {
						throw new Error (`Model "${path}" not registered`);
					}
					if (action.onClick && !action.selected && typeof (Model [method]) != "function") {
						throw new Error (`Unknown static method ${method}`);
					}
				}
				let actionOpts = {
					...this.props,
					selected: action.selected,
					modalComponent: action.modalComponent,
					key: i
				};
				actionOpts.onClick = async (opts) => {
					if (actionOpts.onClickSelected || actionOpts.selected) {
						let record = await this.props.store.getRecord (opts.id);
						
						if (typeof (record [method]) != "function") {
							throw new Error (`Unknown method: ${method}, record: ${opts.id}`);
						}
						return record [method].call (record, Object.assign (opts, {
							parentModel: this.props.parentModel,
							parentId: this.props.parentId
						}));
					} else {
						return Model [method].call (opts.grid, Object.assign (opts, {
							parentModel: this.props.parentModel,
							parentId: this.props.parentId
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
	
	onSelect = async (id) => {
		if (id) {
			let record = await this.props.store.getRecord (id);
			
			if (record._accessDelete) {
				this.setState ({selected: id, canRemove: await record._accessDelete (), removeControlled: true});
			} else {
				this.setState ({selected: id, canRemove: true, removeControlled: false});
			}
		} else {
			this.setState ({selected: id});
		}
		if (this.props.onSelect) {
			this.props.onSelect (id);
		}
	}
	
	render () {
		let m = this.props.store.getModel (this.model);
		let gridOpts = {
			...this.props,
			id: this.props.id || `list-${this.model}`,
			ref: this._refs [this.props.id || "list"],
			store: this.props.store,
			label: (m.isDictionary () ? i18n ("Dictionary") : i18n ("List")) + ": " + m.get ("name"),
			refresh: this.state.refresh,
			model: this.model,
			onSelect: this.onSelect,
			inlineActions: true
		};
		gridOpts.params = gridOpts.params || {};
		
		if (this.state._grid.label) {
			gridOpts.label = this.state._grid.label;
		}
		if (this.state._grid.query) {
			delete gridOpts.model;
			gridOpts.query = this.state._grid.query;
		}
		if (this.state._grid.filters) {
			let hash = getHash (this) [gridOpts.id];
			
			if (!hash || !hash.filters) {
				setHash (this, {
					[gridOpts.id]: {
						"showFilters": true,
						"dockFilters": "top",
						"filters": this.state._grid.filters
					}
				});
			}
		}
		if ((m.isDictionary () || m.isTable ()) && this.props.store.map ["query"][m.getPath ()]) {
			delete gridOpts.model;
			gridOpts.query = m.getPath ();
		}
		if (this.props.hasOwnProperty ("label")) {
			gridOpts.label = this.props.label;
		}
		if ((m.isTable () || this.props.isTable) && this.props.parentModel && this.props.parentId) {
			let pm = this.props.store.getModel (this.props.parentModel);
			
			gridOpts.params [pm.get ("code")] = this.props.parentId;
		}
		gridOpts.editable = m.isDictionary ();
		
		if (this.state._grid.editable) {
			gridOpts.editable = this.state._grid.editable;
			delete this.state._grid.editable;
		}
		Object.assign (gridOpts, this.state._grid);
		
		let actions = this.renderActions ();
		let grid = <Grid {...gridOpts}>
			<div className="d-flex pb-1">
				{!this.props.hideCreate && <Action {...this.props} icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} disabled={!this.state.canCreate} />}
				{!this.props.hideEdit && <Action {...this.props} icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />}
				{!this.props.hideRemove && <Action {...this.props} icon="fas fa-minus" label={i18n ("Remove")} onClick={this.onRemove}
						confirm selected disabled={!this.state.canRemove} disabledControlled={this.state.removeControlled} />}
				{actions}
			</div>
		</Grid>;
		
		if (this.regModel && this.regModel._renderGrid) {
			grid = this.regModel._renderGrid ({grid, store: this.props.store});
		}
		return grid;
	}
};
ModelList.displayName = "ModelList";

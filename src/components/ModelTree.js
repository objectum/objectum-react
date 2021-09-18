import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import {i18n} from "./../i18n";

export default class ModelTree extends Component {
	constructor (props) {
		super (props);
		
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
		this.state = {
			refresh: false
		};
		let id = this.props.id || `tree-${this.model}`;
		
		this._refs = {[id]: React.createRef ()};
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
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.setState (state);
	}

	componentDidUpdate () {
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
	}
	
	render () {
		let m = this.props.store.getModel (this.model);
		let label = (m.isDictionary () ? i18n ("Dictionary") : i18n ("List")) + ": " + m.get ("name");
		let opts = m.getOpts ();
		let params = {};
		
		if (opts.grid && opts.grid.label) {
			label = opts.grid.label;
		}
		if (this.props.hasOwnProperty ("label")) {
			label = this.props.label;
		}
		if (m.isTable () && this.props.parentModel && this.props.parentId) {
			let pm = this.props.store.getModel (this.props.parentModel);
			
			params [pm.get ("code")] = this.props.parentId;
		}
		let id = this.props.id || `tree-${this.model}`;
		let gridOpts = {
			...this.props,
			id,
			ref: this._refs [id],
			label,
			store: this.props.store,
			model: this.model,
			tree: true,
			refresh: this.state.refresh,
			params,
			inlineActions: true
		};
		let grid = <Grid {...gridOpts}>
			<div className="d-flex">
				<Action onClick={this.onCreate} icon="fas fa-plus" label={i18n ("Create")} />
				<Action onClick={this.onEdit} icon="fas fa-edit" label={i18n ("Edit")} selected />
				<Action onClick={this.onRemove} confirm icon="fas fa-minus" label={i18n ("Remove")} selected />
			</div>
		</Grid>;
		
		if (this.model._renderGrid) {
			grid = this.model._renderGrid ({grid, store: this.props.store});
		}
		return <div className="bg-white shadow-sm">
			{grid}
		</div>;
	}
};
ModelTree.displayName = "ModelTree";

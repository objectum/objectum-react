import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import {i18n} from "./../i18n";

export default class Records extends Component {
	constructor (props) {
		super (props);
		
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
		this.state = {
			refresh: false
		};
		this._ref = React.createRef ();
	}

	onCreate = () => {
		let opts = {
			model: this.model
		};
		this.props.history.push ({
			pathname: "/model_record/new#" + JSON.stringify ({opts})
		});
	}

	onEdit = ({id}) => {
		let opts = {
			model: this.model
		};
		this.props.history.push ({
			pathname: "/model_record/" + id + "#" + JSON.stringify ({opts})
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
		if (this.props.store.username != "admin") {
			return (<div />);
		}
		let m = this.props.store.getModel (this.model);
		let gridOpts = {
			...this.props,
			id: this.props.id || `records-${this.model}`,
			ref: this._ref,
			store: this.props.store,
			label: i18n ("Records") + ": " + m.get ("name"),
			refresh: this.state.refresh,
			model: this.model,
			editable: true
		};
		return <div>
			<Grid {...gridOpts} inlineActions>
				<div className="d-flex mb-1">
					<Action {...this.props} icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
					<Action {...this.props} selected onClick={this.onEdit} icon="fas fa-edit" label={i18n ("Edit")} />
					<Action {...this.props} confirm selected onClick={this.onRemove} icon="fas fa-minus" label={i18n ("Remove")} />
				</div>
			</Grid>
		</div>;
	}
};
Records.displayName = "Records";

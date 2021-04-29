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
			
			state.error = err.message;
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
			ref: this.props.id || `records-${this.model}`,
			store: this.props.store,
			label: i18n ("Records") + ": " + m.get ("name"),
			refresh: this.state.refresh,
			model: this.model,
			editable: true
		};
		return <div>
			{this.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${this.state.error}`}</span>}
			<Grid {...gridOpts} inlineActions>
				<div className="d-flex">
					<Action {...this.props} onClickSelected={this.onEdit} icon="fas fa-edit" label={i18n ("Edit")} />
					<Action {...this.props} confirm onClickSelected={this.onRemove} icon="fas fa-minus" label={i18n ("Remove")} />
				</div>
			</Grid>
		</div>;
	}
};
Records.displayName = "Records";

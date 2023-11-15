import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import {i18n} from "./../i18n";

export default class Roles extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			refresh: false
		};
		this._refs = {"roles": React.createRef ()};
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: "/role/new"
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: "/role/" + id
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing role: " + id);
			await this.props.store.removeRecord (id);
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.setState (state);
	}
	
	render () {
		return <div className="container">
			<Grid {...this.props} id="roles" ref={this._refs ["roles"]} label="Roles" store={this.props.store} query="objectum.role" refresh={this.state.refresh} inlineActions>
				<div className="d-flex pb-1">
					<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
					<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
					<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClick={this.onRemove} selected />
				</div>
			</Grid>
		</div>;
	}
};
Roles.displayName = "Roles";

import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import {i18n} from "./../i18n";

export default class Menus extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			refresh: false
		};
		this._refs = {"menus": React.createRef ()};
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: "/menu/new"
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: "/menu/" + id
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing menu: " + id);
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
			<Grid {...this.props} id="menus" ref={this._refs ["menus"]} label="Menus" store={this.props.store} query="objectum.menu" refresh={this.state.refresh} inlineActions>
				<div className="d-flex pb-1">
					<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
					<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
					<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClick={this.onRemove} selected />
				</div>
			</Grid>
		</div>;
	}
};
Menus.displayName = "Menus";

import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import {i18n} from "./../i18n";

export default class Users extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			refresh: false
		};
		this._refs = {"users": React.createRef ()};
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: "/user/new"
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: "/user/" + id
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing user: " + id);
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
			<Grid {...this.props} id="users" ref={this._refs ["users"]} label="Users" store={this.props.store} query="objectum.user" refresh={this.state.refresh} inlineActions>
				<div className="d-flex pb-1">
					<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
					<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
					<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClick={this.onRemove} selected />
					{this.props.store.username == "admin" ? <Action icon="fas fa-users" label={i18n ("Activity")} onClick={() => {
						this.props.history.push ({
							pathname: "/stat"
						});
					}} /> : null}
				</div>
			</Grid>
		</div>;
	}
};
Users.displayName = "Users";

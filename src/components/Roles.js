import React, {Component} from "react";
import Action from "./Action";
import Confirm from "./Confirm";
import Grid from "./Grid";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";

class Roles extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;
		
		me.props.history.push ({
			pathname: "/role/new"
		});
	}
	
	onEdit ({id}) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/role/" + id
		});
	}
	
	async onRemove (id) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing role: " + id);
			await me.props.store.removeRecord (id);
			await me.props.store.commitTransaction ();
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		me.setState (state);
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<div className="bg-white shadow-sm">
					<Grid {...me.props} id="roles" ref="roles" label="Roles" store={me.props.store} query="objectum.role" refresh={me.state.refresh}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2" />{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</Action>
						<RemoveAction onRemove={me.onRemove} />
						{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
					</Grid>
				</div>
			</div>
		);
		
	}
};
Roles.displayName = "Roles";

export default Roles;

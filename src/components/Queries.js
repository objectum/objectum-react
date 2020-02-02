import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";

class Queries extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.parent = null;
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.onChange = me.onChange.bind (me);
		me.state = {
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;

		me.props.history.push ({
			pathname: "/query/new#" + JSON.stringify ({
				opts: {
					parent: me.parent
				}
			})
		});
	}
	
	onEdit ({id}) {
		let me = this;

		me.props.history.push ({
			pathname: "/query/" + id
		});
	}
	
	onChange (val) {
		this.setState ({taValue: val.target.value});
	}
	
	async onRemove (id) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing query: " + id);
			await me.props.store.removeQuery (id);
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
					<Grid {...me.props} id="queries" ref="queries" label="Queries" store={me.props.store} query="objectum.query" tree={true} system={true} refresh={me.state.refresh} onSelectParent={(parent) => me.parent = parent}>
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
Queries.displayName = "Queries";

export default Queries;

import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";

class Models extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.parent = null;
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.onSelect = me.onSelect.bind (me);
		me.onRecords = me.onRecords.bind (me);
		me.state = {
			refresh: false
		};
		me._refs = {"models": React.createRef ()};
	}
	
	onCreate () {
		let me = this;

		me.props.history.push ({
			pathname: "/model/new#" + JSON.stringify ({
				opts: {
					parent: me.parent
				}
			}),
		});
	}
	
	onEdit ({id}) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/model/" + id + "#" + JSON.stringify ({
				opts: {
					parent: me.parent
				}
			})
		});
	}
	
	async onRemove (id) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing model: " + id);
			await me.props.store.removeModel (id);
			await me.props.store.commitTransaction ();
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		me.setState (state);
	}
	
	onRecords () {
		let me = this;
		
		me.props.history.push ({
			pathname: "/records/" + me.state.model.split (".").join ("_")
		});
	}
	
	onSelect (id) {
		if (id) {
			this.setState ({model: this.props.store.getModel (id).getPath ()});
		}
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<div className="bg-white shadow-sm">
					<Grid
						{...me.props}
						id="models" ref={me._refs ["models"]}
						label="Models"
						store={me.props.store}
						query="objectum.model"
						tree={true} system={true}
						refresh={me.state.refresh}
						onSelectParent={parent => me.parent = parent}
						onSelect={me.onSelect}
					>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2" />{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</Action>
						<RemoveAction onRemove={me.onRemove} />
						<Action onClick={() => me.props.history.push ({pathname: "/schema"})}><i className="fas fa-list-alt mr-2" />{i18n ("Schema")}</Action>
						<Action onClickSelected={me.onRecords}><i className="fas fa-eye mr-2" />{i18n ("Records")}</Action>
						{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
					</Grid>
				</div>
			</div>
		);
		
	}
};
Models.displayName = "Models";

export default Models;

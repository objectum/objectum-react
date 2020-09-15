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
	
	onRecords ({id}) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/records/" + me.props.store.getModel (id).getPath ().split (".").join ("_")
		});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<div className="shadow-sm">
					<Grid
						{...me.props}
						id="models" ref={me._refs ["models"]}
						label="Models"
						store={me.props.store}
						query="objectum.model"
						tree={true} system={true}
						refresh={me.state.refresh}
						onSelectParent={parent => me.parent = parent}
						inlineActions
					>
						<div className="d-flex">
							<Action icon="fas fa-plus" label={i18n ("Create")} onClick={me.onCreate} />
							<Action icon="fas fa-edit" label={i18n ("Edit")} onClickSelected={me.onEdit} />
							<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClickSelected={me.onRemove} />
	{/*
							<Action onClick={() => me.props.history.push ({pathname: "/schema"})}><i className="fas fa-list-alt mr-2" />{i18n ("Schema")}</Action>
	*/}
							<Action icon="fas fa-eye" label={i18n ("Records")} onClickSelected={me.onRecords} />
						</div>
						{me.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</div>}
					</Grid>
				</div>
			</div>
		);
		
	}
};
Models.displayName = "Models";

export default Models;

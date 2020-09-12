import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import {i18n} from "./../i18n";

class Records extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.model = me.props.model || me.props.match.params.model.split ("#")[0];
		
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			refresh: false
		};
	}
	
	onEdit ({id}) {
		let me = this;
		let opts = {
			model: me.model
		};
		me.props.history.push ({
			pathname: "/model_record/" + id + "#" + JSON.stringify ({opts})
		});
	}
	
	async onRemove ({id}) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing record: " + id);
			await me.props.store.removeRecord (id);
			await me.props.store.commitTransaction ();
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		me.setState (state);
	}
	
	componentDidUpdate () {
		this.model = this.props.model || this.props.match.params.model.split ("#")[0];
	}
	
	render () {
		let me = this;
		
		if (me.props.store.username != "admin") {
			return (<div />);
		}
		let m = me.props.store.getModel (me.model);
		let gridOpts = {
			...me.props,
			id: me.props.id || `records-${me.model}`,
			ref: me.props.id || `records-${me.model}`,
			store: me.props.store,
			label: i18n ("Records") + ": " + m.get ("name"),
			refresh: me.state.refresh,
			model: me.model,
			editable: true
		};
		return (
			<div>
				{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
				<Grid {...gridOpts} inlineActions>
					<div className="d-flex">
						<Action {...me.props} onClickSelected={me.onEdit} icon="fas fa-edit" label={i18n ("Edit")} />
						<Action {...me.props} confirm onClickSelected={me.onRemove} icon="fas fa-minus" label={i18n ("Remove")} />
					</div>
				</Grid>
			</div>
		);
	}
};
Records.displayName = "Records";

export default Records;

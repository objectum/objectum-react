import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";

class Menus extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			refresh: false
		};
		me._refs = {"menus": React.createRef ()};
	}
	
	onCreate () {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu/new"
		});
	}
	
	onEdit ({id}) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu/" + id
		});
	}
	
	async onRemove (id) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing menu: " + id);
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
				<div className="shadow-sm">
					<Grid {...me.props} id="menus" ref={me._refs ["menus"]} label="Menus" store={me.props.store} query="objectum.menu" refresh={me.state.refresh} inlineActions>
						<div className="d-flex">
							<Action icon="fas fa-plus" label={i18n ("Create")} onClick={me.onCreate} />
							<Action icon="fas fa-edit" label={i18n ("Edit")} onClickSelected={me.onEdit} />
							<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClickSelected={me.onRemove} />
						</div>
						{me.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</div>}
					</Grid>
				</div>
			</div>
		);
	}
};
Menus.displayName = "Menus";

export default Menus;

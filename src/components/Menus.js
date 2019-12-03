import React, {Component} from "react";
import Action from "./Action";
import Confirm from "./Confirm";
import Grid from "./Grid";
import {i18n} from "./../i18n";

class Menus extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			removeConfirm: false,
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu/new"
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu/" + id
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing menu: " + me.state.removeId);
			await me.props.store.removeRecord (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<div className="row">
					<div className="col-sm-12">
						<Grid {...me.props} id="menus" ref="menus" label="Menus" store={me.props.store} query="objectum.menu" refresh={me.state.refresh}>
							<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>{i18n ("Create")}</Action>
							<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>{i18n ("Edit")}</Action>
							<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>{i18n ("Remove")}</Action>
						</Grid>
					</div>
					<Confirm label="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
				</div>
			</div>
		);
	}
};
Menus.displayName = "Menus";

export default Menus;

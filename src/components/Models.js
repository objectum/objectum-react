import React, {Component} from "react";
import TreeGrid from "./TreeGrid";
import Action from "./Action";
import Confirm from "./Confirm";
import {i18n} from "./../i18n";
import {pushLocation} from "./helper";

class Models extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.parent = null;
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

		pushLocation ();
		
		me.props.history.push ({
			pathname: "/model/new#" + JSON.stringify ({
				opts: {
					parent: me.parent
				}
			}),
		});
	}
	
	onEdit (id) {
		let me = this;
		
		pushLocation ();
		
		me.props.history.push ({
			pathname: "/model/" + id + "#" + JSON.stringify ({
				opts: {
					parent: me.parent
				}
			})
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing model: " + me.state.removeId);
			await me.props.store.removeModel (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<TreeGrid {...me.props} id="models" ref="models" label="Models" store={me.props.store} query="objectum.model" pageRecs={10} refresh={me.state.refresh} onSelectParent={parent => me.parent = parent}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>{i18n ("Edit")}</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>{i18n ("Remove")}</Action>
					</TreeGrid>
				</div>
				<Confirm label={i18n ("Are you sure?")} visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};
Models.displayName = "Models";

export default Models;

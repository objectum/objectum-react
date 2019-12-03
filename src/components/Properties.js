/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import Confirm from "./Confirm";
import {i18n} from "./../i18n";

class Properties extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me ["model"] = me.props ["model"];
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
			pathname: "/property/new#" + JSON.stringify ({
				opts: {
					model: me ["model"]
				}
			})
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/property/" + id + "#" + JSON.stringify ({
				opts: {
					model: me ["model"]
				}
			})
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing property: " + me.state.removeId);
			await me.props.store.removeProperty (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid id="properties" store={me.props.store} query="objectum.property" system={true} refresh={me.state.refresh} params={{modelId: me.model}}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>{i18n ("Create")}</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>{i18n ("Edit")}</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>{i18n ("Remove")}</Action>
					</Grid>
				</div>
				<Confirm label="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};
Properties.displayName = "Properties";

export default Properties;

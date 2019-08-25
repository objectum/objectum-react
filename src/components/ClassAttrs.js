/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from 'react';
import Grid from "./Grid";
import Action from "./Action";
import Confirm from "./Confirm";

class ClassAttrs extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me ["class"] = me.props ["class"];
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
			pathname: "/class_attr/new#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash),
					"class": me ["class"]
				}
			})
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/class_attr/" + id + "#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash)
				}
			})
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing class attr: " + me.state.removeId);
			await me.props.store.removeClassAttr (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid id="classAttrs" store={me.props.store} view="objectum.classAttr" pageRecs={10} refresh={me.state.refresh} params={{classId: me ["class"]}}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>Create</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>Edit</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>Remove</Action>
					</Grid>
				</div>
				<Confirm title="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};

export default ClassAttrs;

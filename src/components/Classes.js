import React, {Component} from 'react';
import TreeGrid from "./TreeGrid";
import Action from "./Action";
import Confirm from "./Confirm";

class Classes extends Component {
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
		me.props.history.push ({
			pathname: "/class/new#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash),
					parent: me.parent
				}
			}),
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/class/" + id + "#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash),
					parent: me.parent
				}
			})
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing class: " + me.state.removeId);
			await me.props.store.removeClass (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<TreeGrid id="classes" ref="classes" title="Classes" store={me.props.store} view="objectum.class" pageRecs={10} refresh={me.state.refresh} onSelectParent={parent => me.parent = parent}>
						<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>Create</Action>
						<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>Edit</Action>
						<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>Remove</Action>
					</TreeGrid>
				</div>
				<Confirm title="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
			</div>
		);
		
	}
};

export default Classes;

import React, {Component} from "react";
import Action from "./Action";
import Confirm from "./Confirm";
import TreeGrid from "./TreeGrid";
import {i18n} from "./../i18n";

class MenuItems extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.menu = me.props.menu;
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.state = {
			parent: null,
			removeConfirm: false,
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu_item/new#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash),
					menu: me.menu,
					parent: me.state.parent
				}
			})
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu_item/" + id + "#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash),
					menu: me.menu,
					parent: me.state.parent
				}
			})
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing menu item: " + me.state.removeId);
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
						<TreeGrid {...me.props} id="menuItems" ref="menuItems" store={me.props.store} query="objectum.menuItem" refresh={me.state.refresh} onSelectParent={parent => me.parent = parent} params={{menu: me.menu}}>
							<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>{i18n ("Create")}</Action>
							<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>{i18n ("Edit")}</Action>
							<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>{i18n ("Remove")}</Action>
						</TreeGrid>
					</div>
					<Confirm label="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
				</div>
			</div>
		);
	}
};
MenuItems.displayName = "MenuItems";

export default MenuItems;

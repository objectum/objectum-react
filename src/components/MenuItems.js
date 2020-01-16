import React, {Component} from "react";
import Action from "./Action";
import Confirm from "./Confirm";
import Grid from "./Grid";
import RemoveAction from "./RemoveAction";
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
			refresh: false
		};
	}
	
	onCreate () {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu_item/new#" + JSON.stringify ({
				opts: {
					menu: me.menu,
					parent: me.state.parent
				}
			})
		});
	}
	
	onEdit ({id}) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/menu_item/" + id + "#" + JSON.stringify ({
				opts: {
					menu: me.menu,
					parent: me.state.parent
				}
			})
		});
	}
	
	async onRemove (id) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing menu item: " + id);
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
			<div>
				<div className="row">
					<div className="col-sm-12">
						<Grid {...me.props} id="menuItems" ref="menuItems" store={me.props.store} query="objectum.menuItem" tree={true} refresh={me.state.refresh} onSelectParent={parent => me.parent = parent} params={{menu: me.menu}}>
							<Action onClick={me.onCreate}><i className="fas fa-plus mr-2" />{i18n ("Create")}</Action>
							<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</Action>
							<RemoveAction onRemove={me.onRemove} />
							{me.state.error && <span className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</span>}
						</Grid>
					</div>
					<Confirm label="Are you sure?" visible={me.state.removeConfirm} onClick={me.onRemove} />
				</div>
			</div>
		);
	}
};
MenuItems.displayName = "MenuItems";

export default MenuItems;

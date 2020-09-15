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
		me._refs = {"menuItems": React.createRef ()};
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
	
	async onRemove ({id}) {
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
			<div className="p-1">
				<Grid {...me.props} id="menuItems" ref={me._refs ["menuItems"]} store={me.props.store} query="objectum.menuItem" tree={true} refresh={me.state.refresh} onSelectParent={parent => me.parent = parent} params={{menu: me.menu}} inlineActions>
					<div className="d-flex">
						<Action icon="fas fa-plus" label={i18n ("Create")} onClick={me.onCreate} />
						<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={me.onEdit} selected />
						<Action icon="fas fa-minus" label={i18n ("Remove")} onClickSelected={me.onRemove} confirm selected />
					</div>
					{me.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</div>}
				</Grid>
			</div>
		);
	}
};
MenuItems.displayName = "MenuItems";

export default MenuItems;

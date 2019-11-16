/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import {getHash} from "./helper";
import Menus from "./Menus";
import MenuItems from "./MenuItems";
import ChooseField from "./ChooseField";
import Back from "./Back";
import {i18n} from "./../i18n";

class MenuItem extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			menu: hash.opts.menu,
			parent: hash.opts.parent
		};
		me.onChange = me.onChange.bind (me);
		me.onCreate = me.onCreate.bind (me);
	}
	
	onChange (id, v) {
		this.setState ({[id]: v});
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.state.rid) {
			let o = await me.props.store.getRecord (me.state.rid);
			
			me.setState ({label: o.getLabel ()});
		}
	}
	
	async onCreate (rid) {
		let me = this;
		let o = await me.props.store.getRecord (rid);
		
		me.setState ({rid, label: o.getLabel ()});
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<Back {...me.props} />
				<Tabs key="tabs" id="tabs" label={i18n ("Menu item") + ": " + me.state.label}>
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="objectum.menuItem" onChange={me.onChange} onCreate={me.onCreate}>
							<ChooseField property="menu" label="Menu" disabled={true} rsc="record" value={me.state.menu} choose={Menus} chooseRef="menus" />
							<ChooseField property="parent" label="Parent" rsc="record" value={me.state.parent} choose={MenuItems} chooseRef="menuItems" menu={me.state.menu} />
							<Field property="name" />
							<Field property="order" />
							<Field property="path" />
							<Field property="icon" />
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};
MenuItem.displayName = "MenuItem";

export default MenuItem;

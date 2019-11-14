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
import {i18n} from "./../i18n";

class MenuItem extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			menu: hash.opts.menu,
			parent: hash.opts.parent
		};
		me.onChange = me.onChange.bind (me);
	}
	
	onChange (id, v) {
		this.setState ({[id]: v});
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i>{i18n ("Back")}</button>
				<Tabs key="tabs" id="tabs">
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="objectum.menuItem" onChange={me.onChange}>
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

export default MenuItem;

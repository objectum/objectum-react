/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import MenuItems from "./MenuItems";
import {getHash, goRidLocation} from "./helper";
import {i18n} from "./../i18n";

class Menu extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		
		me.state = {
			rid: rid == "new" ? null : rid,
			label: ""
		};
		me.onCreate = me.onCreate.bind (me);
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
		goRidLocation (me.props, rid);
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<div className="bg-white shadow-sm border">
					<Tabs key="tabs" id="tabs" label={i18n ("Menu") + ": " + me.state.label}>
						<Tab key="tab-1" label="Information">
							<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="objectum.menu" onCreate={me.onCreate}>
								<Field property="name" />
								<Field property="code" />
								<Field property="order" />
							</Form>
						</Tab>
						{me.state.rid &&<Tab key="Tab2" label="Menu items">
							<MenuItems {...me.props} menu={me.state.rid} />
						</Tab>}
					</Tabs>
				</div>
			</div>
		);
	}
};
Menu.displayName = "Menu";

export default Menu;

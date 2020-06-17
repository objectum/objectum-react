/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Field, Form, Tab, Tabs, Menus, MenuItems, ChooseField} from "..";
import {getHash, goRidLocation, i18n} from "..";

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
	
	onChange ({property, value}) {
		this.setState ({[property]: value});
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
				<div className="shadow-sm border">
					<Tabs key="tabs" id="tabs" label={i18n ("Menu item") + ": " + me.state.label}>
						<Tab key="Tab1" label="Information">
							<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="objectum.menuItem" onChange={me.onChange} onCreate={me.onCreate}>
								<ChooseField
									label="Menu"
									property="menu" disabled={true} rsc="record" value={me.state.menu}
									choose={{cmp: Menus, ref: "menus"}}
								/>
								<ChooseField
									label="Parent"
									property="parent" rsc="record" value={me.state.parent}
									choose={{cmp: MenuItems, ref: "menuItems", menu: me.state.menu}}
								/>
								<Field property="name" />
								<Field property="order" />
								<Field property="path" />
								<Field property="icon" />
							</Form>
						</Tab>
					</Tabs>
				</div>
			</div>
		);
	}
};
MenuItem.displayName = "MenuItem";

export default MenuItem;

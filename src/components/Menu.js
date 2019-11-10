/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import MenuItems from "./MenuItems";
import {getHash} from "./helper";

class Menu extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid
		};
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i>Back</button>
				<Tabs key="tabs" id="tabs">
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="objectum.menu">
							<Field attr="name" />
							<Field attr="code" />
							<Field attr="order" />
						</Form>
					</Tab>
					{me.state.rid &&<Tab key="Tab2" title="Menu items">
						<MenuItems {...me.props} menu={me.state.rid} />
					</Tab>}
				</Tabs>
			</div>
		);
	}
};

export default Menu;

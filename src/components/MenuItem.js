/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Field, Form, Tab, Tabs, Menus, MenuItems, ChooseField, DictField, Return} from "..";
import {getHash, goRidLocation, i18n} from "..";

export default class MenuItem extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		this.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			menu: hash.opts.menu,
			parent: hash.opts.parent,
			itemRecords: []
		};
	}
	
	onChange = ({property, value}) => {
		this.setState ({[property]: value});
	}
	
	async componentDidMount () {
		let state = {};
		
		if (this.state.rid) {
			let o = await this.props.store.getRecord (this.state.rid);
			
			state.label = o.getLabel ();
		}
		state.itemRecords = await this.props.store.getRecords ({
			model: "objectum.menuItem",
			filters: [
				["menu", "=", this.state.menu]
			]
		});
		this.setState (state);
	}
	
	onCreate = async (rid) => {
		let o = await this.props.store.getRecord (rid);
		
		this.setState ({rid, label: o.getLabel ()});
		goRidLocation (this.props, rid);
	}
	
	render () {
		return <div className="container">
			<Return {...this.props} />
			<div className="shadow-sm border">
				<Tabs key="tabs" id="tabs" label={i18n ("Menu item") + ": " + this.state.label}>
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={this.props.store} rsc="record" rid={this.state.rid} mid="objectum.menuItem" onChange={this.onChange} onCreate={this.onCreate}>
							<ChooseField
								label="Menu"
								property="menu" disabled rsc="record" value={this.state.menu}
								choose={{cmp: Menus, ref: "menus"}}
							/>
{/*
							<ChooseField
								label="Parent"
								property="parent" rsc="record" value={this.state.parent}
								choose={{cmp: MenuItems, ref: "menuItems", menu: this.state.menu}}
							/>
*/}
							<DictField
								property="parent" label="Parent"
								recs={this.state.itemRecords} tree
							/>
							<Field property="name" />
							<Field property="order" />
							<Field property="path" />
							<Field property="icon" />
						</Form>
					</Tab>
				</Tabs>
			</div>
		</div>;
	}
};
MenuItem.displayName = "MenuItem";

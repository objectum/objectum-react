/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Field, Form, Tab, Tabs, Return} from "..";
import {goRidLocation, i18n} from "..";

export default class Role extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		
		this.state = {
			rid: rid == "new" ? null : rid,
			label: ""
		};
	}
	
	async componentDidMount () {
		if (this.state.rid) {
			let o = await this.props.store.getRecord (this.state.rid);
			
			this.setState ({label: o.getLabel ()});
		}
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
				<Tabs key="tabs" id="tabs" label={i18n ("Role") + ": " + this.state.label}>
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={this.props.store} rsc="record" rid={this.state.rid} mid="objectum.role" onCreate={this.onCreate}>
							<Field property="name" />
							<Field property="code" />
							<Field property="menu" dict />
						</Form>
					</Tab>
				</Tabs>
			</div>
		</div>;
	}
};
Role.displayName = "Role";

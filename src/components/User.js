/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {DictField, Field, Form, Tab, Tabs, Return} from "..";
import {goRidLocation, i18n} from "..";

class User extends Component {
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
				<Return {...this.props} />
				<div className="shadow-sm border">
					<Tabs key="tabs" id="tabs" label={i18n ("User") + ": " + me.state.label}>
						<Tab key="Tab1" label="Information">
							<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="objectum.user" onCreate={me.onCreate}>
								<Field property="name" />
								<Field property="login" />
								<Field property="password" />
								<Field property="email" />
								<Field property="role" dict={true} />
							</Form>
						</Tab>
					</Tabs>
				</div>
			</div>
		);
	}
};
User.displayName = "User";

export default User;

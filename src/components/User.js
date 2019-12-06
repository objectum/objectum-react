/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import DictField from "./DictField";
import {getHash, goRidLocation} from "./helper";
import {i18n} from "./../i18n";

class User extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			label: ""
		};
		me.onCreate = me.onCreate.bind (me);
		me.onClick = me.onClick.bind (me);
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.state.rid) {
			let o = await me.props.store.getRecord (me.state.rid);
			
			me.setState ({label: o.getLabel ()});
		}
	}

	onClick () {
		let me = this;
		let div1 = me.refs.div1;
		let div2 = me.refs.div2;
		let rect = div1.getBoundingClientRect ();
		let scrollY = document.getElementById ("contentContainer").getBoundingClientRect ().top;
		
		div2.innerHTML = "innerHTML";
		div2.style.position = "absolute";
		div2.style.top = rect.top - scrollY + 40 + "px";
		div2.style.left = rect.left + "px";
		div2.style.width = rect.width;
		div2.style.height = rect.height;
		console.log (rect, div1.scrollTop);
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
			<div>
				<Tabs key="tabs" id="tabs" label={i18n ("User") + ": " + me.state.label}>
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="objectum.user" onCreate={me.onCreate}>
							<Field property="name" />
							<Field property="login" />
							<Field property="password" />
							<Field property="role" dict={true} />
						</Form>
					</Tab>
				</Tabs>
				<DictField />
			</div>
		);
	}
};
User.displayName = "User";

export default User;

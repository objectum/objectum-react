/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import {getHash} from "./helper";
import {i18n} from "./../i18n";
import _ from "lodash";

class ModelRecord extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			model: hash.opts.model,
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
	}
	
	render () {
		let me = this;
		let m = me.props.store.getModel (me.state.model);
		let properties = _.sortBy (_.values (m.properties), ["order", "name"]);
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i>{i18n ("Back")}</button>
				<Tabs key="tabs" id="tabs" title={i18n ("User") + ": " + me.state.label}>
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid={me.state.model} onCreate={me.onCreate}>
							{properties.map ((p, i) => {
								let dict = false;
								
								if (p.get ("type") >= 1000) {
									let m = me.props.store.getModel (p.get ("type"));
									
									dict = m.isDictionary ();
								}
								return (
									<Field key={i} property={p.get ("code")} dict={dict} />
								);
							})}
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};
ModelRecord.displayName = "ModelRecord";

export default ModelRecord;

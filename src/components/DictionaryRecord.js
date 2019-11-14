/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Field from "./Field";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import {getHash} from "./helper";
import {i18n} from "./../i18n";

class DictionaryRecord extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			record: null
		};
	}
	
	async componentDidMount () {
		let me = this;
		let record = await me.props.store.getRecord (me.state.rid);
		let modelPath = me.props.store.getModel (record.get ("model"));
		
		me.setState ({record, modelPath});
	}
	
	render () {
		let me = this;
		
		if (!me.state.record) {
			return (<div />);
		}
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i>{i18n ("Back")}</button>
				<Tabs key="tabs" id="tabs">
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid={me.state.modelPath}>
							<Field property="name" />
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};

export default DictionaryRecord;

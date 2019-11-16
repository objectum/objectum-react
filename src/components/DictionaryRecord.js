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
		me.dictionary_id = hash.opts.dictionary_id;
		me.model = me.props.store.getModel (me.dictionary_id);
		me.state = {
			rid: rid == "new" ? null : rid,
			record: null
		};
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i>{i18n ("Back")}</button>
				<Tabs key="tabs" id="tabs">
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid={me.model.getPath ()}>
							<Field property="name" />
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};
DictionaryRecord.displayName = "DictionaryRecord";

export default DictionaryRecord;

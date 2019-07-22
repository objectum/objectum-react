/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from 'react';
import StringField from "./StringField";
import BooleanField from "./BooleanField";
import SelectField from "./SelectField";
import ChooseField from "./ChooseField";
import Types from "./Types";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import Classes from "./Classes";
import {getHash} from "./helper";

class ClassAttr extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			classAttrName: "-",
			"class": hash.opts ["class"]
		};
		if (me.state.rid) {
			let o = me.props.store.getClassAttr (me.state.rid);
			
			me.state.classAttrName = o.get ("name") + " (" + o.getPath () + ")";
		}
	}
	
	render () {
		let me = this;
		let removeRuleRecs = [
			{id: "no action", name: "No action"},
			{id: "set null", name: "Set null"},
			{id: "cascade", name: "Cascade"}
		];
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)} disabled={!me.from}><i className="fas fa-arrow-left mr-2"></i> Back</button>
				<Tabs key="tabs" id="tabs" title={"Class attribute: " + me.state.classAttrName}>
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="classAttr" rid={me.state.rid} onChange={me.onChange} >
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="name" label="Name" notNull={true} />
								</div>
								<div className="form-group col-md-6">
									<ChooseField attr="class" label="Class" disabled={true} rsc="class" value={me.state ["class"]} choose={Classes} chooseRef="classes" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="code" label="Code" disabled={!!me.state.rid} notNull={true} />
								</div>
								<div className="form-group col-md-6">
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<ChooseField attr="type" label="Type" disabled={!!me.state.rid} rsc="class" notNull={true} choose={Types} chooseRef="types" />
								</div>
								<div className="form-group col-md-6">
									<StringField attr="description" label="Description" textarea={true} />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<BooleanField attr="notNull" label="Not null" />
								</div>
								<div className="form-group col-md-6">
									<BooleanField attr="unique" label="Unique" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<BooleanField attr="secure" label="Secure" />
								</div>
								<div className="form-group col-md-6">
									<SelectField attr="removeRule" label="Remove rule" recs={removeRuleRecs} />
								</div>
							</div>
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};

export default ClassAttr;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import BooleanField from "./BooleanField";
import SelectField from "./SelectField";
import ChooseField from "./ChooseField";
import Types from "./Types";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import Models from "./Models";
import {getHash} from "./helper";

class Property extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "-",
			model: hash.opts.model
		};
		if (me.state.rid) {
			let o = me.props.store.getProperty (me.state.rid);
			
			me.state.label = o.getLabel ();
			me.state.type = o.get ("type");
		}
		me.onChange = me.onChange.bind (me);
	}

	onChange (id, v) {
		this.setState ({[id]: v});
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
				<Tabs key="tabs" id="tabs" title={"Property: " + me.state.label}>
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="property" rid={me.state.rid} onChange={me.onChange} >
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="name" label="Name" notNull={true} />
								</div>
								<div className="form-group col-md-6">
									<ChooseField property="model" label="Model" disabled={true} rsc="model" value={me.state.model} choose={Models} chooseRef="models" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="code" label="Code" disabled={!!me.state.rid} notNull={true} />
								</div>
								<div className="form-group col-md-6">
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<ChooseField property="type" label="Type" disabled={!!me.state.rid} rsc="model" notNull={true} choose={Types} chooseRef="types" />
								</div>
								<div className="form-group col-md-6">
									<StringField property="description" label="Description" textarea={true} />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<BooleanField property="notNull" label="Not null" />
								</div>
								<div className="form-group col-md-6">
									<BooleanField property="unique" label="Unique" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<BooleanField property="secure" label="Secure" />
								</div>
								<div className="form-group col-md-6">
									{me.state.type >= 1000 && <SelectField property="removeRule" label="Remove rule" recs={removeRuleRecs} />}
								</div>
							</div>
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};

export default Property;

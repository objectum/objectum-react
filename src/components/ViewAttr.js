/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from 'react';
import StringField from "./StringField";
import NumberField from "./NumberField";
import SelectField from "./SelectField";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import ChooseField from "./ChooseField";
import Views from "./Views";
import {getHash} from "./helper";

class ViewAttr extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "-",
			view: hash.opts.view
		};
		if (me.state.rid) {
			let o = me.props.store.getViewAttr (me.state.rid);
			
			me.state.label = o.getLabel ();
		}
	}
	
	render () {
		let me = this;
		let areaRecs = [
			{id: 0, name: "Hidden"},
			{id: 1, name: "Visible"}
		];
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)} disabled={!me.from}><i className="fas fa-arrow-left mr-2"></i> Back</button>
				<Tabs key="tabs" id="tabs" title={"View attribute: " + me.state.label}>
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="viewAttr" rid={me.state.rid}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<ChooseField attr="view" label="View" disabled={!!me.state.rid} rsc="view" value={me.state.view} choose={Views} chooseRef="views" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="code" label="Code" />
								</div>
								<div className="form-group col-md-6">
									<NumberField attr="order" label="Order" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<SelectField attr="area" label="Area" recs={areaRecs} />
								</div>
								<div className="form-group col-md-6">
									<NumberField attr="columnWidth" label="Column width" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="description" label="Description" textarea={true} />
								</div>
								<div className="form-group col-md-6">
								</div>
							</div>
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};

export default ViewAttr;

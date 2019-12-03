/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import NumberField from "./NumberField";
import SelectField from "./SelectField";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import ChooseField from "./ChooseField";
import Queries from "./Queries";
import {getHash, goRidLocation} from "./helper";
import {i18n} from "./../i18n";

class Column extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			area: "1"
		};
		if (hash.opts && hash.opts.query) {
			me.state.query = hash.opts.query;
		}
		if (me.state.rid) {
			let o = me.props.store.getColumn (me.state.rid);
			
			me.state.label = o.getLabel ();
		}
		me.onCreate = me.onCreate.bind (me);
	}
	
	onCreate (rid) {
		let me = this;
		let o = me.props.store.getColumn (rid);
		
		me.setState ({rid, label: o.getLabel ()});
		goRidLocation (me.props, rid);
	}
	
	render () {
		let me = this;
		let areaRecs = [
			{id: "0", name: i18n ("Hidden")},
			{id: "1", name: i18n ("Visible")}
		];
		return (
			<div>
				<Tabs key="tabs" id="tabs" label={i18n ("Column") + ": " + me.state.label}>
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={me.props.store} rsc="column" rid={me.state.rid} onCreate={me.onCreate}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<ChooseField property="query" label="Query" disabled={!!me.state.rid} rsc="query" value={me.state.query} choose={Queries} chooseRef="queries" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="code" label="Code" />
								</div>
								<div className="form-group col-md-6">
									<NumberField property="order" label="Order" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<SelectField property="area" label="Area" recs={areaRecs} value={me.state.area} />
								</div>
								<div className="form-group col-md-6">
{/*
									<NumberField property="columnWidth" label="Column width" />
*/}
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="description" label="Description" textarea={true} />
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
Column.displayName = "Column";

export default Column;

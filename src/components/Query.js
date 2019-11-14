/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import Columns from "./Columns";
import ChooseField from "./ChooseField";
import Queries from "./Queries";
import {getHash} from "./helper";
import {i18n} from "./../i18n";

class Query extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "-",
			parent: hash.opts.parent
		};
		if (me.state.rid) {
			let o = me.props.store.getQuery (me.state.rid);
			
			me.state.label = o.getLabel ();
		}
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i>{i18n ("Back")}</button>
				<Tabs key="tabs" id="tabs" title={"Query: " + me.state.label}>
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="query" rid={me.state.rid}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<ChooseField property="parent" label="Parent" disabled={!!me.state.rid} rsc="query" value={me.state.parent} choose={Queries} chooseRef="queries" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="code" label="Code" />
								</div>
								<div className="form-group col-md-6">
									<StringField property="description" label="Description" textarea={true} />
								</div>
							</div>
							<div className="row">
								<div className="col-md-12">
									<StringField property="query" label="Query" codemirror={true} />
								</div>
							</div>
						</Form>
					</Tab>
					{me.state.rid &&
					<Tab key="Tab2" title="Columns">
						<Columns {...me.props} query={me.state.rid} />
					</Tab>}
				</Tabs>
			</div>
		);
	}
};

export default Query;

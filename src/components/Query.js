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
import {getHash, goRidLocation} from "./helper";
import {i18n} from "./../i18n";

class Query extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			label: ""
		};
		if (hash.opts && hash.opts.parent) {
			me.state.parent = hash.opts.parent;
		}
		if (me.state.rid) {
			let o = me.props.store.getQuery (me.state.rid);
			
			me.state.label = o.getLabel ();
		}
		me.onCreate = me.onCreate.bind (me);
	}
	
	onCreate (rid) {
		let me = this;
		let o = me.props.store.getQuery (rid);
		
		me.setState ({rid, label: o.getLabel ()});
		goRidLocation (me.props, rid);
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<div className="bg-white shadow-sm">
					<Tabs key="tabs" id="tabs" label={i18n ("Query") + ": " + me.state.label}>
						<Tab key="Tab1" label="Information">
							<Form key="form1" store={me.props.store} rsc="query" rid={me.state.rid} onCreate={me.onCreate}>
								<div className="form-row">
									<div className="form-group col-md-6">
										<StringField property="name" label="Name" />
									</div>
									<div className="form-group col-md-6">
										<ChooseField
											property="parent" label="Parent" disabled={!!me.state.rid} rsc="query" value={me.state.parent}
											choose={{cmp: Queries, ref: "queries"}}
										/>
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
									<div className="col-md-6">
										<StringField property="query" label="Query" codemirror={true} />
									</div>
									<div className="col-md-6">
										<StringField property="opts" label="Options" codemirror={true} />
									</div>
								</div>
							</Form>
						</Tab>
						{me.state.rid &&
						<Tab key="Tab2" label="Columns">
							<div className="p-1">
								<Columns {...me.props} query={me.state.rid} />
							</div>
						</Tab>}
					</Tabs>
				</div>
			</div>
		);
	}
};
Query.displayName = "Query";

export default Query;

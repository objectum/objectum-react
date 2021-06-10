/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {StringField, Form, Tab, Tabs, Columns, Return} from "..";
import {getHash, goRidLocation, i18n} from "..";
import DictField from "./DictField";

export default class Query extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		this.state = {
			rid: rid == "new" ? null : rid,
			label: ""
		};
		if (hash.opts && hash.opts.parent) {
			this.state.parent = hash.opts.parent;
		}
		if (this.state.rid) {
			let o = this.props.store.getQuery (this.state.rid);
			
			this.state.label = o.getLabel ();
		}
	}
	
	onCreate = (rid) => {
		let o = this.props.store.getQuery (rid);
		this.setState ({rid, label: o.getLabel ()});
		goRidLocation (this.props, rid);
	}
	
	render () {
		return <div className="container">
			<Return {...this.props} />
			<div className="shadow-sm border">
				<Tabs key="tabs" id="tabs" label={i18n ("Query") + ": " + this.state.label}>
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={this.props.store} rsc="query" rid={this.state.rid} onCreate={this.onCreate}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<DictField
										property="parent" label="Parent" disabled={!!this.state.rid} value={this.state.parent}
										recs={this.props.store.getQueryRecords ()} tree
									/>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="code" label="Code" regexp={/^[a-zA-Z0-9_]+$/} />
								</div>
								<div className="form-group col-md-6">
									<StringField property="description" label="Description" textarea />
								</div>
							</div>
							<div className="row">
								<div className="col">
									<StringField property="query" label="Query" textarea monospace rows={20} />
								</div>
							</div>
						</Form>
					</Tab>
					{this.state.rid &&
					<Tab key="Tab2" label="Columns">
						<div className="p-1">
							<Columns {...this.props} query={this.state.rid} />
						</div>
					</Tab>}
				</Tabs>
			</div>
		</div>;
	}
};
Query.displayName = "Query";

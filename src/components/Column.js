/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {StringField, NumberField, SelectField, Form, Tab, Tabs, ChooseField, Queries, Return} from "..";
import {getHash, goRidLocation, i18n} from "..";

export default class Column extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		this.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			area: "1"
		};
		if (hash.opts && hash.opts.query) {
			this.state.query = hash.opts.query;
		}
		if (this.state.rid) {
			let o = this.props.store.getColumn (this.state.rid);
			
			this.state.label = o.getLabel ();
		}
	}
	
	onCreate = (rid) => {
		let o = this.props.store.getColumn (rid);
		
		this.setState ({rid, label: o.getLabel ()});
		goRidLocation (this.props, rid);
	}
	
	render () {
		let areaRecs = [
			{id: "0", name: i18n ("Hidden")},
			{id: "1", name: i18n ("Visible")}
		];
		return <div className="container">
			<Return {...this.props} />
			<div className="shadow-sm border">
				<Tabs key="tabs" id="tabs" label={i18n ("Column") + ": " + this.state.label}>
					<Tab key="Tab1" label="Information">
						<Form key="form1" store={this.props.store} rsc="column" rid={this.state.rid} onCreate={this.onCreate}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<ChooseField
										property="query" label="Query" disabled rsc="query" value={this.state.query}
										choose={{cmp: Queries, ref: "queries"}}
									/>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="code" label="Code" regexp={/^[a-zA-Z0-9_]+$/} />
								</div>
								<div className="form-group col-md-6">
									<NumberField property="order" label="Order" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<SelectField property="area" label="Area" recs={areaRecs} value={this.state.area} />
								</div>
								<div className="form-group col-md-6">
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="description" label="Description" textarea />
								</div>
								<div className="form-group col-md-6">
								</div>
							</div>
						</Form>
					</Tab>
				</Tabs>
			</div>
		</div>;
	}
};
Column.displayName = "Column";

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import ReactDOM from "react-dom";
import {StringField, Form, Tab, Tabs, Columns, BooleanField, Action} from "..";
import {getHash, goRidLocation, i18n} from "..";
import DictField from "./DictField";

export default class Query extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		this.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			properties: [],
			pagination: true,
			where: false,
			order: false,
			tree: false,
		};
		this.queryRef = React.createRef ();

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

	getSelectedProperties () {
		return this.state.properties.filter (property => this.state [`property-${property.id}`]);
	}

	build = () => {
		let properties = this.getSelectedProperties ();
		let s = `{"data": "begin"}
select
${properties.map ((p, i) => `	{"prop": "a.${p.code}", "as": "${p.code}"}${i < properties.length - 1 ? "," : ""}\n`).join ("")}{"data": "end"}
${this.state.pagination ? `\n{"count": "begin"}
select
    count (*) as num
{"count": "end"}
` : ""}${this.state.tree ? `\n{"tree": "begin"}
select
    {"prop": "a.parent", "as": "parent"}, count (*) as num
{"tree": "end"}
` : ""}
from
	{"model": "${this.state.model.getPath ()}", "alias": "a"}

${this.state.where ? `{"where": "begin"}
{"where": "end"}
` : `{"where": "empty"}`}
${this.state.order ? `{"order": "begin"}
{"order": "end"}
` : `{"order": "empty"}`}
${this.state.tree ? `{"tree": "begin"}
group by
    {"prop": "a.parent"}
{"tree": "end"}
` : ""}
${this.state.pagination ? `limit {"param": "limit"}
offset {"param": "offset"}
` : ""}		
`;
		ReactDOM.findDOMNode (this.queryRef.current).getElementsByTagName ("textarea")[0].value = s;
	}

	render () {
		return <div className="container">
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
								<StringField property="query" label="Query" textarea monospace rows={20} ref={this.queryRef} />
							</div>
						</div>
					</Form>
					<div className="px-1 pb-1">
						<h5 className="font-weight-bold">{i18n ("Query constructor")}</h5>
						<div className="row">
							<div className="col-6">
								<DictField label="Model" records={this.props.store.getModelRecords (true).filter (record => record.id >= 1000)} tree onChange={({value}) => {
									let model = this.props.store.getModel (value);
									let properties = [];

									for (let code in model.properties) {
										properties.push (model.properties [code]);
									}
									properties.sort ((a, b) => {
										if ((!a.order && b.order) || (a.order && b.order && a.order > b.order)) {
											return 1;
										}
										if ((a.order && !b.order) || (a.order && b.order && a.order < b.order)) {
											return -1;
										}
										if (a.code > b.code) {
											return 1;
										}
										return -1;
									});
									this.setState ({properties, model});
								}} />
								<BooleanField label={i18n ("Pagination")} value={this.state.pagination} onChange={({value}) => this.setState ({pagination: value})} />
								<BooleanField label={`${i18n ("Clause")}: where`} value={this.state.where} onChange={({value}) => this.setState ({where: value})} />
								<BooleanField label={`${i18n ("Clause")}: order`} value={this.state.order} onChange={({value}) => this.setState ({order: value})} />
								<BooleanField label={i18n ("Tree")} value={this.state.tree} onChange={({value}) => this.setState ({tree: value})} />
							</div>
							<div className="col-6">
								<div className="mb-1">{i18n ("Properties")}</div>
								{this.state.properties.map (p => {
									return <BooleanField key={p.code} label={p.getLabel ()} onChange={({value}) => this.setState ({[`property-${p.id}`]: value})} />;
								})}
							</div>
						</div>
						<Action label={i18n ("Build")} icon="fas fa-wrench" disabled={!this.getSelectedProperties ().length} onClick={this.build} />
					</div>
				</Tab>
				{this.state.rid &&
				<Tab key="Tab2" label="Columns">
					<div className="p-1">
						<Columns {...this.props} query={this.state.rid} />
					</div>
				</Tab>}
			</Tabs>
		</div>;
	}
};
Query.displayName = "Query";

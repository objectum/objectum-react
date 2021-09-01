/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import DictField from "./DictField";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import Properties from "./Properties";
import JsonEditor from "./JsonEditor";
import BooleanField from "./BooleanField";
import {getHash, goRidLocation} from "..";
import {i18n} from "./../i18n";

export default class Model extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		this.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			parent: hash.opts.parent,
			refresh: false
		};
		if (this.state.rid) {
			let o = this.props.store.getModel (this.state.rid);
			
			this.state.label = o.getLabel ();
		}
	}
	
	onCreate = (rid) => {
		let o = this.props.store.getModel (rid);
		this.setState ({rid, label: o.getLabel ()});
		goRidLocation (this.props, rid);
	}
	
	render () {
		return <div className="container">
			<Tabs {...this.props} key="modelTabs" id="modelTabs" label={i18n ("Model") + ": " + this.state.label}>
				<Tab key="tab1" label="Information">
					<Form key="form1" store={this.props.store} rsc="model" rid={this.state.rid} onCreate={this.onCreate}>
						<div className="form-row">
							<div className="form-group col-md-6">
								<StringField property="name" label="Name" />
							</div>
							<div className="form-group col-md-6">
								<DictField
									property="parent" label="Parent" disabled={!!this.state.rid} value={this.state.parent}
									recs={this.props.store.getModelRecords ()} tree
								/>
							</div>
						</div>
						<div className="form-row">
							<div className="form-group col-md-6">
								<StringField property="code" label="Code" disabled={!!this.state.rid} regexp={/^[a-zA-Z0-9_]+$/} />
							</div>
							<div className="form-group col-md-6">
								<StringField property="description" label="Description" textarea />
							</div>
						</div>
						<div className="form-row">
							<div className="form-group col-md-6">
								<BooleanField property="unlogged" disabled={!!this.state.rid} label="Unlogged" />
							</div>
						</div>
						<div className="form-row">
							<div className="form-group col-md-12">
								<JsonEditor property="opts" label="Options" />
							</div>
						</div>
					</Form>
				</Tab>
				{this.state.rid && <Tab key="Tab2" label="Properties">
					<div className="p-1"><Properties {...this.props} model={this.state.rid} /></div>
				</Tab>}
			</Tabs>
		</div>;
	}
};
Model.displayName = "Model";

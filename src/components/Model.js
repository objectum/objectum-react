/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import ChooseField from "./ChooseField";
import Models from "./Models";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import Properties from "./Properties";
import JsonEditor from "./JsonEditor";
import {getHash, goRidLocation} from "./helper";
import {i18n} from "./../i18n";

class Model extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			parent: hash.opts.parent,
			refresh: false
		};
		if (me.state.rid) {
			let o = me.props.store.getModel (me.state.rid);
			
			me.state.label = o.getLabel ();
		}
		me.onCreate = me.onCreate.bind (me);
	}
	
	onCreate (rid) {
		let me = this;
		let o = me.props.store.getModel (rid);
		
		me.setState ({rid, label: o.getLabel ()});
		goRidLocation (me.props, rid);
	}
	
	render () {
		let me = this;

		return (
			<div className="container">
				<Tabs key="modelTabs" id="modelTabs" label={i18n ("Model") + ": " + me.state.label}>
					<Tab key="tab1" label="Information">
						<Form key="form1" ref="form1" store={me.props.store} rsc="model" rid={me.state.rid} onCreate={me.onCreate}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<ChooseField
										property="parent" label="Parent" rsc="model" disabled={!!me.state.rid} value={me.state.parent}
										choose={{cmp: Models, ref: "models"}}
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
							<div className="form-row">
								<div className="form-group col-md-12">
									<JsonEditor property="opts" label="Options" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col">
									<StringField property="format" label="Format function" codemirror={true} />
								</div>
							</div>
						</Form>
					</Tab>
					{me.state.rid &&
					<Tab key="Tab2" label="Properties">
						<Properties {...me.props} model={me.state.rid} />
					</Tab>
					}
				</Tabs>
			</div>
		);
	}
};
Model.displayName = "Model";

export default Model;

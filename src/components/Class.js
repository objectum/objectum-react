/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import ChooseField from "./ChooseField";
import Classes from "./Classes";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import ClassAttrs from "./ClassAttrs";
import {getHash} from "./helper";

class Class extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "-",
			parent: hash.opts.parent,
			removeConfirm: false,
			refresh: false
		};
		if (me.state.rid) {
			let o = me.props.store.getClass (me.state.rid);
			
			me.state.label = o.getLabel ();
		}
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)} disabled={!me.from}><i className="fas fa-arrow-left mr-2"></i> Back</button>
				<Tabs key="tabs" id="tabs" title={"Class: " + me.state.label}>
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="class" rid={me.state.rid}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<ChooseField attr="parent" label="Parent" rsc="class" disabled={!!me.state.rid} value={me.state.parent} choose={Classes} chooseRef="classes" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="code" label="Code" />
								</div>
								<div className="form-group col-md-6">
									<StringField attr="description" label="Description" textarea={true} />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-12">
									<StringField attr="formatFunc" label="Format function" codemirror={true} />
								</div>
							</div>
						</Form>
					</Tab>
					{me.state.rid &&
					<Tab key="Tab2" title="Attributes">
						<ClassAttrs {...me.props} class={me.state.rid} />
					</Tab>
					}
				</Tabs>
			</div>
		);
	}
};

export default Class;

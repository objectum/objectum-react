/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import Form from "./Form";
import Tab from "./Tab";
import Tabs from "./Tabs";
import ViewAttrs from "./ViewAttrs";
import ChooseField from "./ChooseField";
import Views from "./Views";
import {getHash} from "./helper";


class View extends Component {
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
			let o = me.props.store.getView (me.state.rid);
			
			me.state.label = o.getLabel ();
		}
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i> Back</button>
				<Tabs key="tabs" id="tabs" title={"View: " + me.state.label}>
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="view" rid={me.state.rid}>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField attr="name" label="Name" />
								</div>
								<div className="form-group col-md-6">
									<ChooseField attr="parent" label="Parent" disabled={!!me.state.rid} rsc="view" value={me.state.parent} choose={Views} chooseRef="views" />
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
							<div className="row">
								<div className="col-md-12">
									<StringField attr="query" label="Query" codemirror={true} />
								</div>
							</div>
						</Form>
					</Tab>
					{me.state.rid &&
					<Tab key="Tab2" title="Attributes">
						<ViewAttrs {...me.props} view={me.state.rid} />
					</Tab>}
				</Tabs>
			</div>
		);
	}
};

export default View;

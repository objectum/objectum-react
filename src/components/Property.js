/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {StringField, NumberField, BooleanField, DictField, SelectField, ChooseField} from "..";
import {Types, Form, Tab, Tabs, Models, getHash, goRidLocation, i18n} from "..";

class Property extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			model: hash.opts.model,
			removeRule: "set null"
		};
		if (me.state.rid) {
			let o = me.props.store.getProperty (me.state.rid);
			
			me.state.label = o.getLabel ();
			me.state.type = o.get ("type");
		}
		me.onChange = me.onChange.bind (me);
		me.onCreate = me.onCreate.bind (me);
	}

	onChange ({property, value}) {
		let state = {[property]: value};
		
		if (property == "type" && value >= 1000) {
			let m = this.props.store.getModel (value);
			
			state.name = m.name;
			state.code = m.code;
		}
		this.setState (state);
	}
	
	onCreate (rid) {
		let me = this;
		let o = me.props.store.getProperty (rid);
		
		me.setState ({rid, label: o.getLabel ()});
		goRidLocation (me.props, rid);
	}
	
	render () {
		let me = this;
		let removeRuleRecs = [
			{id: "set null", name: "Set null"},
			{id: "cascade", name: "Cascade"},
			{id: "no action", name: "No action"}
		];
		return (
			<div className="container">
				<div className="shadow-sm">
					<Tabs key="propertyTabs" id="propertyTabs" label={i18n ("Property") + ": " + me.state.label}>
						<Tab key="Tab1" label="Information">
							<Form
								key="form1" store={me.props.store}
								rsc="property" rid={me.state.rid}
								onChange={me.onChange} onCreate={me.onCreate}
								values={{name: me.state.name, code: me.state.code}}
							>
								<div className="form-row">
									<div className="form-group col-md-6">
										<StringField property="name" label="Name" notNull={true} />
									</div>
									<div className="form-group col-md-6">
										<ChooseField
											property="model" label="Model" disabled={true} rsc="model" value={me.state.model}
											choose={{cmp: Models, ref: "models"}}
										/>
									</div>
								</div>
								<div className="form-row">
									<div className="form-group col-md-6">
										<StringField property="code" label="Code" disabled={!!me.state.rid} notNull={true} regexp={/^[a-zA-Z0-9_]+$/} />
									</div>
									<div className="form-group col-md-6">
										<NumberField property="order" label="Order" />
									</div>
								</div>
								<div className="form-row">
									<div className="form-group col-md-6">
{/*
										<ChooseField
											property="type" label="Type" disabled={!!me.state.rid} rsc="model" notNull={true}
											choose={{cmp: Types, ref: "types"}}
										/>
*/}
										<DictField
											property="type" label="Type" disabled={!!me.state.rid} notNull={true}
											recs={me.props.store.getModelRecords (true)} tree
										/>
									</div>
									<div className="form-group col-md-6">
										<StringField property="description" label="Description" textarea={true} />
									</div>
								</div>
								<div className="form-row">
									<div className="form-group col-md-6">
										<BooleanField property="notNull" label="Not null" />
										<BooleanField property="unique" label="Unique" />
										<BooleanField property="secure" label="Secure" />
									</div>
									<div className="form-group col-md-6">
										{me.state.type >= 1000 && <SelectField property="removeRule" label="Remove rule" recs={removeRuleRecs} value="set null" />}
									</div>
								</div>
								<div className="form-row">
									<div className="form-group col-md-6">
										<StringField property="opts" label="Options" textarea monospace rows={10} />
									</div>
									<div className="form-group col-md-6">
									</div>
								</div>
							</Form>
						</Tab>
					</Tabs>
				</div>
			</div>
		);
	}
};
Property.displayName = "Property";

export default Property;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {StringField, NumberField, BooleanField, DictField, SelectField, ChooseField, Return} from "..";
import {Form, Tab, Tabs, Models, getHash, goRidLocation, i18n} from "..";

export default class Property extends Component {
	constructor (props) {
		super (props);
		
		let rid = this.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		this.state = {
			rid: rid == "new" ? null : rid,
			label: "",
			model: hash.opts.model,
			removeRule: "set null"
		};
		if (this.state.rid) {
			let o = this.props.store.getProperty (this.state.rid);
			
			this.state.label = o.getLabel ();
			this.state.type = o.get ("type");
		}
	}

	onChange = ({property, value}) => {
		let state = {[property]: value};
		
		if (property == "type" && value >= 1000) {
			let m = this.props.store.getModel (value);
			
			state.name = m.name;
			state.code = m.code;
		}
		this.setState (state);
	}
	
	onCreate = (rid) => {
		let o = this.props.store.getProperty (rid);
		this.setState ({rid, label: o.getLabel ()});
		goRidLocation (this.props, rid);
	}
	
	render () {
		let removeRuleRecs = [
			{id: "set null", name: "Set null"},
			{id: "cascade", name: "Cascade"}
		];
		return <div className="container">
			<Return {...this.props} />
			<div className="shadow-sm">
				<Tabs key="propertyTabs" id="propertyTabs" label={i18n ("Property") + ": " + this.state.label}>
					<Tab key="Tab1" label="Information">
						<Form
							key="form1" store={this.props.store}
							rsc="property" rid={this.state.rid}
							onChange={this.onChange} onCreate={this.onCreate}
							values={{name: this.state.name, code: this.state.code}}
						>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="name" label="Name" notNull />
								</div>
								<div className="form-group col-md-6">
									<ChooseField
										property="model" label="Model" disabled rsc="model" value={this.state.model}
										choose={{cmp: Models, ref: "models"}}
									/>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<StringField property="code" label="Code" disabled={!!this.state.rid} notNull regexp={/^[a-zA-Z0-9_]+$/} />
								</div>
								<div className="form-group col-md-6">
									<NumberField property="order" label="Order" />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<DictField
										property="type" label="Type" disabled={!!this.state.rid} notNull
										recs={this.props.store.getModelRecords (true)} tree
									/>
								</div>
								<div className="form-group col-md-6">
									<StringField property="description" label="Description" textarea />
								</div>
							</div>
							<div className="form-row">
								<div className="form-group col-md-6">
									<BooleanField property="notNull" label="Not null" />
									<BooleanField property="unique" label="Unique" />
									<BooleanField property="secure" label="Secure" />
								</div>
								<div className="form-group col-md-6">
									{this.state.type >= 1000 && <SelectField property="removeRule" label="Remove rule" recs={removeRuleRecs} value="set null" />}
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
		</div>;
	}
};
Property.displayName = "Property";

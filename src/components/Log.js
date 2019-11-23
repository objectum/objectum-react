/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import _ from "lodash";
import {getDateString} from "./helper";

class Log extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.form = me.props.form;
		me.store = me.props.form.props.store;
		me.onChange = me.onChange.bind (me);
		
		me.state = {
			field: "",
			recs: []
		};
	}
	
	async onChange (val) {
		let me = this;
		let v = val.target.value;
		let state = {field: v};
		
		if (v) {
			let record = await me.store.getRecord (me.props.form.state.rid);
			let model = me.store.getModel (record.get ("_model"));
			let property = model.properties [v];
			
			state.recs = await me.store.getLog (me.props.form.state.rid, property.get ("id"));
			
		} else {
			state.recs = [];
		}
		me.setState (state);
	}
	render () {
		let me = this;
		let recs = _.map (me.form.map, (o, a) => {
			return {
				id: a, name: o.label
			};
		});
		return (
			<div className="border p-1 mb-1 bg-white shadow-sm">
				<h5>{i18n ("Log")}</h5>
				<select className="form-control custom-select mb-1" value={me.state.tag} onChange={me.onChange}>
					{[{id: "", name: i18n ("Select field")}, ...recs].map ((rec, i) => {
						return (
							<option value={rec.id} key={i}>{rec.name}</option>
						);
					})}
				</select>
				{me.state.recs && <table className="table table-bordered bg-white shadow-sm objectum-table p-1">
					<thead className="thead-dark">
						<tr>
							<th>{i18n ("Date")}</th>
							<th>{i18n ("Value")}</th>
							<th>{i18n ("Comment")}</th>
							<th>{i18n ("IP-address")}</th>
						</tr>
					</thead>
					<tbody>
					{me.state.recs.map ((rec, i) => {
						return (
							<tr key={i}>
								<td key={"date-" + i}>{getDateString (rec.date)}</td>
								<td key={"value-" + i}>{rec.value || ""}</td>
								<td key={"description-" + i}>{rec.description || ""}</td>
								<td key={"remote_addr-" + i}>{rec.remote_addr || ""}</td>
							</tr>
						);
					})}
					</tbody>
				</table>}
			</div>
		);
	}
};
Log.displayName = "Log";

export default Log;

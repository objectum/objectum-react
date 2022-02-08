/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getTimestampString, i18n} from "..";

export default class Log extends Component {
	constructor (props) {
		super (props);
		
		this.form = this.props.form;
		this.store = this.props.form.props.store;
		
		this.state = {
			field: "",
			recs: []
		};
	}
	
	onChange = async (val) => {
		let v = val.target.value;
		let state = {field: v};
		
		if (v) {
			let record = await this.store.getRecord (this.form.record.id);
			let model = this.store.getModel (record.get ("_model"));
			let property = model.properties [v];

			state.recs = await this.store.getLog (this.form.record.id, property.get ("id"));

			for (let i = 0; i < state.recs.length; i ++) {
				let value = state.recs [i].value;

				if (value && typeof (value) == "object" && value.getMonth) {
					value = value.toLocaleString ();
				}
				if (property.type >= 1000 && value) {
					try {
						let record = await store.getRecord (value);
						value = record.getLabel ();
					} catch (err) {
					}
				}
				state.recs [i].value = value;
			}
		} else {
			state.recs = [];
		}
		this.setState (state);
	}
	render () {
		let fields = this.form.getFields (this.form.props.children);
		let recs = [];
		
		for (let code in fields) {
			recs.push ({
				id: code, name: this.form.model.properties [code] && this.form.model.properties [code].name
			});
		}
		return <div>
			<strong>{i18n ("Log")}</strong>
			<select className="form-control custom-select my-1" value={this.state.tag} onChange={this.onChange}>
				{[{id: "", name: i18n ("Select field")}, ...recs].map ((rec, i) => {
					return (
						<option value={rec.id} key={i}>{rec.name}</option>
					);
				})}
			</select>
			{this.state.recs && <table className="table table-bordered table-sm objectum-table p-1 mb-0">
				<thead className="bg-info text-white">
					<tr>
						<th>{i18n ("Date")}</th>
						<th>{i18n ("Value")}</th>
						<th>{i18n ("Comment")}</th>
						<th>{i18n ("IP-address")}</th>
						<th>{i18n ("User")}</th>
					</tr>
				</thead>
				<tbody>
				{this.state.recs.map ((rec, i) => {
					let value = rec.value || "";

					return (
						<tr key={i}>
							<td key={"date-" + i}>{getTimestampString (rec.date)}</td>
							<td key={"value-" + i}>{value}</td>
							<td key={"description-" + i}>{rec.description || ""}</td>
							<td key={"remote_addr-" + i}>{rec.remote_addr || ""}</td>
							<td key={"user-" + i}>{`${rec.login || "admin"}${rec.user_id ? ` (${rec.user_id})`: ""}`}</td>
						</tr>
					);
				})}
				</tbody>
			</table>}
		</div>;
	}
};
Log.displayName = "Log";

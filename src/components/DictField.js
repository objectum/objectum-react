/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import _ from "lodash";
import {newId} from "./helper";

class DictField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onClear = me.onClear.bind (me);
		me.onFilter = me.onFilter.bind (me);
		me.onClick = me.onClick.bind (me);
		me.onGroupClick = me.onGroupClick.bind (me);
		me.onDocumentClick = me.onDocumentClick.bind (me);
		me.onShowDialog = me.onShowDialog.bind (me);

		me.state = {
			code: me.props.property,
			value: me.props.value === null ? "" : me.props.value,
			label: "",
			showDialog: false,
			recs: [],
			groupRecs: null,
			group: null,
			filter: ""
		};
		me.model = me.props.store.getModel (me.props.model);
		me.property = me.model.properties [me.props.property];
		me.id = newId ();
	}
	
	onClear () {
		let me = this;
		
		me.setState ({value: null, label: ""});

		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value: null, id: me.props.id});
		}
	}
	
	async componentDidMount () {
		let me = this;
		let state = {
			recs: await me.props.store.getDict (me.property.get ("type")),
			label: ""
		};
		if (me.state.value) {
			let record = await me.props.store.getRecord (me.state.value);

			state.label = record.getLabel ();
		}
		let m = me.props.store.getModel (me.property.get ("type"));
		
		for (let code in m.properties) {
			let property = m.properties [code];
			
			if (property.get ("type") >= 1000) {
				let pm = me.props.store.getModel (property.get ("type"));
				
				if (pm.isDictionary ()) {
					me.groupProperty = property;
					state.groupRecs = await me.props.store.getDict (property.get ("type"));
					break;
				}
			}
		}
		document.addEventListener ("mousedown", me.onDocumentClick)
		me.setState (state);
	}
	
	componentWillUnmount () {
		document.removeEventListener ("mousedown", this.onDocumentClick);
	}
	
	onDocumentClick (event) {
		let me = this;
		
		if (me.refs.dialog && !me.refs.dialog.contains (event.target) && me.refs.button && !me.refs.button.contains (event.target)) {
			me.setState ({
				showDialog: false,
				filter: "",
				group: null
			});
		}
	}
	
	onFilter (val) {
		let me = this;
		let v = val.target.value;
		
		me.setState ({filter: v});
	}
	
	onShowDialog () {
		let me = this;
		
		if (me.state.showDialog) {
			return me.setState ({
				showDialog: false,
				filter: "",
				group: null
			});
		}
		me.setState ({showDialog: true});
	}
	
	async onClick (val) {
		let me = this;
		let state = {
			showDialog: false,
			value: val.target.id,
			filter: "",
			group: null
		};
		let record = await me.props.store.getRecord (state.value);
		
		state.label = record.getLabel ();
		me.setState (state);
		
		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value: state.value, id: me.props.id});
		}
	}
	
	onGroupClick (val) {
		let me = this;
		me.setState ({group: val.target.id});
	}
	
	filter (inRecs) {
		let me = this;
		let recs = [];
		
		inRecs.forEach (rec => {
			if (me.state.filter && (rec.name.toLowerCase () || "").indexOf (me.state.filter.toLowerCase ()) == -1) {
				return;
			}
			recs.push (rec);
		});
		return recs;
	}

	renderParameters () {
		let me = this;
		let recs = me.filter (me.state.recs);
		
		if (me.state.group) {
			recs = recs.filter (rec => rec [me.groupProperty.code] == me.state.group);
		}
		return (
			<div className="_dictfield-dialog text-left" ref="dialog">
				<div className="_dictfield-filter border p-1 bg-white">
					<h6 className="ml-2">{i18n ("Select parameter")}</h6>
					<input type="text" className="form-control" value={me.state.filter} onChange={me.onFilter} placeholder={i18n ("Filter") + " ..."} />
				</div>
				<div className="_dictfield-params border p-1 bg-white">
					<ul className="list-group">
						{recs.map (rec => {
							return (
								<li className="list-group-item" id={rec.id} key={rec.id} onClick={me.onClick}>{`${rec.name} (id: ${rec.id})`}</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
	
	renderGroup () {
		let me = this;
		let recs = me.filter (me.state.groupRecs);
		
		return (
			<div className="_dictfield-dialog text-left" ref="dialog">
				<div className="_dictfield-filter border p-1 bg-white">
					<h6>{`${i18n ("Select")}: ${me.groupProperty.get ("name")}`}</h6>
					<input type="text" className="form-control" value={me.state.filter} onChange={me.onFilter} placeholder={i18n ("Filter") + " ..."} />
				</div>
				<div className="_dictfield-params border p-1 bg-white">
					<ul className="list-group">
						{recs.map (rec => {
							let num = _.filter (me.state.recs, {[me.groupProperty.get ("code")]: rec.id}).length;
							
							return (
								<li className="list-group-item" id={rec.id} key={rec.id} onClick={me.onGroupClick}>{`${rec.name} (${i18n ("Amount")}: ${num})`}</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
	
	render () {
		let me = this;
		let addCls = me.props.error ? " is-invalid" : "";
		
		return (
			<div>
				<div className="form-group">
					{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
					<div className="input-group">
						{!me.props.disabled && <div>
							<button
								type="button"
								className="btn btn-primary btn-sm"
								onClick={me.onShowDialog}
								style={{height: "100%", width: "27px"}}
							>
								<i className="fas fa-edit" ref="button" />
							</button>
							<button
								type="button"
								className="btn btn-primary btn-sm border-left"
								onClick={me.onClear}
								style={{height: "100%", width: "27px"}}
							>
								<i className="fas fa-times" />
							</button>
						</div>}
						<input
							type="text"
							className={`form-control ${addCls} _dictfield-input`}
							id={me.id}
							value={me.state.label}
							onChange={() => {}}
							disabled={true}
						/>
					</div>
					{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}

					{me.state.showDialog ? ((me.state.groupRecs && !me.state.group) ? me.renderGroup () : me.renderParameters ()) : <div />}
				</div>
			</div>
		);
	}
};
DictField.displayName = "DictField";

export default DictField;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Tooltip from "./Tooltip";
import {i18n} from "../i18n";
import _isEmpty from "lodash.isempty";
import _filter from "lodash.filter";
import _keys from "lodash.keys";
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
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value === null ? "" : me.props.value,
			label: "",
			showDialog: false,
			recs: me.props.records || me.props.recs || [],
			groupRecs: null,
			group: null,
			filter: ""
		};
		me.model = me.props.store.getModel (me.props.model);
		me.property = me.model.properties [me.props.property];
		me._refs = {
			"optionDialog": React.createRef (),
			"groupDialog": React.createRef (),
			"button": React.createRef ()
		};
		me.id = newId ();
	}
	
	onClear () {
		let me = this;
		
		me.setState ({value: null, label: ""});

		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value: null, id: me.props.id});
		}
	}
	
	async componentDidMount () {
		let me = this;
		let state = {
			label: ""
		};
		if (!me.state.recs.length && !(me.props.recs || me.props.records)) {
			state.recs = await me.props.store.getDict (me.property.get ("type"));
		}
		if (me.state.value) {
			let record = await me.props.store.getRecord (me.state.value);

			state.label = record.getLabel ();
		}
		let m = me.props.store.getModel (me.property.get ("type"));
		
		for (let code in m.properties) {
			let property = m.properties [code];
			
			if (property.get ("type") >= 1000 && ((property.code == "group" && !me.props.hasOwnProperty ("groupProperty")) || property.code == me.props.groupProperty)) {
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
	
	async componentDidUpdate (prevProps) {
		let me = this;
		let state = {};
		
		if (prevProps.value !== me.props.value) {
			state.value = me.props.value;
			state.label = "";
			
			if (me.props.value) {
				let record = await me.props.store.getRecord (me.props.value);
				
				state.label = record.getLabel ();
			}
		}
		let recs = me.props.recs || me.props.records;
		
		if (recs && _keys (recs).join () != _keys (me.state.recs).join ()) {
			state.recs = recs;
		}
		if (!_isEmpty (state)) {
			me.setState (state);
		}
	}
	
	componentWillUnmount () {
		document.removeEventListener ("mousedown", this.onDocumentClick);
	}
	
	onDocumentClick (event) {
		let me = this;
		let dialog = me._refs ["optionDialog"] || me._refs ["groupDialog"];
		
		if (dialog) {
			dialog = dialog.current;
		}
		if (dialog && !dialog.contains (event.target) && me._refs ["button"].current && !me._refs ["button"].current.contains (event.target)) {
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
		let value = val.target.id;
		
		if (!isNaN (value)) {
			value = Number (value);
		}
		let state = {
			showDialog: false,
			value,
			filter: "",
			group: null
		};
		let record = await me.props.store.getRecord (value);
		
		state.label = record.getLabel ();
		me.setState (state);
		
		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
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
			<div className="dictfield-dialog text-left" ref={me._refs ["optionDialog"]}>
				<div className="dictfield-filter border p-1 bg-white shadow">
					<div className="mb-1">{i18n ("Select parameter")}</div>
					<input type="text" className="form-control" value={me.state.filter} onChange={me.onFilter} placeholder={i18n ("Filter") + " ..."} />
				</div>
				<div className="dictfield-params border p-1 bg-white shadow">
					<ul className="list-group">
						{recs.map (rec => {
							let label = `${rec.name} (id: ${rec.id})`;
							
							if (rec.getLabel) {
								label = rec.getLabel ();
							}
							return (
								<li className="border-bottom p-1 dictfield-option" id={rec.id} key={rec.id} onClick={me.onClick}>{label}</li>
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
			<div className="dictfield-dialog text-left" ref={me._refs ["groupDialog"]}>
				<div className="dictfield-filter border p-1 bg-white shadow">
					<div className="mb-1">{`${i18n ("Select")}: ${me.groupProperty.get ("name")}`}</div>
					<input type="text" className="form-control" value={me.state.filter} onChange={me.onFilter} placeholder={i18n ("Filter") + " ..."} />
				</div>
				<div className="dictfield-params border p-1 bg-white shadow">
					<ul className="list-group">
						{recs.map (rec => {
							let label = rec.name;
							
							if (rec.getLabel) {
								label = rec.getLabel ();
							}
							let num = _filter (me.state.recs, {[me.groupProperty.get ("code")]: rec.id}).length;
							
							label += ` (${i18n ("Amount")}: ${num})`;
							
							return (
								<li className="border-bottom p-1 dictfield-option" id={rec.id} key={rec.id} onClick={me.onGroupClick}>{label}</li>
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
				<div className={(me.props.label || me.props.error) ? "form-group" : ""}>
					{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}{me.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
					<div className="d-flex dictfield">
						{!me.props.disabled && <div className="border border-right-0 rounded-left">
							<Tooltip label={i18n ("Choose")}><button
								type="button"
								className="btn btn-link btn-sm p-1"
								onClick={me.onShowDialog}
								style={{height: "100%", width: "27px"}}
							>
								<i className="fas fa-edit" ref={me._refs ["button"]} />
							</button></Tooltip>
						</div>}
						<Tooltip label={me.state.label}>
							<input
								type="text"
								className={`form-control ${addCls} ${me.props.disabled ? "" : " dictfield-input"}`}
								id={me.id}
								value={me.state.label}
								onChange={() => {}}
								disabled={true}
							/>
						</Tooltip>
						{!me.props.disabled && <div className="border border-left-0 rounded-right">
							<Tooltip label={i18n ("Clear")}><button
								type="button"
								className="btn btn-link btn-sm p-1"
								onClick={me.onClear}
								style={{height: "100%", width: "27px"}}
							>
								<i className="fas fa-times" />
							</button></Tooltip>
						</div>}
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

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";
import {i18n} from "./../i18n";
import {newId} from "./helper";
import Grid from "./Grid";
import Tooltip from "./Tooltip";

class ChooseField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let choose = me.props.choose || {};
		
		me.onClear = me.onClear.bind (me);
		me.onChoose = me.onChoose.bind (me);
		me.onVisible = me.onVisible.bind (me);
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value,
			visible: false,
			name: "",
			cmp: choose.cmp,
			query: choose.query,
			ref: choose.query ? "list" : choose.ref
		};
		if (!choose.ref && choose.cmp && choose.cmp.displayName == "ModelList") {
			me.state.ref = "list";
		}
		if (!me.props.disabled) {
			if (!choose.query && (!me.state.cmp || !me.state.ref)) {
				me.state.invalid = true;
			}
		}
		me.id = newId ();
	}
	
	async updateName (value) {
		let me = this;
		let name = "";
		
		if (value) {
			let o = await me.props.store.getRsc (me.state.rsc, value);
			
			name = o.getLabel ();
		}
		me.setState ({name});
	}
	
	onVisible () {
		let me = this;
		
		me.setState ({visible: !me.state.visible});
	}
	
	onClear () {
		let me = this;
		
		me.setState ({value: null, name: ""});
		
		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value: null, id: me.props.id});
		}
	}
	
	onChoose () {
		let me = this;
		let cmp = me.props.choose.cmp ? me.refs ["component"].refs [me.state.ref] : me.refs ["list"];
		
		if (!cmp) {
			throw new Error (`not found choose.ref: ${me.state.ref}`);
		}
		let selected = cmp.state.selected;
		let value = "";
		
		if (selected !== null) {
			value = (cmp.recs || cmp.state.recs) [selected].id;
		}
		me.setState ({value, visible: false});
		me.updateName (value);

		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
		}
	}
	
	async componentDidMount () {
		let me = this;
		
		Modal.setAppElement ("body");
		
		me.updateName (me.state.value);
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value});
			await me.updateName (me.props.value);
		}
	}
	
	render () {
		let me = this;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";
		
		if (me.state.invalid) {
			return (
				<div className="form-group">
					<label htmlFor={me.id}>{i18n (me.props.label)}</label>
					<div className="alert alert-danger">"choose: cmp, ref" or "choose: query" not exist</div>
				</div>
			);
		}
		if (me.props.disabled) {
			return (
				<div className="form-group">
					<label htmlFor={me.id}>{i18n (me.props.label)}</label>
					<Tooltip label={me.state.name}>
						<input type="text" className={"form-control" + addCls} id={me.id} value={me.state.name} disabled={true}/>
					</Tooltip>
				</div>
			)
		}
		let ChooseComponent = me.state.cmp;
		let props = {
			...me.props, addCls, disabled, value: me.state.value, localHash: true
		};
		let gridId = "list";
		
		if (me.props.choose.query) {
			gridId = "list-" + me.props.choose.query;
		}
		if (me.props.choose.model) {
			gridId = "list-" + me.props.choose.model;
		}
		return (
			<div>
				<div className={(me.props.label || me.props.error) ? "form-group" : ""}>
					{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
					<div className="choosefield d-flex">
						{!me.props.disabled && <div>
							<button
								type="button"
								className="btn btn-primary btn-sm"
								onClick={me.onVisible}
								style={{height: "100%", width: "27px"}}
							>
								<i className="fas fa-edit" />
							</button>
						</div>}
						{!me.props.disabled && <div>
							<button
								type="button"
								className="btn btn-primary btn-sm border-left"
								onClick={me.onClear}
								style={{height: "100%", width: "27px"}}
							>
								<i className="fas fa-times" />
							</button>
						</div>}
						<Tooltip label={me.state.name}>
							<input
								type="text"
								className={"form-control _dictfield-input" + addCls}
								id={me.id}
								value={me.state.name}
								onChange={() => {}}
								disabled={true}
							/>
						</Tooltip>
					</div>
					{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
				</div>
				<Modal
					isOpen={me.state.visible}
					style={
						document.documentElement.clientWidth > 1000 ? {
							content: {
								left: "270px"
							}
						} : {}
					}
				>
					<div className="row">
						<div className="col-md mb-1">
							<button type="button" className="btn btn-primary mr-1" onClick={me.onChoose}><i className="fas fa-check mr-1" />{i18n ("Choose")}</button>
							<button type="button" className="btn btn-primary" onClick={() => me.setState ({visible: !me.state.visible})}><i className="fas fa-window-close mr-1" />{i18n ("Cancel")}</button>
						</div>
					</div>
					{me.props.choose.cmp ?
						<ChooseComponent {...props} {...me.props.choose} ref="component" disableActions={true}/> :
						<Grid
							id={gridId}
							ref="list"
							store={me.props.store}
							{...me.props.choose}
						/>
					}
				</Modal>
			</div>
		);
	}
};
ChooseField.displayName = "ChooseField";

export default ChooseField;

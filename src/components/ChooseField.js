/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";
import {i18n} from "./../i18n";
import {newId} from "./helper";

class ChooseField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onClear = me.onClear.bind (me);
		me.onChoose = me.onChoose.bind (me);
		me.onVisible = me.onVisible.bind (me);
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value,
			visible: false,
			name: ""
		};
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
		let cmp = me.refs ["component"].refs [me.props.choose.ref];
		
		if (!cmp) {
			throw new Error (`not found choose.ref: ${me.props.choose.ref}`);
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
		
		if (!disabled && (!me.props.choose || !me.props.choose.cmp || !me.props.choose.ref)) {
			return (
				<div className="form-group">
					<label htmlFor={me.id}>{i18n (me.props.label)}</label>
					<div className="alert alert-danger">choose.cmp or choose.ref not exist</div>
				</div>
			);
		}
		if (me.props.disabled) {
			return (
				<div className="form-group">
					<label htmlFor={me.id}>{i18n (me.props.label)}</label>
					<input type="text" className={"form-control form-control-sm" + addCls} id={me.id} value={me.state.name} disabled={true}/>
				</div>
			)
		}
		let ChooseComponent = me.props.choose.cmp;
		let props = {
			...me.props, addCls, disabled, value: me.state.value, localHash: true
		};
		return (
			<div>
				<div className={(me.props.label || me.props.error) ? "form-group" : ""}>
					{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
					<div className="input-group choosefield">
						{!me.props.disabled && <div>
							<button
								type="button"
								className="btn btn-primary btn-sm"
								onClick={me.onVisible}
								style={{height: "100%", width: "27px"}}
							>
								<i className="fas fa-edit" />
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
							className={"form-control form-control-sm _dictfield-input" + addCls}
							id={me.id}
							value={me.state.name}
							onChange={() => {}}
							disabled={true}
						/>
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
							<button type="button" className="btn btn-primary btn-sm mr-1" onClick={me.onChoose}><i className="fas fa-check mr-1" />{i18n ("Choose")}</button>
							<button type="button" className="btn btn-primary btn-sm" onClick={() => me.setState ({visible: !me.state.visible})}><i className="fas fa-window-close mr-1" />{i18n ("Cancel")}</button>
						</div>
					</div>
					<ChooseComponent {...props} {...me.props.choose} ref="component" disableActions={true} />
				</Modal>
			</div>
		);
	}
};
ChooseField.displayName = "ChooseField";

export default ChooseField;

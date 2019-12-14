/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";
import {i18n} from "./../i18n";

class ChooseField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onClear = me.onClear.bind (me);
		me.onChoose = me.onChoose.bind (me);
		me.onVisible = me.onVisible.bind (me);
		me.state = {
			value: me.props.value,
			visible: false,
			name: ""
		};
	}
	
	async updateName (value) {
		let me = this;
		let name = "";
		
		if (value) {
			let o = await me.props.store.getRsc (me.props.rsc, value);
			
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
		let id = me.props.id || me.props.attr || me.props.property || me.props.prop;
		
		me.setState ({value: null, name: ""});

		me.props.onChange ({
			target: {
				id, value: null
			}
		});
	}
	
	onChoose () {
		let me = this;
		let cmp = me.refs ["component"].refs [me.props.choose.ref];
		let id = me.props.id || me.props.attr || me.props.property || me.props.prop;
		
		if (!cmp) {
			throw new Error (`not found choose.ref: ${me.props.choose.ref}`);
		}
		let selected = cmp.state.selected;
		let value = "";
		
		if (selected !== null) {
			value = (cmp.recs || cmp.state.recs) [selected].id;
		}
		me.setState ({value, visible: false});
		me.props.onChange ({
			target: {
				id, value
			}
		});
		me.updateName (value);
	}
	
	async componentDidMount () {
		let me = this;
		let name = "";
		
		Modal.setAppElement ("body");
		
		if (me.state.value) {
			let o = await me.props.store.getRsc (me.props.rsc, me.state.value);
			
			name = o.getLabel ();
		}
		me.setState ({name});
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value});
			me.updateName (me.props.value);
		}
	}
	
	render () {
		let me = this;
		let id = me.props.id || me.props.attr || me.props.property || me.props.prop;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";
		
		if (!disabled && (!me.props.choose || !me.props.choose.cmp || !me.props.choose.ref)) {
			return (
				<div className="form-group">
					<label htmlFor={id}>{i18n (me.props.label)}</label>
					<div className="alert alert-danger">choose.cmp or choose.ref not exist</div>
				</div>
			);
		}
		if (me.props.disabled) {
			return (
				<div className="form-group">
					<label htmlFor={id}>{i18n (me.props.label)}</label>
					<input type="text" className={"form-control" + addCls} id={id} value={me.state.name || ""} disabled={true}/>
				</div>
			)
		}
		let ChooseComponent = me.props.choose.cmp;
		let props = {
			...me.props, addCls, disabled, value: me.state.value, id, localHash: true
		};
		return (
			<div>
				<div className="form-group">
					{me.props.label && <label htmlFor={id}>{i18n (me.props.label)}</label>}
					<div className="input-group">
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
							className={"form-control" + addCls}
							id={id}
							value={me.state.name}
							onChange={() => {}}
							disabled={true}
						/>
					</div>
					{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
				</div>
				<Modal
					isOpen={me.state.visible}
					style={{
						content: {
							top: "50%",
							left: "50%",
							right: "auto",
							bottom: "auto",
							marginTop: "50px",
							marginRight: "-50%",
							transform: "translate(-50%, -50%)"
						}
					}}
				>
					<div className="row">
						<div className="col-md mb-1">
							<button type="button" className="btn btn-primary mr-1" onClick={me.onChoose}><i className="fas fa-check mr-1" />{i18n ("Choose")}</button>
							<button type="button" className="btn btn-primary" onClick={() => me.setState ({visible: !me.state.visible})}><i className="fas fa-window-close mr-1" />{i18n ("Cancel")}</button>
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

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";
import {i18n} from "./../i18n";

function objectField (ComponentClass) {
	return class extends Component {
		constructor (props) {
			super (props);
			
			let me = this;
			
			me.onChoose = me.onChoose.bind (me);
			me.onVisible = me.onVisible.bind (me);
			me.state = {
				visible: false,
				value: props.value,
				name: ""
			};
		}
		
		async updateName () {
			let me = this;
			let name = "";
			
			if (me.state.value) {
				let o = await me.props.store.getRsc (me.props.rsc, me.state.value);
				
				name = o.getLabel ();
			}
			me.setState ({name});
		}
		
		async componentDidMount () {
			let me = this;
			
			Modal.setAppElement ("body");
			
			if (me.state.value) {
				me.updateName ();
			}
		}
		
		onVisible () {
			let me = this;
			
			me.setState ({visible: !me.state.visible});
		}
		
		onChoose () {
			let me = this;
			let cmp = me.refs ["component"].refs [me.props.chooseRef];
			
			if (!cmp) {
				throw new Error (`not found chooseRef: ${me.props.chooseRef}`);
			}
			let selected = cmp.state.selected;
			let value = "";
			
			if (selected !== null) {
				value = (cmp.recs || cmp.state.recs) [selected].id;
			}
			me.setState ({value, visible: false});
			me.props.onChange ({
				target: {
					id: me.props.id, value
				}
			});
			me.updateName ();
		}
		
		render () {
			let me = this;
			console.log (me.props);
			
			return (
				<div className="row">
					<div className="col-md">
						<div className="input-group input-group-md">
							<div className="input-group">
								{!me.props.disabled && <div>
									<button type="button" className="btn btn-primary btn-sm" onClick={me.onVisible} style={{height: "100%"}}><i className="fas fa-edit" /></button>
								</div>}
								<input type="text" className={"form-control" + me.props.addCls} id={me.props.id} value={me.state.name} disabled={true} />
						    </div>
							<Modal
								isOpen={me.state.visible}
								style={{
									content: {
										top: "50%",
										left: "50%",
										right: "auto",
										bottom: "auto",
										marginRight: "-50%",
										transform: "translate(-50%, -50%)"
									}
								}}
							>
								<div className="row">
									<div className="col-md mb-1">
										<button type="button" className="btn btn-primary mr-1" onClick={me.onChoose}><i className="fas fa-check mr-1"></i>{i18n ("Choose")}</button>
										<button type="button" className="btn btn-primary" onClick={() => me.setState ({visible: !me.state.visible})}><i className="fas fa-window-close mr-1"></i>{i18n ("Cancel")}</button>
									</div>
								</div>
								<ComponentClass {...me.props} ref="component" disableActions={true} />
							</Modal>
						</div>
					</div>
				</div>
			);
		}
	};
};

class ChooseField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			value: me.props.value
		};
	}
	
	onChange (val) {
		let me = this;
		let v = val.target.value;
		
		me.setState ({value: v});
		me.props.onChange (val);
	}
	
	async componentDidMount () {
		let me = this;
		let name = "";
		
		if (me.props.disabled && me.state.value) {
			let o = await me.props.store.getRsc (me.props.rsc, me.state.value);
			
			name = o.getLabel ();
		}
		me.setState ({name});
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value});
		}
	}
	
	render () {
		let me = this;
		let id = me.props.id || me.props.attr || me.props.property || me.props.prop;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";
		
		if (!disabled && (!me.props.choose || !me.props.chooseRef)) {
			return (
				<div className="form-group">
					<label htmlFor={id}>{i18n (me.props.label)}</label>
					<div className="alert alert-danger">choose or chooseRef not exist</div>
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
		let ObjectField = objectField (me.props.choose);
		let props = {
			...me.props, addCls, onChange: me.onChange, disabled, value: me.state.value, id, localHash: true
		};
		return (
			<div className="form-group choosefield">
				{me.props.label && <label htmlFor={id}>{i18n (me.props.label)}</label>}
				<ObjectField {...props} />
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
ChooseField.displayName = "ChooseField";

export default ChooseField;

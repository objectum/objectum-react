/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";

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
				
				name = o.getName ();
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
				value = cmp.recs [selected].id;
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
			
			return (
				<div className="row">
					<div className="col-md">
						<div className="input-group input-group-md">
					    	<span className="input-group-btn">
								{!me.props.disabled && <button type="button" className="btn btn-primary mr-1" onClick={me.onVisible}><i className="fas fa-edit mr-2"></i>Choose</button>}
						    </span>
							<input type="text" className={"form-control" + me.props.addCls} id={me.props.id} value={me.state.name} disabled={true} />
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
										<button type="button" className="btn btn-primary mr-1" onClick={me.onChoose}><i className="fas fa-check mr-1"></i>Choose</button>
										<button type="button" className="btn btn-primary" onClick={() => me.setState ({visible: !me.state.visible})}><i className="fas fa-window-close mr-1"></i>Cancel</button>
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
	
	render () {
		let me = this;
		let id = me.props.attr;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";
		
		if (!disabled && (!me.props.choose || !me.props.chooseRef)) {
			return (<div className="alert alert-danger">choose or chooseRef not exist</div>);
		}
		let ObjectField = objectField (me.props.choose);
		let props = {
			...me.props, addCls, onChange: me.onChange, disabled, value: me.state.value, id, localHash: true
		};
		return (
			<div className="form-group">
				<label htmlFor={id}>{me.props.label}</label>
				<ObjectField {...props} />
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};

export default ChooseField;

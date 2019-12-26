import React, {Component} from "react";
import {i18n} from "./../i18n";
import Fade from "react-reveal/Fade";
import {timeout} from "./helper";
import ModelList from "./ModelList";

class RemoveAction extends Component {
	constructor (props) {
		super (props);
		
		this.onRemove = this.onRemove.bind (this);
		
		this.state = {
			removeConfirm: false,
			removing: false
		};
	}
	
	async onRemove () {
		let me = this;
		
		me.setState ({removing: true});
		
		await timeout (100);
		await me.props.onRemove (me.props.removeId);
		
		me.setState ({removing: false, removeConfirm: false});
	}
	
	render () {
		let me = this;
		
		if (me.state.removing) {
			return (
				<span className="text-danger  ml-3 mt-1">
					<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />{i18n ("Removing") + " ..."}
				</span>
			);
		}
		if (me.state.removeConfirm) {
			return (
				<Fade>
					<span className="text-danger ml-1 p-1">
						{i18n ("Are you sure?")}
						<button type="button" className="btn btn-danger btn-sm ml-2 mb-1" onClick={me.onRemove}><i className="fas fa-check mr-2" />{i18n ("Remove")}</button>
						<button type="button" className="btn btn-success btn-sm ml-2 mb-1" onClick={() => this.setState ({removeConfirm: false})}><i className="fas fa-times mr-2" />{i18n ("Cancel")}</button>
					</span>
				</Fade>
			);
		}
		return (
			<button
				type="button"
				className={me.props.hasOwnProperty ("buttonClass") ? me.props.buttonClass : "btn btn-primary btn-labeled mr-1"}
				onClick={() => me.setState ({removeConfirm: true})} disabled={me.props.disabled}
			>
				<i className={me.props.hasOwnProperty ("iconClass") ? me.props.iconClass : "fas fa-minus mr-2"} />{me.props.hasOwnProperty ("buttonLabel") ? me.props.buttonLabel : i18n ("Remove")}
			</button>
		);
	}
};
RemoveAction.displayName = "RemoveAction";

export default RemoveAction;

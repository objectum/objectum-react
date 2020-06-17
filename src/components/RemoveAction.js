import React, {Component} from "react";
import {Fade, i18n, timeout} from "..";

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
				<span className="text-danger ml-3 mr-1 mb-1">
					<span className="spinner-border objectum-spinner mr-2" role="status" aria-hidden="true" />{i18n ("Removing") + " ..."}
				</span>
			);
		}
/*
		if (me.state.removeConfirm) {
			return (
					<span className="text-danger mb-1">
						{i18n ("Are you sure?")}
						<button type="button" className="btn btn-danger ml-1 mb-1" onClick={me.onRemove}><i className="fas fa-check mr-2" />{i18n ("Remove")}</button>
						<button type="button" className="btn btn-success mx-1 mb-1" onClick={() => this.setState ({removeConfirm: false})}><i className="fas fa-times mr-2" />{i18n ("Cancel")}</button>
					</span>
			);
		}
*/
		return (
			<div>
				<button
					type="button"
					className={me.props.hasOwnProperty ("btnClassName") ? me.props.btnClassName : "btn btn-primary btn-labeled mr-1 mb-1"}
					onClick={() => me.setState ({removeConfirm: true})} disabled={me.props.disabled || me.props.disableActions}
				>
					<i className={me.props.hasOwnProperty ("iconClass") ? me.props.iconClass : "fas fa-minus mr-2"} />{me.props.hasOwnProperty ("buttonLabel") ? me.props.buttonLabel : i18n ("Remove")}
				</button>
				{me.state.removeConfirm && <Fade className="popup">
					<div className="popup-content bg-white shadow text-danger p-1">
						<div className="mb-1">{i18n ("Are you sure?")}</div>
						<button type="button" className="btn btn-danger" onClick={me.onRemove}><i className="fas fa-check mr-2" />{i18n ("Remove")}</button>
						<button type="button" className="btn btn-success ml-1" onClick={() => this.setState ({removeConfirm: false})}><i className="fas fa-times mr-2" />{i18n ("Cancel")}</button>
					</div>
				</Fade>}
			</div>
		);
	}
};
RemoveAction.displayName = "RemoveAction";

export default RemoveAction;

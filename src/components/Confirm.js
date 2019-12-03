/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";
import {i18n} from "./../i18n";
import Fade from "react-reveal/Fade";

class Confirm extends Component {
	componentDidMount () {
		Modal.setAppElement ("body");
	}
	
	render () {
		let me = this;

		return (
			<Modal
				isOpen={me.props.visible}
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
				<Fade>
					<h5>{i18n (me.props.label)}</h5>
					<div className="btn-toolbar" role="toolbar">
						<div className="btn-group mr-1" role="group">
							<button type="button" className="btn btn-danger mr-1" onClick={() => me.props.onClick (true)}><i className="fas fa-check mr-2"></i>{i18n ("Yes")}</button>
							<button type="button" className="btn btn-success" onClick={() => me.props.onClick (false)}><i className="fas fa-times mr-2"></i>{i18n ("No")}</button>
						</div>
					</div>
				</Fade>
			</Modal>
		);
	}
};
Confirm.displayName = "Confirm";

export default Confirm;

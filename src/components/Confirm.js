/*
	Deprecated
 */
/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Modal from "react-modal";
import {i18n} from "./../i18n";
import Loading from "./Loading";
import Fade from "./Fade";

export default class Confirm extends Component {
	componentDidMount () {
		Modal.setAppElement ("body");
	}
	
	render () {
		let disabled = this.props.processing;

		return <Modal
			isOpen={this.props.visible}
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
				<h5>{i18n (this.props.label)}</h5>
				<div className="btn-toolbar" role="toolbar">
					<div className="btn-group mr-1" role="group">
						<button type="button" className="btn btn-danger mr-1" onClick={() => this.props.onClick (true)} disabled={disabled}>
							<i className="fas fa-check mr-2" />{i18n ("Yes")}
						</button>
						<button type="button" className="btn btn-success" onClick={() => this.props.onClick (false)} disabled={disabled}>
							<i className="fas fa-times mr-2" />{i18n ("No")}
						</button>
					</div>
				</div>
				{this.props.processing ? <div className="text-primary mt-3 text-center"><Loading /></div> : <div />}
			</Fade>
		</Modal>;
	}
};
Confirm.displayName = "Confirm";

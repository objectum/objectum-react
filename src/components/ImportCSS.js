import {i18n} from "../i18n";
import React, {Component} from "react";
import PageTitle from "./PageTitle";

export default class ImportCSS extends Component {
	constructor (props) {
		super (props);
		
		this._refs = {
			"input": React.createRef ()
		};
	}
	
	onClick = () => {
		let inp = this._refs ["input"].current;

		if (inp.files.length) {
			let file = inp.files [0];
			let reader = new FileReader ();

			reader.onload = function () {
				let style = document.createElement ("style");

				style.innerHTML = reader.result;
				document.head.appendChild (style);
			};
			reader.readAsText (file, "utf-8");
		}
	}
	
	render () {
		return <div className="container">
			<PageTitle label={i18n ("Import css")} />
			<div className="border p-2 bg-white">
				<div className="custom-file">
					<input type="file" className="custom-file-input" id="customFile" ref={this._refs ["input"]} />
					<label className="custom-file-label" htmlFor="customFile">Choose file</label>
				</div>
				<button className="btn btn-primary mt-1" onClick={this.onClick}>{i18n ("Load")}</button>
			</div>
		</div>;
	}
};

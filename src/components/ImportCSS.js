import {i18n} from "../i18n";

import React, {Component} from "react";

class ImportCSS extends Component {
	constructor (props) {
		super (props);
		
		this._refs = {
			"input": React.createRef ()
		};
	}
	
	onClick = () => {
		let inp = this._refs ["input"].current;
		let file = inp.files [0];
		let reader = new FileReader ();
		
		reader.onload = function () {
			let style = document.createElement ("style");
			
			style.innerHTML = reader.result;
			document.head.appendChild (style);
		};
		reader.readAsText (file, "utf-8");
	}
	
	render () {
		return <div className="container">
			<div className="border m-2 p-2">
				<input type="file" ref={this._refs ["input"]} />
				<button className="btn btn-primary" onClick={this.onClick}>{i18n ("Load")}</button>
			</div>
		</div>;
	}
};
export default ImportCSS;

import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {ObjectumApp, Form, Field, ObjectumRoute, Grid, ChooseField, DictField, NumberField, ModelList, Action} from '../../src'
import {pushLocation, timeout} from "../../src/components/helper";

import OrgModel from "./models/OrgModel";
import TkModel from "./models/TkModel";

import "../../src/css/bootstrap.css";
import "../../src/css/objectum.css";
import "../../src/fontawesome/css/all.css";

const store = new Store ();

class Test extends Component {
	constructor (props) {
		super (props);
		
		this.onCLick = this.onClick.bind (this);
		this.onTableRow = this.onTableRow.bind (this);
		this.state = {};
	}
	
	async onClick ({progress, confirm}) {
		let me = this;
		
		//let result = await confirm ("Вы уверены?");
		
		//if (result) {
			//throw new Error ("123");
			
			for (let i = 0; i < 2; i ++) {
				progress ({label: "test", value: i + 1, max: 10});
				await timeout (500);
			}
			return "success";
		//}
	}
	
	onTableRow ({row, rec}) {
		let props = {};
		
		if (!row.props.className) {
			props.className = "table-success";
		}
		let newRow = React.cloneElement (row, props);

		return newRow;
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<div className="bg-white shadow-sm">
					<Action onClick={me.onClick}>Action</Action>
				</div>
				<Grid id="org-list" store={store} query="org.list" onTableRow={me.onTableRow} />
			</div>
		);
	}
}

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/rmp");
		
		store.register ("org", OrgModel);
		store.register ("tk", TkModel);
		
		window.store = store;
	}
	
	render () {
		return (
			<div>
				<ObjectumApp
					store={store}
					username="admin"
					password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()}
					name="objectum-react"
				>
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

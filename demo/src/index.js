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
		this.state = {};
	}
	
	async onClick ({progress, confirm}) {
		let me = this;
		
		let result = await confirm ("Вы уверены?");
		
		if (result) {
			//throw new Error ("123");
			
			for (let i = 0; i < 2; i ++) {
				progress ({label: "test", value: i + 1, max: 2});
				await timeout (500);
			}
			return "success";
		}
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<ChooseField
					store={store}
					choose={{
						query: "waybill.list",
						params: {org: 1}
					}}
					value={17515}
					onChange={({value}) => console.log (value)}
				/>
				<div className="bg-white shadow-sm mt-1">
					<Action onClick={me.onClick} confirm={true}>Action</Action>
				</div>
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

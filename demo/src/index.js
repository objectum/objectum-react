import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {ObjectumApp, Form, Field, ObjectumRoute, Grid, ChooseField, DictField, NumberField, ModelList, Action} from '../../src'
import {pushLocation, timeout} from "../../src/components/helper";

import OrgModel from "./models/OrgModel";
import TkModelClient from "./models/TkModelClient";
import TOrgProductModel from "./models/TOrgProductModel";
import BrakModel from "./models/BrakModel";
import TBrakDishModel from "./models/TBrakDishModel";

import "../../src/css/bootstrap.css";
import "../../src/css/objectum.css";
import "../../src/fontawesome/css/all.css";
import bgImage from "./images/italian.jpg";

import packageConfig from "./../package";

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
				<Grid
					store={store}
					model="item"
				>
					<Action label="test" onClick={async () => {
						return "test";
					}} />
				</Grid>
				
				<div className="bg-white shadow-sm mt-1">
					<ModelList store={store} model="tk" />
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
		store.register ("tk", TkModelClient);
		store.register ("t.org.product", TOrgProductModel);
		store.register ("brak", BrakModel);
		store.register ("t.brak.dish", TBrakDishModel);
		
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
					version={packageConfig.version}
					menuIconSize="fa-2x"
					onRenderAuthInfo={div => {
						return React.cloneElement (div, {style: {
							backgroundImage: `url(${bgImage})`,
							backgroundSize: "content"
						}});
					}}
				>
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

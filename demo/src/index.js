import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {ObjectumApp, Form, Field, ObjectumRoute, Grid, ChooseField, DictField, NumberField, ModelList, Action} from '../../src'
import {pushLocation, timeout} from "../../src/components/helper";

import "../../src/css/bootstrap.css";
import "../../src/fontawesome/css/all.css";

const store = new Store ();

class Test extends Component {
	constructor (props) {
		super (props);
		
		this.state = {};
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<NumberField
					label="Вес"
					value={me.state.weight}
					min={0}
					max={9}
				/>
			</div>
		);
	}
}

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/rmp");
		
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

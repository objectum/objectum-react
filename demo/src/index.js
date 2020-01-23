import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {ObjectumApp, Form, Field, ObjectumRoute, Grid, ChooseField, NumberField, ModelList, Action} from '../../src'
import {pushLocation, timeout} from "../../src/components/helper";

const store = new Store ();

class TOrgProductModel extends Record {
	static async syncProductsAction ({parentId, store, progress}) {
		for (let i = 0; i < 5; i ++) {
			await timeout (1000);
			progress ({value: i + 1, max: 5});
		}
	}
};
store.register ("t.org.product", TOrgProductModel);

class Test extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.onClick = me.onClick.bind (me);
		
		me.state = {
			refresh: false
		};
	}
	
	async onClick () {
		setTimeout (() => {
			throw new Error ("1");
		}, 1000);
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row no-gutters">
				<div className="col-12">
					<NumberField
						store={me.props.store} label="Вес упаковки, кг" value={me.state.packWeight}
						onChange={({value}) => {
							let state = {packWeight: value};
							
							me.setState (state);
						}}
					/>
					<Action onClick={() => me.setState ({packWeight: ""})}>test</Action>
				</div>
			</div>
		);
	}
};

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

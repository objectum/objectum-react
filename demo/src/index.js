import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import store from "objectum-client";
import {ObjectumApp, ObjectumRoute, Grid} from '../../src'
import {i18n} from "../../src/i18n";
import {pushLocation} from "../../src/components/helper";

class Test extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onEdit = me.onEdit.bind (me);
	}
	
	onEdit (id) {
		let me = this;
		
		pushLocation ();
		
		me.props.history.push ({
			pathname: "/model_record/" + id + "#" + JSON.stringify ({opts: {model: "product"}})
		});
	}
	
	render () {
		let me = this;
		return (
			<Grid {...me.props} id="test" ref="test" label="Test" store={me.props.store} model="product" />
		);
	}
};

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/shop");
		window.store = store;
	}
	
	render () {
		return (
			<div>
				<ObjectumApp store={store} _username="admin" _password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()} name="objectum-react">
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

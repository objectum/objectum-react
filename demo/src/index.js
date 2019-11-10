import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import store from "objectum-client";
import {ObjectumApp} from '../../src'

class Test extends Component {
	render () {
		return (<div>Test</div>);
	}
};

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/api/projects/objectum/");
		window.store = store;
	}
	
	render () {
		return (
			<div>
				<ObjectumApp store={store} _username="admin" _password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()} name="objectum-react">
					<Route path="/test" render={props => <Test {...props} store={store} />} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

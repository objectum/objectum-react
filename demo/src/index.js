import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import store from "objectum-client";
import {ObjectumApp, ObjectumRoute, Grid} from '../../src'

class Test extends Component {
	render () {
		return (<div>Test</div>);
	}
};

class Items extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			removeConfirm: false,
			refresh: false
		};
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...me.props} id="items" ref="items" title="Items" store={me.props.store} query="item.list" refresh={me.state.refresh} />
				</div>
			</div>
		);
		
	}
};

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/api/projects/catalog/");
		window.store = store;
	}
	
	render () {
		return (
			<div>
				<ObjectumApp store={store} _username="admin" _password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()} name="objectum-react">
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
					<ObjectumRoute path="/items" render={props => <Items {...props} store={store} />} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

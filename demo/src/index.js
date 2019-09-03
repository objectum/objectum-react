import React, {Component} from "react";
import {render} from "react-dom";
import store from "objectum-client";
import "../../src/css/bootstrap.css";
import "../../src/fontawesome/css/all.css";
import {ObjectumApp} from '../../src'

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/api/projects/catalog/");
		window.store = store;
	}
	
	render () {
		return (
			<div>
				<ObjectumApp store={store} />
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

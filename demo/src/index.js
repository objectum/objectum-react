import React, {Component} from "react";
import {render} from "react-dom";
//import store from "objectum-client";
import "../../src/css/bootstrap.css";
import "../../src/fontawesome/css/all.css";
import {ObjectumApp} from '../../src'

class Demo extends Component {
	constructor (props) {
		super (props);
		
		//store.setUrl ("/api/projects/objectum/");
	}
	
	render () {
		return (
			<div>
				<ObjectumApp />
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

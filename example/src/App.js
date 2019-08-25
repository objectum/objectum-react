import React, {Component} from "react";
import store from "objectum-client";
import {ObjectumApp} from "objectum-react";

class App extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/api/projects/catalog/");
	}
	
	render () {
		return (
			<ObjectumApp store={store} />
		);
	}
}

export default App;

/*
import React, { Component } from 'react'

import ExampleComponent from 'objectum-react'

export default class App extends Component {
  render () {
    return (
      <div>
        <ExampleComponent text='Modern React component module' />
      </div>
    )
  }
}
*/

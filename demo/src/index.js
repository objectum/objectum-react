import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import store from "objectum-client";
import {ObjectumApp, ObjectumRoute, Grid} from '../../src'
import {pushLocation} from "../../src/components/helper";

class Test extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.state = {};
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row no-gutters">
				<div className="col-6">
					<Grid
						id="tm-list"
						ref="tm-list"
						label="Типовые меню"
						store={me.props.store}
						query="menu.mtd" refresh={me.state.refresh}
						onSelect={(menu) => me.setState ({menu})}
					>
					</Grid>
				</div>
				{me.state.menu && <div className="col ml-1">
					<Grid
						id="dish-list"
						ref="dish-list"
						label={`Типовое меню (id: ${me.state.menu})`}
						store={me.props.store}
						query="dish.mtd"
						pageRecs={30}
						refresh={me.state.refresh}
						params={{menu: me.state.menu}}
						groupCol="eating"
					>
					</Grid>
				</div>}
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

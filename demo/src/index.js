import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import {Store} from "objectum-client";
import {ObjectumApp, Form, Field, ObjectumRoute, Grid, ChooseField, ModelList} from '../../src'
import {pushLocation} from "../../src/components/helper";

const store = new Store ();

class Test extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.state = {
			refresh: false
		};
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row no-gutters">
				<div className="col-6">
					<Grid
						id="tm-list"
						ref="tm-list"
						store={me.props.store}
						query="menu.mtd" refresh={me.state.refresh}
						onSelect={(menu) => me.setState ({menu, refresh: !me.state.refresh})}
					>
					</Grid>
				</div>
				{me.state.menu && <div className="col ml-1">
					<Form store={me.props.store} refresh={me.state.refresh}>
						<Field rid={me.state.menu} property="name" />
						<Field rid={me.state.menu} property="date" />
						<Field rid={me.state.menu} property="category" dict={true} />
					</Form>
					<Grid
						id="dish-list"
						ref="dish-list"
						label={`(id: ${me.state.menu})`}
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

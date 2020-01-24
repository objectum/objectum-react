import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {ObjectumApp, Form, Field, ObjectumRoute, Grid, ChooseField, DictField, NumberField, ModelList, Action} from '../../src'
import {pushLocation, timeout} from "../../src/components/helper";

import "react-sortable-tree/style.css";
import SortableTree from "react-sortable-tree";

const store = new Store ();

class Test extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let models = [], has = {};
		
		for (let id in me.props.store.map ["model"]) {
			let m = me.props.store.map ["model"][id];
			
			if (id >= 1000 && !has [m.id]) {
				has [m.id] = true;
				models.push (m);
			}
		}
		me.state = {
			treeData: me.getChildren (models, null)
		};
	}
	
	getChildren (models, parent) {
		let me = this;
		let items = [];
		
		models.forEach (m => {
			if (m.parent == parent) {
				let children = me.getChildren (models, m.id);
				
				for (let code in m.properties) {
					let p = m.properties [code];
					let subtitle = me.props.store.map ["model"][p.type] && me.props.store.map ["model"][p.type].getLabel ();
					
					children.push ({title: p.name + " (" + p.code + ": " + p.id + ")", subtitle});
				}
				items.push ({
					title: m.name + " (" + m.getPath () + ": " + m.id + ")", children
				});
			}
		});
		return items;
	}
	
	render () {
		return (
			<div style={{ height: "100%" }}>
				<SortableTree
					treeData={this.state.treeData}
					onChange={treeData => this.setState({ treeData })}
					isVirtualized={false}
					canDrag={false}
					canDrop={false}
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

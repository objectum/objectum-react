import React, {Component, useState} from "react";
import {render} from "react-dom";
import {Link, Route, useHistory} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {
	createReport, Office, Loading, Navbar, ObjectumApp, SelectField, DateField, FileField, BooleanField, Form,
	StringField, Field, ObjectumRoute, Tabs, Tab, Grid, ChooseField, DictField, NumberField, ModelList, Action, Tooltip, Auth,
	Pagination, Fade, Tree, JsonField, Panel, Group, Models
} from '../../src'
import {pushLocation, timeout, newId} from "../../src";
import ReactCrop from "react-image-crop";

//import OrgModel from "./models/OrgModel";
//import TkModelClient from "./models/TkModelClient";
//import TOrgProductModel from "./models/TOrgProductModel";
//import BrakModel from "./models/BrakModel";
//import TBrakDishModel from "./models/TBrakDishModel";
import ItemModel from "./models/ItemModel";

import "../../src/css/bootstrap-sapr.css";
import "../../src/css/objectum.css";
import "../../src/fontawesome/css/all.css";

import packageConfig from "./../package";
import {i18n} from "../../src/i18n";

const store = new Store ();

function HomeButton (props) {
	let history = useHistory ();
	
	function handleClick () {
		history.push ("/");
	}
	return (
		<button className="btn btn-link p-0" onClick={handleClick}>
			{props.children || <i className="fas fa-home" />}
		</button>
	);
};

class Cmp extends Component {
	render () {
		return <div>123456789  </div>;
	}
};

class Test extends Component {
	constructor (props) {
		super (props);
		
		this.onClick = this.onClick.bind (this);

		this.state = {
			text: "1",
			file: "test.jpg",
			refresh: false,
			active: 0,
			recs: [],
			value: ""
		};
		this._refs = {"test": React.createRef ()};
		this.changed = {};
		DateField.prototype.holidays = {"2021-05-20": "ee", "2021-05-19": "dd"};
	}
	
	componentDidMount () {
		this.setState ({
			recs: [
				{id: 1, name: "1"},
				{id: 2, name: "2", getLabel: () => "2 (id: 2)"},
				{id: 3, name: "3", parent: 2},
				{id: 4, name: "4", parent: 3},
				{id: 5, name: "5555 6 7 8 9 0", parent: 4},
				{id: 6, name: "6"},
				{id: 7, name: "7"},
				{id: 8, name: "8"},
				{id: 9, name: "9"},
				{id: 10, name: "10"},
				{id: 11, name: "11"},
				{id: 12, name: "12"},
				{id: 13, name: "13"},
				{id: 14, name: "14"},
				{id: 15, name: "15"},
				{id: 16, name: "16"},
				{id: 17, name: "17"},
				{id: 18, name: "18"},
				{id: 19, name: "19"},
				{id: 20, name: "20"},
				{id: 21, name: "21"},
				{id: 22, name: "22"},
				{id: 23, name: "23"},
				{id: 24, name: "24"}
			],
			value: 5
		});
	}
	
	async onClick ({progress, confirm}) {
		let me = this;
		
		let result = await confirm ("Вы уверены?");
		
		if (result) {
			//throw new Error ("123");
			
			for (let i = 0; i < 2; i ++) {
				progress ({label: "test", value: i + 1, max: 2});
				await timeout (500);
			}
			return "success";
		}
	}
	
	render () {
		return (
			<div className="container">
				<div className="border m-1 p-1">
					<Form store={store} rsc="record" mid="item" rid={1023}>
						<Field property="name" />
					</Form>
				</div>
				<DateField label="Timestamp" showTime />
				<NumberField label="Number" min={0} max={10} />
				<FileField store={store} label="file" />
				<BooleanField label="BooleanField" error="" />
				<DictField label="DictField" recs={this.state.recs} notNull />
				<Form store={store} rsc="record" rid={14197} mid="item">
					<StringField property="name" label="String" regexp1={"/^[0-9]{6}$/"} exampleValue="123456" notNull />
				</Form>
				<Action label="Action" modalComponent={Cmp} />
				<Action label="Зависание после rollback" onClick={async () => {
					await store.startTransaction ();
					let record = await store.getRecord (1023);
					record.name = new Date ().toLocaleString ();
					await record.sync ();
					await store.rollbackTransaction ();
				}} />
				<div className="row">
					<div className="col-6">
						<ModelList store={store} model="item" onSelect={id => this.setState ({id})} hideCreate hideEdit refresh={this.state.refresh} />
					</div>
					<div className="col-6 border">
						<Form store={store} rsc="record" rid={this.state.id} mid="item" onCreate={() => this.setState ({refresh: !this.state.refresh})} onSave={() => this.setState ({refresh: !this.state.refresh})}>
							<Field property="name" />
						</Form>
					</div>
				</div>
			</div>
		);
	}
}

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/api");
		
		//store.register ("org", OrgModel);
		//store.register ("tk", TkModelClient);
		//store.register ("t.org.product", TOrgProductModel);
		//store.register ("brak", BrakModel);
		//store.register ("t.brak.dish", TBrakDishModel);
		store.register ("item", ItemModel);
		
		this.onCustomRender = this.onCustomRender.bind (this);
		
		this.state = {};
		//window.store = store;
	}
	
	onConnect = () => {
		this.setState ({
			username: store.username
		});
		window.store = store;
	}
	
	onCustomRender ({content, app, location}) {
		if (!this.state.username) {
			return <Loading container />
		}
		return (
			<div className="container">
				<Navbar className="navbar navbar-expand navbar-dark bg-dark" items={[
					<HomeButton><strong className="text-white">Label</strong></HomeButton>,
				]} />
				<Navbar expand app={app} items={[
					"back",
					...app.menuItems,
					{
						id: "1",
						label: "Label",
						icon: "fas fa-check",
						path: null,
						items: [
							{
								id: "2",
								label: "Label Label Label Label Label Label",
								icon: "fas fa-check",
								path: "/test"
							}
						]
					}
				]} />
				<div className="bg-secondary p-1">
					{content}
				</div>
			</div>
		);
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<ObjectumApp
					locale="ru"
					store={store}
					username="admin"
					password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()}
/*
					username="guest"
					password={require ("crypto").createHash ("sha1").update ("guest").digest ("hex").toUpperCase ()}
*/
					name="objectum-react"
					version={packageConfig.version}
					//registration
					siteKey="6LffszoUAAAAALAe2ghviS8wqitVKvsR1bFMwtcK"
					//label="Label"
					onDisconnect={() => console.log ("disc")}
/*
					onRenderAuthInfo={div => {
						return div;
					}}
*/
					/*onCustomRender={me.onCustomRender}*/
					//sidebar
					onConnect={me.onConnect}
				>
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
					<ObjectumRoute path="/test2" render={props => <Test {...props} store={store} />} />
					<ObjectumRoute path="/office" render={props => (
						<div className="container">
							<div style={{width: "50em"}}>
								<Office
									{...props} store={store} name="objectum-react" cardClassName="p-4 shadow"
									/*authorized={me.state.username && me.state.username != "guest"}*/
									siteKey="6LffszoUAAAAALAe2ghviS8wqitVKvsR1bFMwtcK"
								/>
							</div>
						</div>
					)} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

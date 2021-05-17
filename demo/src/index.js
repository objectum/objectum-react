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

import "../../src/css/bootstrap-green.css";
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
				{id: 14, name: "14"}
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
				<Fade>12344</Fade>
				<div className="bg-white border border-danger p-2" style={{width: "110%", left: "-5%", position: "relative"}}>
					<div className="bg-white border border-danger p-2 fade-in" style={{left: "0px", top: "2px", position: "absolute"}}>
						111
					</div>
				</div>
				<ChooseField
					store={store}
					property="model" label="Model" rsc="model"
					choose={{cmp: Models, ref: "models"}}
					value={1007}
					disabled
				/>
				<Form store={store} rsc="record" rid={14197} mid="item">
					<StringField property="name" label="String" regexp1={"/^[0-9]{6}$/"} exampleValue="123456" notNull />
				</Form>
				<Action label="Action" modalComponent={Cmp} />
				<Action label="Action2" onClick={async () => {
					for (let i = 0; i < 2; i ++) {
						await timeout (1000);
					}
					return "ok";
				}} />
				<select
					className="form-control custom-select"
					style={{width: "30em"}}
					value={this.state.selectValue}
					onChange={val => {
						this.setState ({selectValue: val.target.value});
						console.log (val.target.value);
					}}
				>
					{[{id: "1", name: "1"}, {id: "2", name: "2"}].map ((rec, i) => {
						return (
							<option value={rec.id} key={i}>{rec.name}</option>
						);
					})}
				</select>
				<div className="p-1 border" style={{width: "15em"}}>
					<DictField label="Dict" notNull records={this.state.recs} />
				</div>
				<div className="mt-1 border" style={{width: "20em"}}>
					<Tree recs={this.state.recs} selectMulti onCheck={({checkedNodes}) => console.log (checkedNodes)} />
				</div>
				<div className="mt-1 border" style={{width: "2em"}}>
					<DateField holidays={{"2021-05-20": "ee", "2021-05-19": "dd"}} />
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
					sidebar
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

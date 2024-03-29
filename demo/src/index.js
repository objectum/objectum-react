import React, {Component, useState} from "react";
import {render} from "react-dom";
import {Link, Route, useHistory} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {
	createReport, Office, Loading, Navbar, ObjectumApp, SelectField, DateField, FileField, BooleanField, Form,
	StringField, Field, ObjectumRoute, Tabs, Tab, Grid, ChooseField, DictField, NumberField, ModelList, Action, Tooltip, Auth,
	Pagination, Fade, Tree, JsonField, Panel, Group, Models, MenuButton, RadioField
} from '../../src'
import {pushLocation, timeout, newId} from "../../src";
import ReactCrop from "react-image-crop";

//import OrgModel from "./models/OrgModel";
//import TkModelClient from "./models/TkModelClient";
//import TOrgProductModel from "./models/TOrgProductModel";
//import BrakModel from "./models/BrakModel";
//import TBrakDishModel from "./models/TBrakDishModel";
import ItemModel from "./models/ItemModel";

import "../../src/css/bootstrap-nap.css";
import "../../src/css/objectum.css";
import "../../src/fontawesome/css/all.css";
import "./demo.css";

import {
	Menu,
	MenuItem,
	SubMenu
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';

import packageConfig from "./../package";
import {i18n} from "../../src/i18n";

const store = new Store ();

store.addListener ("record", data => {
	console.log ("record", data);
});

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
			value: "",
			tabs: [<div>1</div>, <div>2</div>, <div>3</div>]
		};
		this._refs = {
			"test": React.createRef (),
			"cmp": React.createRef ()
		};
		this.changed = {};
		DateField.prototype.holidays = {"2021-05-20": "ee", "2021-05-19": "dd"};
	}

	componentDidMount () {
		this.setState ({
			recs: [
				{id: 1, name: "1"},
				{id: 2, name: "2", getLabel: () => "2 (id: 2)"},
				{id: 3, name: "3"},
				{id: 4, name: "4"},
				{id: 5, name: "5555 6 7 8 9 0"},
				{id: 6, name: "6", group: 3},
				{id: 7, name: "7", group: 3},
				{id: 8, name: "8", group: 3},
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

	async onClick () {
		let record = await store.getRecord (1023);
		record.cost = record.cost + 1;
		await record.sync ();
	}

	render () {
		window.OBJECTUM_APP.hideSeconds = true;
		window.OBJECTUM_APP.hidePrevNextMonthDaysFromCalendar = true

		return (
			<div className="container-fluid">
				<StringField label="label" secure value="123" />
				<RadioField property="nomination" records={[{id: 1, name: "a1"}, {id: 2, name: "a2"}]} disabled />
				<ChooseField
					store={store}
					label="Test"
					choose={{cmp: ModelList, model: "item", ref: "list"}}
				/>
				<StringField label="СНИЛС" property="snils" regexp="/^[0-9]{3}-[0-9]{3}-[0-9]{3}-[0-9]{2}$/" exampleValue="111-111-111-11" onChange={opts => {
					let v = opts.value || "";

					if (/^[0-9]{3}$/.test (v) || /^[0-9]{3}-[0-9]{3}$/.test (v) || /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/.test (v)) {
						console.log (v);
						opts.value = v + "-";
					}
				}} />
				<div className="row">
					<div className="col-6">
						<ModelList store={store} model="item" onSelect={id => this.setState ({id})} hideEdit hideCreate refresh={this.state.refresh} {...this.props} />
					</div>
					<div className="col-6 bg-white">
						<Form
							store={store} rsc="record" rid={this.state.id} mid="item"
							onCreate={() => this.setState ({refresh: !this.state.refresh})}
							onSave={() => this.setState ({refresh: !this.state.refresh})}
							ref={this._refs ["cmp"]}
						>
							<Field property="date" />
							<Field property="name" hideLabel onChange={opts => {
								if (opts.value == "123") {
									opts.value = "123-"
								}
							}} />
							<Action label={"test"} onClick={() => console.log(this._refs ["cmp"].current.setState({'name': '123'}))} />
							<div className="row">
								<div className="col-8">
								</div>
								<div className="col">
									<DictField property="category" />
								</div>
							</div>
							<JsonField property="opts" props={[
								{prop: "green", label: "Green", component: BooleanField},
								{prop: "blue", label: "Blue", component: BooleanField},
								{prop: "red", label: "Red", component: BooleanField}
							]} />
							<Field property="photo" accept=".pdf" />
							<Field property="file" />
						</Form>
					</div>
				</div>
				<DictField label={"Dict"} records={this.state.recs} />
				<select id="column" className="form-control form-control-sm">
					<option value="1">1</option>
					<option value="2">2</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
				</select>
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

	onConnect = async () => {
		this.setState ({
			username: store.username
		});
		window.store = store;
	}

	onCustomRender ({content, app, location}) {
		if (!app.state.sid) {
			return <div>
				<div>{content}</div>
				<div className="text-center"><Action icon="fas fa-key" label={i18n ("Create temporary account and sign in")} /></div>
			</div>;
		}
	}

	render () {
		let me = this;

		return <ObjectumApp
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
			registration
			siteKey="6LffszoUAAAAALAe2ghviS8wqitVKvsR1bFMwtcK"
			//label="Label"
			onDisconnect={() => console.log ("disc")}
/*
			onRenderAuthInfo={div => {
				return div;
			}}
*/
			//onCustomRender={me.onCustomRender}
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
		</ObjectumApp>;
	}
};

render (<Demo/>, document.querySelector ("#demo"));

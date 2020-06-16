import React, {Component, useState} from "react";
import {render} from "react-dom";
import {Link, Route, useHistory} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {Office, Loading, Navbar, ObjectumApp, SelectField, DateField, FileField, BooleanField, Form, StringField, Field, ObjectumRoute, Tabs, Tab, Grid, ChooseField, DictField, NumberField, ModelList, Action, Tooltip, Auth} from '../../src'
import {pushLocation, timeout, newId} from "../../src/components/helper";
import ReactCrop from "react-image-crop";

//import OrgModel from "./models/OrgModel";
//import TkModelClient from "./models/TkModelClient";
//import TOrgProductModel from "./models/TOrgProductModel";
//import BrakModel from "./models/BrakModel";
//import TBrakDishModel from "./models/TBrakDishModel";
import ItemModel from "./models/ItemModel";

import "../../src/css/bootstrap.css";
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

function LogoutButton ({app, size}) {
	let history = useHistory ();
	
	function handleClick () {
		app.store.end ();
		
		app.setState ({
			sidebarOpen: false, locations: [], sid: null
		});
		history.push ("/");
	}
	return (
		<Link className="nav-item nav-link font-weight-bold" onClick={handleClick}><i className="fas fa-sign-out-alt mr-2" />{i18n ("Logout")}</Link>
	);
};

function BackButton ({popLocation, locations}) {
	let history = useHistory ();
	
	function handleClick () {
		let {pathname, hash} = locations [locations.length - 2];
		
		popLocation ();

//		history.push (decodeURI (pathname + hash));
		history.push (pathname + hash);
	}
	return (
		<Link className="nav-item nav-link font-weight-bold" disabled={locations.length < 2} onClick={handleClick}><i className="fas fa-arrow-left mr-2" />{i18n ("Back")}</Link>
	);
};

class Test extends Component {
	constructor (props) {
		super (props);
		
		this.onClick = this.onClick.bind (this);

		this.state = {
			text: "1",
			file: "test.jpg",
			refresh: false
		};
		this._refs = {"test": React.createRef ()};
		this.changed = {};
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
		let me = this;
		
		return (
			<div className="container">
				<Navbar
					className="navbar navbar-expand navbar-dark bg-primary"
					linkClassName="nav-item nav-link font-weight-bold p-1"
					submenuLinkClassName="nav-item nav-link font-weight-bold text-dark"
					items={[
						<button className="btn btn-link nav-item nav-link font-weight-bold" onClick={() => {}}><i className="fas fa-arrow-left mr-2" />{i18n ("Back")}</button>,
						<Link
							key={1}
							className="btn btn-link nav-item nav-link font-weight-bold"
							to="/#"
							onClick={() => {}}
						>
							<i className="fas fa-utensils" /> Рецепты
						</Link>,
						<button className="btn btn-link nav-item nav-link font-weight-bold" onClick={() => {}}><i className="fas fa-sign-out-alt mr-2" />{i18n ("Logout")}</button>
					]}
				/>
				<StringField ref={me._refs ["test"]} />
				<Action label="tt" onClick={() => me._refs ["test"].current.setState ({value: "2"})} />
				<ModelList store={store} model="item" />
				<Form ref="my-form" record={me.state} hideButtons disabled>
					<DateField property="date" label="Date" notNull={0} showTime />
					<FileField property="file" label="Скан" propertyId={123} recordId={456} />
					<BooleanField property="bb" label="Даю согласие на обработку своих персональных данных в порядке, установленном Федеральным законом от 27 июля 2006 г №152-ФЗ «О персональных данных» (Собрание законодательства Российской Федерации, 2006, № 31, ст. 3451)" />
					<StringField label="Text" property="text" wysiwyg />
					<Action label="test" onClick={() => {
						me.refs ["my-form"].isValid ();
					}} />
					<Action label="test value" onClick={() => {
						me.setState ({refresh: !me.state.refresh, text: "2"});
					}} />
				</Form>
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
					"logout",
					"logout",
					"logout",
					"logout",
					"logout"
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
					_username="admin"
					_password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()}
					username="guest"
					password={require ("crypto").createHash ("sha1").update ("guest").digest ("hex").toUpperCase ()}
					name="objectum-react"
					version={packageConfig.version}
					registration
					siteKey="6LffszoUAAAAALAe2ghviS8wqitVKvsR1bFMwtcK"
					label="Label"
/*
					onRenderAuthInfo={div => {
						return div;
					}}
*/
					onCustomRender={me.onCustomRender}
					onConnect={me.onConnect}
				>
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
					<ObjectumRoute path="/test2" render={props => <Test {...props} store={store} />} />
					<ObjectumRoute path="/office" render={props => (
						<div className="container">
							<div style={{width: "50em"}}>
								<Office
									{...props} store={store} name="objectum-react" cardClassName="p-4 shadow"
									authorized={me.state.username && me.state.username != "guest"}
									siteKey="6LffszoUAAAAALAe2ghviS8wqitVKvsR1bFMwtcK"
								>
									authorized menu
								</Office>
							</div>
						</div>
					)} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

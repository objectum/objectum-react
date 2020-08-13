import React, {Component, useState} from "react";
import {render} from "react-dom";
import {Link, Route, useHistory} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {
	createReport, Office, Loading, Navbar, ObjectumApp, SelectField, DateField, FileField, BooleanField, Form,
	StringField, Field, ObjectumRoute, Tabs, Tab, Grid, ChooseField, DictField, NumberField, ModelList, Action, Tooltip, Auth,
	Pagination, Fade, Tree
} from '../../src'
import {pushLocation, timeout, newId} from "../../src";
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

class Test extends Component {
	constructor (props) {
		super (props);
		
		this.onClick = this.onClick.bind (this);

		this.state = {
			text: "1",
			file: "test.jpg",
			refresh: false,
			active: 0
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
				<Tree recs={[
					{id: 1, name: "n1.1", parent: null},
					{id: 2, name: "n1.2", parent: null},
					{id: 3, name: "n1.3", parent: null},
					{id: 4, name: "n2.1", parent: 2},
					{id: 5, name: "n2.2", parent: 2},
					{id: 6, name: "n3.1", parent: 5},
					{id: 7, name: "n3.1", parent: 1}
				]} onChoose={({id}) => console.log (id)} />
				<Form store={store} rsc="record" rid={1021} mid="item" hideButtons>
					<Field property="category" />
				</Form>
				<Form ref="my-form" record={me.state} hideButtons>
					<StringField label="Text" property="text2" placeholder="123dd" />
					<DateField property="date" label="Date" notNull={0} showTime />
					<FileField property="file" label="Скан" propertyId={123} recordId={456} />
					<BooleanField property="bb" label="Даю согласие на обработку своих персональных данных в порядке, установленном Федеральным законом от 27 июля 2006 г №152-ФЗ «О персональных данных» (Собрание законодательства Российской Федерации, 2006, № 31, ст. 3451)" />
					<StringField label="Text" property="text" wysiwyg />
					<div className="d-flex">
						<Action onClick={
							async ({progress}) => {
								return await store.remote ({
									model: "org",
									method: "test",
									progress
								});
							}
						} selected={true} icon="fas fa-copy" label="Action 1" store={store} />
						<Action onClick={
							async (opts) => {
								for (let i = 0; i < 5; i ++) {
									await timeout (1000);
									opts.progress ({label: "progress", value: i + 1, max: 5});
								}
								return "action 2";
							}
						} selected={true} icon="fas fa-copy" label="Action 2" store={store} />
						<Action label="test" modalComponent={Loading} />
						<Action label="test exception" onClick={async () => {
							await store.startTransaction ("new comment");
							await store.createRecord ({
								date: new Date (),
								user: store.userId,
								text: "123"
							});
							await store.commitTransaction ("new comment");
						}} />
					</div>
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
					_username="guest"
					_password={require ("crypto").createHash ("sha1").update ("guest").digest ("hex").toUpperCase ()}
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

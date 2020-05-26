import React, {Component, useState} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import {Store, Record} from "objectum-client";
import {ObjectumApp, DateField, FileField, BooleanField, Form, StringField, Field, ObjectumRoute, Tabs, Tab, Grid, ChooseField, DictField, NumberField, ModelList, Action, Tooltip, Auth} from '../../src'
import {pushLocation, timeout, newId} from "../../src/components/helper";
import ReactCrop from "react-image-crop";

//import OrgModel from "./models/OrgModel";
//import TkModelClient from "./models/TkModelClient";
//import TOrgProductModel from "./models/TOrgProductModel";
//import BrakModel from "./models/BrakModel";
//import TBrakDishModel from "./models/TBrakDishModel";

import "react-image-crop/dist/ReactCrop.css";
import "../../src/css/bootstrap-site.css";
import "../../src/css/objectum.css";
import "../../src/fontawesome/css/all.css";
import bgImage from "./images/italian.jpg";

import packageConfig from "./../package";
import Fade from "react-reveal/Fade";

const store = new Store ();

class Test extends Component {
	constructor (props) {
		super (props);
		
		this.onClick = this.onClick.bind (this);

		this.state = {
			text: "1",
			file: "test.jpg",
			refresh: false
		};
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
				<DateField property="date" label="Date" value="" />
				<Form ref="my-form" record={me.state} refresh={me.state.refresh} hideButtons>
					<FileField property="file" label="Скан" propertyId={123} recordId={456} />
					<BooleanField property="bb" label="Даю согласие на обработку своих персональных данных в порядке, установленном Федеральным законом от 27 июля 2006 г №152-ФЗ «О персональных данных» (Собрание законодательства Российской Федерации, 2006, № 31, ст. 3451)" />
					<StringField label="Text" property="text" notNull />
					<Action label="test" onClick={() => {
						me.refs ["my-form"].isValid ();
					}} />
					<Action label="test value" onClick={() => {
						me.setState ({refresh: !me.state.refresh, text: "2"});
					}} />
				</Form>
				<DictField label="DictField" store={store} model="declaration" property="state" value="1048" />
				<ChooseField label="ChooseField" store={store} property="test" choose={{model: "org"}} value="1020" />
				<StringField label="StringField" property="test" wysiwyg />
{/*
				<Form store={store} rsc="record" rid={20436} mid="balance">
					<Field property="amount" notNull />
					<JsonField
						label="JsonField" property="opts"
						props={[
							{prop: "f1", label: "F1", component: BooleanField},
							{prop: "f2", label: "F2", component: BooleanField},
							{prop: "f3", label: "F3", component: BooleanField},
							{prop: "f4", label: "F4", component: BooleanField},
							{prop: "f5", label: "F5", component: BooleanField}
						]}
					/>
				</Form>
*/}
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
		
		this.onCustomRender = this.onCustomRender.bind (this);
		
		window.store = store;
	}
	
	onCustomRender ({content, app}) {
		let roleMenu = [
			{label: "Модели", path: "/models"},
			{label: "Запросы", path: "/queries"},
		];
		return (
			<div>
				<Tabs id="tabs">
					{roleMenu.map ((o, i) => {
						return (
							<Tab key={i} {...o} />
						);
					})}
				</Tabs>
				{content}
			</div>
		);
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<ObjectumApp
					store={store}
					username="admin"
					password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()}
					_username="diet"
					_password="356A192B7913B04C54574D18C28D46E6395428AB"
					name="objectum-react"
					version={packageConfig.version}
					onRenderAuthInfo={div => {
						return React.cloneElement (div, {style: {
							backgroundImage: `url(${bgImage})`,
							backgroundSize: "content"
						}});
					}}
					/*onCustomRender={me.onCustomRender}*/
				>
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
					<ObjectumRoute path="/test2" render={props => <Test {...props} store={store} />} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

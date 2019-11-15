import React, {Component} from "react";
import {render} from "react-dom";
import {Route} from "react-router-dom";
import store from "objectum-client";
import {ObjectumApp, ObjectumRoute, Grid, Action, Tabs, Tab, Form, Field} from '../../src'
import {getHash} from "../../src/components/helper";

class Test extends Component {
	render () {
		return (<div>Test</div>);
	}
};

class Items extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			removeConfirm: false,
			refresh: false
		};
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
	}
	
	onCreate () {
		let me = this;
		
		me.props.history.push ({
			pathname: "/item/new#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash)
				}
			})
		});
	}
	
	onEdit (id) {
		let me = this;
		
		me.props.history.push ({
			pathname: "/item/" + id + "#" + JSON.stringify ({
				opts: {
					from: unescape (window.location.pathname + window.location.hash)
				}
			})
		});
	}
	
	async onRemove (confirmed) {
		let me = this;
		
		if (confirmed) {
			await me.props.store.startTransaction ("Removing item: " + me.state.removeId);
			await me.props.store.removeRecord (me.state.removeId);
			await me.props.store.commitTransaction ();
		}
		me.setState ({removeConfirm: false, refresh: !me.state.refresh});
	}

	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Action onClick={me.onCreate}><i className="fas fa-plus mr-2"></i>Create</Action>
					<Action onClickSelected={me.onEdit}><i className="fas fa-edit mr-2"></i>Edit</Action>
					<Action onClickSelected={(id) => this.setState ({removeConfirm: true, removeId: id})}><i className="fas fa-minus mr-2"></i>Remove</Action>
					<Grid {...me.props} id="items" ref="items" title="Items" store={me.props.store} query="item.list" refresh={me.state.refresh} />
				</div>
			</div>
		);
		
	}
};

class Item extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let rid = me.props.match.params.rid.split ("#")[0];
		let hash = getHash ();
		
		me.from = hash.opts.from;
		me.state = {
			rid: rid == "new" ? null : rid,
		};
		if (rid == "new") {
			me.state.creationDate = new Date ();
		}
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<button type="button" className="btn btn-primary mb-2" onClick={() => me.props.history.push (me.from)}><i className="fas fa-arrow-left mr-2"></i>Back</button>
				<Tabs key="tabs" id="tabs">
					<Tab key="Tab1" title="Information">
						<Form key="form1" store={me.props.store} rsc="record" rid={me.state.rid} mid="item">
							<Field property="creationDate" value={me.state ["creationDate"]} />
							<Field property="name" />
							<Field property="hidden" />
							<Field property="weight" />
							<Field property="type" dict={true} />
							<Field property="file" />
						</Form>
					</Tab>
				</Tabs>
			</div>
		);
	}
};

class Demo extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/api");
		window.store = store;
	}
	
	render () {
		return (
			<div>
				<ObjectumApp locale="ru" store={store} _username="admin" _password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()} name="objectum-react">
					<ObjectumRoute path="/test" render={props => <Test {...props} store={store} />} />
					<ObjectumRoute path="/items" render={props => <Items {...props} store={store} />} />
					<ObjectumRoute path="/item/:rid" render={props => <Item {...props} store={store} />} />
				</ObjectumApp>
			</div>
		);
	}
};

render (<Demo/>, document.querySelector ("#demo"));

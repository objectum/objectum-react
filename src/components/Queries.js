import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import RemoveAction from "./RemoveAction";
import {i18n} from "./../i18n";
import Tab from "./Tab";
import Tabs from "./Tabs";

class Queries extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.parent = null;
		me.onCreate = me.onCreate.bind (me);
		me.onEdit = me.onEdit.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.onChange = me.onChange.bind (me);
		me.state = {
			refresh: false
		};
		me._refs = {"queries": React.createRef ()};
	}
	
	onCreate () {
		let me = this;

		me.props.history.push ({
			pathname: "/query/new#" + JSON.stringify ({
				opts: {
					parent: me.parent
				}
			})
		});
	}
	
	onEdit ({id}) {
		let me = this;

		me.props.history.push ({
			pathname: "/query/" + id
		});
	}
	
	onChange (val) {
		this.setState ({taValue: val.target.value});
	}
	
	async onRemove (id) {
		let me = this;
		let state = {refresh: !me.state.refresh};
		
		try {
			await me.props.store.startTransaction ("Removing query: " + id);
			await me.props.store.removeQuery (id);
			await me.props.store.commitTransaction ();
		} catch (err) {
			await me.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		me.setState (state);
	}
	
	render () {
		let me = this;
		
		return (
			<div className="container">
				<div className="shadow-sm">
					<Grid {...me.props} id="queries" ref={me._refs ["queries"]} label="Queries" store={me.props.store} query="objectum.query" tree={true} system={true} refresh={me.state.refresh} onSelectParent={(parent) => me.parent = parent} inlineActions>
						<div className="d-flex">
							<Action icon="fas fa-plus" label={i18n ("Create")} onClick={me.onCreate} />
							<Action icon="fas fa-edit" label={i18n ("Edit")} onClickSelected={me.onEdit} />
							<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClickSelected={me.onRemove} />
						</div>
						{me.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${me.state.error}`}</div>}
					</Grid>

{/*
					<Tabs {...me.props} id="tabs">
						<Tab label="test1" path="/queries1" />
						<Tab label="test2" path="/queries2" />
						<Tab label="test" path="/queries" />
					</Tabs>
*/}

				</div>
			</div>
		);
		
	}
};
Queries.displayName = "Queries";

export default Queries;

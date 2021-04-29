import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import {i18n} from "./../i18n";

export default class Queries extends Component {
	constructor (props) {
		super (props);
		
		this.parent = null;
		this.state = {
			refresh: false
		};
		this._refs = {"queries": React.createRef ()};
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: "/query/new#" + JSON.stringify ({
				opts: {
					parent: this.parent
				}
			})
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: "/query/" + id
		});
	}
	
	onChange = (val) => {
		this.setState ({taValue: val.target.value});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing query: " + id);
			await this.props.store.removeQuery (id);
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		this.setState (state);
	}
	
	render () {
		return <div className="container">
			<div className="shadow-sm">
				<Grid {...this.props} id="queries" ref={this._refs ["queries"]} label="Queries" store={this.props.store} query="objectum.query" tree={true} system={true} refresh={this.state.refresh} onSelectParent={(parent) => this.parent = parent} inlineActions>
					<div className="d-flex">
						<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
						<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
						<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClick={this.onRemove} selected />
					</div>
					{this.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${this.state.error}`}</div>}
				</Grid>
			</div>
		</div>;
	}
};
Queries.displayName = "Queries";

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import {i18n} from "./../i18n";

export default class Properties extends Component {
	constructor (props) {
		super (props);
		
		this ["model"] = this.props ["model"];
		this.state = {
			refresh: false
		};
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: this.props.prefix + "/property/new#" + JSON.stringify ({
				opts: {
					model: this ["model"]
				}
			})
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: this.props.prefix + "/property/" + id + "#" + JSON.stringify ({
				opts: {
					model: this ["model"]
				}
			})
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing property: " + id);
			await this.props.store.removeProperty (id);
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.setState (state);
	}
	
	render () {
		return <div className="row">
			<div className="col-sm-12">
				<Grid id="properties" store={this.props.store} query="objectum.property" system refresh={this.state.refresh} params={{modelId: this.model}} inlineActions>
					<div className="d-flex pb-1">
						<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
						<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
						<Action icon="fas fa-minus" label={i18n ("Remove")} onClick={this.onRemove} confirm selected />
					</div>
				</Grid>
			</div>
		</div>;
	}
};
Properties.displayName = "Properties";

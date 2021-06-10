import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import {i18n} from "../i18n";

export default class Types extends Component {
	constructor (props) {
		super (props);
		
		this.parent = null;
		this.state = {
			refresh: false
		};
		this._refs = {"types": React.createRef ()};
	}
	
	render () {
		return <div className="row">
			<div className="col-sm-12">
				<Grid {...this.props} id="types" ref={this._refs ["types"]} label="Data types" store={this.props.store} query="objectum.type" tree system refresh={this.state.refresh} onSelectParent={parent => this.parent = parent}>
					<div className="d-flex">
						<Action onClick={({grid}) => grid.onFolderClick (null)}>
							<i className="fas fa-home mr-2" />{i18n ("Basic")}
						</Action>
						<Action onClick={({grid}) => grid.onFolderClick (grid.props.store.getModel ("d").get ("id"))}>
							<i className="fas fa-book mr-2" />{i18n ("Dictionary")}
						</Action>
						<Action onClick={({grid}) => grid.onFolderClick (grid.props.store.getModel ("t").get ("id"))}>
							<i className="fas fa-table mr-2" />{i18n ("Table")}
						</Action>
					</div>
				</Grid>
			</div>
		</div>;
	}
};
Types.displayName = "Types";

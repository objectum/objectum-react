import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import {i18n} from "../i18n";
import {setHash} from "../modules/common";

class Types extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.parent = null;
		me.state = {
			refresh: false
		};
		me._refs = {"types": React.createRef ()};
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...me.props} id="types" ref={me._refs ["types"]} label="Data types" store={me.props.store} query="objectum.type" tree={true} system={true} refresh={me.state.refresh} onSelectParent={parent => me.parent = parent}>
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
			</div>
		);
		
	}
};
Types.displayName = "Types";

export default Types;

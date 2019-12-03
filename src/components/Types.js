import React, {Component} from "react";
import Grid from "./Grid";

class Types extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.parent = null;
		me.state = {
			refresh: false
		};
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row">
				<div className="col-sm-12">
					<Grid {...me.props} id="types" ref="types" label="Data types" store={me.props.store} query="objectum.type" tree={true} system={true} refresh={me.state.refresh} onSelectParent={parent => me.parent = parent} />
				</div>
			</div>
		);
		
	}
};
Types.displayName = "Types";

export default Types;

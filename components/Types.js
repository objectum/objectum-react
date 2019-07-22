import React, {Component} from 'react';
import TreeGrid from "./TreeGrid";

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
					<TreeGrid id="types" ref="types" title="Types" store={me.props.store} view="objectum.type" pageRecs={10} refresh={me.state.refresh} onSelectParent={parent => me.parent = parent} />
				</div>
			</div>
		);
		
	}
};

export default Types;

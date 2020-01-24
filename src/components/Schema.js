import React, {Component} from "react";
import SortableTree from "react-sortable-tree";
import "react-sortable-tree/style.css";

class Schema extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let models = [], has = {};
		
		for (let id in me.props.store.map ["model"]) {
			let m = me.props.store.map ["model"][id];
			
			if (id >= 1000 && !has [m.id]) {
				has [m.id] = true;
				models.push (m);
			}
		}
		me.state = {
			treeData: me.getChildren (models, null)
		};
	}
	
	getChildren (models, parent) {
		let me = this;
		let items = [];
		
		models.forEach (m => {
			if (m.parent == parent) {
				let children = me.getChildren (models, m.id);
				
				for (let code in m.properties) {
					let p = m.properties [code];
					let subtitle = me.props.store.map ["model"][p.type] && me.props.store.map ["model"][p.type].getLabel ();
					
					children.push ({title: p.name + " (" + p.code + ": " + p.id + ")", subtitle});
				}
				items.push ({
					title: m.name + " (" + m.getPath () + ": " + m.id + ")", children
				});
			}
		});
		return items;
	}
	
	render () {
		return (
			<div style={{ height: "100%" }}>
				<SortableTree
					treeData={this.state.treeData}
					onChange={treeData => this.setState({ treeData })}
					isVirtualized={false}
					canDrag={false}
					canDrop={false}
				/>
			</div>
		);
	}
}
Schema.displayName = "Schema";

export default Schema;

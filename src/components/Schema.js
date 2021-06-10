import React, {Component} from "react";
import SortableTree from "react-sortable-tree";
import "react-sortable-tree/style.css";

export default class Schema extends Component {
	constructor (props) {
		super (props);
		
		let models = [], has = {};
		
		for (let id in this.props.store.map ["model"]) {
			let m = this.props.store.map ["model"][id];
			
			if (id >= 1000 && !has [m.id]) {
				has [m.id] = true;
				models.push (m);
			}
		}
		this.state = {
			treeData: this.getChildren (models, null)
		};
	}
	
	getChildren (models, parent) {
		let items = [];
		
		models.forEach (m => {
			if (m.parent == parent) {
				let children = this.getChildren (models, m.id);
				
				for (let code in m.properties) {
					let p = m.properties [code];
					let subtitle = this.props.store.map ["model"][p.type] && this.props.store.map ["model"][p.type].getLabel ();
					
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
		return <div style={{ height: "100%" }}>
			<SortableTree
				treeData={this.state.treeData}
				onChange={treeData => this.setState({ treeData })}
				isVirtualized={false}
				canDrag={false}
				canDrop={false}
			/>
		</div>;
	}
}
Schema.displayName = "Schema";

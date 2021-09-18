import React, {Component} from "react";
import Action from "./Action";
import Grid from "./Grid";
import Tree from "./Tree";
import DictField from "./DictField";
import {i18n} from "../i18n";

class ImportItems extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			loading: true,
			checkedNodes: []
		};
	}
	
	async componentDidMount () {
		this.setState ({
			loading: false,
			records: await this.props.store.getRecs ({
				model: "objectum.menuItem",
				filters: [
					["menu", "=", this.props.srcMenu]
				]
			})
		});
	}
	
	onCheck = ({checkedNodes}) => {
		this.setState ({checkedNodes});
	}
	
	onImport = async ({progress}) => {
		let srcRecords = await this.props.store.getRecords ({
			model: "objectum.menuItem",
			filters: [
				["id", "in", this.state.checkedNodes]
			]
		});
		let model = this.props.store.getModel ("objectum.menuItem");
		let map = {};
		
		try {
			await this.props.store.startTransaction ("Importing menu items");
			
			for (let i = 0; i < srcRecords.length; i ++) {
				let srcRecord = srcRecords [i];
				let data = {_model: "objectum.menuItem"};
				
				for (let code in model.properties) {
					data [code] = srcRecord [code];
				}
				data.menu = this.props.menu;
				data.parent = null;
				
				let record = await this.props.store.createRecord (data);
				
				map [srcRecord.id] = record;
				
				progress ({value: i + 1, max: srcRecords.length});
			}
			for (let i = 0; i < srcRecords.length; i ++) {
				let srcRecord = srcRecords [i];
				
				if (srcRecord.parent && map [srcRecord.parent]) {
					map [srcRecord.id].parent = map [srcRecord.parent].id;
					await map [srcRecord.id].sync ();
				}
			}
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.props.onComplete ();
	}
	
	render () {
		if (this.state.loading) {
			return null;
		}
		return <div style={{minWidth: "30em"}}>
			<Tree records={this.state.records} selectMulti onCheck={this.onCheck} />
			<Action label={i18n ("Import selected menu items")} onClick={this.onImport} disabled={!this.state.checkedNodes.length} />
		</div>
	}
};

export default class MenuItems extends Component {
	constructor (props) {
		super (props);
		
		this.menu = this.props.menu;
		this.state = {
			parent: null,
			refresh: false,
			menuRecords: []
		};
		this._refs = {"menuItems": React.createRef ()};
	}
	
	async componentDidMount () {
		this.setState ({
			menuRecords: await this.props.store.getRecs ({
				model: "objectum.menu",
				filters: [
					["id", "<>", this.menu]
				]
			})
		});
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: this.props.prefix + "/menu_item/new#" + JSON.stringify ({
				opts: {
					menu: this.menu,
					parent: this.state.parent
				}
			})
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: this.props.prefix + "/menu_item/" + id + "#" + JSON.stringify ({
				opts: {
					menu: this.menu,
					parent: this.state.parent
				}
			})
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing menu item: " + id);
			await this.props.store.removeRecord (id);
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			throw err;
		}
		this.setState (state);
	}
	
	render () {
		return <div className="p-1">
			<Grid {...this.props} id="menuItems" ref={this._refs ["menuItems"]} store={this.props.store} query="objectum.menuItem" tree refresh={this.state.refresh} onSelectParent={parent => this.parent = parent} params={{menu: this.menu}} inlineActions>
				<div className="d-flex pb-1">
					<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
					<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
					<Action icon="fas fa-minus" label={i18n ("Remove")} onClick={this.onRemove} confirm selected />
					<Action
						icon="fas fa-file-import" label={i18n ("Import from another menu")}
						menu={this.menu} srcMenu={this.state.menu}
						popupComponent={ImportItems} disabled={!this.state.menu}
						onComplete={() => this.setState ({refresh: !this.state.refresh})}
					/>
					<DictField recs={this.state.menuRecords} onChange={({value}) => this.setState ({menu: value})} />
				</div>
			</Grid>
		</div>;
	}
};
MenuItems.displayName = "MenuItems";

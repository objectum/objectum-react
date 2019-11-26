/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener} from "./helper";
import Cell from "./Cell";
import Filters from "./Filters";
import _ from "lodash";
import {i18n} from "./../i18n";

class Grid extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let page = 1;
		let pageRecs = me.props.pageRecs || 10;
		let selected = null;
		let showFilters = false;
		let filters = [];
		let order = [];
		let parent = null;
		let mode = me.props.mode || "table";
		let hash = getHash (me);
		
		if (hash [me.props.id]) {
			if (hash [me.props.id].page) {
				page = Number (hash [me.props.id].page);
			}
			if (hash [me.props.id].pageRecs) {
				pageRecs = Number (hash [me.props.id].pageRecs);
			}
			if (hash [me.props.id].hasOwnProperty ("selected")) {
				selected = Number (hash [me.props.id].selected);
			}
			if (hash [me.props.id].hasOwnProperty ("showFilters")) {
				showFilters = hash [me.props.id].showFilters;
			}
			if (hash [me.props.id].filters) {
				filters = hash [me.props.id].filters;
			}
			if (hash [me.props.id].mode) {
				mode = hash [me.props.id].mode;
			}
			if (hash [me.props.id].hasOwnProperty ("order")) {
				order = hash [me.props.id].order;
			}
			if (hash [me.props.id].parent) {
				parent = Number (hash [me.props.id].parent);
				
				if (me.props.onSelectParent) {
					me.props.onSelectParent (parent);
				}
			}
		}
		me.state = {
			ready: false,
			cols: [],
			recs: [],
			imageRecs: [],
			page,
			pageNum: 1,
			pageRecs,
			mode,
			selected,
			showFilters,
			filters,
			order,
			parent
		};
		me.position = [];
		me.childMap = {};
		me.nodeMap = {};
		
		me.onRowClick = me.onRowClick.bind (me);
		me.onFolderClick = me.onFolderClick.bind (me);
		me.onChange = me.onChange.bind (me);
		me.onFirst = me.onFirst.bind (me);
		me.onPrev = me.onPrev.bind (me);
		me.onNext = me.onNext.bind (me);
		me.onLast = me.onLast.bind (me);
		me.onShowFilters = me.onShowFilters.bind (me);
		me.onImageMode = me.onImageMode.bind (me);
		me.hashChange = me.hashChange.bind (me);
		me.onFilter = me.onFilter.bind (me);
		me.onOrder = me.onOrder.bind (me);
	}
	
	hashChange () {
		let me = this;
		let page = me.state.page;
		let pageRecs = me.state.pageRecs;
		let mode = me.state.mode;
		let selected = me.state.selected;
		let showFilters = me.state.showFilters;
		let filters = me.state.filters;
		let order = me.state.order;
		let parent = me.state.parent;
		let hash = getHash (me);
		let ready = true;
		
		if (hash [me.props.id]) {
			if (hash [me.props.id].page && hash [me.props.id].page != me.state.page) {
				page = hash [me.props.id].page;
				ready = false;
			}
			if (hash [me.props.id].pageRecs && hash [me.props.id].pageRecs != me.state.pageRecs) {
				pageRecs = hash [me.props.id].pageRecs;
				ready = false;
			}
			if (hash [me.props.id].mode && hash [me.props.id].mode != me.state.mode) {
				mode = hash [me.props.id].mode;
				ready = false;
			}
			if (hash [me.props.id].filters && JSON.stringify (hash [me.props.id].filters) != JSON.stringify (me.state.filters)) {
				filters = hash [me.props.id].filters;
				ready = false;
			}
			if (hash [me.props.id].hasOwnProperty ("order") && JSON.stringify (hash [me.props.id].order) !== JSON.stringify (me.state.order)) {
				order = hash [me.props.id].order;
				ready = false;
			}
			if (hash [me.props.id].hasOwnProperty ("selected") && hash [me.props.id].selected != me.state.selected) {
				selected = hash [me.props.id].selected;
			}
			if (hash [me.props.id].hasOwnProperty ("showFilters") && hash [me.props.id].showFilters != me.state.showFilters) {
				showFilters = hash [me.props.id].showFilters;
			}
			if ((hash [me.props.id].parent && hash [me.props.id].parent != me.state.parent) || (!hash [me.props.id].parent && me.state.parent)) {
				parent = hash [me.props.id].parent || null;
				
				if (parent == "null") {
					parent = null;
				}
				ready = false;
			}
		}
		if (parent != me.state.parent && me.props.onSelectParent) {
			me.props.onSelectParent (parent);
		}
		if (selected != me.state.selected && me.props.onSelect) {
			me.props.onSelect (me.state.recs [selected] && me.state.recs [selected].id);
		}
		me.setState ({page, pageRecs, mode, selected, showFilters, filters, order, parent, ready});
	}
	
	componentDidMount () {
		addHashListener (this, this.hashChange);
	}
	
	componentWillUnmount () {
		removeHashListener (this, this.hashChange);
	}
	
	onRowClick (row) {
		setHash (this, {[this.props.id]: {selected: row}});
	}
	
	onFolderClick (id) {
		setHash (this, {[this.props.id]: {parent: id, selected: null}});
	}
	
	onChange (val) {
		let me = this;
		let id = val.target.id;
		let v = val.target.value;
		
		if (val.target.type === "checkbox") {
			v = val.target.checked;
		}
		if (id == "page" && !v) {
			v = 1;
		}
		if (id == "pageRecs" || id == "page") {
			setHash (me, {[me.props.id]: {[id]: v}});
		}
	}
	
	onFirst () {
		setHash (this, {[this.props.id]: {page: 1}});
	}
	
	onPrev () {
		setHash (this, {[this.props.id]: {page: Number (this.state.page) - 1}});
	}
	
	onLast () {
		setHash (this, {[this.props.id]: {page: this.state.pageNum}});
	}
	
	onNext () {
		setHash (this, {[this.props.id]: {page: Number (this.state.page) + 1}});
	}
	
	onShowFilters () {
		setHash (this, {[this.props.id]: {showFilters: !this.state.showFilters}});
	}
	
	onImageMode () {
		setHash (this, {[this.props.id]: {mode: this.state.mode == "images" ? "table" : "images"}});
	}
	
	onFilter (filters) {
		setHash (this, {[this.props.id]: {filters}});
	}
	
	onOrder (colCode) {
		let me = this;
		let order = [...me.state.order];
		
		if (me.state.order [0] === colCode) {
			if (me.state.order [1] == "asc") {
				order [1] = "desc";
			} else {
				order = [];
			}
		} else {
			order = [colCode, "asc"];
		}
		setHash (this, {[this.props.id]: {order}});
	}
	
	async load () {
		let me = this;
		let state = {
			pageRecs: me.state.pageRecs
		};
		
		try {
			let opts = {
				offset: (me.state.page - 1) * me.state.pageRecs,
				limit: me.state.pageRecs,
				filters: me.state.filters
			};
			if (me.props.tree) {
				opts.parent = me.state.parent;
			}
			if (me.props.query) {
				opts.query = me.props.query;
			}
			if (me.props.model) {
				opts.model = me.props.model;
			}
			if (me.state.order.length) {
				opts.order = me.state.order;
			}
			if (me.props.params) {
				opts = {...opts, ...me.props.params};
			}
			let result = await me.props.store.getData (opts);
			
			state.recs = result.recs;
			state.cols = _.sortBy (result.cols, ["order", "name"]);
			me.position = result.position;
			state.length = result.length;
			
			me.childMap = {};
			
			if (me.props.tree) {
				result.childs.forEach (rec => {
					me.childMap [rec.parent] = rec.num;
				});
				result.recs.forEach (rec => {
					me.nodeMap [rec.id] = rec;
				});
			}
			me.colMap = {};
			
			state.cols.forEach (col => me.colMap [col.code] = col);
			
			if (me.props.card) {
				let imageProperty = me.props.store.getProperty (me.colMap [me.props.card.image].property);
				let imageModel = me.props.store.getModel (imageProperty.get ("type"));
				let model = me.props.store.getModel (imageProperty.get ("model"));
				let result = await me.props.store.getData ({
					model: imageModel.getPath (),
					offset: 0,
					limit: me.state.pageRecs * 3,
					filters: [[model.get ("code"), "in", _.map (state.recs, "id")]]
				});
				state.imageRecs = result.recs;
			}
			let hash = getHash (me);
			
			if (me.props.id && hash [me.props.id]) {
				if (hash [me.props.id].page) {
					state.page = Number (hash [me.props.id].page);
				}
				if (hash [me.props.id].pageRecs) {
					state.pageRecs = Number (hash [me.props.id].pageRecs);
				}
			}
			state.pageNum = state.length / state.pageRecs | 0;
			
			if (state.length % state.pageRecs) {
				state.pageNum ++;
			}
			for (let i = 0; i < state.cols.length; i ++) {
				let c = state.cols [i];
				
				if (c.type >= 1000) {
					let m = await me.props.store.getModel (c.type);
					
					if (m.isDictionary ()) {
						c.recs = await me.props.store.getDict (c.type);
					}
				}
			}
			state.ready = true;
		} catch (err) {
			state.error = err.message;
		}
		me.setState (state);
	}

	getInfo () {
		let me = this;
		let pos = (me.state.page - 1) * me.state.pageRecs + 1;
		let pos2 = pos + Number (me.state.pageRecs) - 1;
		
		if (pos2 > me.state.length) {
			pos2 = me.state.length;
		}
		let s = `${pos}-${pos2} ${i18n ("of")} ${me.state.length} ${i18n ("records")} (${me.state.pageNum} ${i18n ("pages")})`;
		
		if (!pos2) {
			s = i18n ("empty");
		}
		return s;
	}

	renderChildren (children) {
		let me = this;
		
		return React.Children.map (children, child => {
			if (!child.props) {
				return child;
			}
			let o = {};

			if (child.props.onClick) {
				o.onClick = () => child.props.onClick ();
			} else
			if (child.props.onClickSelected) {
				o.onClick = () => {
					child.props.onClickSelected (me.state.recs [me.state.selected].id);
				}
			}
			if (child.type && child.type.name == "Action") {
				if (!me.state.ready || (child.props.onClickSelected && me.state.selected === null)) {
					o.disabled = true;
				}
			}
			if (child.props.children) {
				o.children = me.renderChildren (child.props.children);
			}
			return React.cloneElement (child, o);
		});
	}
	
	componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.refresh !== me.props.refresh ||
			JSON.stringify (prevProps.params) != JSON.stringify (me.props.params) ||
			prevProps.query != me.props.query ||
			prevProps.model != me.props.model
		) {
			me.setState ({ready: false});
		}
	}
	
	renderPosition () {
		let me = this;
		let active = !!me.position.length || me.state.parent;
		
		return (
			<div className="mt-1 mb-1 border shadow-sm">
				<nav aria-label="breadcrumb">
					<ol className="breadcrumb">
						<li className={"breadcrumb-item" + (active ? " active" : "")} aria-current={active ? "page" : ""}>
							<button type="button" className="btn btn-link btn-sm" onClick={() => me.onFolderClick (null)} disabled={!active}><i className="fas fa-home"></i></button>
						</li>
						{me.position.map ((rec, i) => {
							active = i < me.position.length - 1;
							
							return (
								<li key={i} className={"breadcrumb-item" + (active ? " active" : "")} aria-current={active ? "page" : ""}>
									<button type="button" className="btn btn-link btn-sm" onClick={() => me.onFolderClick (rec.id)} disabled={!active}>{rec.name || "-"}</button>
								</li>
							);
						})}
					</ol>
				</nav>
			</div>
		);
	}
	
	init () {
		let me = this;
		
		if (!me.state.ready || me.initialized) {
			return;
		}
		me.initialized = true;
		
		let selected = me.state.selected;
		let parent = me.state.parent;
		
		if (parent !== null && me.props.onSelectParent) {
			me.props.onSelectParent (parent);
		}
		if (selected !== null && me.props.onSelect) {
			me.props.onSelect (me.state.recs [selected] && me.state.recs [selected].id);
		}
	}
	
	renderTableView () {
		let me = this;
		
		return (
			<table className="table table-hover table-bordered p-1 bg-white shadow-sm mt-1 mb-1 objectum-table">
				<thead className="thead-dark">
				<tr>
					{me.props.tree && <th><i className="far fa-folder-open ml-2"></i></th>}
					{me.state.cols.map ((col, i) => {
						if (col.area === 0) {
							return;
						}
						let cls = "";
						let f = me.state.filters.find (f => {
							if (f [0] == col.code) {
								return true;
							}
						});
						let name = i18n (col.name);
						
						if (f) {
							cls = "font-italic";
						}
						let orderClass = "sort";
						
						if (col.code === me.state.order [0]) {
							if (me.state.order [1] == "asc") {
								orderClass = "sort-up";
							} else {
								orderClass = "sort-down";
							}
						}
						return (
							<th key={i} scope="col" className={cls}>
								{me.props.system ?
									<div>{name}</div> :
									<div className={orderClass} onClick={() => me.onOrder (col.code)}>{name}</div>
								}
							</th>
						);
					})}
				</tr>
				</thead>
				<tbody>
				{me.state.recs.map ((rec, i) => {
					let child = me.childMap [rec.id];
					
					return (
						<tr key={i} onClick={() => me.onRowClick (i)} className={me.state.selected == i ? "table-primary" : ""}>
							{me.props.tree && <td key={i + "-tree"}><button type="button" className="btn btn-primary btn-sm text-left treegrid-button" disabled={!child} onClick={() => me.onFolderClick (rec.id)}><i className="fas fa-folder"></i> {child ? <span className="badge badge-info">{child}</span> : ""}</button></td>}
							{me.state.cols.map ((col, j) => {
								if (col.area === 0) {
									return;
								}
								return (
									<td key={i + "_" + j}><Cell store={me.props.store} value={rec [col.code]} col={col} /></td>
								);
							})}
						</tr>
					);
				})}
				</tbody>
			</table>
		);
	}
	
	renderCardView () {
		let me = this;
		
		if (!me.state.ready) {
			return (<div />);
		}
		let card = me.props.card;
		let imageProperty = me.props.store.getProperty (me.colMap [card.image].property);
		let imageModel = me.props.store.getModel (imageProperty.get ("type"));
		let model = me.props.store.getModel (imageProperty.get ("model"));

		return (
			<div className="row">
				{me.state.recs.map ((rec, i) => {
					let imageRecs = _.filter (me.state.imageRecs, {[model.get ("code")]: rec.id});
					let smallImageRec = null, bigImageRec = null;
					
					imageRecs.forEach (rec => {
						if (!smallImageRec || rec.width < smallImageRec.width) {
							smallImageRec = rec;
						}
						if (!bigImageRec || rec.width > bigImageRec.width) {
							bigImageRec = rec;
						}
					});
					let smallImage = `${me.props.store.getUrl ()}/files/${smallImageRec.id}-${imageModel.properties ["photo"].get ("id")}-${smallImageRec ["photo"]}`;
					let bigImage = `${me.props.store.getUrl ()}/files/${bigImageRec.id}-${imageModel.properties ["photo"].get ("id")}-${bigImageRec ["photo"]}`;
					let text = [];
					
					card.text.forEach (code => {
						if (rec [code] !== null) {
							text.push (`${me.colMap [code].name}: ${rec [code]}`);
						}
					});
					text = text.join (", ");
					
					return (
						<div key={i} className="col">
							<div key={i} className="card mb-2 bg-white shadow-sm" style={{width: "18rem"}}>
								<img src={smallImage} className="card-img-top" alt="..." />
								<div className="card-body">
									<h5 className="card-title">{rec [card.title]}</h5>
									<p className="card-text">{text}</p>
									<button className="btn btn-primary" onClick={() => card.onEdit (rec.id)}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</button>
									<a target="_blank" rel="noopener noreferrer" href={bigImage} className="ml-4">{i18n ("Image")}</a>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
	
	render () {
		let me = this;
		
		if (!me.state.ready && !me.state.error) {
			me.load ();
		}
		me.init ();
		
		const gridChildren = me.renderChildren (me.props.children);
		
		return (
			<div>
				{me.props.label && <h5 className="grid-label ml-3">{i18n (me.props.label)}</h5>}
				{me.state.error && <div className="alert alert-danger" role="alert">{me.state.error}</div>}
				{me.state.mode != "images" && gridChildren && <div className="actions border p-1 bg-white shadow-sm">
					{gridChildren}
				</div>}

				{me.props.tree && me.renderPosition ()}

				{me.state.mode == "images" ? me.renderCardView () : me.renderTableView ()}
				
				{me.state.showFilters && <Filters cols={me.state.cols} store={me.props.store} onFilter={me.onFilter} filters={me.state.filters} />}
				
				<div className="btn-toolbar bg-white border shadow-sm p-1" role="toolbar">
					<div className="objectum-5em">
						<div className="input-group">
							<select className="custom-select" value={me.state.pageRecs} id="pageRecs" onChange={me.onChange}>
								<option value="10">10</option>
								<option value="20">20</option>
								<option value="30">30</option>
								<option value="40">40</option>
								<option value="50">50</option>
							</select>
						</div>
					</div>
					<div className="btn-group mr-1" role="group">
						<button type="button" className="btn btn-link" disabled={me.state.page == 1} onClick={me.onFirst}><i className="fas fa-angle-double-left"></i></button>
						<button type="button" className="btn btn-link" disabled={me.state.page == 1} onClick={me.onPrev}><i className="fas fa-angle-left"></i></button>
					</div>
					<div className="objectum-5em">
						<div className="input-group mr-1">
							<input type="number" className="form-control" id="page" value={me.state.page} min="1" max={me.state.pageNum} onChange={me.onChange} />
						</div>
					</div>
					<div className="btn-group mr-1" role="group">
						<button type="button" className="btn btn-link" disabled={me.state.page >= me.state.pageNum} onClick={me.onNext}><i className="fas fa-angle-right"></i></button>
						<button type="button" className="btn btn-link" disabled={me.state.page >= me.state.pageNum} onClick={me.onLast}><i className="fas fa-angle-double-right"></i></button>
						<button type="button" className="btn btn-link" onClick={() => me.setState ({ready: false})}><i className="fas fa-sync"></i></button>
						{!me.props.system && <button type="button" className="btn btn-link" onClick={me.onShowFilters}><i className="fas fa-filter"></i></button>}
						{me.props.card && <button type="button" className="btn btn-link" onClick={me.onImageMode}><i className="fas fa-camera"></i></button>}
					</div>
				</div>
				<small className="text-muted ml-3">
					{me.getInfo ()}
				</small>
			</div>
		);
	}
};
Grid.displayName = "Grid";

export default Grid;

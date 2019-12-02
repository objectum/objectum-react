/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener, timeout} from "./helper";
import Cell from "./Cell";
import Filters from "./Filters";
import _ from "lodash";
import {i18n} from "./../i18n";
import ReactTooltip from "react-tooltip";
import GridColumns from "./GridColumns";

class Grid extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		let hash = getHash (me) [me.props.id];
		
		me.state = {
			loading: false,
			refresh: false,
			page: 1,
			pageRecs: me.props.pageRecs || 20,
			selected: null,
			showFilters: false,
			filters: [],
			order: [],
			parent: null,
			mode: me.props.mode || "table",
			cols: [],
			recs: [],
			imageRecs: [],
			showCols: false,
			hideCols: [],
			pageNum: 1
		};
		if (hash) {
			["page", "pageRecs", "selected", "parent", "showFilters", "filters", "mode", "order", "showCols", "hideCols"].forEach (a => {
				if (hash.hasOwnProperty (a)) {
					me.state [a] = hash [a];
				}
			});
		}
		me.position = [];
		me.childMap = {};
		me.nodeMap = {};
		me.colMap = {};
		
		me.onRowClick = me.onRowClick.bind (me);
		me.onFolderClick = me.onFolderClick.bind (me);
		me.onChange = me.onChange.bind (me);
		me.onFirst = me.onFirst.bind (me);
		me.onPrev = me.onPrev.bind (me);
		me.onNext = me.onNext.bind (me);
		me.onLast = me.onLast.bind (me);
		me.onShowFilters = me.onShowFilters.bind (me);
		me.onShowCols = me.onShowCols.bind (me);
		me.onImageMode = me.onImageMode.bind (me);
		me.hashChange = me.hashChange.bind (me);
		me.onFilter = me.onFilter.bind (me);
		me.onOrder = me.onOrder.bind (me);
		me.onHideCols = me.onHideCols.bind (me);
	}
	
	hashChange () {
		let me = this;
		let hash = getHash (me) [me.props.id];
		let state = {};
		
		if (hash) {
			if (!hash.hasOwnProperty ("parent")) {
				hash.parent = null;
			}
			["page", "pageRecs", "selected", "parent", "showFilters", "filters", "mode", "order", "showCols", "hideCols"].forEach (a => {
				if (hash.hasOwnProperty (a) && JSON.stringify (hash [a]) !== JSON.stringify (me.state [a])) {
					state [a] = hash [a];
				}
			});
		}
		me.setState (state);
	}
	
	async componentDidMount () {
		let me = this;
		
		addHashListener (me, me.hashChange);

		await me.load ();
		
		let selected = me.state.selected;
		let parent = me.state.parent;
		
		if (parent !== null && me.props.onSelectParent) {
			me.props.onSelectParent (parent);
		}
		if (selected !== null && me.props.onSelect) {
			me.props.onSelect (me.state.recs [selected] && me.state.recs [selected].id);
		}
	}
	
	async componentDidUpdate (prevProps, prevState) {
		let me = this;
		let needRefresh = false;
		
		["refresh", "params", "query", "model"].forEach (a => {
			if (JSON.stringify (prevProps [a]) !== JSON.stringify (me.props [a])) {
				needRefresh = true;
			}
		});
		["refresh", "page", "pageRecs", "filters", "order", "parent", "mode"].forEach (a => {
			if (JSON.stringify (prevState [a]) !== JSON.stringify (me.state [a])) {
				needRefresh = true;
			}
		});
		if (needRefresh) {
			await me.load ();
		}
		if (prevState.parent !== me.state.parent && me.props.onSelectParent) {
			me.props.onSelectParent (me.state.parent);
		}
		if (prevState.selected !== me.state.selected && me.props.onSelect) {
			me.props.onSelect (me.state.recs [state.selected] && me.state.recs [me.state.selected].id);
		}
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
	
	onShowCols () {
		setHash (this, {[this.props.id]: {showCols: !this.state.showCols}});
	}
	
	onImageMode () {
		setHash (this, {[this.props.id]: {mode: this.state.mode == "images" ? "table" : "images"}});
	}
	
	onFilter (filters) {
		setHash (this, {[this.props.id]: {filters}});
	}
	
	onHideCols (hideCols) {
		setHash (this, {[this.props.id]: {hideCols}});
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
			me.setState ({loading: true});
		
			await timeout (100);
			
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
			
			if (!me.state.hideCols.length) {
				state.cols.forEach (col => {
					if (col.area === 0) {
						me.state.hideCols.push (col.code);
					}
				});
			}
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
			state.pageNum = state.length / state.pageRecs | 0;
			
			if (state.length % state.pageRecs) {
				state.pageNum ++;
			}
			for (let i = 0; i < state.cols.length; i ++) {
				let c = state.cols [i];
				
				if (c.type >= 1000) {
					let m = me.props.store.getModel (c.type);
					
					if (m.isDictionary ()) {
						c.recs = await me.props.store.getDict (c.type);
					}
				}
			}
		} catch (err) {
			state.error = err.message;
		}
		state.loading = false;
		
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
				if (child.props.onClickSelected && me.state.selected === null) {
					o.disabled = true;
				}
			}
			if (child.props.children) {
				o.children = me.renderChildren (child.props.children);
			}
			return React.cloneElement (child, o);
		});
	}
	
	renderPosition () {
		let me = this;
		let active = !!me.position.length || me.state.parent;
		
		return (
			<div className="mt-1 mb-1 border shadow-sm">
				<nav aria-label="breadcrumb">
					<ol className="breadcrumb">
						<li className={"breadcrumb-item" + (active ? " active" : "")} aria-current={active ? "page" : ""}>
							<button type="button" className="btn btn-link btn-sm" onClick={() => me.onFolderClick (null)} disabled={!active}><i className="fas fa-home" /></button>
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
	
	renderTableView () {
		let me = this;
		
		if (!me.state.cols.length) {
			return (<div />);
		}
		return (
			<table className="table table-hover table-striped table-bordered p-1 bg-white shadow-sm mt-1 mb-0 objectum-table">
				<thead className="thead-dark">
				<tr>
					{me.props.tree && <th><i className="far fa-folder-open ml-2" /></th>}
					{me.state.cols.map ((col, i) => {
						//if (col.area === 0) {
						if (me.state.hideCols.indexOf (col.code) > -1) {
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
							{me.props.tree && <td key={i + "-tree"}><button type="button" className="btn btn-primary btn-sm text-left treegrid-button" disabled={!child} onClick={() => me.onFolderClick (rec.id)}><i className="fas fa-folder" /> {child ? <span className="badge badge-info">{child}</span> : ""}</button></td>}
							{me.state.cols.map ((col, j) => {
								//if (col.area === 0) {
								if (me.state.hideCols.indexOf (col.code) > -1) {
									return;
								}
								return (
									<td key={i + "_" + j}><Cell store={me.props.store} value={rec [col.code]} col={col} rec={rec} /></td>
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
		let card = me.props.card;
		
		if (!me.colMap [card.image]) {
			return (<div />);
		}
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
							<div key={i} className="card my-1 bg-white shadow-sm" style={{width: "18rem"}}>
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
		let gridChildren = me.renderChildren (me.props.children);
		
		return (
			<div>
				{me.props.label && <h5 className="objectum-title ml-3">{i18n (me.props.label)}</h5>}
				{me.state.error && <div className="alert alert-danger" role="alert">{me.state.error}</div>}
				{me.state.mode != "images" && gridChildren && <div className="actions border p-1 bg-white shadow-sm">
					{gridChildren}
				</div>}

				{me.props.tree && me.renderPosition ()}
				
				{me.state.mode == "images" ? me.renderCardView () : me.renderTableView ()}
				
				{me.state.showFilters && <Filters cols={me.state.cols} store={me.props.store} onFilter={me.onFilter} filters={me.state.filters} />}

				{me.state.showCols && <GridColumns cols={me.state.cols} store={me.props.store} onHideCols={me.onHideCols} hideCols={me.state.hideCols} />}

				<div className="bg-white border shadow-sm p-1 mt-1">
					<div className="btn-toolbar" role="toolbar">
						<div className="objectum-5em">
							<div className="input-group">
								<select className="custom-select" value={me.state.pageRecs} id="pageRecs" onChange={me.onChange} data-tip={i18n ("Records on page")}>
									<option value="10">10</option>
									<option value="20">20</option>
									<option value="30">30</option>
									<option value="40">40</option>
									<option value="50">50</option>
								</select>
							</div>
						</div>
						<div className="btn-group mr-1" role="group">
							<button type="button" className="btn btn-link" disabled={me.state.page == 1} onClick={me.onFirst} data-tip={i18n ("First page")}>
								<i className="fas fa-angle-double-left"/>
							</button>
							<button type="button" className="btn btn-link" disabled={me.state.page == 1} onClick={me.onPrev} data-tip={i18n ("Previous page")}>
								<i className="fas fa-angle-left"/>
							</button>
						</div>
						<div className="objectum-5em">
							<div className="input-group mr-1">
								<input type="number" className="form-control" id="page" value={me.state.page} min="1" max={me.state.pageNum} onChange={me.onChange} data-tip={i18n ("Page")} />
							</div>
						</div>
						<div className="btn-group mr-1" role="group">
							<button type="button" className="btn btn-link" disabled={me.state.page >= me.state.pageNum} onClick={me.onNext} data-tip={i18n ("Next page")}>
								<i className="fas fa-angle-right"/>
							</button>
							<button type="button" className="btn btn-link" disabled={me.state.page >= me.state.pageNum} onClick={me.onLast} data-tip={i18n ("Last page")}>
								<i className="fas fa-angle-double-right" />
							</button>
							<span data-tip={i18n ("Refresh")}>
								{me.state.loading ?
									<span className="spinner-border spinner-border-sm text-primary refresh-btn-loading" role="status" aria-hidden="true"/> :
									<button type="button" className="btn btn-link" onClick={() => me.setState ({refresh: ! me.state.refresh})}>
										<i className="fas fa-sync" />
									</button>
								}
							</span>
							{!me.props.system && <button type="button" className="btn btn-link" onClick={me.onShowFilters}>
								<i className={`fas fa-filter ${me.state.showFilters ? "border-bottom border-primary" : ""}`} data-tip={i18n ("Filters")} />
							</button>}
							{!me.props.system && <button type="button" className="btn btn-link" onClick={me.onShowCols} data-tip={i18n ("Columns")}>
								<i className={`fas fa-eye ${me.state.showCols ? "border-bottom border-primary" : ""}`} />
							</button>}
							{me.props.card && <button type="button" className="btn btn-link" onClick={me.onImageMode} data-tip={i18n ("Images mode")}>
								<i className={`fas fa-camera ${me.state.mode == "images" ? "border-bottom border-primary" : ""}`} />
							</button>}
						</div>
					</div>
					<div>
						<small className="text-muted ml-3">
							{me.getInfo ()}
						</small>
					</div>
				</div>
				<ReactTooltip />
			</div>
		);
	}
};
Grid.displayName = "Grid";

export default Grid;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener, timeout, newId, createTooltip, removeTooltip} from "./helper";
import Cell from "./Cell";
import Filters from "./Filters";
import _ from "lodash";
import {i18n} from "./../i18n";
import GridColumns from "./GridColumns";
import TableForm from "./TableForm";
import Tooltip from "./Tooltip";
import Fade from "./Fade";
import {execute} from "objectum-client";

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
			showFilters: me.props.showFilters || false,
			dockFilters: me.props.dockFilters || "bottom",
			filters: me.props.filters || [],
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
		if (me.props.filters && me.props.filters.length) {
			me.state.showFilters = true;
			me.state.dockFilters = "top";
		}
		let id = `grid-${me.props.id}`;
		let data = JSON.parse (localStorage.getItem (id) || "{}");

		if (data.defaultFilter) {
			if (!data.filters) {
				localStorage.setItem (id, "");
			} else if (!data.filters [data.defaultFilter]) {
				delete data.defaultFilter;
				localStorage.setItem (id, JSON.stringify (data));
			} else {
				let filters = [];
				
				data.filters [data.defaultFilter].forEach (f => {
					if (f.column) {
						if ((f.operator && f.hasOwnProperty ("value")) || f.operator == "is null" || f.operator == "is not null") {
							filters.push ([f.column, f.operator, f.value]);
						}
						if (f.operator === "0" || f.operator === "1") {
							filters.push ([f.column, "=", f.operator]);
						}
					}
				});
				me.state.filters = filters;
				me.state.showFilters = true;
				me.state.dockFilters = "top";
			}
		}
		if (hash) {
			["page", "pageRecs", "selected", "parent", "showFilters", "dockFilters", "filters", "mode", "order", "showCols", "hideCols"].forEach (a => {
				if (hash.hasOwnProperty (a)) {
					me.state [a] = hash [a];
				}
			});
		}
		me.position = [];
		me.childMap = {};
		me.nodeMap = {};
		me.colMap = {};
		me.unmounted = false;
		
		me.onRowClick = me.onRowClick.bind (me);
		me.onFolderClick = me.onFolderClick.bind (me);
		me.onChange = me.onChange.bind (me);
		me.onFirst = me.onFirst.bind (me);
		me.onPrev = me.onPrev.bind (me);
		me.onNext = me.onNext.bind (me);
		me.onLast = me.onLast.bind (me);
		me.onShowFilters = me.onShowFilters.bind (me);
		me.onDockFilters = me.onDockFilters.bind (me);
		me.onShowCols = me.onShowCols.bind (me);
		me.onImageMode = me.onImageMode.bind (me);
		me.onEditMode = me.onEditMode.bind (me);
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
			["page", "pageRecs", "selected", "parent", "showFilters", "dockFilters", "filters", "mode", "order", "showCols", "hideCols"].forEach (a => {
				if (hash.hasOwnProperty (a) && JSON.stringify (hash [a]) !== JSON.stringify (me.state [a])) {
					state [a] = hash [a];
					
					if (a == "filters" && me.props.onFilters) {
						me.props.onFilters (_.map (hash [a], f => {
							return {
								col: f [0], oper: f [1], value: f [2]
							};
						}), hash [a]);
					}
				}
			});
		}
		if (!me.unmounted) {
			me.setState (state);
		}
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
			me.props.onSelect (me.state.recs [me.state.selected] ? me.state.recs [me.state.selected].id : null);
		}
	}
	
	componentWillUnmount () {
		removeHashListener (this, this.hashChange);
		this.unmounted = true;
	}
	
	onRowClick (row) {
		setHash (this, {[this.props.id]: {selected: row}});
	}
	
	onFolderClick (id) {
		setHash (this, {[this.props.id]: {parent: id, selected: null, page: 1}});
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
		setHash (this, {[this.props.id]: {page: 1, selected: null}});
	}
	
	onPrev () {
		setHash (this, {[this.props.id]: {page: Number (this.state.page) - 1, selected: null}});
	}
	
	onLast () {
		setHash (this, {[this.props.id]: {page: this.state.pageNum, selected: null}});
	}
	
	onNext () {
		setHash (this, {[this.props.id]: {page: Number (this.state.page) + 1, selected: null}});
	}
	
	onShowFilters () {
		setHash (this, {[this.props.id]: {showFilters: !this.state.showFilters}});
	}
	
	onDockFilters () {
		setHash (this, {[this.props.id]: {dockFilters: this.state.dockFilters == "bottom" ? "top" : "bottom"}});
	}
	
	onShowCols () {
		setHash (this, {[this.props.id]: {showCols: !this.state.showCols}});
	}
	
	onImageMode () {
		setHash (this, {[this.props.id]: {mode: this.state.mode == "images" ? "table" : "images"}});
	}
	
	onEditMode () {
		setHash (this, {[this.props.id]: {mode: this.state.mode == "edit" ? "table" : "edit"}});
	}
	
	onFilter (filters) {
		setHash (this, {[this.props.id]: {filters, selected: null}});
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
		setHash (this, {[this.props.id]: {order, selected: null}});
	}
	
	prepareRequestOptions () {
		let me = this;
		let opts = {
			offset: (me.state.page - 1) * me.state.pageRecs,
			limit: me.state.pageRecs,
			filters: me.state.filters.filter (f => {
				if (f [2] == "" && f [1] != "is null" && f [1] != "is not null") {
					return false;
				}
				return true;
			})
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
		return opts;
	}
	
	async load () {
		let me = this;
		let state = {
			pageRecs: me.state.pageRecs
		};
		try {
			if (me.unmounted) {
				return;
			}
			me.setState ({loading: true});
			
			await timeout (100);
			
			let result = await me.props.store.getData (me.prepareRequestOptions ());
			
			state.recs = result.recs;
			state.cols = _.sortBy (result.cols, ["order", "name"]);
			me.position = result.position;
			state.length = result.length;
			
/*
			if (me.state.selected > state.recs.length - 1) {
				state.selected = null;
			}
*/
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
			if (me.props.card && me.state.mode == "images") {
				let imageProperty = me.props.store.getProperty (me.colMap [me.props.card.image].property);
				let imageModel = me.props.store.getModel (imageProperty.get ("type"));
				let model = me.props.store.getModel (imageProperty.get ("model"));
				
				state.imageRecs = [];
				
				if (state.recs.length) {
					let result = await me.props.store.getData ({
						model: imageModel.getPath (),
						offset: 0,
						limit: me.state.pageRecs * 3,
						filters: [[model.get ("code"), "in", _.map (state.recs, "id")]]
					});
					state.imageRecs = result.recs;
				}
			}
			state.pageNum = state.length / state.pageRecs | 0;
			
			if (state.length % state.pageRecs) {
				state.pageNum ++;
			}
			for (let i = 0; i < state.cols.length; i ++) {
				let c = state.cols [i];
				
				if (c.type >= 1000) {
					let m = me.props.store.getModel (c.type);
					
					if (m.isDictionary () || me.props.store.dict [m.getPath ()]) {
						c.recs = await me.props.store.getDict (c.type);
					}
				}
			}
		} catch (err) {
			state.error = err.message;
		}
		state.loading = false;
		
		if (me.props.onLoad) {
			me.props.onLoad (state);
		}
		if (!me.unmounted) {
			me.setState (state);
		}
	}

	getInfo () {
		let me = this;
		let pos = (me.state.page - 1) * me.state.pageRecs + 1;
		let pos2 = pos + Number (me.state.pageRecs) - 1;
		
		if (pos2 > me.state.length) {
			pos2 = me.state.length;
		}
		let s = `${i18n ("Records")}: ${pos}-${pos2} ${i18n ("of")} ${me.state.length} (${i18n ("Pages")}: ${me.state.pageNum})`;
		
		if (!pos2) {
			s = i18n ("empty");
		}
		return s;
	}

	renderChildren (children) {
		let me = this;
		
		return React.Children.map (children, child => {
			if (!child || !child.props) {
				return child;
			}
			let o = {
				store: me.props.store
			};
			if (child.type.displayName == "Action") {
/*
				if (child.props.onClick) {
					o.onClick = (opts) => {
						Object.assign (opts, {grid: me, store: me.props.store})
						
						if (child.props.selected) {
							opts.id = me.state.recs [me.state.selected].id;
						}
						child.props.onClick (opts);
					};
				} else if (child.props.onClickSelected) {
					o.onClick = (opts) => child.props.onClickSelected (Object.assign (opts, {id: me.state.recs [me.state.selected].id, grid: me, store: me.props.store}));
				}
*/
				o.onClick = async (opts) => {
					Object.assign (opts, {grid: me, store: me.props.store, parentId: me.props.parentId, parentModel: me.props.parentModel})
					
					if (child.props.selected || child.props.onClickSelected) {
						opts.id = me.state.recs [me.state.selected].id;
					}
					let fn = child.props.onClick || child.props.onClickSelected;
					
					if (fn) {
						return await execute (fn, opts);
					}
				};
				if ((child.props.selected || child.props.onClickSelected) && me.state.selected === null) {
					o.disabled = true;
				}
				if (child.props.modalComponent && me.state.recs [me.state.selected]) {
					o.recordId = me.state.recs [me.state.selected].id;
					o.grid = me;
				}
			}
			if (child.type && child.type.displayName == "RemoveAction") {
				if (me.state.selected === null) {
					o.disabled = true;
				} else {
					o.removeId = me.state.recs [me.state.selected] && me.state.recs [me.state.selected].id;
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
			<div className="p-1 border-top">
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

	visibleColNum () {
		let me = this;
		let n = 0;
		
		me.state.cols.forEach (col => {
			if (me.state.hideCols.indexOf (col.code) > - 1 || me.props.groupCol == col.code) {
				return;
			}
			n ++;
		});
		return n;
	}
	
	renderTableRows () {
		let me = this;
		let rows = [];
		let prevGroupColValue = null;
		
		me.state.recs.forEach ((rec, i) => {
			let child = me.childMap [rec.id];
			
			if (me.props.groupCol) {
				if (rec [me.props.groupCol] != prevGroupColValue) {
					rows.push (
						<tr key={newId ()} className="table-secondary">
							<td
								key={newId ()}
								className="align-top text-left"
								colSpan={me.visibleColNum ()}
							>
								<Cell
									store={me.props.store}
									value={rec [me.props.groupCol]}
									col={me.colMap [me.props.groupCol]}
									rec={rec}
									maxStrLen={me.props.maxStrLen}
								/>
							</td>
						</tr>
					);
				}
				prevGroupColValue = rec [me.props.groupCol];
			}
			let row = (
				<tr key={i} onClick={() => me.onRowClick (i)} className={me.state.selected == i ? "table-primary" : ""}>
					{me.props.tree && <td key={i + "-tree"} className="align-top"><button type="button" className="btn btn-primary btn-sm text-left treegrid-button" disabled={!child} onClick={() => me.onFolderClick (rec.id)}><i className="fas fa-folder" /> {child ? <span className="badge badge-info">{child}</span> : ""}</button></td>}
					{me.state.cols.map ((col, j) => {
						if (me.state.hideCols.indexOf (col.code) > -1 || me.props.groupCol == col.code) {
							return;
						}
						return (
							<td key={i + "_" + j} className="align-top"><Cell store={me.props.store} value={rec [col.code]} col={col} rec={rec} /></td>
						);
					})}
				</tr>
			);
			if (me.props.onTableRow || me.props.onRenderRow) {
				row = (me.props.onTableRow || me.props.onRenderRow) ({row, rec, store: me.props.store, grid: me});
			}
			rows.push (row);
		});
		return rows;
	}
	
	renderTableView () {
		let me = this;
		
		if (!me.state.cols.length) {
			return (<div />);
		}
		if (me.props.onRenderTable) {
			return me.props.onRenderTable ({grid: me, cols: me.state.cols, colMap: me.colMap, recs: me.state.recs, store: me.props.store});
		}
		return (
			<div className="p-1 border-top">
				<table className="table table-hover table-bordered table-striped table-sm mb-0 p-1 objectum-table">
					<thead className="bg-info text-white">
					<tr>
						{me.props.tree && <th className="align-top"><i className="far fa-folder-open ml-2" /></th>}
						{me.state.cols.map ((col, i) => {
							if (me.state.hideCols.indexOf (col.code) > -1 || me.props.groupCol == col.code) {
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
								<th key={i} scope="col" className={cls + " align-top"}>
									{(me.props.system || me.props.groupCol || !col.model) ?
										<div>{name}</div> :
										<div className={orderClass} onClick={() => me.onOrder (col.code)}>{name}</div>
									}
								</th>
							);
						})}
					</tr>
					</thead>
					<tbody>
					{me.renderTableRows ()}
					</tbody>
				</table>
			</div>
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
							<div key={i} className="card my-1" style={{width: "18rem"}}>
								<img src={smallImage} className="card-img-top" alt="..." />
								<div className="card-body">
									<h5 className="card-title">{rec [card.title]}</h5>
									<p className="card-text">{text}</p>
									<button className="btn btn-primary btn-sm" onClick={() => card.onEdit (rec.id)}><i className="fas fa-edit mr-2" />{i18n ("Edit")}</button>
									<a target="_blank" rel="noopener noreferrer" href={bigImage} className="ml-4">{i18n ("Image")}</a>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
	
	renderEditView () {
		let me = this;
		
		if (!me.colMap ["id"]) {
			return (<div />);
		}
		let model = me.props.store.getModel (me.colMap ["id"].model);
/*
		let properties = [];
		
		me.state.cols.forEach (col => {
			if (model.properties [col.code] && col.area == 1 && me.state.hideCols.indexOf (col.code) == -1) {
				properties.push (col.code);
			}
		});
*/
		return (
			<TableForm
				store={me.props.store}
				model={model.getPath ()}
				editable={me.props.editable}
				recs={me.state.recs}
				cols={me.state.cols}
				hideCols={me.state.hideCols}
				colMap={me.colMap}
				onSave={me.props.onSave}
				groupCol={me.props.groupCol}
			/>
		);
	}

	renderToolbar () {
		let me = this;
		
		if (me.state.mode == "edit") {
			return (
				<div className="border-top p-1">
					<div className="btn-toolbar" role="toolbar">
						<div className="btn-group mr-1" role="group">
							{! me.props.system && <button type="button" className="btn btn-link" onClick={me.onEditMode} data-tip={i18n ("Edit mode")}>
								{i18n ("Return")}
							</button>}
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="border-top p-1">
					<div className="btn-toolbar" role="toolbar">
						<div className="btn-group mr-1" role="group">
							<Tooltip label={i18n ("First page")}>
								<button type="button" className="btn btn-link btn-sm" disabled={me.state.page == 1} onClick={me.onFirst}>
									<i className="fas fa-angle-double-left"/>
								</button>
							</Tooltip>
							<Tooltip label={i18n ("Previous page")}>
								<button type="button" className="btn btn-link btn-sm" disabled={me.state.page == 1} onClick={me.onPrev}>
									<i className="fas fa-angle-left"/>
								</button>
							</Tooltip>
						</div>
						<div className="objectum-5em">
							<div className="input-group mr-1">
								<Tooltip label={i18n ("Page")}>
									<input type="number" className="form-control form-control-sm" id="page" value={me.state.page} min="1" max={me.state.pageNum} onChange={me.onChange} />
								</Tooltip>
							</div>
						</div>
						<div className="btn-group mr-1" role="group">
							<Tooltip label={i18n ("Next page")}>
								<button type="button" className="btn btn-link btn-sm" disabled={me.state.page >= me.state.pageNum} onClick={me.onNext}>
									<i className="fas fa-angle-right"/>
								</button>
							</Tooltip>
							<Tooltip label={i18n ("Last page")}>
								<button type="button" className="btn btn-link btn-sm" disabled={me.state.page >= me.state.pageNum} onClick={me.onLast}>
									<i className="fas fa-angle-double-right"/>
								</button>
							</Tooltip>
							<span data-tip={i18n ("Refresh")}>
									{me.state.loading ?
										<span className="spinner-border objectum-spinner text-primary mt-1 mx-1" role="status" aria-hidden="true"/> :
										<Tooltip label={i18n ("Refresh")}>
											<button type="button" className="btn btn-link btn-sm" onClick={() => me.setState ({refresh: ! me.state.refresh})}>
												<i className="fas fa-sync"/>
											</button>
										</Tooltip>
									}
								</span>
							{! me.props.system && <Tooltip label={i18n ("Filters")}><button type="button" className="btn btn-link btn-sm" onClick={me.onShowFilters}>
								<i className={`fas fa-filter ${me.state.showFilters ? "border-bottom border-primary" : ""}`} data-tip={i18n ("Filters")}/>
							</button></Tooltip>}
							{! me.props.system && <Tooltip label={i18n ("Columns")}><button type="button" className="btn btn-link btn-sm" onClick={me.onShowCols} data-tip={i18n ("Columns")}>
								<i className={`fas fa-eye ${me.state.showCols ? "border-bottom border-primary" : ""}`}/>
							</button></Tooltip>}
							{! me.props.system && me.props.editable && <Tooltip label={i18n ("Edit mode")}><button type="button" className="btn btn-link btn-sm" onClick={me.onEditMode}>
								<i className={`fas fa-edit ${me.state.mode == "edit" ? "border-bottom border-primary" : ""}`} />
							</button></Tooltip>}
							{me.props.card && <Tooltip label={i18n ("Images mode")}><button type="button" className="btn btn-link btn-sm" onClick={me.onImageMode} data-tip={i18n ("Images mode")}>
								<i className={`fas fa-camera ${me.state.mode == "images" ? "border-bottom border-primary" : ""}`}/>
							</button></Tooltip>}
						</div>
						<div className="objectum-5em">
							<div className="input-group">
								<Tooltip label={i18n ("Records on page")}>
									<select className="custom-select custom-select-sm" value={me.state.pageRecs} id="pageRecs" onChange={me.onChange}>
										<option value="10">10</option>
										<option value="20">20</option>
										<option value="30">30</option>
										<option value="40">40</option>
										<option value="50">50</option>
									</select>
								</Tooltip>
							</div>
						</div>
					</div>
					<div>
						<small className="text-muted ml-1">
							{me.getInfo ()}
						</small>
					</div>
				</div>
			);
		}
	}
	
	render () {
		let me = this;
		let gridChildren = me.renderChildren (me.props.children);
		let filters =
			<div className="border-top">
				<Filters
					cols={me.state.cols.filter (col => !!col.model)}
					store={me.props.store}
					onFilter={me.onFilter}
					filters={me.state.filters}
					onDockFilters={me.onDockFilters}
					dockFilters={me.state.dockFilters}
					gridId={me.props.id}
				/>
			</div>
		;
		
		return (
			<Fade><div className={me.props.className}>
				{me.props.label && <div className="text-white bg-info py-1">
					<strong className="ml-2">{i18n (me.props.label)}</strong>
				</div>}
				<div className="border">
					{me.state.error && <div className="alert alert-danger" role="alert">{me.state.error}</div>}
					{me.state.mode == "table" && gridChildren && <div className="pl-1 pt-1">
						{gridChildren}
					</div>}
	
					{me.props.tree && me.renderPosition ()}
					
					{me.state.showFilters && me.state.dockFilters == "top" && me.state.mode != "edit" && filters}
					
					{me.state.mode == "images" ? me.renderCardView () : (me.state.mode == "edit" ? me.renderEditView () : me.renderTableView ())}
					
					{me.state.showFilters && me.state.dockFilters == "bottom" && me.state.mode != "edit" && filters}
					
					{me.state.showCols && me.state.mode != "edit" && <div className="border-top">
						<GridColumns
							cols={me.state.cols}
							store={me.props.store}
							onHideCols={me.onHideCols}
							hideCols={me.state.hideCols}
						/>
					</div>}
					{!(me.props.smartHideToolbar && (me.state.length - me.state.pageRecs < 0)) && me.renderToolbar ()}
				</div>
			</div></Fade>
		);
	}
};
Grid.displayName = "Grid";

export default Grid;

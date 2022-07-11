/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener, timeout, newId} from "../modules/common";
import FileField from "./FileField";
import Action from "./Action";
import Cell from "./Cell";
import Filters from "./Filters";
import Loading from "./Loading";
import _sortBy from "lodash.sortby";
import _filter from "lodash.filter";
import _map from "lodash.map";
import {i18n} from "../i18n";
import GridColumns from "./GridColumns";
import TableForm from "./TableForm";
import Fade from "./Fade";
import PageTitle from "./PageTitle";
import {execute} from "objectum-client";
import ImportCSV from "./ImportCSV";

export default class Grid extends Component {
	constructor (props) {
		super (props);

		let hash = getHash (this) [this.props.id];

		this.state = {
			loading: false,
			refresh: false,
			page: 1,
			pageRecs: this.props.pageRecs || 20,
			selected: null,
			showFilters: this.props.showFilters || false,
			dockFilters: this.props.dockFilters || "bottom",
			filters: this.props.filters || [],
			order: [],
			parent: null,
			mode: this.props.mode || "table",
			cols: [],
			recs: [],
			imageRecs: [],
			showCols: false,
			hideCols: [],
			pageNum: 1,
			inlineActions: this.props.hasOwnProperty ("inlineActions") ? this.props.inlineActions : true,
		};
		if (!this.hasInlineActions (this.props.children)) {
			this.state.inlineActions = false;
		}
		if (this.props.filters && this.props.filters.length) {
			this.state.showFilters = true;
			this.state.dockFilters = "top";
		}
		if (this.props.id) {
			let id = `grid-${this.props.id}`;
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
					this.state.filters = filters;
					this.state.showFilters = true;
					this.state.dockFilters = "top";
				}
			}
			if (data.hideCols) {
				this.state.hideCols = data.hideCols;
			}
		}
		if (hash) {
			["page", "pageRecs", "selected", "parent", "showFilters", "dockFilters", "filters", "mode", "order", "showCols", "hideCols"].forEach (a => {
				if (hash.hasOwnProperty (a)) {
					this.state [a] = hash [a];
				}
			});
		}
		this.position = [];
		this.childMap = {};
		this.nodeMap = {};
		this.colMap = {};
		this.unmounted = false;
	}

	hashChange = () => {
		let hash = getHash (this) [this.props.id];
		let state = {};

		if (hash) {
			if (!hash.hasOwnProperty ("parent")) {
				hash.parent = null;
			}
			["page", "pageRecs", "selected", "parent", "showFilters", "dockFilters", "filters", "mode", "order", "showCols", "hideCols"].forEach (a => {
				if (hash.hasOwnProperty (a) && JSON.stringify (hash [a]) !== JSON.stringify (this.state [a])) {
					state [a] = hash [a];

					if (a == "filters" && this.props.onFilters) {
						this.props.onFilters (_map (hash [a], f => {
							return {
								col: f [0], oper: f [1], value: f [2]
							};
						}), hash [a]);
					}
				}
			});
		}
		if (!this.unmounted) {
			this.setState (state);
		}
	}

	async componentDidMount () {
		addHashListener (this, this.hashChange);

		await this.load ();

		let selected = this.state.selected;
		let parent = this.state.parent;

		if (parent !== null && this.props.onSelectParent) {
			this.props.onSelectParent (parent);
		}
		if (selected !== null && this.props.onSelect) {
			this.props.onSelect (this.state.recs [selected] && this.state.recs [selected].id);
		}
	}

	async componentDidUpdate (prevProps, prevState) {
		let needRefresh = false;

		["refresh", "params", "query", "model"].forEach (a => {
			if (JSON.stringify (prevProps [a]) !== JSON.stringify (this.props [a])) {
				needRefresh = true;
			}
		});
		["refresh", "page", "pageRecs", "filters", "order", "parent", "mode"].forEach (a => {
			if (JSON.stringify (prevState [a]) !== JSON.stringify (this.state [a])) {
				needRefresh = true;
			}
		});
		if (needRefresh) {
			await this.load ();
		}
		if (prevState.parent !== this.state.parent && this.props.onSelectParent) {
			this.props.onSelectParent (this.state.parent);
		}
		if (prevState.selected !== this.state.selected && this.props.onSelect) {
			this.props.onSelect (this.state.recs [this.state.selected] ? this.state.recs [this.state.selected].id : null);
		}
	}

	componentWillUnmount () {
		removeHashListener (this, this.hashChange);
		this.unmounted = true;
	}

	onRowClick = (row) => {
		setHash (this, {[this.props.id]: {selected: row}});
	}

	onFolderClick = (id) => {
		setHash (this, {[this.props.id]: {parent: id, selected: null, page: 1}});
	}

	onChange = (val) => {
		let id = val.target.id;
		let v = val.target.value;

		if (val.target.type === "checkbox") {
			v = val.target.checked;
		}
		if (id == "page" && !v) {
			v = 1;
		}
		if (id == "pageRecs" || id == "page") {
			setHash (this, {[this.props.id]: {[id]: v}});
		}
	}

	onFirst = () => {
		setHash (this, {[this.props.id]: {page: 1, selected: null}});
	}

	onPrev = () => {
		setHash (this, {[this.props.id]: {page: Number (this.state.page) - 1, selected: null}});
	}

	onNext = () => {
		setHash (this, {[this.props.id]: {page: Number (this.state.page) + 1, selected: null}});
	}

	onLast = () => {
		setHash (this, {[this.props.id]: {page: this.state.pageNum, selected: null}});
	}

	onShowFilters = () => {
		setHash (this, {[this.props.id]: {showFilters: !this.state.showFilters}});
	}

	onDockFilters = () => {
		setHash (this, {[this.props.id]: {dockFilters: this.state.dockFilters == "bottom" ? "top" : "bottom"}});
	}

	onShowCols = () => {
		setHash (this, {[this.props.id]: {showCols: !this.state.showCols}});
	}

	onImageMode = () => {
		setHash (this, {[this.props.id]: {mode: this.state.mode == "images" ? "table" : "images"}});
	}

	onEditMode = () => {
		setHash (this, {[this.props.id]: {mode: this.state.mode == "edit" ? "table" : "edit"}});
	}

	onFilter = (filters) => {
		setHash (this, {[this.props.id]: {filters, selected: null}});
	}

	onHideCols = (hideCols) => {
		if (this.props.id) {
			let id = `grid-${this.props.id}`;
			let data = JSON.parse (localStorage.getItem (id) || "{}");
			data.hideCols = hideCols;
			localStorage.setItem (id, JSON.stringify (data));
		}
		setHash (this, {[this.props.id]: {hideCols}});
	}

	onOrder = (colCode) => {
		let order = [...this.state.order];

		if (this.state.order [0] === colCode) {
			if (this.state.order [1] == "asc") {
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
		let opts = {
			offset: (this.state.page - 1) * this.state.pageRecs,
			limit: this.state.pageRecs,
			filters: this.state.filters.filter (f => {
				if (f [2] == "" && f [1] != "is null" && f [1] != "is not null") {
					return false;
				}
				return true;
			})
		};
		if (this.props.tree) {
			opts.parent = this.state.parent;
		}
		if (this.props.query) {
			opts.query = this.props.query;
		}
		if (this.props.model) {
			opts.model = this.props.model;
		}
		if (this.state.order.length) {
			opts.order = this.state.order;
		}
		if (this.props.params) {
			opts = {...opts, ...this.props.params};
		}
		return opts;
	}

	async load () {
		let state = {
			pageRecs: this.state.pageRecs
		};
		try {
			if (this.unmounted) {
				return;
			}
			this.setState ({loading: true});

			await timeout (100);

			let result = await this.props.store.getData (this.prepareRequestOptions ());

			state.recs = result.recs;
			state.cols = _sortBy (result.cols, ["order", "name"]);
			this.position = result.position;
			state.length = result.length;

			this.childMap = {};

			if (this.props.tree) {
				result.childs.forEach (rec => {
					this.childMap [rec.parent] = rec.num;
				});
				result.recs.forEach (rec => {
					this.nodeMap [rec.id] = rec;
				});
			}
			this.colMap = {};

			state.cols.forEach (col => this.colMap [col.code] = col);

			if (!this.state.hideCols.length) {
				state.cols.forEach (col => {
					if (col.area === 0) {
						this.state.hideCols.push (col.code);
					}
				});
			}
			if (this.props.card && this.state.mode == "images") {
				let imageProperty = this.props.store.getProperty (this.colMap [this.props.card.image].property);
				let imageModel = this.props.store.getModel (imageProperty.get ("type"));
				let model = this.props.store.getModel (imageProperty.get ("model"));

				state.imageRecs = [];

				if (state.recs.length) {
					let result = await this.props.store.getData ({
						model: imageModel.getPath (),
						offset: 0,
						limit: this.state.pageRecs * 3,
						filters: [[model.get ("code"), "in", _map (state.recs, "id")]]
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
					let m = this.props.store.getModel (c.type);

					if (m.isDictionary () || this.props.store.dict [m.getPath ()]) {
						c.recs = await this.props.store.getDict (c.type);
					}
				}
			}
		} catch (err) {
			state.error = err.message;
		}
		state.loading = false;

		if (this.props.onLoad) {
			this.props.onLoad (state);
		}
		if (!this.unmounted) {
			this.setState (state);

			if (this.state.page > state.pageNum) {
				setHash (this, {[this.props.id]: {page: 1, selected: null}});
			}
		}
	}

	getInfo () {
		let pos = (this.state.page - 1) * this.state.pageRecs + 1;
		let pos2 = pos + Number (this.state.pageRecs) - 1;

		if (pos2 > this.state.length) {
			pos2 = this.state.length;
		}
		let s = `${i18n ("Records")}: ${pos}-${pos2} ${i18n ("of")} ${this.state.length} (${i18n ("Pages")}: ${this.state.pageNum})`;

		if (this.state.pageNum == 1) {
			s = `${i18n ("Records")}: ${this.state.length || ""}`;
		}
		if (!pos2) {
			s = i18n ("empty");
		}
		return s;
	}

	renderChildren (children) {
		return React.Children.map (children, child => {
			if (!child || !child.props) {
				return child;
			}
			let o = {
				store: this.props.store
			};
			if (child.type.displayName == "Action") {
				if (this.state.inlineActions && (child.props.onClickSelected || child.props.selected)) {
					return <div />;
				}
				o.onClick = async (opts) => {
					Object.assign (opts, {grid: this, store: this.props.store, parentId: this.props.parentId, parentModel: this.props.parentModel})

					if (child.props.selected || child.props.onClickSelected) {
						opts.id = this.state.recs [this.state.selected].id;
					}
					let fn = child.props.onClick || child.props.onClickSelected;

					if (fn) {
						return await execute (fn, opts);
					}
				};
				if ((child.props.selected || child.props.onClickSelected) && this.state.selected === null) {
					o.disabled = true;
				}
				if ((child.props.modalComponent || child.props.popupComponent) && this.state.recs [this.state.selected]) {
					o.recordId = this.state.recs [this.state.selected].id;
					o.grid = this;
				}
			}
			if (child.type && child.type.displayName == "RemoveAction") {
				if (this.state.selected === null) {
					o.disabled = true;
				} else {
					o.removeId = this.state.recs [this.state.selected] && this.state.recs [this.state.selected].id;
				}
			}
			if (child.props.children) {
				o.children = this.renderChildren (child.props.children);
			}
			return React.cloneElement (child, o);
		});
	}

	renderPosition () {
		let active = !!this.position.length || this.state.parent;

		return <div className="p-1 border-top">
			<nav aria-label="breadcrumb">
				<ol className="breadcrumb m-0 p-1">
					<li className={"breadcrumb-item" + (active ? " active" : "")} aria-current={active ? "page" : ""}>
						<button type="button" className="btn btn-link btn-sm p-0" onClick={() => this.onFolderClick (null)} disabled={!active}><i className="fas fa-home" /></button>
					</li>
					{this.position.map ((rec, i) => {
						active = i < this.position.length - 1;

						return <li key={i} className={"breadcrumb-item" + (active ? " active" : "")} aria-current={active ? "page" : ""}>
							<button type="button" className="btn btn-link btn-sm p-0" onClick={() => this.onFolderClick (rec.id)} disabled={!active}>{rec.name || "-"}</button>
						</li>;
					})}
				</ol>
			</nav>
		</div>;
	}

	visibleColNum () {
		let n = 0;

		this.state.cols.forEach (col => {
			if (this.state.hideCols.indexOf (col.code) > - 1 || this.props.groupCol == col.code) {
				return;
			}
			n ++;
		});
		if (this.state.inlineActions) {
			n ++;
		}
		return n;
	}

	hasInlineActions (children) {
		let has = false;

		React.Children.forEach (children, child => {
			if (!child || !child.props) {
				return;
			}
			if (child && child.type && child.type.displayName == "Action" && (child.props.onClickSelected || child.props.selected)) {
				has = true;
			}
			if (child.props.children) {
				if (this.hasInlineActions (child.props.children)) {
					has = true;
				}
			}
		});
		return has;
	}

	renderInlineActions (children, id, rowIdx, count) {
		let actions = [];

		React.Children.forEach (children, (child, i) => {
			if (!child || !child.props) {
				return;
			}
			if (child && child.type && child.type.displayName == "Action") {
				if (child.props.onClickSelected || child.props.selected) {
					let opts = {...child.props};

					if (child.props.modalComponent || child.props.popupComponent) {
						opts.recordId = id;
						opts.grid = this;
					}
					if (this.state.selected != rowIdx && child.props.disabledControlled) {
						opts.disabled = true;
					}
					actions.push (<Action
						{...opts}
/*
						key={`${id}-${count ++}`}
*/
						key={newId ()}
						store={this.props.store}
						label=""
						title={child.props.label}
						btnClassName={child.props.btnClassName || `btn btn-sm ${child.props.label == i18n ("Remove") ? "btn-outline-danger" : "btn-outline-primary"} mr-1`}
						onClick={async (opts) => {
							Object.assign (opts, {grid: this, store: this.props.store, parentId: this.props.parentId, parentModel: this.props.parentModel})
							opts.id = id;

							return await execute (child.props.onClickSelected || child.props.onClick, opts);
						}}
					/>);
				}
			}
			if (child.props.children) {
				actions = [...actions, ...this.renderInlineActions (child.props.children, id, rowIdx, count)];
			}
		});
		return actions;
	}

	renderTableRows () {
		let rows = [];
		let prevGroupColValue = null;

		this.state.recs.forEach ((rec, i) => {
			let child = this.childMap [rec.id];

			if (this.props.groupCol) {
				if (rec [this.props.groupCol] != prevGroupColValue) {
					rows.push (<tr key={newId ()} className="table-secondary">
						<td
							key={newId ()}
							className="align-top text-left"
							colSpan={this.visibleColNum ()}
						>
							<Cell
								store={this.props.store}
								value={rec [this.props.groupCol]}
								col={this.colMap [this.props.groupCol]}
								rec={rec}
								maxStrLen={this.props.maxStrLen}
								hideSeconds={this.props.hideSeconds}
							/>
						</td>
					</tr>);
				}
				prevGroupColValue = rec [this.props.groupCol];
			}
			let row = <tr key={i} onClick={() => this.onRowClick (i)} className={this.state.selected == i ? "table-primary" : ""}>
				{this.state.inlineActions && <td key={i + "-actions"} className="align-top"><div className="d-flex">{this.renderInlineActions (this.props.children, rec.id, i, 1)}</div></td>}
				{this.props.tree && <td key={i + "-tree"} className="align-top"><button type="button" className="btn btn-sm btn-primary text-left treegrid-button" disabled={!child} onClick={() => this.onFolderClick (rec.id)}><i className="fas fa-folder" /> {child ? <span className="badge badge-info">{child}</span> : ""}</button></td>}
				{this.state.cols.map ((col, j) => {
					if (this.state.hideCols.indexOf (col.code) > -1 || this.props.groupCol == col.code) {
						return;
					}
					let cell = <Cell store={this.props.store} value={rec [col.code]} col={col} rec={rec} showImages={this.props.showImages} hideSeconds={this.props.hideSeconds} />;

					if (this.props.onRenderCell) {
						cell = this.props.onRenderCell ({cell, col, rec});
					}
					return (
						<td key={i + "_" + j} className="align-top">{cell}</td>
					);
				})}
			</tr>;
			if (this.props.onTableRow || this.props.onRenderRow) {
				row = (this.props.onTableRow || this.props.onRenderRow) ({row, rec, store: this.props.store, grid: this});
			}
			rows.push (row);
		});
		return rows;
	}

	getHeaderRows (cols) {
		let rowNum = (function (cols) {
			let r = 0;

			for (let i = 0; i < cols.length; i ++) {
				let a = cols [i].split (":");

				if (a.length > r) {
					r = a.length;
				}
			}
			return r;
		}) (cols);
		// init matrix
		let m = [];

		for (let i = 0; i < cols.length; i ++) {
			let a = cols [i].split (":");

			for (let j = 0; j < a.length; j ++) {
				a [j] = {text: a [j].trim (), colspan: 1, rowspan: 1};
			}
			for (let j = 0, len = rowNum - a.length; j < len; j ++) {
				a.push ({text: null, colspan: 1, rowspan: 1});
			}
			m.push (a);
		}
		// merge cols
		for (let i = 1; i < cols.length; i ++) {
			for (let j = 0; j < rowNum; j ++) {
				let ref = m [i - 1][j].hasOwnProperty ('ref') ? m [i - 1][j].ref :  i - 1;

				if (m [i][j].text != null && m [i][j].text == m [ref][j].text) {
					m [ref][j].colspan ++;
					m [i][j].ref = ref;
				}
			}
		}
		// merge rows
		for (let i = 0; i < cols.length; i ++) {
			for (let j = 1; j < rowNum; j ++) {
				let refR = m [i][j - 1].hasOwnProperty ('refR') ? m [i][j - 1].refR : j - 1;

				if (m [i][j].text == null) {
					m [i][refR].rowspan ++;
					m [i][j].refR = refR;
				}
			}
		}
		// rows
		let rows = [];

		for (let i = 0; i < rowNum; i ++) {
			let cells = [], index = 1;

			for (let j = 0; j < cols.length; j ++) {
				if (m [j][i].hasOwnProperty ('refR')) {
					index += m [j][i].colspan;
					continue;
				}
				if (!m [j][i].hasOwnProperty ('ref')) {
					cells.push ({
						text: m [j][i].text,
						colspan: m [j][i].colspan,
						rowspan: m [j][i].rowspan,
						index: index
					});
					index += m [j][i].colspan;
				}
			}
			rows.push (cells);
		}
		return rows;
	}

	renderTableView ({gridChildren}) {
		if (!this.state.cols.length) {
			return (<div />);
		}
		if (this.props.onRenderTable) {
			return this.props.onRenderTable ({grid: this, cols: this.state.cols, colMap: this.colMap, recs: this.state.recs, store: this.props.store});
		}
		let cols = this.state.cols.filter (col => this.state.hideCols.indexOf (col.code) == -1);
		let rows = this.getHeaderRows (cols.map (col => col.name));

		return <div className={`p-1 ${gridChildren ? "border-top" : ""}`}>
			<table className="table table-hover table-bordered table-striped table-sm mb-0 p-1 objectum-table">
				<thead className="bg-info text-white">
				{rows.map ((row, i) => {
					return <tr key={i}>
						{(this.state.inlineActions && !i) ? <th className="align-top" rowSpan={rows.length}>{i18n ("Actions")}</th> : null}
						{(this.props.tree && !i) ? <th className="align-top" rowSpan={rows.length}><i className="far fa-folder-open ml-2" /></th> : null}
						{row.map (o => {
							//let col = this.state.cols [o.index - 1];
							let col = cols [o.index - 1];

							if (this.state.hideCols.indexOf (col.code) > -1 || this.props.groupCol == col.code) {
								if (o.colspan == 1) {
									return;
								}
								o.colspan --;
							}
							let cls = "";
							let f = this.state.filters.find (f => {
								if (f [0] == col.code) {
									return true;
								}
							});
							let name = i18n (o.text);

							if (f) {
								cls = "font-italic";
							}
							let orderClass = "sort";

							if (col.code === this.state.order [0]) {
								if (this.state.order [1] == "asc") {
									orderClass = "sort-up";
								} else {
									orderClass = "sort-down";
								}
							}
							return (
								<th key={o.index} scope="col" className={cls + " align-top"} colSpan={o.colspan} rowSpan={o.rowspan}>
									{(this.props.system || this.props.groupCol || !col.model || o.colspan > 1) ?
										<div>{name}</div> :
										<div className={orderClass} onClick={() => this.onOrder (col.code)}>{name}</div>
									}
								</th>
							);
						})}
					</tr>;
				})}
				</thead>
				<tbody>{this.renderTableRows ()}</tbody>
			</table>
		</div>;
	}

	renderCardView () {
		let card = this.props.card;

		if (!this.colMap [card.image]) {
			return (<div />);
		}
		let imageProperty = this.props.store.getProperty (this.colMap [card.image].property);
		let imageModel = this.props.store.getModel (imageProperty.get ("type"));
		let model = this.props.store.getModel (imageProperty.get ("model"));

		return <div className="row">
			{this.state.recs.map ((rec, i) => {
				let imageRecs = _filter (this.state.imageRecs, {[model.get ("code")]: rec.id});
				let smallImageRec = null, bigImageRec = null;

				imageRecs.forEach (rec => {
					if (!smallImageRec || rec.width < smallImageRec.width) {
						smallImageRec = rec;
					}
					if (!bigImageRec || rec.width > bigImageRec.width) {
						bigImageRec = rec;
					}
				});
				let smallImage = `${this.props.store.getUrl ()}/files/${smallImageRec.id}-${imageModel.properties ["photo"].get ("id")}-${smallImageRec ["photo"]}`;
				let bigImage = `${this.props.store.getUrl ()}/files/${bigImageRec.id}-${imageModel.properties ["photo"].get ("id")}-${bigImageRec ["photo"]}`;
				let text = [];

				card.text.forEach (code => {
					if (rec [code] !== null) {
						text.push (`${this.colMap [code].name}: ${rec [code]}`);
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
		</div>;
	}

	renderEditView () {
		if (!this.colMap ["id"]) {
			return (<div />);
		}
		let model = this.props.store.getModel (this.colMap ["id"].model);

		return <TableForm
			store={this.props.store}
			model={model.getPath ()}
			editable={this.props.editable}
			recs={this.state.recs}
			cols={this.state.cols}
			hideCols={this.state.hideCols}
			colMap={this.colMap}
			onSave={this.props.onSave}
			groupCol={this.props.groupCol}
		/>;
	}

	renderToolbar () {
		if (this.state.mode == "edit") {
			return <div className="border-top p-1">
				<div className="btn-toolbar" role="toolbar">
					<div className="btn-group mr-1" role="group">
						{! this.props.system && <button type="button" className="btn btn-link" onClick={this.onEditMode} data-tip={i18n ("Edit mode")}>
							{i18n ("Return")}
						</button>}
					</div>
				</div>
			</div>;
		} else {
			return <div className="border-top p-1">
				<div className="d-flex">
					{this.state.pageNum > 1 && <div className="d-flex">
						<button type="button" className="btn btn-link btn-sm" disabled={this.state.page == 1} onClick={this.onFirst} title={i18n ("First page")}>
							<i className="fas fa-angle-double-left"/>
						</button>
						<button type="button" className="btn btn-link btn-sm" disabled={this.state.page == 1} onClick={this.onPrev} title={i18n ("Previous page")}>
							<i className="fas fa-angle-left"/>
						</button>
						<input
							type="number"
							className="form-control form-control-sm"
							value={this.state.page}
							min="1"
							max={this.state.pageNum}
							onChange={this.onChange}
							id="page"
							title={i18n ("Page")}
							style={{width: "5em"}}
							autoComplete="off"
						/>
						<button type="button" className="btn btn-link btn-sm" disabled={this.state.page >= this.state.pageNum} onClick={this.onNext} title={i18n ("Next page")}>
							<i className="fas fa-angle-right"/>
						</button>
						<button type="button" className="btn btn-link btn-sm" disabled={this.state.page >= this.state.pageNum} onClick={this.onLast} title={i18n ("Last page")}>
							<i className="fas fa-angle-double-right"/>
						</button>
					</div>}
					<button
						type="button"
						className="btn btn-link btn-sm"
						onClick={() => this.setState ({refresh: ! this.state.refresh})}
						title={i18n ("Refresh")}
						disabled={this.state.loading}
					>
						{this.state.loading ?
							<span className="spinner-border spinner-border-sm text-primary" /> :
							<i className="fas fa-sync"/>
						}
					</button>
					{!this.props.system && <button type="button" className="btn btn-link btn-sm" onClick={this.onShowFilters} title={i18n ("Filters")}>
						<i className={`fas fa-filter ${this.state.showFilters ? "border-bottom border-primary" : ""}`} />
					</button>}
					{!this.props.system && <button type="button" className="btn btn-link btn-sm" onClick={this.onShowCols} title={i18n ("Columns")}>
						<i className={`fas fa-eye ${this.state.showCols ? "border-bottom border-primary" : ""}`} />
					</button>}
					{!this.props.system && this.props.importCSV && <Action
						btnClassName="btn btn-link btn-sm px-1"
						title={i18n ("Import csv")}
						modalComponent={ImportCSV}
						store={this.props.store}
						opts={this.props.importCSV}
					><i className="fas fa-file-import" /></Action>}
					{!this.props.system && <button type="button" className="btn btn-link btn-sm" onClick={this.onReport} title={i18n ("Export csv")}>
						<i className="fas fa-file-export" />
					</button>}
					{!this.props.system && this.props.editable && <button type="button" className="btn btn-link btn-sm" onClick={this.onEditMode} title={i18n ("Edit mode")}>
						<i className={`fas fa-edit ${this.state.mode == "edit" ? "border-bottom border-primary" : ""}`} />
					</button>}
					{this.props.card && <button type="button" className="btn btn-link btn-sm" onClick={this.onImageMode} data-tip={i18n ("Images mode")} title={i18n ("Images mode")}>
						<i className={`fas fa-camera ${this.state.mode == "images" ? "border-bottom border-primary" : ""}`} />
					</button>}
					{this.state.pageNum > 1 && <select
						className="custom-select custom-select-sm"
						value={this.state.pageRecs}
						id="pageRecs"
						onChange={this.onChange}
						title={i18n ("Records on page")}
						style={{width: "6em"}}
					>
						<option value="10">10</option>
						<option value="20">20</option>
						<option value="30">30</option>
						<option value="40">40</option>
						<option value="50">50</option>
					</select>}
				</div>
				<div>
					<small className="text-muted ml-1">
						{this.getInfo ()}
					</small>
				</div>
			</div>;
		}
	}

	onReport = async () => {
		let cols = this.state.cols.filter (col => {
			if (col.type >= 1000) {
				let m = this.props.store.getModel (col.type);
				if (this.props.store.dict [m.getPath ()]) {
					col.dict = this.props.store.dict [m.getPath ()];
				}
			}
			return col.area != 0;
		});
		let opts = Object.assign (this.prepareRequestOptions (), {offset: 0, limit: this.state.length});
		let recs = await this.props.store.getRecs (opts);

		let content = "\ufeff" + [
			cols.map (col => i18n (col.name)).join (";"),
			...recs.map (rec => {
				return cols.map (col => {
					let v = rec [col.code] || "";

					if (v && typeof (v) == "object" && v.getMonth) {
						v = v.toLocaleDateString ();
					}
					if (col.dict) {
						v = col.dict [v] ? col.dict [v].name : "";
					}
					if (v && typeof (v) == "string" && v.indexOf (";") > -1) {
						v = `"${v}"`
					}
					return v;
				}).join (";")
			})
		].join ("\n");

		let createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function () {};
		let blob = null;
		let mimeString = "application/octet-stream";

		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

		if (window.BlobBuilder) {
			let bb = new BlobBuilder ();
			bb.append (content);
			blob = bb.getBlob (mimeString);
		} else {
			blob = new Blob ([content], {type: mimeString});
		}
		let url = createObjectURL (blob);
		let a = document.createElement ("a");

		a.href = url;
		a.download = "report.csv";
		a.innerHTML = "download file";
		document.body.appendChild (a);
		a.click ();
	}

	render () {
		if (!this.props.store) {
			return <div className="alert alert-danger">store not exist</div>;
		}
		let gridChildren = this.renderChildren (this.props.children);
		let filters = <div className="border-top">
			<Filters
				cols={this.state.cols.filter (col => !!col.model)}
				store={this.props.store}
				onFilter={this.onFilter}
				filters={this.state.filters}
				onDockFilters={this.onDockFilters}
				dockFilters={this.state.dockFilters}
				gridId={this.props.id}
			/>
		</div>;

		return <Fade><div className={this.props.className}>
			<PageTitle label={this.props.label} />
			<div className="border bg-white">
				{this.state.error && <div className="alert alert-danger" role="alert">{this.state.error}</div>}
				{this.state.mode == "table" && gridChildren && <div className="pl-1 pt-1">
					{gridChildren}
				</div>}

				{this.props.tree && this.renderPosition ()}

				{this.state.showFilters && this.state.dockFilters == "top" && this.state.mode != "edit" && filters}

				{this.state.mode == "images" ? this.renderCardView () : (this.state.mode == "edit" ? this.renderEditView () : this.renderTableView ({gridChildren}))}

				{this.state.showFilters && this.state.dockFilters == "bottom" && this.state.mode != "edit" && filters}

				{this.state.showCols && this.state.mode != "edit" && <div className="border-top">
					<GridColumns
						cols={this.state.cols}
						store={this.props.store}
						onHideCols={this.onHideCols}
						hideCols={this.state.hideCols}
					/>
				</div>}
				{!(this.props.smartHideToolbar && (this.state.length - this.state.pageRecs < 0)) && this.renderToolbar ()}
			</div>
		</div></Fade>;
	}
};
Grid.displayName = "Grid";

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener} from "./helper";
import Cell from "./Cell";
import Filters from "./Filters";
import _ from "lodash";

class Grid extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.recs = [];
		me.cols = [];
		
		let page = 1;
		let pageRecs = me.props.pageRecs || 10;
		let selected = null;
		let showFilters = false;
		let filters = [];
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
		}
		me.state = {
			ready: false,
			page,
			pageNum: 1,
			pageRecs,
			selected,
			showFilters,
			filters
		};
		me.onRowClick = me.onRowClick.bind (me);
		me.onChange = me.onChange.bind (me);
		me.onFirst = me.onFirst.bind (me);
		me.onPrev = me.onPrev.bind (me);
		me.onNext = me.onNext.bind (me);
		me.onLast = me.onLast.bind (me);
		me.onShowFilters = me.onShowFilters.bind (me);
		me.hashChange = me.hashChange.bind (me);
		me.onFilter = me.onFilter.bind (me);
	}
	
	hashChange () {
		let me = this;
		let page = me.state.page;
		let pageRecs = me.state.pageRecs;
		let selected = me.state.selected;
		let showFilters = me.state.showFilters;
		let filters = me.state.filters;
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
			if (hash [me.props.id].filters && JSON.stringify (hash [me.props.id].filters) != JSON.stringify (me.state.filters)) {
				filters = hash [me.props.id].filters;
				ready = false;
			}
			if (hash [me.props.id].hasOwnProperty ("selected") && hash [me.props.id].selected != me.state.selected) {
				selected = hash [me.props.id].selected;
			}
			if (hash [me.props.id].hasOwnProperty ("showFilters") && hash [me.props.id].showFilters != me.state.showFilters) {
				showFilters = hash [me.props.id].showFilters;
			}
		}
		if (selected != me.state.selected && me.props.onSelect) {
			me.props.onSelect (me.recs [selected] && me.recs [selected].id);
		}
		me.setState ({page, pageRecs, selected, showFilters, filters, ready});
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
	
	onFilter (filters) {
		console.log (filters);
		setHash (this, {[this.props.id]: {filters}});
	}
	
	async load () {
		let me = this;
		let state = {
			pageRecs: me.state.pageRecs
		};
		
		try {
			let opts = {
				query: me.props.query,
				offset: (me.state.page - 1) * me.state.pageRecs,
				limit: me.state.pageRecs,
				filters: me.state.filters
			};
			if (me.props.params) {
				opts = {...opts, ...me.props.params};
			}
			let result = await me.props.store.getData (opts);
			
			me.recs = result.recs;
			me.cols = _.sortBy (result.cols, ["order", "name"]);
			me.length = result.length;
			
			let hash = getHash (me);
			
			if (me.props.id && hash [me.props.id]) {
				if (hash [me.props.id].page) {
					state.page = Number (hash [me.props.id].page);
				}
				if (hash [me.props.id].pageRecs) {
					state.pageRecs = Number (hash [me.props.id].pageRecs);
				}
			}
			state.pageNum = me.length / state.pageRecs | 0;
			
			if (me.length % state.pageRecs) {
				state.pageNum ++;
			}
			for (let i = 0; i < me.cols.length; i ++) {
				let c = me.cols [i];
				
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
		
		if (pos2 > me.length) {
			pos2 = me.length;
		}
		let s = `${pos}-${pos2} of ${me.length} records (${me.state.pageNum} pages)`;
		
		if (!pos2) {
			s = "empty";
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
					child.props.onClickSelected (me.recs [me.state.selected].id);
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
	
	componentWillReceiveProps (props) {
		let me = this;
		
		if (props.refresh !== me.props.refresh || JSON.stringify (props.params) != JSON.stringify (me.props.params)) {
			me.setState ({ready: false});
		}
	}
	
	init () {
		let me = this;
		
		if (!me.state.ready || me.initialized) {
			return;
		}
		me.initialized = true;
		
		let selected = me.state.selected;
		
		if (selected !== null && me.props.onSelect) {
			me.props.onSelect (me.recs [selected] && me.recs [selected].id);
		}
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
				{me.props.title && <h5>{me.props.title}</h5>}
				{me.state.error && <div className="alert alert-danger" role="alert">{me.state.error}</div>}
				<div>
					{gridChildren}
				</div>
				<table className="table table-hover border bg-white shadow-sm mt-1">
					<thead>
					<tr>
						{me.cols.map ((col, i) => {
							let cls = "";
							let f = me.state.filters.find (f => {
								if (f [0] == col.code) {
									return true;
								}
							});
							if (f) {
								cls = "text-primary";
							}
							return (
								<th key={i} scope="col" className={cls}>{col.name}</th>
							);
						})}
					</tr>
					</thead>
					<tbody>
						{me.recs.map ((rec, i) => {
							return (
								<tr key={i} onClick={() => me.onRowClick (i)} className={me.state.selected == i ? "table-primary" : ""}>
									{me.cols.map ((col, j) => {
										return (
											<td key={i + "_" + j}><Cell store={me.props.store} value={rec [col.code]} col={col} /></td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
				
				{me.state.showFilters && <Filters cols={me.cols} store={me.props.store} onFilter={me.onFilter} filters={me.state.filters} />}
				
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
						<button type="button" className="btn btn-link" onClick={me.onShowFilters}><i className="fas fa-filter"></i></button>
					</div>
				</div>
				<small className="text-muted ml-3">
					{me.getInfo ()}
				</small>
			</div>
		);
	}
};

export default Grid;

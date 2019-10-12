/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getHash, setHash, addHashListener, removeHashListener} from "./helper";
import Cell from "./Cell";

class Grid extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.recs = [];
		me.cols = [];
		
		let page = 1;
		let pageRecs = me.props.pageRecs || 10;
		let selected = null;
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
		}
		me.state = {
			ready: false,
			page,
			pageNum: 1,
			pageRecs,
			selected
		};
		me.onRowClick = me.onRowClick.bind (me);
		me.onChange = me.onChange.bind (me);
		me.onFirst = me.onFirst.bind (me);
		me.onPrev = me.onPrev.bind (me);
		me.onNext = me.onNext.bind (me);
		me.onLast = me.onLast.bind (me);
		me.hashChange = me.hashChange.bind (me);
	}
	
	hashChange () {
		let me = this;
		let page = me.state.page;
		let pageRecs = me.state.pageRecs;
		let selected = me.state.selected;
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
			if (hash [me.props.id].hasOwnProperty ("selected") && hash [me.props.id].selected != me.state.selected) {
				selected = hash [me.props.id].selected;
			}
		}
		if (selected != me.state.selected && me.props.onSelect) {
			me.props.onSelect (me.recs [selected] && me.recs [selected].id);
		}
		me.setState ({page, pageRecs, selected, ready});
	}
	
	componentDidMount () {
		//window.addEventListener ("hashchange", this.hashChange);
		addHashListener (this, this.hashChange);
	}
	
	componentWillUnmount () {
//		window.removeEventListener ("hashchange", this.hashChange);
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
	
	async load () {
		let me = this;
		let state = {
			pageRecs: me.state.pageRecs
		};
		
		try {
			let opts = {
				view: me.props.view,
				offset: (me.state.page - 1) * me.state.pageRecs,
				limit: me.state.pageRecs
			};
			if (me.props.params) {
				opts = {...opts, ...me.props.params};
			}
			let result = await me.props.store.getData (opts);
			
			me.recs = result.recs;
			me.cols = result.cols;
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
							return (
								<th key={i} scope="col">{col.name}</th>
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

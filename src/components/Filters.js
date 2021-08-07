/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {DictField, getDateString, i18n, Group} from "..";
import _isEmpty from "lodash.isempty";
import _find from "lodash.find";
import _keys from "lodash.keys";

class Filter extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			...this.props.value,
			operatorRecs: []
		};
		if (this.state.column) {
			this.state.operatorRecs = this.getOperatorRecs (this.state.column);
		}
	}
	
	onClick = () => {
		this.props.onRemove (this.props.id);
	}
	
	getOperatorRecs (column) {
		this.col = this.props.cols.find ((rec) => {
			if (rec.code == column) {
				return true;
			}
		});
		let t = this.col && this.col.type;
		let operatorRecs = [];
		
		if (t >= 1000) {
			if (this.col.recs) {
				operatorRecs = [{
					code: "=", name: "="
				}, {
					code: "<>", name: "<>"
				}, {
					code: "is null", name: i18n ("null")
				}, {
					code: "is not null", name: i18n ("not null")
				}];
			} else {
				t = 2;
			}
		}
		if (t == 1 || t == 5) {
			operatorRecs = [{
				code: "=", name: "="
			}, {
				code: "<>", name: "<>"
			}, {
				code: "like", name: i18n ("like")
			}, {
				code: "not like", name: i18n ("not like")
			}, {
				code: "is null", name: i18n ("null")
			}, {
				code: "is not null", name: i18n ("not null")
			}];
		}
		if (t == 2 || t == 3) {
			operatorRecs = [{
				code: "=", name: "="
			}, {
				code: ">", name: ">"
			}, {
				code: "<", name: "<"
			}, {
				code: ">=", name: ">="
			}, {
				code: "<=", name: "<="
			}, {
				code: "<>", name: "<>"
			}, {
				code: "is null", name: i18n ("null")
			}, {
				code: "is not null", name: i18n ("not null")
			}];
		}
		if (t == 4) {
			operatorRecs = [{
				code: "1", name: i18n ("Yes")
			}, {
				code: "0", name: i18n ("No")
			}, {
				code: "is null", name: i18n ("null")
			}, {
				code: "is not null", name: i18n ("not null")
			}];
		}
		return operatorRecs;
	}

	onChange = (opts) => {
		let id = opts.id, v = opts.value;
		
		if (opts.target) {
			id = opts.target.id;
			v = opts.target.value;
		}
		if (id != "column" && id != "operator") {
			id = "value";
		}
		let state = {...this.state};
		
		state [id] = v === null ? "" : v;
		
		if (id == "column") {
			state.operatorRecs = this.getOperatorRecs (v);
			
			if (_find (state.operatorRecs, {code: "like"})) {
				state.operator = "like";
			} else
			if (_find (state.operatorRecs, {code: "="})) {
				state.operator = "=";
			} else {
				state.operator = "";
			}
			state.value = "";
		}
		this.setState (state);
		this.debouncedOnChange (this.props.id, state);
	}
	
	debouncedOnChange = (id, state) => {
		this.props.onChangeState (id, state);
	}
	
	renderValue () {
		let t = this.col && this.col.type;
		
		if (t >= 1000) {
			if (this.col.recs) {
				let property = this.props.store.getProperty (this.col.property);
				return <DictField id="value" value={this.state.value} onChange={this.onChange} store={this.props.store} model={this.col.model} property={property.get ("code")} />
			} else {
				t = 2;
			}
		}
		if (t == 1 || t == 5) {
			return <input id="value" type="text" className="filter-select mt-1" value={this.state.value} onChange={this.onChange} placeholder={i18n ("Enter value")} />;
		}
		if (t == 2) {
			return <input id="value" type="number" className="filter-select mt-1" value={this.state.value} onChange={this.onChange} placeholder={i18n ("Enter value")} />;
		}
		if (t == 3) {
			return <input id="value" type="date" className="filter-select mt-1" value={getDateString (this.state.value)} onChange={this.onChange} placeholder={i18n ("Enter value")} />;
		}
		if (t == 4) {
			return <div />;
		}
	}
	
	componentDidUpdate (prevProps) {
		let state = {};
		
		if (prevProps.cols.length != this.props.cols.length) {
			state.operatorRecs = this.getOperatorRecs (this.state.column);
		}
		if (prevProps.value.column != this.props.value.column) {
			state.column = this.props.value.column;
		}
		if (prevProps.value.operator != this.props.value.operator) {
			state.operator = this.props.value.operator;
		}
		if (prevProps.value.value != this.props.value.value) {
			state.value = this.props.value.value;
		}
		if (!_isEmpty (state)) {
			this.setState (state);
		}
	}
	
	render () {
		let showValue = !!this.state.column;
		
		if (this.state.operator == "is null" || this.state.operator == "is not null") {
			showValue = false;
		}
		return <div className="border p-1 text-center mt-1">
			<button type="button" className="btn btn-outline-primary btn-sm mb-1" onClick={this.onClick}><i className="fas fa-minus mr-2" />{i18n ("Remove")}</button>
			<select id="column" className="filter-select custom-select" value={this.state.column} onChange={this.onChange}>
				{[{code: "", name: i18n ("Choose column")}, ...this.props.cols].map ((rec, i) => {
					return (
						<option value={rec.code} key={"column-" + i}>{i18n (rec.name)}</option>
					);
				})}
			</select>
			<br />
			{this.state.column && <select id="operator" className="filter-select custom-select mt-1" value={this.state.operator} onChange={this.onChange} disabled={!this.state.column}>
				{[{code: "", name: i18n ("Choose operator")}, ...this.state.operatorRecs].map ((rec, i) => {
					return (
						<option value={rec.code} key={"operator-" + i}>{rec.name}</option>
					);
				})}
			</select>}
			<br />
			{showValue && <div className="mt-1">{this.renderValue ()}</div>}
		</div>;
	}
};

export default class Filters extends Component {
	constructor (props) {
		super (props);
		
		this.gen = 1;
		
		let id = `grid-${this.props.gridId}`;
		let data = JSON.parse (localStorage.getItem (id) || "{}");
		
		this.state = {
			refresh: false,
			filters: [{
				id: this.gen,
				column: "",
				operator: "",
				value: ""
			}],
			filterName: "",
			filter: data.defaultFilter || ""
		};
		if (this.props.filters && this.props.filters.length) {
			this.state.filters = this.props.filters.map (f => {
				return {
					id: this.gen ++,
					column: f [0],
					operator: f [1],
					value: f [2]
				};
			});
		}
	}

	sendFilters (filters) {
		let data = [];
		
		filters.forEach (f => {
			if (f.column) {
				if ((f.operator && f.value !== "") || f.operator == "is null" || f.operator == "is not null") {
					data.push ([f.column, f.operator, f.value]);
				}
				if (f.operator === "0" || f.operator === "1") {
					data.push ([f.column, "=", f.operator]);
				}
			}
		});
		this.props.onFilter (data);
	}
	
	onChangeState = (id, state) => {
		let filters = [...this.state.filters];
		
		for (let i = 0; i < filters.length; i ++) {
			if (filters [i].id == id) {
				filters [i] = state;
				break;
			}
		}
		this.setState ({filters});
		this.sendFilters (filters);
	}
	
	onAdd = () => {
		this.setState ({
			filters: [...this.state.filters, {
				id: ++ this.gen,
				column: "",
				operator: "",
				value: ""
			}]
		});
	}
	
	onRemove = (id) => {
		let filters = this.state.filters;
		
		for (let i = 0; i < filters.length; i ++) {
			if (filters [i].id == id) {
				filters.splice (i, 1);
				break;
			}
		}
		this.setState ({filters});
		this.sendFilters (filters);
	}
	
	onDock = () => {
		this.props.onDockFilters (this.props.dockFilters == "bottom" ? "top" : "bottom");
	}
	
	onSelectFilter = (val) => {
		let filter = val.target.value;
		let id = `grid-${this.props.gridId}`;
		let data = JSON.parse (localStorage.getItem (id) || "{}");
		
		data.filters = data.filters || {};
		
		if (filter == "-") {
			delete data.defaultFilter;
		} else {
			data.defaultFilter = filter;
		}
		localStorage.setItem (id, JSON.stringify (data));
		
		let filters = data.filters [filter] || [{
			id: 1,
			column: "",
			operator: "",
			value: ""
		}];
		this.setState ({filter, filters});
		this.sendFilters (filters);
	}
	
	onCreateFilter = () => {
		if (this.state.filterName) {
			let id = `grid-${this.props.gridId}`;
			let data = JSON.parse (localStorage.getItem (id) || "{}");
			
			data.filters = data.filters || {};
			data.filters [this.state.filterName] = this.state.filters;
			localStorage.setItem (id, JSON.stringify (data));
			this.setState ({filterName: "", filter: this.state.filterName});
		}
	}
	
	onRemoveFilter = () => {
		let id = `grid-${this.props.gridId}`;
		let data = JSON.parse (localStorage.getItem (id) || "{}");
		
		data.filters = data.filters || {};
		
		delete data.filters [this.state.filter];
		delete data.defaultFilter;
		
		localStorage.setItem (id, JSON.stringify (data));
		
		this.setState ({filter: "-", filters: [{
			id: 1,
			column: "",
			operator: "",
			value: ""
		}]});
		this.sendFilters ([{
			id: 1,
			column: "",
			operator: "",
			value: ""
		}]);
	}
	
	onSaveFilter = () => {
		let id = `grid-${this.props.gridId}`;
		let data = JSON.parse (localStorage.getItem (id) || "{}");
		
		data.filters = data.filters || {};
		data.filters [this.state.filter] = this.state.filters;
		localStorage.setItem (id, JSON.stringify (data));
		this.setState ({refresh: !this.state.refresh});
	}
	
	saveDisabled () {
		if (!this.state.filter || this.state.filter == "-") {
			return true;
		}
		let id = `grid-${this.props.gridId}`;
		let data = JSON.parse (localStorage.getItem (id) || "{}");

		let result = true;
		
		data.filters [this.state.filter].forEach ((filter, i) => {
			let filter2 = this.state.filters [i];
			
			if (!filter2 || filter.column != filter2.column || filter.operator != filter2.operator || filter.value != filter2.value) {
				result = false;
			}
		});
		return result;
	}
	
	onChangeFilterName = (val) => {
		this.setState ({filterName: val.target.value});
	}
	
	render () {
		let gridOpts = JSON.parse (localStorage.getItem (`grid-${this.props.gridId}`) || "{}");
		let savedFilters = _keys (gridOpts.filters || {});
		
		return <div>
			<div className="mt-1 ml-2 d-flex align-items-center">
				<strong className="">{i18n ("Filters")}</strong>
				<button type="button" className="btn btn-outline-primary btn-sm ml-3 " onClick={this.onAdd}><i className="fas fa-plus mr-2" />{i18n ("Add filter")}</button>
				<button type="button" className="btn btn-outline-primary btn-sm ml-1" onClick={this.onDock}>
					<i className={`fas ${this.props.dockFilters == "bottom" ? "fa-arrow-up" : "fa-arrow-down"} mr-2`} />
					{this.props.dockFilters == "bottom" ? i18n ("Filters on top") : i18n ("Filters on bottom")}
				</button>
			</div>
			<div className="mx-1 mb-1 row flex-row">
				{this.state.filters.map (rec => {
					return (
						<div className="mr-1 filter-block" key={"div-filter-" + rec.id}>
							<Filter {...this.props} id={rec.id} key={"filter-" + rec.id} cols={this.props.cols} value={rec} onChangeState={this.onChangeState} onRemove={this.onRemove} />
						</div>
					);
				})}
			</div>
			<Group className="p-1" label={i18n ("Saved filters")}>
				<div className="d-flex overflow-auto">
					<div className="d-flex border p-1">
						<button type="button" className="btn btn-outline-primary btn-sm" onClick={this.onCreateFilter} disabled={!this.state.filterName} title={i18n ("Create")}>
							<i className="fas fa-plus" />
						</button>
						<input type="text" className="ml-1 form-control filter-name-field" value={this.state.filterName} placeholder={i18n ("Name")} onChange={this.onChangeFilterName} size={10} />
					</div>
					<div className="d-flex border p-1 ml-1">
						<select className="form-control filter-name-field" value={this.state.filter} onChange={this.onSelectFilter}>
							{["-", ...savedFilters].map ((f, i) => {
								return (
									<option value={f} key={i}>{f}</option>
								);
							})}
						</select>
						<button type="button" className="ml-1 btn btn-outline-primary btn-sm" onClick={this.onSaveFilter} disabled={this.saveDisabled ()} title={i18n ("Save")}>
							<i className="fas fa-check" />
						</button>
						<button type="button" className="ml-1 btn btn-outline-primary btn-sm" onClick={this.onRemoveFilter} disabled={!this.state.filter || this.state.filter == "-"} title={i18n ("Remove")}>
							<i className="fas fa-minus" />
						</button>
					</div>
				</div>
			</Group>
		</div>;
	}
};
Filters.displayName = "Filters";

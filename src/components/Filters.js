/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getDateString} from "./helper";
import _ from "lodash";
import {i18n} from "../i18n";
import DictField from "./DictField";

class Filter extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.debouncedOnChange = _.debounce (me.debouncedOnChange.bind (me), 500);
		me.onClick = me.onClick.bind (me);
		
		me.state = {...me.props.value, operatorRecs: []};
		
		if (me.state.column) {
			me.state.operatorRecs = me.getOperatorRecs (me.state.column);
		}
	}
	
	onClick () {
		let me = this;
		
		me.props.onRemove (me.props.id);
	}
	
	getOperatorRecs (column) {
		let me = this;
		
		me.col = me.props.cols.find ((rec) => {
			if (rec.code == column) {
				return true;
			}
		});
		let t = me.col && me.col.type;
		let operatorRecs = [];
		
		if (t >= 1000) {
			if (me.col.recs) {
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
	
	
/*
	onChange (val) {
		let me = this;
		let id = val.target.id;
		
		if (id != "column" && id != "operator") {
			id = "value";
		}
		let v = val.target.value;
		let state = {...me.state};
		
		state [id] = v;
		
		if (id == "column") {
			state.operatorRecs = me.getOperatorRecs (v);
			
			if (_.find (state.operatorRecs, {code: "="})) {
				state.operator = "=";
			} else {
				state.operator = "";
			}
			state.value = "";
		}
		me.setState (state);
		me.debouncedOnChange (me.props.id, state);
	}
*/
	onChange (opts) {
		let me = this;
		let id = opts.id, v = opts.value;
		
		if (opts.target) {
			id = opts.target.id;
			v = opts.target.value;
		}
		if (id != "column" && id != "operator") {
			id = "value";
		}
		let state = {...me.state};
		
		state [id] = v === null ? "" : v;
		
		if (id == "column") {
			state.operatorRecs = me.getOperatorRecs (v);
			
			if (_.find (state.operatorRecs, {code: "like"})) {
				state.operator = "like";
			} else
			if (_.find (state.operatorRecs, {code: "="})) {
				state.operator = "=";
			} else {
				state.operator = "";
			}
			state.value = "";
		}
		me.setState (state);
		me.debouncedOnChange (me.props.id, state);
	}
	
	debouncedOnChange (id, state) {
		this.props.onChangeState (id, state);
	}
	
	renderValue () {
		let me = this;
		
		let t = me.col && me.col.type;
		
		if (t >= 1000) {
			if (me.col.recs) {
				let property = me.props.store.getProperty (me.col.property);
				
				return <DictField id="value" value={me.state.value} onChange={me.onChange} store={me.props.store} model={me.col.model} property={property.get ("code")} />
			} else {
				t = 2;
			}
		}
		if (t == 1 || t == 5) {
			return (
				<input id="value" type="text" className="filter-select mt-1" value={me.state.value} onChange={me.onChange} placeholder={i18n ("Enter value")} />
			);
		}
		if (t == 2) {
			return (
				<input id="value" type="number" className="filter-select mt-1" value={me.state.value} onChange={me.onChange} placeholder={i18n ("Enter value")} />
			);
		}
		if (t == 3) {
			return (
				<input id="value" type="date" className="filter-select mt-1" value={getDateString (me.state.value)} onChange={me.onChange} placeholder={i18n ("Enter value")} />
			);
		}
		if (t == 4) {
			return (<div />);
		}
	}
	
	componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.cols.length != me.props.cols.length) {
			me.setState ({operatorRecs: me.getOperatorRecs (me.state.column)});
		}
	}
	
	render () {
		let me = this;
		let showValue = !!me.state.column;
		
		if (me.state.operator == "is null" || me.state.operator == "is not null") {
			showValue = false;
		}
		return (
			<div className="border p-1 text-center mt-1">
				<button type="button" className="btn btn-link btn-sm mb-1" onClick={me.onClick}><i className="fas fa-minus mr-2" /><span className="text-dark"> {i18n ("Remove")}</span></button>
				<select id="column" className="filter-select custom-select custom-select-sm" value={me.state.column} onChange={me.onChange}>
					{[{code: "", name: i18n ("Choose column")}, ...me.props.cols].map ((rec, i) => {
						return (
							<option value={rec.code} key={"column-" + i}>{i18n (rec.name)}</option>
						);
					})}
				</select>
				<br />
				{me.state.column && <select id="operator" className="filter-select custom-select custom-select-sm mt-1" value={me.state.operator} onChange={me.onChange} disabled={!me.state.column}>
					{[{code: "", name: i18n ("Choose operator")}, ...me.state.operatorRecs].map ((rec, i) => {
						return (
							<option value={rec.code} key={"operator-" + i}>{rec.name}</option>
						);
					})}
				</select>}
				<br />
				{showValue && <div className="mt-1">{me.renderValue ()}</div>}
			</div>
		);
	}
};

class Filters extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChangeState = me.onChangeState.bind (me);
		me.onAdd = me.onAdd.bind (me);
		me.onRemove = me.onRemove.bind (me);
		me.onDock = me.onDock.bind (me);
		
		me.gen = 1;
		
		me.state = {
			filters: [{
				id: me.gen,
				column: "",
				operator: "",
				value: ""
			}]
		};
		if (me.props.filters && me.props.filters.length) {
			me.state.filters = me.props.filters.map (f => {
				return {
					id: me.gen ++,
					column: f [0],
					operator: f [1],
					value: f [2]
				};
			});
		}
	}

	sendFilters (filters) {
		let me = this;
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
		me.props.onFilter (data);
	}
	
	onChangeState (id, state) {
		let me = this;
		let filters = [...me.state.filters];
		
		for (let i = 0; i < filters.length; i ++) {
			if (filters [i].id == id) {
				filters [i] = state;
				break;
			}
		}
		me.setState ({filters});
		me.sendFilters (filters);
	}
	
	onAdd () {
		let me = this;
		
		me.setState ({
			filters: [...me.state.filters, {
				id: ++ me.gen,
				column: "",
				operator: "",
				value: ""
			}]
		});
	}
	
	onRemove (id) {
		let me = this;
		let filters = me.state.filters;
		
		for (let i = 0; i < filters.length; i ++) {
			if (filters [i].id == id) {
				filters.splice (i, 1);
				break;
			}
		}
		me.setState ({filters});
		me.sendFilters (filters);
	}
	
	onDock () {
		this.props.onDockFilters (this.props.dockFilters == "bottom" ? "top" : "bottom");
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<div className="mt-1 ml-3">
					<h6 className="d-inline">{i18n ("Filters")}</h6>
					<button type="button" className="btn btn-link btn-sm ml-3" onClick={me.onAdd}><i className="fas fa-plus mr-2" /><span className="text-dark">{i18n ("Add filter")}</span></button>
					<button type="button" className="btn btn-link btn-sm ml-1" onClick={me.onDock}>
						<i className={`fas ${me.props.dockFilters == "bottom" ? "fa-arrow-up" : "fa-arrow-down"} mr-2`} />
						<span className="text-dark">{me.props.dockFilters == "bottom" ? i18n ("Filters on top") : i18n ("Filters on bottom")}</span>
					</button>
				</div>
				<div className="mx-1 mb-1 row flex-row">
					{me.state.filters.map (rec => {
						return (
							<div className="mr-1 filter-block" key={"div-filter-" + rec.id}>
								<Filter {...me.props} id={rec.id} key={"filter-" + rec.id} cols={me.props.cols} value={rec} onChangeState={me.onChangeState} onRemove={me.onRemove} />
							</div>
						);
					})}
				</div>
			</div>
		);
	}
};
Filters.displayName = "Filters";

export default Filters;

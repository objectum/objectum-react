/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getDateString} from "./helper";

class Filter extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onClick = me.onClick.bind (me);
		
		me.state = {...me.props.value};
		me.operatorRecs = [];
	}
	
	onClick () {
		let me = this;
		
		me.props.onRemove (me.props.id);
	}
	
	onChange (val) {
		let me = this;
		let id = val.target.id;
		let v = val.target.value;
		
		if (id == "column") {
			me.col = me.props.cols.find ((rec) => {
				if (rec.code == v) {
					return true;
				}
			});
			let t = me.col && me.col.type;
			
			if (t >= 1000) {
				if (me.col.recs) {
					me.operatorRecs = [{
						code: "=", name: "="
					}, {
						code: "<>", name: "<>"
					}, {
						code: "is null", name: "null"
					}, {
						code: "is not null", name: "not null"
					}];
				} else {
					t = 2;
				}
			}
			if (t == 1 || t == 5) {
				me.operatorRecs = [{
					code: "=", name: "="
				}, {
					code: "<>", name: "<>"
				}, {
					code: "like", name: "like"
				}, {
					code: "not like", name: "not like"
				}, {
					code: "is null", name: "null"
				}, {
					code: "is not null", name: "not null"
				}];
			}
			if (t == 2 || t == 3) {
				me.operatorRecs = [{
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
					code: "is null", name: "null"
				}, {
					code: "is not null", name: "not null"
				}];
			}
			if (t == 4) {
				me.operatorRecs = [{
					code: "1", name: "Yes"
				}, {
					code: "0", name: "No"
				}, {
					code: "is null", name: "null"
				}, {
					code: "is not null", name: "not null"
				}];
			}
		}
		me.setState ({[id]: v});
		
		let state = {...me.state};
		
		state [id] = v;
		me.props.onChangeState (me.props.id, state);
	}
	
	renderValue () {
		let me = this;
		
		let t = me.col.type;
		
		if (t >= 1000) {
			if (me.col.recs) {
				return (
					<select id="value" className="filter-select mt-1" value={me.state.value} onChange={me.onChange}>
						{me.col.recs.map ((rec, i) => {
							return (
								<option value={rec.id} key={i}>{rec.name}</option>
							);
						})}
					</select>
				);
			} else {
				t = 2;
			}
		}
		if (t == 1) {
			return (
				<input id="value" type="text" className="filter-select mt-1" value={me.state.value} onChange={me.onChange} placeholder="Enter value" />
			);
		}
		if (t == 2) {
			return (
				<input id="value" type="number" className="filter-select mt-1" value={me.state.value} onChange={me.onChange} placeholder="Enter value" />
			);
		}
		if (t == 3) {
			return (
				<input id="value" type="date" className="filter-select mt-1" value={getDateString (me.state.value)} onChange={me.onChange} placeholder="Enter value" />
			);
		}
		if (t == 4) {
			return (<div />);
		}
	}
	
	render () {
		let me = this;
		let showValue = !!me.state.column;
		
		if (me.state.operator == "is null" || me.state.operator == "is not null") {
			showValue = false;
		}
		return (
			<div className="border p-1 bg-white shadow-sm mb-2 text-center filter-block">
				<button type="button" className="btn btn-danger btn-sm mb-1" onClick={me.onClick}><i className="fas fa-minus mr-2"></i>Remove</button>
				<select id="column" className="filter-select" value={me.state.column} onChange={me.onChange}>
					{[{code: "", name: "Choose column"}, ...me.props.cols].map ((rec, i) => {
						return (
							<option value={rec.code} key={i}>{rec.name}</option>
						);
					})}
				</select>
				<br />
				{me.state.column && <select id="operator" className="filter-select mt-1" value={me.state.operator} onChange={me.onChange} disabled={!me.state.column}>
					{[{code: "", name: "Choose operator"}, ...me.operatorRecs].map ((rec, i) => {
						return (
							<option value={rec.code} key={i}>{rec.name}</option>
						);
					})}
				</select>}
				<br />
				{showValue && me.renderValue ()}
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
		
		me.gen = 1;
		
		me.state = {
			filters: [{
				id: me.gen,
				column: "",
				operator: "",
				value: ""
			}]
		};
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
	}
	
	render () {
		let me = this;
		
		return (
			<div className="row no-gutters">
				{me.state.filters.map ((rec) => {
					return (
						<div className="col-sm-2 mr-1" key={rec.id}>
							<Filter id={rec.id} key={rec.id} cols={me.props.cols} value={rec} onChangeState={me.onChangeState} onRemove={me.onRemove} />
						</div>
					);
				})}
				<div className="col-sm-2">
					<div className="border p-1 bg-light shadow-sm mb-2 filter-block text-center">
						<button type="button" className="btn btn-success btn-sm" onClick={me.onAdd}><i className="fas fa-plus mr-2"></i>Add filter</button>
					</div>
				</div>
			</div>
		);
	}
};

export default Filters;

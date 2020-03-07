/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

class GridColumns extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.state = {
			hideCols: []
		};
		if (me.props.hideCols && me.props.hideCols.length) {
			me.state.hideCols = [...me.props.hideCols];
		}
		me.onChange = me.onChange.bind (me);
	}
	
	onChange (val) {
		let me = this;
		let id = val.target.id;
		let v = val.target.value;
		
		if (val.target.type === "checkbox") {
			v = val.target.checked;
		}
		let hideCols = [...me.state.hideCols];
		let idx = hideCols.indexOf (id);

		if (!v && idx === -1) {
			hideCols.push (id);
		}
		if (v && idx !== -1) {
			hideCols.splice (idx, 1);
		}
		me.setState ({hideCols});
		me.props.onHideCols (hideCols);
	}
	
	render () {
		let me = this;
		
		return (
			<div>
				<div className="mt-2 ml-3 mb-0"><h6>{i18n ("Columns")}</h6></div>
				<div className="px-1 pb-1">
					<table className="table table-bordered objectum-table mb-0 p-1">
						<thead className="thead-dark">
							<tr>
								{me.props.cols.map ((col, i) => {
									return (
										<th className="align-top text-left" key={i}>{i18n (col.name)}</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							<tr>
								{me.props.cols.map ((col, i) => {
									let checked = true;
									
									if (me.state.hideCols.indexOf (col.code) > -1) {
										checked = false;
									}
									return (
										<td key={i}><input type="checkbox" id={col.code} checked={checked} onChange={me.onChange} /></td>
									);
								})}
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
};
GridColumns.displayName = "GridColumns";

export default GridColumns;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";

export default class GridColumns extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			hideCols: []
		};
		if (this.props.hideCols && this.props.hideCols.length) {
			this.state.hideCols = [...this.props.hideCols];
		}
	}
	
	onChange = (val) => {
		let id = val.target.id;
		let v = val.target.value;
		
		if (val.target.type === "checkbox") {
			v = val.target.checked;
		}
		let hideCols = [...this.state.hideCols];
		let idx = hideCols.indexOf (id);

		if (!v && idx === -1) {
			hideCols.push (id);
		}
		if (v && idx !== -1) {
			hideCols.splice (idx, 1);
		}
		this.setState ({hideCols});
		this.props.onHideCols (hideCols);
	}
	
	render () {
		return <div>
			<div className="my-1 ml-2 mb-0"><strong>{i18n ("Columns")}</strong></div>
			<div className="px-1 pb-1">
				<table className="table table-bordered table-sm objectum-table mb-0 p-1">
					<thead className="bg-info text-white">
						<tr>
							{this.props.cols.map ((col, i) => {
								return (
									<th className="align-top text-left" key={i}>{i18n (col.name)}</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						<tr>
							{this.props.cols.map ((col, i) => {
								let checked = true;
								
								if (this.state.hideCols.indexOf (col.code) > -1) {
									checked = false;
								}
								return (
									<td key={i}><input type="checkbox" id={col.code} checked={checked} onChange={this.onChange} /></td>
								);
							})}
						</tr>
					</tbody>
				</table>
			</div>
		</div>;
	}
};
GridColumns.displayName = "GridColumns";

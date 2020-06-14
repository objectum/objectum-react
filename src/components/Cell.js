/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {getTimestampString} from "./helper";
import Tooltip from "./Tooltip";

class Cell extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			maxStrLen: this.props.maxStrLen || 300
		};
	}
	
	renderString (v) {
		let me = this;
		let col = me.props.col;

		if (col.property && me.props.store.getProperty (col.property).getOpts ().wysiwyg) {
			return <span dangerouslySetInnerHTML={{__html: v}} />
		} else {
			//return <span>{v}</span>
			return v;
		}
	}
	
	render () {
		let me = this;
		let value = me.props.value;
		let col = me.props.col;
		
		if (value === null) {
			return (<span />);
		} else {
			if (col.type == 3) {
				// Date
				return (<span>{getTimestampString (value)}</span>);
			} else
			if (col.type == 4) {
				// Boolean
				return (<input type="checkbox" checked={value} disabled />);
			} else
			if (col.type == 5) {
				// File
				return (
					<span>
						<a target="_blank" rel="noopener noreferrer"
						   href={`/files/${me.props.rec.id}-${me.props.col.property}-${value}`}>{value}
						</a>
					</span>
				);
			} else
			if (col.type == 6) {
				// Class
				let cls = me.props.store.getModel (value);
				
				return (<span>{`${cls.get ("name")} (${cls.getPath ()} : ${cls.get ("id")})`}</span>);
			} else
			if (col.recs) {
				let rec = col.recs.find ((rec) => {
					if (rec.id == value) {
						return true;
					}
				});
				if (rec) {
					let label = `${rec.name} (id: ${value})`;
					
					if (rec.getLabel) {
						label = rec.getLabel ();
					}
					return (<span>{label}</span>);
				} else {
					return (<span>{`${value}`}</span>);
				}
			} else {
				if (typeof (value) == "string") {
					if (value.length < me.state.maxStrLen) {
						return me.renderString (value);
					} else {
						for (let i = 0; i < value.length; i ++) {
							let c = value [i];
						}
						return (<Tooltip label={me.renderString (value)}>{me.renderString (value.substr (0, me.state.maxStrLen) + " ...")}</Tooltip>);
					}
				} else {
					return <span>{value}</span>;
				}
			}
		}
	}
};
Cell.displayName = "Cell";

export default Cell;

/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Tooltip, getTimestampString} from "..";

export default class Cell extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			maxStrLen: this.props.maxStrLen || 300
		};
	}
	
	renderString (v) {
		let col = this.props.col;

		if (col.property && this.props.store.getProperty (col.property).getOpts ().wysiwyg) {
			return <div dangerouslySetInnerHTML={{__html: v}} />
		} else {
			return v;
		}
	}
	
	render () {
		let value = this.props.value;
		let col = this.props.col;
		
		if (value === null) {
			return <span />;
		} else {
			if (col.type == 3) {
				// Date
				return <span>{getTimestampString (value, {hideSeconds: this.props.hideSeconds})}</span>;
			} else
			if (col.type == 4) {
				// Boolean
				return <input type="checkbox" checked={value} disabled />;
			} else
			if (col.type == 5) {
				// File
				let opts = this.props.store.getProperty (col.property).getOpts ();
				
				if (this.props.showImages && opts.image && opts.image.resize) {
					return <img
						src={`/files/${this.props.rec.id}-${this.props.col.property}-${value}`}
						width={opts.image.resize.width}
						height={opts.image.resize.height}
						alt={value}
					/>;
				}
				return <span>
					<a target="_blank" rel="noopener noreferrer"
					   href={`/files/${this.props.rec.id}-${this.props.col.property}-${value}`}>{value}
					</a>
				</span>;
			} else
			if (col.type == 6) {
				// Class
				let cls = this.props.store.getModel (value);
				return <span>{`${cls.get ("name")} (${cls.getPath ()} : ${cls.get ("id")})`}</span>;
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
					return <span>{label}</span>;
				} else {
					return <span>{`${value}`}</span>;
				}
			} else {
				if (typeof (value) == "string") {
					if (value.length < this.state.maxStrLen) {
						return this.renderString (value);
					} else {
						return <Tooltip label={this.renderString (value)}>{this.renderString (value.substr (0, this.state.maxStrLen) + " ...")}</Tooltip>;
					}
				} else {
					return <span>{value}</span>;
				}
			}
		}
	}
};
Cell.displayName = "Cell";

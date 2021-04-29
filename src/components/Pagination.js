import React, {Component} from "react";

export default class Pagination extends Component {
	constructor (props) {
		super (props);
	}
	
	onClick (active) {
		if (this.props.onChange) {
			this.props.onChange (active);
		}
	}
	
	render () {
		if (!this.props.items) {
			return null;
		}
		return <ul className={this.props.className || "pagination"}>
			{this.props.items.map ((item, i) => {
				return (
					<li key={i} className={`page-item ${(i === this.props.active) ? "active" : ""}`}>
						<button className="page-link" onClick={() => this.onClick (i)}>{item}</button>
					</li>
				);
			})}
		</ul>;
	}
};
Pagination.displayName = "Pagination";

import React, {Component} from "react";

class Pagination extends Component {
	constructor (props) {
		super (props);
	}
	
	onClick (active) {
		if (this.props.onChange) {
			this.props.onChange (active);
		}
	}
	
	render () {
		let me = this;
		
		if (!me.props.items) {
			return null;
		}
		return (
			<ul className={me.props.className || "pagination"}>
				{this.props.items.map ((item, i) => {
					return (
						<li key={i} className={`page-item ${(i === me.props.active) ? "active" : ""}`}>
							<button className="page-link" onClick={() => me.onClick (i)}>{item}</button>
						</li>
					);
				})}
			</ul>
		);
	}
};
Pagination.displayName = "Pagination";

export default Pagination;

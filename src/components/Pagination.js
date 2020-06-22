import React, {Component} from "react";

class Pagination extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			active: this.props.active
		};
	}
	
	onClick (active) {
		this.setState ({active});
		
		if (this.props.onChange) {
			this.props.onChange (active);
		}
	}
	
	render () {
		let me = this;
		
		if (!me.props.items) {
			return <div>no items</div>;
		}
		return (
			<ul className={me.props.className || "pagination"}>
				{this.props.items.map ((item, i) => {
					return (
						<li className={`page-item ${(i === me.props.active || item === me.props.active) ? "active" : ""}`}>
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

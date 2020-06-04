/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Link} from "react-router-dom";

class Navbar extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {};
		
		if (me.props.items && me.props.items.length) {
			me.state.path = me.props.items [0].path;
		}
	}
	
	render () {
		let me = this;
		
		return (
			<nav className="navbar navbar-expand-sm navbar-dark bg-primary">
				<div className="collapse navbar-collapse">
					<div className="navbar-nav">
						{me.props.items.map ((item, i) => {
							return (
								<Link
									key={i}
									className={`nav-item m-2 nav-link ${me.state.path == item.path ? "active" : ""}`}
									to={item.path}
									onClick={() => me.setState ({path: item.path})}
								>
									<strong>{item.label}</strong>
								</Link>
							);
						})}
					</div>
				</div>
			</nav>
		);
	}
};
Navbar.displayName = "Navbar";

export default Navbar;

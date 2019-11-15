import React, {Component} from "react";

class Logout extends Component {
	componentDidMount () {
		this.props.store.setSessionId (null);
		this.props.store.end ();
		this.props.onLogout ();

		this.props.history.push ({
			pathname: "/"
		});
	}
	
	render () {
		return null;
	}
};
Logout.displayName = "Logout";

export default Logout

import React, {Component} from "react";
import "../css/Auth.css";

class Auth extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.fieldChange = me.fieldChange.bind (me);
		me.buttonClick = me.buttonClick.bind (me);
		
		me.store = me.props.store;
		me.state = {};
	}
	
	fieldChange (val) {
		let id = val.target.id;
		let v = val.target.value;

		this.setState ({[id]: v});
	}
	
	buttonClick () {
		let me = this;
		
		me.store.auth ({
			username: me.state.username,
			password: require ("crypto").createHash ("sha1").update (me.state.password).digest ("hex").toUpperCase ()
		}).then (sid => {
			me.props.onConnect (sid);
		});
	}

	render () {
		let me = this;
		let disabledButton = false;
		
		if (!me.state.username || !me.state.password) {
			disabledButton = true;
		}
		return (
			<div className="auth shadow p-3 mb-5 bg-white">
				<h5>Sign in</h5>
				<div className="form-group row">
					<div className="col-sm">
						<input type="text" className="form-control" id="username" placeholder="Username" onChange={me.fieldChange} />
					</div>
				</div>
				<div className="form-group row">
					<div className="col-sm">
						<input type="password" className="form-control" id="password" placeholder="Password" onChange={me.fieldChange} />
					</div>
				</div>
				{me.state.showError && (
					<div className="alert alert-danger" role="alert">
						Invalid username or password
					</div>
				)}
				<button type="button" className="btn btn-primary" onClick={me.buttonClick} disabled={disabledButton}>Login</button>
			</div>
		);
	}
}

export default Auth;

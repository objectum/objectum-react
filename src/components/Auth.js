import React, {Component} from "react";
import {i18n} from "./../i18n";

class Auth extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.fieldChange = me.fieldChange.bind (me);
		me.buttonClick = me.buttonClick.bind (me);
		me.onKeyDown = me.onKeyDown.bind (me);
		
		me.store = me.props.store;
		me.state = {};
	}
	
	fieldChange (val) {
		let id = val.target.id;
		let v = val.target.value;

		this.setState ({[id]: v});
	}
	
	async buttonClick () {
		let me = this;
		
		try {
			let sid = await me.store.auth ({
				username: me.state.username,
				password: require ("crypto").createHash ("sha1").update (me.state.password).digest ("hex").toUpperCase ()
			});
			if (me.props.onConnect) {
				me.props.onConnect (sid);
			}
		} catch (err) {
			me.setState ({error: i18n ("Invalid username or password")});
		}
	}
	
	onKeyDown (e) {
		let me = this;
		
		if (e.key === "Enter" && me.state.username && me.state.password) {
			me.buttonClick ();
		}
	}
	
	componentDidMount () {
		this.usernameInput.focus ();
	}
	
	render () {
		let me = this;
		let disabledButton = false;
		
		if (!me.state.username || !me.state.password) {
			disabledButton = true;
		}
		return (
			<div className="auth shadow p-3 mb-5 bg-white">
				<h5><i className="fas fa-user mr-2 mb-2" />{i18n ("Sign in")}</h5>
				<div className="form-group row">
					<div className="col-sm">
						<input type="text" className="form-control" id="username" placeholder={i18n ("Username")} onChange={me.fieldChange} ref={input => me.usernameInput = input} />
					</div>
				</div>
				<div className="form-group row">
					<div className="col-sm">
						<input type="password" className="form-control" id="password" placeholder={i18n ("Password")} onChange={me.fieldChange} onKeyDown={me.onKeyDown} />
					</div>
				</div>
				<button type="button" className="btn btn-primary" onClick={me.buttonClick} disabled={disabledButton}><i className="fas fa-sign-in-alt mr-2" />{i18n ("Login")}</button>
				{me.state.error && (
					<div className="alert alert-danger mt-3" role="alert">
						{me.state.error}
					</div>
				)}
			</div>
		);
	}
}

export default Auth;

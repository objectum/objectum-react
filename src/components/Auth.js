import React, {Component} from "react";
import {i18n} from "./../i18n";
import Loading from "./Loading";
import {timeout} from "./helper";

class Auth extends Component {
	constructor (props) {
		super (props);
		
		let me = this;

		me.fieldChange = me.fieldChange.bind (me);
		me.buttonClick = me.buttonClick.bind (me);
		me.onKeyDown = me.onKeyDown.bind (me);
		
		me.store = me.props.store;
		me.state = {
			loading: false
		};
	}
	
	fieldChange (val) {
		let id = val.target.id;
		let v = val.target.value;

		this.setState ({[id]: v});
	}
	
	async buttonClick () {
		let me = this;
		
		try {
			me.setState ({loading: true});
			await timeout ();
			
			await me.store.auth ({
				username: me.state.username,
				password: require ("crypto").createHash ("sha1").update (me.state.password).digest ("hex").toUpperCase ()
			});
		} catch (error) {
			if (error.message == "401 Unauthenticated") {
				me.setState ({loading: false, error: i18n ("Invalid username or password")});
			} else {
				me.setState ({loading: false, error: error.message});
			}
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
		
		if (!me.state.username || !me.state.password || me.state.loading) {
			disabledButton = true;
		}
		return (
			<div className="auth shadow-sm bg-white mb-5">
				<div className="p-3">
					<h5><i className="fas fa-user mr-2 mb-2" />{i18n ("Sign in")}</h5>
					<div className="form-group row">
						<div className="col-sm">
							<input
								type="text"
								className="form-control"
								id="username"
								placeholder={i18n ("Username")}
								onChange={me.fieldChange}
								ref={input => me.usernameInput = input}
								onKeyDown={me.onKeyDown}
							/>
						</div>
					</div>
					<div className="form-group row">
						<div className="col-sm">
							<input
								type="password"
								className="form-control"
								id="password"
								placeholder={i18n ("Password")}
								onChange={me.fieldChange}
								onKeyDown={me.onKeyDown}
							/>
						</div>
					</div>
					
					<button type="button" className="btn btn-primary" onClick={me.buttonClick} disabled={disabledButton}>
						{me.state.loading ? <Loading /> : <span><i className="fas fa-sign-in-alt mr-2"/>{i18n ("Log in")}</span>}
					</button>
					
					{me.state.error && (
						<div className="alert alert-danger mt-3" role="alert">
							{me.state.error}
						</div>
					)}
				</div>
			</div>
		);
	}
}
Auth.displayName = "Auth";

export default Auth;

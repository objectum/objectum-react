import React, {Component} from "react";
import {Loading, i18n, timeout, Fade} from "..";

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
		let authInfo;
		
		if (me.props.onRenderAuthInfo) {
			authInfo = (
				<div className="auth-info flex-grow-1 p-3 border-left">
					<div className="mt-1 ml-2">
						<h3>{me.props.name}</h3>
					</div>
					<div className="mt-3 ml-2">
						<h5>{i18n ("version") + " " + me.props.version}</h5>
					</div>
				</div>
			);
			authInfo = me.props.onRenderAuthInfo (authInfo);
		}
		return (
			<Fade>
				{authInfo ? <div className="auth-long">
					<div className="border shadow mt-5">
						<div className="bg-info text-white py-2 pl-4">
							<strong><i className="fas fa-user mr-2" />{i18n ("Sign in")}</strong>
						</div>
						<div className="d-flex">
							<div className="auth-login p-3">
								<div>
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
								<div className="mt-3">
									<input
										type="password"
										className="form-control"
										id="password"
										placeholder={i18n ("Password")}
										onChange={me.fieldChange}
										onKeyDown={me.onKeyDown}
									/>
								</div>
								<div className="mt-3">
									<button type="button" className="btn btn-primary" onClick={me.buttonClick} disabled={disabledButton}>
										{me.state.loading ? <Loading /> : <span><i className="fas fa-sign-in-alt mr-2"/>{i18n ("Log in")}</span>}
									</button>
								</div>
								{me.state.error && (
									<div className="alert alert-danger mt-3" role="alert">
										{me.state.error}
									</div>
								)}
							</div>
							{authInfo}
						</div>
					</div>
				</div> : <div className="auth">
					<div className="border shadow mt-5">
						<div className="bg-info text-white py-2 pl-2">
							<strong><i className="fas fa-user mr-2" />{i18n ("Sign in")}</strong>
						</div>
						<div className="border-bottom px-2 py-1">
							<strong>{me.props.name}</strong>
						</div>
						<div className="border-bottom px-2 py-1">
							<i>{i18n ("version") + " " + me.props.version}</i>
						</div>
						<div className="p-2">
							<div>
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
							<div className="mt-3">
								<input
									type="password"
									className="form-control"
									id="password"
									placeholder={i18n ("Password")}
									onChange={me.fieldChange}
									onKeyDown={me.onKeyDown}
								/>
							</div>
							<div className="mt-3">
								<button type="button" className="btn btn-primary" onClick={me.buttonClick} disabled={disabledButton}>
									{me.state.loading ? <Loading /> : <span><i className="fas fa-sign-in-alt mr-2"/>{i18n ("Log in")}</span>}
								</button>
							</div>
						</div>
						{me.state.error && (
							<div className="alert alert-danger mt-3" role="alert">
								{me.state.error}
							</div>
						)}
					</div>
				</div>}
			</Fade>
		);
	}
}
Auth.displayName = "Auth";

export default Auth;

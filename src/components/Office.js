/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Action from "./Action";
import Loading from "./Loading";
import crypto from "crypto";
import {i18n} from "./../i18n";
import {loadJS} from "./helper.js";

class Office extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			loading: true,
			recover: false,
			register: false
		};
		this.onChange = this.onChange.bind (this);
		this.onRegister = this.onRegister.bind (this);
		this.onLogin = this.onLogin.bind (this);
		this.onKeyDown = this.onKeyDown.bind (this);
		this.onRecover = this.onRecover.bind (this);

		let search = document.location.search.substr (1);

		if (search.startsWith ("activationId=")) {
			this.state.activationId = search.substr (13);
		}
		if (search.startsWith ("email=")) {
			let tokens = search.split ("&");
			let o = {};
			
			tokens.forEach (s => {
				let t = s.split ("=");
				
				o [t [0]] = t [1];
			});
			if (o.recoverId) {
				this.state.recoverId = o.recoverId;
				this.state.email = o.email;
				this.state.newPassword = o.newPassword;
			}
		}
	}
	
	async componentDidMount () {
		let me = this;

/*
		window.onRecaptchaCallback = () => {
			try {
				window.grecaptcha.render ("g-recaptcha", {
					sitekey: me.props.siteKey,
					callback: (res) => {
						me.setState ({recaptchaRes: res})
					},
					theme: "light"
				});
			} catch (err) {
			}
		};
*/
//		await loadJS ("https://www.google.com/recaptcha/api.js?onload=onRecaptchaCallback&render=explicit");
		await loadJS ("https://www.google.com/recaptcha/api.js?render=explicit");
		me.setState ({loading: false});
		
		if (me.state.activationId) {
			let state = {activationId: ""};
			
			try {
				let result = await me.props.store.remote ({
					model: "admin",
					method: "activation",
					activationId: me.state.activationId
				});
/*
				await me.props.store.auth ({
					username: result.login,
					password: result.password
				});
*/
				state.activationResult = i18n ("Account activated");
			} catch (err) {
				state.activationResult = i18n (err.message);
			}
			me.setState (state);
		}
		if (me.state.recoverId) {
			let state = {recoverId: ""};
			
			try {
				/*let result = */await me.props.store.remote ({
					model: "admin",
					method: "recover",
					recoverId: me.state.recoverId,
					email: me.state.email,
					newPassword: me.state.newPassword
				});
/*
				await me.props.store.auth ({
					username: result.login,
					password: me.state.newPassword
				});
*/
				state.recoverResult = i18n ("Password changed");
			} catch (err) {
				state.recoverResult = i18n (err.message);
			}
			me.setState (state);
		}
		if (me.loginInput) {
			me.loginInput.focus ();
		}
	}
	
	componentDidUpdate (prevProps, prevState) {
		if ((this.state.recover && !prevState.recover) || (this.state.register && !prevState.register)) {
			try {
				window.grecaptcha.render ("g-recaptcha", {
					sitekey: this.props.siteKey,
					callback: (res) => {
						this.setState ({recaptchaRes: res})
					},
					theme: "light"
				});
				this.setState ({recaptchaRendered: true});
			} catch (err) {
			}
		}
	}
	
	componentWillUnmount () {
		this.unmounted = true;
	}
	
	onChange (val) {
		let me = this;
		let id = val.target.id;
		let value = val.target.value;
		
		if (id == "email") {
			value = value.trim ().toLowerCase ();
		}
		me.setState ({[id]: value});
	}
	
	async onRegister () {
		let me = this;
		let activationHost = document.location.protocol + "//" + document.location.host + document.location.pathname;
		
/*
		if (!activationHost.endsWith ("/")) {
			activationHost += "/";
		}
*/
		return await me.props.store.remote ({
			model: "admin",
			method: "register",
			activationHost,
			email: me.state.email,
			password: crypto.createHash ("sha1").update (me.state.password).digest ("hex").toUpperCase (),
			name: me.state.name,
			subject: i18n ("User registration") + ": " + me.props.name,
			text: i18n ("To activate your account, follow the link"),
			recaptchaRes: me.state.recaptchaRes
		});
	}
	
	async onLogin () {
		let me = this;
		
		try {
			await me.props.store.auth ({
				username: me.state.email,
				password: require ("crypto").createHash ("sha1").update (me.state.password).digest ("hex").toUpperCase ()
			});
			if (!me.unmounted) {
				me.setState ({authorized: true});
			}
		} catch (err) {
			if (!me.unmounted) {
				if (err.message == "401 Unauthenticated") {
					me.setState ({error: i18n ("Incorrect e-mail (login) or password")});
				} else {
					me.setState ({error: err.message});
				}
			}
		}
	}
	
	async onKeyDown (e) {
		let me = this;
		
		if (e.key === "Enter" && me.state.email && me.state.password) {
			await me.onLogin ();
		}
	}
	
	async onRecover () {
		let me = this;
		let activationHost = document.location.protocol + "//" + document.location.host + document.location.pathname;
		
/*
		if (!activationHost.endsWith ("/")) {
			activationHost += "/";
		}
*/
		return await me.props.store.remote ({
			model: "admin",
			method: "recoverRequest",
			activationHost,
			email: me.state.email,
			name: me.state.name || undefined,
			password: require ("crypto").createHash ("sha1").update (me.state.password).digest ("hex").toUpperCase (),
			subject: i18n ("Password recovery") + ": " + me.props.name,
			text: i18n ("To recover your password, follow the link"),
			recaptchaRes: me.state.recaptchaRes
		});
	}
	
	render () {
		let me = this;
		let content;
		
		if (me.props.authorized || me.state.authorized) {
			content = me.props.children;
		} else if (me.state.activationId) {
			content = (
				<div className={me.props.cardClassName || "p-3 shadow"}>
					{i18n ("Account activation") + " ..."}
				</div>
			);
		} else if (me.state.recoverId) {
			content = (
				<div className={me.props.cardClassName || "p-3 shadow"}>
					{i18n ("Password recovery") + " ..."}
				</div>
			);
		} else if (me.state.activationResult) {
			content = (
				<div className={me.props.cardClassName || "p-3 shadow"}>
					<div className="mb-2">
						{me.state.activationResult}
					</div>
					<Action
						onClick={() => me.setState ({activationResult: ""})}
					><i className="fas fa-check mr-2"/>Ok</Action>
				</div>
			);
		} else if (me.state.recoverResult) {
			content = (
				<div className={me.props.cardClassName || "p-3 shadow"}>
					<div className="mb-2">
						{me.state.recoverResult}
					</div>
					<Action
						onClick={() => me.setState ({recoverResult: ""})}
					><i className="fas fa-check mr-2"/>Ok</Action>
				</div>
			);
		} else if (me.state.recover) {
			content = (
				<div className={me.props.cardClassName || "p-3 shadow"}>
					<h3 className="text-center">{i18n ("Password recovery")}</h3>
					<div className="form-group mt-4">
						<label htmlFor="email">{i18n ("E-mail")}</label>
						<input type="email" className="form-control" id="email" onChange={me.onChange} />
					</div>
					<div className="form-group">
						<label htmlFor="name">{i18n ("Change name")}</label>
						<input type="name" className="form-control" id="name" onChange={me.onChange} />
					</div>
					<div className="form-group">
						<label htmlFor="password">{i18n ("New password")}</label>
						<input type="password" className="form-control" id="password" onChange={me.onChange} />
					</div>
					<div className="form-group">
						<label htmlFor="password2">{i18n ("Confirm password")}</label>
						<input type="password" className="form-control" id="password2" onChange={me.onChange} />
					</div>
					{me.state.password && me.state.password2 && me.state.password != me.state.password2 && <div className="alert alert-danger" role="alert">
						{i18n ("Passwords do not match")}
					</div>}
					<div id="g-recaptcha" />
					<div className="text-center">
						<div className="mt-3">
							<Action
								btnClassName="btn btn-primary auth-button px-0"
								disabled={!me.state.email || !me.state.password || !me.state.password2 || me.state.password != me.state.password2 || !me.state.recaptchaRes}
								onClick={me.onRecover}
							><i className="fas fa-envelope mr-2"/>{i18n ("Restore password")}</Action>
						</div>
						<div className="mt-3">
							<button className="btn btn-outline-primary px-0 auth-button" onClick={() => me.setState ({recover: false})}>
								<i className="fas fa-sign-in-alt mr-2"/>{i18n ("Sign in")}
							</button>
						</div>
						<div className="mt-3">
							<button className="btn btn-outline-primary px-0 auth-button" onClick={() => me.setState ({register: true, recover: false})}>
								<i className="fas fa-key mr-2"/>{i18n ("Registration")}
							</button>
						</div>
					</div>
				</div>
			);
		} else if (me.state.register) {
			content = (
				<div className={me.props.cardClassName || "p-3 shadow"}>
					<h3 className="text-center">{i18n ("Registration")}</h3>
					<div className="form-group mt-4">
						<label htmlFor="email">{i18n ("E-mail")}</label>
						<input type="email" className="form-control" id="email" onChange={me.onChange} />
					</div>
					<div className="form-group">
						<label htmlFor="name">{i18n ("Your name")}</label>
						<input type="name" className="form-control" id="name" onChange={me.onChange} />
					</div>
					<div className="form-group">
						<label htmlFor="password">{i18n ("Password")}</label>
						<input type="password" className="form-control" id="password" onChange={me.onChange} />
					</div>
					<div className="form-group">
						<label htmlFor="password2">{i18n ("Confirm password")}</label>
						<input type="password" className="form-control" id="password2" onChange={me.onChange} />
					</div>
					{me.state.password && me.state.password2 && me.state.password != me.state.password2 && <div className="alert alert-danger" role="alert">
						{i18n ("Passwords do not match")}
					</div>}
					<div id="g-recaptcha" />
					<div className="text-center">
						<div className="mt-3">
							<Action
								btnClassName="btn btn-primary auth-button"
								onClick={me.onRegister}
								disabled={!me.state.email || !me.state.name || !me.state.password || !me.state.password2 || me.state.password != me.state.password2 || !me.state.recaptchaRes}
							><i className="fas fa-key mr-2"/>{i18n ("Register")}</Action>
						</div>
						<div className="mt-3">
							<button className="btn btn-outline-primary px-0 auth-button" onClick={() => me.setState ({register: false})}>
								<i className="fas fa-sign-in-alt mr-2"/>{i18n ("Sign in")}
							</button>
						</div>
						<div className="mt-3">
							<button className="btn btn-outline-primary px-0 auth-button" onClick={() => me.setState ({recover: true, register: false})}>
								<i className="fas fa-envelope mr-2"/>{i18n ("Forgot password?")}
							</button>
						</div>
					</div>
				</div>
			);
		} else {
			content = (
				<div className={me.props.cardClassName || "p-3 shadow"}>
					<h3 className="text-center">{i18n ("Sign In")}</h3>
					<div className="form-group mt-4">
						<label htmlFor="email">{i18n ("E-mail")}</label>
						<input type="email" className="form-control" id="email" onChange={me.onChange} ref={input => me.loginInput = input} />
					</div>
					<div className="form-group">
						<label htmlFor="loginPassword">{i18n ("Password")}</label>
						<input type="password" className="form-control" id="password" onChange={me.onChange} onKeyDown={me.onKeyDown}/>
					</div>
					<div className="text-center">
						<div className="mt-4">
							<Action
								btnClassName="btn btn-primary auth-button"
								disabled={!me.state.email || !me.state.password}
								onClick={me.onLogin}
							><i className="fas fa-sign-in-alt mr-2"/>{i18n ("Log in")}</Action>
						</div>
						<div className="mt-3">
							<button className="btn btn-outline-primary px-0 auth-button" onClick={() => me.setState ({register: true})}>
								<i className="fas fa-key mr-2"/>{i18n ("Registration")}
							</button>
						</div>
						<div className="mt-3">
							<button className="btn btn-outline-primary px-0 auth-button" onClick={() => me.setState ({recover: true})}>
								<i className="fas fa-envelope mr-2"/>{i18n ("Forgot password?")}
							</button>
						</div>
					</div>
					{me.state.error && <div className="mt-3 alert alert-danger" role="alert">
						{me.state.error}
					</div>}
				</div>
			);
		}
		return (
			<div className={me.props.className || "m-auto"} style={{width: me.props.width || "352px"}}>{content}</div>
		);
	}
};
Office.displayName = "Office";

export default Office;

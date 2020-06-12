/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import Action from "./Action";
import crypto from "crypto";
import {i18n} from "./../i18n";

class Office extends Component {
	constructor (props) {
		super (props);
		
		this.state = {};
		
		this.onChange = this.onChange.bind (this);
		this.onRegister = this.onRegister.bind (this);
		this.onLogin = this.onLogin.bind (this);
		this.onKeyDown = this.onKeyDown.bind (this);
		this.onRecover = this.onRecover.bind (this);

		let search = document.location.search.substr (1);

		if (search.startsWith ("recover=")) {
			this.state.recover = true;
		}
		if (search.startsWith ("activationId=")) {
			this.state.actiovationId = search.substr (13);
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
			}
		}
	}
	
	async componentDidMount () {
		let me = this;
		
		if (me.state.activationId) {
			let state = {activationId: ""};
			
			try {
				let result = await me.props.store.remote ({
					model: "admin",
					method: "activation",
					activationId: me.state.activationId
				});
				await me.props.store.auth ({
					username: result.login,
					password: result.password
				});
				state.activationResult = i18n ("Account activated");
			} catch (err) {
				state.activationResult = err.message;
			}
			me.setState (state);
		}
		if (me.state.recoverId) {
			let state = {recoverId: ""};
			
			try {
				let result = await me.props.store.remote ({
					model: "admin",
					method: "recover",
					recoverId: me.state.recoverId,
					email: me.state.email
				});
				await me.props.store.auth ({
					username: result.login,
					password: result.password
				});
				state.recoverResult = i18n ("New password") + ": " + result.plainPassword;
			} catch (err) {
				state.recoverResult = err.message;
			}
			me.setState (state);
		}
	}
	
	onChange (val) {
		let me = this;
		let id = val.target.id;
		let value = val.target.value;
		
		if (id == "email" || id == "loginEmail" || id == "recoverEmail") {
			value = value.trim ().toLowerCase ();
		}
		me.setState ({[id]: value});
	}
	
	async onRegister () {
		let me = this;
		let activationHost = document.location.protocol + "//" + document.location.host;
		
		return await me.props.store.remote ({
			model: "admin",
			method: "register",
			activationHost,
			email: me.state.email,
			password: crypto.createHash ("sha1").update (me.state.password).digest ("hex").toUpperCase (),
			name: me.state.name
		});
	}
	
	async onLogin () {
		let me = this;
		
		try {
			await me.props.store.auth ({
				username: me.state.loginEmail,
				password: require ("crypto").createHash ("sha1").update (me.state.loginPassword).digest ("hex").toUpperCase ()
			});
		} catch (err) {
			if (err.message == "401 Unauthenticated") {
				me.setState ({loginError: i18n ("Incorrect e-mail (login) or password")});
			} else {
				me.setState ({loginError: err.message});
			}
		}
	}
	
	async onKeyDown (e) {
		let me = this;
		
		if (e.key === "Enter" && me.state.loginEmail && me.state.loginPassword) {
			await me.onLogin ();
		}
	}
	
	async onRecover () {
		let me = this;
		let activationHost = document.location.protocol + "//" + document.location.host;
		
		return await me.props.store.remote ({
			model: "admin",
			method: "recoverRequest",
			activationHost,
			email: me.state.recoverEmail
		});
	}
	
	render () {
		let me = this;
		
		if (me.state.activationId) {
			return (
				<div className={me.props.cardClassName || "p-4 shadow"}>
					{i18n ("Account activation") + " ..."}
				</div>
			);
		}
		if (me.state.recoverId) {
			return (
				<div className={me.props.cardClassName || "p-4 shadow"}>
					{i18n ("Password recovery") + " ..."}
				</div>
			);
		}
		if (me.state.activationResult) {
			return (
				<div className={me.props.cardClassName || "p-4 shadow"}>
					<div className="mb-2">
						{me.state.activationResult}
					</div>
					<Action
						onClick={() => me.setState ({activationResult: ""})}
					><i className="fas fa-check mr-2"/>Ok</Action>
				</div>
			);
		}
		if (me.state.recoverResult) {
			return (
				<div className={me.props.cardClassName || "p-4 shadow"}>
					<div className="mb-2">
						{me.state.recoverResult}
					</div>
					<Action
						onClick={() => me.setState ({recoverResult: ""})}
					><i className="fas fa-check mr-2"/>Ok</Action>
				</div>
			);
		}
		if (me.props.authorized) {
			return me.props.children;
		}
		if (me.state.recover) {
			return (
				<div className={me.props.cardClassName || "p-4 shadow"}>
					<h3 className="">{i18n ("Password recovery")}</h3>
						<div className="form-group mt-4">
							<label htmlFor="recoverEmail">{i18n ("E-mail")}</label>
							<input type="email" className="form-control" id="recoverEmail" onChange={me.onChange} />
						</div>
					<Action
						onClick={me.onRecover}
						disabled={!me.state.recoverEmail}
					><i className="fas fa-envelope mr-2"/>{i18n ("Restore password")}</Action>
				</div>
			);
		}
		return (
			<div>
				<div className="d-flex">
					<div className={(me.props.cardClassName || "p-4 shadow") + " mr-4 w-50"}>
						<h3 className="text-center">{i18n ("Registration")}</h3>
						<div className="form-group mt-4">
							<label htmlFor="email">{i18n ("E-mail")}</label>
							<input type="email" className="form-control" id="email" onChange={me.onChange} />
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
						<div className="text-center pt-3">
							<Action
								onClick={me.onRegister}
								disabled={!me.state.email || !me.state.password || !me.state.password2 || me.state.password != me.state.password2}
							><i className="fas fa-key mr-2"/>{i18n ("Register")}</Action>
						</div>
						{me.state.registerError && <div className="mt-3 alert alert-danger" role="alert">
							{me.state.registerError}
						</div>}
						{me.state.registerSuccess && <div className="mt-3 alert alert-info" role="alert">
							{i18n ("Registration successful")}
						</div>}
					</div>
					<div className={(me.props.cardClassName || "p-4 shadow") + " w-50"}>
						<h3 className="text-center">{i18n ("Sign In")}</h3>
						<div className="form-group mt-4">
							<label htmlFor="loginEmail">{i18n ("E-mail")}</label>
							<input type="email" className="form-control" id="loginEmail" onChange={me.onChange} />
						</div>
						<div className="form-group">
							<label htmlFor="loginPassword">{i18n ("Password")}</label>
							<input type="password" className="form-control" id="loginPassword" onChange={me.onChange} onKeyDown={me.onKeyDown} />
						</div>
						<div className="text-center pt-3">
							<div>
								<Action
									btnClassName="btn btn-primary px-4"
									disabled={!me.state.loginEmail || !me.state.loginPassword}
									onClick={me.onLogin}
								><i className="fas fa-sign-in-alt mr-2"/>{i18n ("Log in")}</Action>
							</div>
							<button className="btn btn-link mt-2" onClick={() => me.setState ({recover: true})}>{i18n ("Forgot password?")}</button>
						</div>
						{me.state.loginError && <div className="mt-3 alert alert-danger" role="alert">
							{me.state.loginError}
						</div>}
					</div>
				</div>
			</div>
		);
	}
};
Office.displayName = "Office";

export default Office;

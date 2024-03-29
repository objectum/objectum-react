/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Action, i18n, loadJS, Loading} from "..";
import crypto from "crypto";

export default class Office extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			loading: true,
			recover: false,
			register: false,
			email: "",
			name: "",
			password: "",
			password2: "",
			inputError: {}
		};
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
				this.state.newName = o.newName;
				this.state.newPassword = o.newPassword;
			}
		}
	}
	
	async componentDidMount () {
		window.onRecaptchaCallback = () => {
			try {
				window.grecaptcha.render ("g-recaptcha", {
					sitekey: this.props.siteKey,
					callback: (res) => {
						this.setState ({recaptchaRes: res})
					},
					theme: "light"
				});
			} catch (err) {
			}
		};
		await loadJS ("https://www.google.com/recaptcha/api.js?onload=onRecaptchaCallback&render=explicit");
		this.setState ({loading: false});
		
		if (this.state.activationId) {
			let state = {activationId: ""};
			
			try {
				await this.props.store.remote ({
					model: "admin",
					method: "activation",
					activationId: this.state.activationId
				});
				state.activationResult = i18n ("Account activated");
			} catch (err) {
				state.activationResult = i18n (err.message);
			}
			this.setState (state);

			if (window.history) {
				let url = window.location.protocol + "//" + window.location.host + window.location.pathname;
				window.history.pushState ({path: url}, "", url);
			}
		}
		if (this.state.recoverId) {
			let state = {recoverId: ""};
			
			try {
				await this.props.store.remote ({
					model: "admin",
					method: "recover",
					recoverId: this.state.recoverId,
					email: this.state.email,
					newPassword: this.state.newPassword,
					newName: this.state.newName
				});
				state.recoverResult = i18n ("Password changed");
			} catch (err) {
				state.recoverResult = i18n (err.message);
			}
			this.setState (state);

			if (window.history) {
				let url = window.location.protocol + "//" + window.location.host + window.location.pathname;
				window.history.pushState ({path: url}, "", url);
			}
		}
		if (this.loginInput) {
			this.loginInput.focus ();
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
	
	onChange = (val) => {
		let id = val.target.id;
		let value = val.target.value;
		
		if (id == "email") {
			value = value.trim ().toLowerCase ();
		}
		this.setState ({[id]: value});
	}
	
	onRegister = async () => {
		let activationHost = document.location.protocol + "//" + document.location.host + document.location.pathname;
		let fields = ["email", "name", "password", "password2", "recaptchaRes"];
		
		for (let i = 0; i < fields.length; i ++) {
			if (!this.state [fields [i]]) {
				return this.setState ({inputError: {[fields [i]]: i18n ("Please enter value")}});
			}
		}
		if (this.state.password != this.state.password2) {
			return;
		}
		return await this.props.store.remote ({
			model: "admin",
			method: "register",
			activationHost,
			email: this.state.email,
			password: crypto.createHash ("sha1").update (this.state.password).digest ("hex").toUpperCase (),
			name: this.state.name,
			subject: i18n ("User registration") + ": " + this.props.name,
			text: i18n ("To activate your account, follow the link"),
			recaptchaRes: this.state.recaptchaRes
		});
	}
	
	onLogin = async () => {
		let fields = ["email", "password"];
		
		for (let i = 0; i < fields.length; i ++) {
			if (!this.state [fields [i]]) {
				return this.setState ({inputError: {[fields [i]]: i18n ("Please enter value")}});
			}
		}
		try {
			this.setState ({processing: true});

			await this.props.store.auth ({
				username: this.state.email,
				password: require ("crypto").createHash ("sha1").update (this.state.password).digest ("hex").toUpperCase ()
			});
			if (!this.unmounted) {
				this.setState ({processing: false, authorized: true, inputError: {}});
			}
			return i18n ("Logged in")
		} catch (err) {
			if (!this.unmounted) {
				if (err.message == "401 Unauthenticated") {
					this.setState ({processing: false, error: i18n ("Incorrect e-mail (login) or password"), inputError: {}});
				} else {
					this.setState ({processing: false, error: err.message, inputError: {}});
				}
			}
		}
	}
	
	onKeyDown = async (e) => {
		if (e.key === "Enter" && this.state.email && this.state.password) {
			await this.onLogin ();
		}
	}
	
	onRecover = async () => {
		let activationHost = document.location.protocol + "//" + document.location.host + document.location.pathname;
		
		let fields = ["email", "password", "password2"];
		
		for (let i = 0; i < fields.length; i ++) {
			if (!this.state [fields [i]]) {
				return this.setState ({inputError: {[fields [i]]: i18n ("Please enter value")}});
			}
		}
		if (this.state.password != this.state.password2) {
			return;
		}
		this.setState ({inputError: {}});
		return await this.props.store.remote ({
			model: "admin",
			method: "recoverRequest",
			activationHost,
			email: this.state.email,
			name: this.state.name || undefined,
			password: require ("crypto").createHash ("sha1").update (this.state.password).digest ("hex").toUpperCase (),
			subject: i18n ("Password recovery") + ": " + this.props.name,
			text: i18n ("To recover your password, follow the link"),
			recaptchaRes: this.state.recaptchaRes
		});
	}
	
	switch ({register, recover}) {
		this.setState ({register, recover, inputError: {}, email: "", name: "", password: "", password2: ""});
	}
	
	render () {
		let content;
		
		if (this.props.authorized || this.state.authorized) {
			content = this.props.children;
		} else if (this.state.activationId) {
			content = <div className={this.props.cardClassName || "p-3 shadow-sm"}>
				{i18n ("Account activation") + " ..."}
			</div>;
		} else if (this.state.recoverId) {
			content = <div className={this.props.cardClassName || "p-3 shadow-sm"}>
				{i18n ("Password recovery") + " ..."}
			</div>;
		} else if (this.state.activationResult) {
			content = <div className={this.props.cardClassName || "p-3 shadow-sm"}>
				<div className="mb-2">
					{this.state.activationResult}
				</div>
				<Action
					onClick={() => this.setState ({activationResult: ""})}
				><i className="fas fa-check mr-2"/>Ok</Action>
			</div>;
		} else if (this.state.recoverResult) {
			content = <div className={this.props.cardClassName || "p-3 shadow-sm"}>
				<div className="mb-2">
					{this.state.recoverResult}
				</div>
				<Action
					onClick={() => this.setState ({recoverResult: ""})}
				><i className="fas fa-check mr-2"/>Ok</Action>
			</div>;
		} else if (this.state.recover) {
			content = <div className={this.props.cardClassName || "auth shadow-sm bg-white rounded text-center"}>
				<h3 className="font-weight-bold mb-5">{i18n ("Password recovery")}</h3>
				<div className="form-group">
					<input type="email" className="form-control" id="email" value={this.state.email} onChange={this.onChange} placeholder={i18n ("E-mail")} autoComplete="off" />
					{this.state.inputError ["email"] && <div className="small text-danger">{this.state.inputError ["email"]}</div>}
				</div>
				<div className="form-group">
					<input type="password" className="form-control" id="password" value={this.state.password} onChange={this.onChange} placeholder={i18n ("New password")} />
					{this.state.inputError ["password"] && <div className="small text-danger">{this.state.inputError ["password"]}</div>}
				</div>
				<div className="form-group">
					<input type="password" className="form-control" id="password2" value={this.state.password2} onChange={this.onChange} placeholder={i18n ("Confirm password")} />
					{this.state.inputError ["password2"] && <div className="small text-danger">{this.state.inputError ["password2"]}</div>}
				</div>
				{this.state.password && this.state.password2 && this.state.password != this.state.password2 && <div className="small text-danger mb-3">
					{i18n ("Passwords do not match")}
				</div>}
				<div id="g-recaptcha" />
				{this.state.inputError ["recaptchaRes"] && <div className="small text-danger">{this.state.inputError ["recaptchaRes"]}</div>}
				<div className="mt-3">
					<Action
						btnClassName="btn btn-primary w-100"
						onClick={this.onRecover}
					><span className="text-uppercase font-weight-bold">{i18n ("Restore password")}</span></Action>
				</div>
				<div className="mt-2">
					<button className="btn btn-link" onClick={() => this.switch ({register: false, recover: false})}>
						<span className="text-uppercase font-weight-bold">{i18n ("Sign in")}</span>
					</button>
				</div>
			</div>;
		} else if (this.state.register) {
			content = <div className={this.props.cardClassName || "auth shadow-sm bg-white rounded text-center"}>
				<h2 className="font-weight-bold mb-5">{i18n ("Registration")}</h2>
				<div className="form-group">
					<input type="email" className="form-control" id="email" value={this.state.email} onChange={this.onChange} placeholder={i18n ("E-mail")} autoComplete="off" />
					{this.state.inputError ["email"] && <div className="small text-danger">{this.state.inputError ["email"]}</div>}
				</div>
				<div className="form-group">
					<input type="name" className="form-control" id="name" value={this.state.name} onChange={this.onChange} placeholder={i18n ("Your name")} autoComplete="off" />
					{this.state.inputError ["name"] && <div className="small text-danger">{this.state.inputError ["name"]}</div>}
				</div>
				<div className="form-group">
					<input type="password" className="form-control" id="password" value={this.state.password} onChange={this.onChange} placeholder={i18n ("Password")} />
					{this.state.inputError ["password"] && <div className="small text-danger">{this.state.inputError ["password"]}</div>}
				</div>
				<div className="form-group">
					<input type="password" className="form-control" id="password2" value={this.state.password2} onChange={this.onChange} placeholder={i18n ("Confirm password")} />
					{this.state.inputError ["password2"] && <div className="small text-danger">{this.state.inputError ["password2"]}</div>}
				</div>
				{this.state.password && this.state.password2 && this.state.password != this.state.password2 && <div className="small text-danger mb-2">
					{i18n ("Passwords do not match")}
				</div>}
				<div id="g-recaptcha" />
				{this.state.inputError ["recaptchaRes"] && <div className="small text-danger">{this.state.inputError ["recaptchaRes"]}</div>}
				<div className="mt-3">
					<Action
						btnClassName="btn btn-primary w-100"
						onClick={this.onRegister}
					><span className="text-uppercase font-weight-bold">{i18n ("Register")}</span></Action>
				</div>
				<div className="mt-2">
					<button className="btn btn-link" onClick={() => this.switch ({register: false, recover: false})}>
						<span className="text-uppercase font-weight-bold">{i18n ("Sign in")}</span>
					</button>
				</div>
			</div>;
		} else {
			content = <div className={this.props.cardClassName || "auth shadow-sm bg-white rounded text-center"}>
				<h2 className="font-weight-bold mb-5">{i18n ("Sign In")}</h2>
				<div className="form-group">
					<input type="email" className="form-control" id="email" value={this.state.email} onChange={this.onChange} ref={input => this.loginInput = input} placeholder={i18n ("E-mail")} autoComplete="off" />
					{this.state.inputError ["email"] && <div className="small text-danger">{this.state.inputError ["email"]}</div>}
				</div>
				<div className="form-group">
					<input type="password" className="form-control" id="password" value={this.state.password} onChange={this.onChange} onKeyDown={this.onKeyDown} placeholder={i18n ("Password")} />
					{this.state.inputError ["password"] && <div className="small text-danger">{this.state.inputError ["password"]}</div>}
				</div>
				<div className="mt-2">
					<button className="btn btn-link" onClick={() => this.switch ({register: false, recover: true})}>
						<span className="font-italic">{i18n ("Forgot password?")}</span>
					</button>
				</div>
				<div className="mt-2">
					<Action
						btnClassName="btn btn-primary w-100"
						onClick={this.onLogin}
						hideProgress
						disabled={this.state.processing}
						label={this.state.processing ? <span className="spinner-border spinner-border-sm" /> :
							<span className="text-uppercase font-weight-bold">{i18n ("Log in")}</span>}
					/>
				</div>
				<div className="mt-2">
					<button className="btn btn-link" onClick={() => this.switch ({register: true, recover: false})}>
						<span className="text-uppercase font-weight-bold">{i18n ("Registration")}</span>
					</button>
				</div>
				{this.state.error && <div className="mt-3 alert alert-danger" role="alert">
					{this.state.error}
				</div>}
			</div>;
		}
		return <div>{content}</div>;
	}
};
Office.displayName = "Office";

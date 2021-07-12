import React, {Component} from "react";
import {Loading, i18n, timeout, Fade} from "..";

export default class Auth extends Component {
	constructor (props) {
		super (props);
		
		this.store = this.props.store;
		this.state = {
			loading: false
		};
	}
	
	fieldChange = (val) => {
		let id = val.target.id;
		let v = val.target.value;

		this.setState ({[id]: v});
	}
	
	buttonClick = async () => {
		try {
			this.setState ({loading: true});
			await timeout ();

			if (!this.store) {
				throw new Error ("store not exist");
			}
			await this.store.auth ({
				username: this.state.username,
				password: require ("crypto").createHash ("sha1").update (this.state.password).digest ("hex").toUpperCase ()
			});
		} catch (error) {
			if (error.message == "401 Unauthenticated") {
				this.setState ({loading: false, error: i18n ("Invalid username or password")});
			} else {
				this.setState ({loading: false, error: error.message});
			}
		}
	}
	
	onKeyDown = (e) => {
		if (e.key === "Enter" && this.state.username && this.state.password) {
			this.buttonClick ();
		}
	}
	
	componentDidMount () {
		this.usernameInput.focus ();
	}
	
	render () {
		let disabledButton = false;
		
		if (!this.state.username || !this.state.password || this.state.loading) {
			disabledButton = true;
		}
		let authInfo;
		
		if (this.props.onRenderAuthInfo) {
			authInfo = <div className="auth-info flex-grow-1 p-3 border-left">
				<div className="mt-1 ml-2">
					<h3>{this.props.name}</h3>
				</div>
				<div className="mt-3 ml-2">
					<h5>{i18n ("version") + " " + this.props.version}</h5>
				</div>
			</div>;
			authInfo = this.props.onRenderAuthInfo (authInfo);
		}
		return <Fade>
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
									onChange={this.fieldChange}
									ref={input => this.usernameInput = input}
									onKeyDown={this.onKeyDown}
								/>
							</div>
							<div className="mt-3">
								<input
									type="password"
									className="form-control"
									id="password"
									placeholder={i18n ("Password")}
									onChange={this.fieldChange}
									onKeyDown={this.onKeyDown}
								/>
							</div>
							<div className="mt-3">
								<button type="button" className="btn btn-primary" onClick={this.buttonClick} disabled={disabledButton}>
									{this.state.loading ? <Loading /> : <span><i className="fas fa-sign-in-alt mr-2"/>{i18n ("Log in")}</span>}
								</button>
							</div>
							{this.state.error && (
								<div className="alert alert-danger mt-3" role="alert">
									{this.state.error}
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
						<strong>{this.props.name}</strong>
					</div>
					<div className="border-bottom px-2 py-1">
						<i>{i18n ("version") + " " + this.props.version}</i>
					</div>
					<div className="p-2">
						<div>
							<input
								type="text"
								className="form-control"
								id="username"
								placeholder={i18n ("Username")}
								onChange={this.fieldChange}
								ref={input => this.usernameInput = input}
								onKeyDown={this.onKeyDown}
							/>
						</div>
						<div className="mt-3">
							<input
								type="password"
								className="form-control"
								id="password"
								placeholder={i18n ("Password")}
								onChange={this.fieldChange}
								onKeyDown={this.onKeyDown}
							/>
						</div>
						<div className="mt-3">
							<button type="button" className="btn btn-primary" onClick={this.buttonClick} disabled={disabledButton}>
								{this.state.loading ? <Loading /> : <span><i className="fas fa-sign-in-alt mr-2"/>{i18n ("Log in")}</span>}
							</button>
						</div>
					</div>
					{this.state.error && (
						<div className="alert alert-danger mt-3" role="alert">
							{this.state.error}
						</div>
					)}
				</div>
			</div>}
		</Fade>;
	}
}
Auth.displayName = "Auth";

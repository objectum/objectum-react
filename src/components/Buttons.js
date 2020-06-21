import {useHistory} from "react-router-dom";
import {i18n} from "../i18n";
import React from "react";

function HomeButtonSB () {
	let history = useHistory ();
	
	function handleClick () {
		history.push ("/");
	}
	return (
		<button className="btn btn-link" onClick={handleClick}>
			<i className="fas fa-home" />
		</button>
	);
};

function HomeButton (props) {
	let history = useHistory ();
	
	function handleClick () {
		history.push ("/");
	}
	return (
		<button className="btn btn-link p-0 text-white" onClick={handleClick}>
			{props.children || <i className="fas fa-home" />}
		</button>
	);
};

function LogoutButtonSB ({app, size}) {
	let history = useHistory ();
	
	function handleClick () {
		app.store.end ();
		
		app.setState ({
			sidebarOpen: false, locations: [], sid: null
		});
		history.push ("/");
	}
	return (
		<button className="btn btn-link pl-3" onClick={handleClick}>
			<span className={`fas fa-sign-out-alt ${size} menu-icon align-middle mr-1`} /><span className="text-dark">{i18n ("Logout")}</span>
		</button>
	);
};

function LogoutButton ({app, iconsTop}) {
	let history = useHistory ();
	
	function handleClick () {
		app.store.end ();
		
		app.setState ({
			sidebarOpen: false, locations: [], sid: null
		});
		history.push ("/");
	}
	let content = <span><i className="fas fa-sign-out-alt mr-2" />{i18n ("Logout")}</span>;
	
	if (iconsTop) {
		content = <div className="">
			<div className="text-center"><i className="fas fa-sign-out-alt fa-2x" /></div>
			<div className="text-center">{i18n ("Logout")}</div>
		</div>;
	}
	return (
		<button className="btn btn-link nav-item nav-link font-weight-bold text-left" onClick={handleClick}>{content}</button>
	);
};

function BackButtonSB ({popLocation, locations}) {
	let history = useHistory ();
	
	function handleClick () {
		let {pathname, hash} = locations [locations.length - 2];
		
		popLocation ();

//		history.push (decodeURI (pathname + hash));
		history.push (pathname + hash);
	}
	return (
		<button className="btn btn-link" disabled={locations.length < 2} onClick={handleClick}>
			<i className="fas fa-arrow-left mr-2" /><span className="text-dark">{i18n ("Back")}</span>
		</button>
	);
};

function BackButton ({popLocation, locations, children, iconsTop}) {
	let history = useHistory ();
	
	function handleClick () {
		let {pathname, hash} = locations [locations.length - 2];
		
		popLocation ();

//		history.push (decodeURI (pathname + hash));
		history.push (pathname + hash);
	}
	let content = <span>{children || <span><i className="fas fa-arrow-left mr-2" />{i18n ("Back")}</span>}</span>;
	
	if (iconsTop) {
		content = <div className="">
			<div className="text-center"><i className="fas fa-arrow-left fa-2x" /></div>
			<div className="text-center">{i18n ("Back")}</div>
		</div>;
	}
	return (
		<button className="btn btn-link nav-item nav-link font-weight-bold text-left" disabled={!locations || locations.length < 2} onClick={handleClick}>
			{content}
		</button>
	);
};

export {
	HomeButtonSB,
	HomeButton,
	LogoutButtonSB,
	LogoutButton,
	BackButtonSB,
	BackButton
};

import React from "react";
import {Menu, MenuItem, SubMenu} from "@szhsin/react-menu";
import {useHistory} from "react-router-dom";
import {i18n} from "../i18n";

export default function MenuButton (props) {
	const history = useHistory ();

	function onClick (opts) {
		if (props.onClick) {
			props.onClick (opts);
		}
		if (opts.path) {
			history.push (opts.path);
		}
	}
	function getItems (items) {
		return items.map ((item, i) => {
			if (item.items) {
				return <SubMenu key={i} label={<span>{item.icon ? <i className={`${item.icon} mr-2 text-center`} style={{width: "1.5em"}} /> : null}{i18n (item.label)}</span>}>
					{getItems (item.items)}
				</SubMenu>;
			} else {
				return <MenuItem key={i} path={item.path} onClick={() => onClick ({value: item.value || item.label, path: item.path, history})}>
					{item.icon ? <i className={`${item.icon} mr-2 text-center`} style={{width: "1.5em"}} /> : null}{i18n (item.label)}
				</MenuItem>;
			}
		});
	}
	return <Menu menuButton={props.menuButton || <button className="btn btn-primary"><i className="fas fa-bars" /></button>}>
		{getItems (props.items)}
	</Menu>;
};

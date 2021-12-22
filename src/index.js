import Action from "./components/Action";
import Auth from "./components/Auth";
import BooleanField from "./components/BooleanField";
import ChooseField from "./components/ChooseField";
import Model from "./components/Model";
import Property from "./components/Property";
import Properties from "./components/Properties";
import Models from "./components/Models";
import Confirm from "./components/Confirm";
import DateField from "./components/DateField";
import DateSelector from "./components/DateSelector";
import Field from "./components/Field";
import FileField from "./components/FileField";
import Form from "./components/Form";
import Grid from "./components/Grid";
import Cell from "./components/Cell";
import Menu from "./components/Menu";
import Menus from "./components/Menus";
import NumberField from "./components/NumberField";
import ObjectumApp from "./components/ObjectumApp";
import ObjectumRoute from "./components/ObjectumRoute";
import Role from "./components/Role";
import Roles from "./components/Roles";
import SelectField from "./components/SelectField";
import DictField from "./components/DictField";
import StringField from "./components/StringField";
import JsonField from "./components/JsonField";
import LabelField from "./components/LabelField";
import RadioField from "./components/RadioField";
import Tab from "./components/Tab";
import Tabs from "./components/Tabs";
import Types from "./components/Types";
import User from "./components/User";
import Users from "./components/Users";
import Query from "./components/Query";
import Column from "./components/Column";
import Columns from "./components/Columns";
import Queries from "./components/Queries";
import JsonEditor from "./components/JsonEditor";
import ModelList from "./components/ModelList";
import ModelTree from "./components/ModelTree";
import ModelRecord from "./components/ModelRecord";
import RemoveAction from "./components/RemoveAction";
import Loading from "./components/Loading";
import Tooltip from "./components/Tooltip";
import Navbar from "./components/Navbar";
import Fade from "./components/Fade";
import Office from "./components/Office";
import Return from "./components/Return";
import MenuButton from "./components/MenuButton";
import ImportCSS from "./components/ImportCSS";
import Stat from "./components/Stat";
/*
import Schema from "./components/Schema";
*/
import MenuItem from "./components/MenuItem";
import MenuItems from "./components/MenuItems";
import Records from "./components/Records";
import Log from "./components/Log";
import EditForm from "./components/EditForm";
import Pagination from "./components/Pagination";
import Tree from "./components/Tree";
import Panel from "./components/Panel";
import Group from "./components/Group";

import {i18n, setLocale, getLocale, locales} from "./i18n";
import {
	HomeButtonSB,
	HomeButton,
	LogoutButtonSB,
	LogoutButton,
	BackButtonSB,
	BackButton
} from "./components/Buttons";
import {
	getHash,
	setHash,
	addHashListener,
	removeHashListener,
	loadCSS,
	loadJS,
	getDateString,
	goRidLocation,
	timeout,
	newId,
	getTimestampString,
	getStore
} from "./modules/common";
import {
	createReport,
	reportStyles
} from "./modules/report";
import mediator from "./modules/mediator";

export {
	Action,
	Auth,
	BooleanField,
	ChooseField,
	Model,
	Property,
	Properties,
	Models,
	Confirm,
	DateField,
	DateSelector,
	Field,
	FileField,
	Form,
	Grid,
	Cell,
	Menu,
	Menus,
	NumberField,
	ObjectumApp,
	ObjectumRoute,
	Role,
	Roles,
	SelectField,
	DictField,
	StringField,
	JsonField,
	LabelField,
	RadioField,
	Tab,
	Tabs,
	Types,
	User,
	Users,
	Query,
	Column,
	Columns,
	Queries,
	HomeButtonSB,
	HomeButton,
	LogoutButtonSB,
	LogoutButton,
	BackButtonSB,
	BackButton,
	getHash,
	setHash,
	addHashListener,
	removeHashListener,
	loadCSS,
	loadJS,
	getDateString,
	JsonEditor,
	ModelList,
	ModelTree,
	ModelRecord,
	RemoveAction,
	Loading,
	Tooltip,
	Navbar,
	Fade,
	Office,
	Return,
	ImportCSS,
	Stat,
	/*
		Schema,
	*/
	MenuItems,
	MenuItem,
	Records,
	Log,
	EditForm,
	Pagination,
	Tree,
	Panel,
	Group,
	MenuButton,
	i18n,
	setLocale,
	getLocale,
	locales,
	goRidLocation,
	timeout,
	newId,
	getTimestampString,
	createReport,
	reportStyles,
	getStore,
	mediator
};
export default {
	Action,
	Auth,
	BooleanField,
	ChooseField,
	Model,
	Property,
	Properties,
	Models,
	Confirm,
	DateField,
	DateSelector,
	Field,
	FileField,
	Form,
	Grid,
	Cell,
	Menu,
	Menus,
	NumberField,
	ObjectumApp,
	ObjectumRoute,
	Role,
	Roles,
	SelectField,
	DictField,
	StringField,
	JsonField,
	LabelField,
	RadioField,
	Tab,
	Tabs,
	Types,
	User,
	Users,
	Query,
	Column,
	Columns,
	Queries,
	HomeButtonSB,
	HomeButton,
	LogoutButtonSB,
	LogoutButton,
	BackButtonSB,
	BackButton,
	getHash,
	setHash,
	addHashListener,
	removeHashListener,
	loadCSS,
	loadJS,
	getDateString,
	JsonEditor,
	ModelList,
	ModelTree,
	ModelRecord,
	RemoveAction,
	Loading,
	Tooltip,
	Navbar,
	Fade,
	Office,
	Return,
	ImportCSS,
	Stat,
	/*
		Schema,
	*/
	MenuItems,
	MenuItem,
	Records,
	Log,
	EditForm,
	Pagination,
	Tree,
	Panel,
	Group,
	MenuButton,
	i18n,
	setLocale,
	getLocale,
	locales,
	goRidLocation,
	timeout,
	newId,
	getTimestampString,
	createReport,
	reportStyles,
	getStore,
	mediator
};
window.OBJECTUM_APP = {
	DictField: {
		scrollOffset: -50
	}
};

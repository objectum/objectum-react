/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {StringField, NumberField, DateField, BooleanField, DictField, ChooseField, FileField, ModelList, Log, Loading, EditForm} from "..";
import {i18n} from "..";
import {execute} from "objectum-client";
import _isNumber from "lodash.isnumber";
import _each from "lodash.foreach";
import _isEmpty from "lodash.isempty";

export default class Form extends Component {
	constructor (props) {
		super (props);

		this.fileMap = {};
		this.record = null;
		this.model = null;

		this.state = {
			_loading: true,
			_saving: false,
			_saved: false,
			_creating: false,
			_showLog: false,
			_saveProgress: 0
		};
		if (this.props.values) {
			Object.assign (this.state, this.props.values);
		}
	}

	getValues (children) {
		let values = {};

		React.Children.forEach (children, child => {
			if (!child || !child.props) {
				return;
			}
			let code = child.props.property;

			if (code) {
				values [code] = this.state [code];
			} else
			if (child.props.children) {
				Object.assign (values, this.getValues (child.props.children));
			}
		});
		return values;
	}

	getFields (children) {
		let fields = {};

		React.Children.forEach (children, child => {
			if (!child || !child.props) {
				return;
			}
			let code = child.props.property;

			if (code) {
				fields [code] = child;
			} else
			if (child.props.children) {
				Object.assign (fields, this.getFields (child.props.children));
			}
		});
		return fields;
	}

	updateState = async (prevProps = {}, initStateValues) => {
		let state = {};
		//let getValue = (a) => state.hasOwnProperty (a) ? state [a] : this.state [a];
		//let initStateValues = false;

		try {
			// edit record
			if (this.props.rsc && this.props.rid && this.props.rid != prevProps.rid) {
				initStateValues = true;
				state._rid = this.props.rid;
				this.record = await this.props.store.getRsc (this.props.rsc, this.props.rid);

				if (this.props.rsc == "record") {
					this.model = this.props.store.getModel (this.record.get ("_model"));
				}
			}
			// new record
			//if (!this.model && this.props.rsc == "record" && this.props.mid) {
			if (!this.props.rid && (!this.model || this.state.rid) && this.props.rsc == "record" && this.props.mid) {
				initStateValues = true;
				state._rid = null;
				this.model = this.props.store.getModel (this.props.mid);
			}
			if (this.model && !this.regModel) {
				this.regModel = this.props.store.getRegistered (this.model.getPath ());
			}
			// edit another record
			if (this.props.record && (!this.record || (this.record && this.props.record.id != this.record.id))) {
				initStateValues = true;
				this.record = this.props.record;
			}
			if (initStateValues) {
				let fields = this.getFields (this.props.children);

				for (let code in fields) {
					let field = fields [code];
					let value;

					if (this.record) {
						value = (this.record [code] === null || this.record [code] === undefined) ? "" : this.record [code];
					} else {
						if (field.props.hasOwnProperty ("value") && field.props.value !== undefined) {
							value = field.props.value;
						} else {
							if (this.props.defaults && this.props.defaults.hasOwnProperty (code)) {
								value = this.props.defaults [code];
							}
						}
					}
					if (value !== undefined && this.state [code] !== value) {
						state [code] = value;
					}
				}
				if (this.record) {
					for (let code in this.record._data) {
						if (!fields.hasOwnProperty (code) && this.state.hasOwnProperty (code) && !state.hasOwnProperty (code)) {
							state [code] = this.record [code];
						}
					}
				}
			}
			if (this.props.values && JSON.stringify (this.props.values) != JSON.stringify (prevProps.values)) {
				for (let code in this.props.values) {
					if (this.props.values [code] !== undefined) {
						state [code] = this.props.values [code];
					}
				}
			}
		} catch (err) {
			state._error = err.message;
			console.error (err);
		}
		if (this.state._loading) {
			state._loading = false;
		}
		if (!_isEmpty (state) && !this.unmounted) {
			this.setState (state);
		}
	}

	async componentDidMount () {
		await this.updateState ({}, true);
		this.autoSaveIntervalId = setInterval (this.autoSave, this.props.autoSaveInterval || 5000);
	}

	async componentDidUpdate (prevProps) {
		if (this.props.rsc && prevProps.rid && this.props.rid != prevProps.rid) {
			await this.autoSave ();
		}
		await this.updateState (prevProps);
	}

	async componentWillUnmount () {
		await this.autoSave ();
		clearInterval (this.autoSaveIntervalId);
		this.unmounted = true;
	}

	autoSave = async () => {
		if (!this.props.autoSave || !this.state._rid) {
			return;
		}
		await this.onSave ();
	}

	onChange = ({code, property, value, file}) => {
		let state = {};

		code = code || property;

		if (file) {
			this.fileMap [code] = file;
		}
		state [code] = value;

		if (value && this.state [`${code}-error`]) {
			state [`${code}-error`] = "";

			let errors = false;

			_each (this.state, (v, a) => {
				if (v && a.endsWith ("-error") && a != `${code}-error`) {
					errors = true;
				}
			});
			if (!errors) {
				state._error = "";
			}
		}
		this.setState (state);

		if (this.props.onChange) {
			this.props.onChange ({property: code, code, value, file});
		}
	}

/*
	async upload ({sessionId, objectId, classAttrId, name, file}) {
		let formData = new FormData ();

		formData.append ("objectId", objectId);
		formData.append ("classAttrId", classAttrId);
		formData.append ("name", name);
		formData.append ("file", file);

		let url = this.props.store.getUrl ();

		if (url [url.length - 1] == "/") {
			url = url.substr (0, url.length - 1);
		}
		await fetch (`${url}/upload?sessionId=${sessionId}`, {
			method: "POST",
			body: formData
		});
	}
*/

	onSave = async () => {
		if (!(await this.isValid ())) {
			return false;
		}
		this.setState ({_saving: true});

		let state = {_saving: false};
		let values = this.getValues (this.props.children);
		let changed = false;

		try {
			for (let code in values) {
				let value = values [code];
				let property = this.model && this.model.properties [code];

				if (value && property && (property.type == 2 || property.type >= 1000)) {
					value = Number (value);
				}
				if (property && property.secure && value != this.record [code]) {
					value = require ("crypto").createHash ("sha1").update (String (value)).digest ("hex").toUpperCase ();
				}
				if (value === "") {
					value = null;
				}
				if (this.record [code] != value) {
					changed = true;
					this.record [code] = value;
				}
			}
			if (changed) {
				this.setState ({_saveProgress: 25});
				await this.props.store.startTransaction (`${i18n ("Saving")}, id: ${this.state._rid}`);
				this.setState ({_saveProgress: 50});

				let fileNum = 0

				for (let code in values) {
					if (this.fileMap [code]) {
						fileNum ++
					}
				}
				for (let code in values) {
					if (this.fileMap [code]) {
						await this.props.store.upload ({
							recordId: this.record.get ("id"),
							propertyId: this.model.properties [code].get ("id"),
							name: this.record.get (code),
							file: this.fileMap [code]
						});
						fileNum --
					}
				}
				if (fileNum) {
					throw new Error(i18n('File upload error'))
				} else {
					await this.record.sync ();
				}
				this.setState ({_saveProgress: 75});
				await this.props.store.commitTransaction ();
				this.setState ({_saveProgress: 0});
			}
			for (let code in values) {
				state [code] = this.record.get (code);
			}
			state._error = "";
			state._saved = true;
		} catch (err) {
			state._error = err.message;
			console.error (err.stack);
			await this.props.store.rollbackTransaction ();
		}
		try {
			if (this.props.onSave && changed) {
				await execute (this.props.onSave, {form: this, store: this.props.store});
			}
		} catch (err) {
			state._error = err.message;
			console.error (err.stack);
		}
		this.setState (state);

		return !state._error;
	}

	onCreate = async () => {
		if (!(await this.isValid ())) {
			return false;
		}
		this.setState ({_creating: true});

		await this.props.store.startTransaction (`${i18n ("Creating")}${this.props.mid ? `, ${i18n ("model")}: ${this.props.mid}` : ""}`);

		let state = {_creating: false};
		let values = this.getValues (this.props.children);

		try {
			let data = {};

			if (this.props.rsc == "record") {
				data ["_model"] = this.model.getPath ();
			}
			if (this.props.defaults) {
				Object.assign (data, this.props.defaults);
			}
			for (let code in values) {
				let value = values [code];
				let property = this.model && this.model.properties [code];

				if (value && property && (property.type == 2 || property.type >= 1000)) {
					value = Number (value);
				}
				if (property && property.secure) {
					value = require ("crypto").createHash ("sha1").update (String (value)).digest ("hex").toUpperCase ();
				}
				if (value === "") {
					value = null;
				}
				data [code] = value;
			}
			this.record = await this.props.store.createRsc (this.props.rsc, data);

			state._rid = this.record.get ("id");
			state._error = "";

			for (let code in values) {
				if (this.fileMap [code]) {
/*
					await this.upload ({
						sessionId: this.props.store.getSessionId (),
						objectId: this.record.get ("id"),
						classAttrId: this.model.properties [code].get ("id"),
						name: this.record.get (code),
						file: this.fileMap [code]
					});
*/
					await this.props.store.upload ({
						recordId: this.record.get ("id"),
						propertyId: this.model.properties [code].get ("id"),
						name: this.record.get (code),
						file: this.fileMap [code]
					});
				}
			}
			await this.props.store.commitTransaction ();

			for (let code in values) {
				state [code] = this.record.get (code);
			}
			try {
				if (this.props.onCreate) {
					await execute (this.props.onCreate, state._rid);
				}
			} catch (err) {
				state._error = err.message;
				console.error (err.stack);
			}
			state._saved = true;
		} catch (err) {
			console.error (err, err.stack);
			await this.props.store.rollbackTransaction ();
			state._error = err.message;
		}
		if (!this.unmounted) {
			this.setState (state);
		}
		return !state._error;
	}

	async isValid () {
		let fields = this.getFields (this.props.children);
		let state = {}, errors = {};
		let values = {};

		for (let code in fields) {
			values [code] = this.state [code];
		}
		for (let code in fields) {
			let field = fields [code];
			let notNull = field.props.notNull;
			let property = this.model && this.model.properties [code];

			state [`${code}-error`] = "";

			if (this.model && this.model.properties [code] && this.model.properties [code].notNull) {
				notNull = true;
			}
			if (notNull && (!this.state.hasOwnProperty (code) || this.state [code] === "" || this.state [code] === null || this.state [code] === undefined)) {
				errors [code] = property?.type == 5 ? i18n ("Please attach file") : i18n ("Please enter value");
			}
			if (field.props.onValidate) {
				let result = field.props.onValidate ({value: this.state [code], values, errors, form: this});

				if (result) {
					errors [code] = result;
				}
			}
		}
		if (this.props.onValidate) {
			await execute (this.props.onValidate, {form: this, values, errors});
		}
		if (!_isEmpty (errors)) {
			for (let code in errors) {
				state [`${code}-error`] = errors [code];
			}
			state._error = i18n ("Form contains errors");
			this.setState (state);

			return false;
		}
		return true;
	}

	isChanged () {
		let changed = false;
		let values = this.getValues (this.props.children);

		for (let code in values) {
			let stateValue = this.state [code];
			let recordValue = this.record && this.record [code];

			if (stateValue === "" || stateValue === undefined) {
				stateValue = null;
			}
			if (recordValue === "" || recordValue === undefined) {
				recordValue = null;
			}
			if (_isNumber (stateValue) || _isNumber (recordValue)) {
				stateValue = Number (stateValue);
				recordValue = Number (recordValue);
			}
			if (this.state.hasOwnProperty (code) && stateValue !== recordValue) {
				changed = true;
			}
		}
		return changed;
	}

/*
	onFieldBlur = async () => {
		if (this.state._rid && this.props.autoSave && this.isChanged () && !this.state._saving) {
			await this.onSave ();
		}
	}
*/

	renderChildren (children, parent = "") {
		return React.Children.map (children, (child, i) => {
			if (!child || !child.props) {
				return child;
			}
			let key = `${parent}-${i}`;
			let code = child.props.property;

			if (code) {
				let value = this.state.hasOwnProperty (code) ? this.state [code] : (child.props.value || "");
//				let value = child.props.value !== undefined ? child.props.value : (this.state [code] || ""); todo: button Save disabled
				let props = {
					...child.props,
					onChange: (opts) => {
						if (child.props.onChange) {
							child.props.onChange (opts);
						}
						if (!opts.invalid) {
							this.onChange (opts);
						}
					},
					property: code,
					value,
					record: this.record,
					model: this.model && this.model.getPath (),
					store: this.props.store,
					key,
					disabled: child.props.disabled || this.props.disabled,
					error: this.state [`${code}-error`]
				};
				if (this.model && this.model.properties [code]) {
					let property = this.model.properties [code];

					if (property.notNull) {
						props.notNull = true;
					}
					props.label = props.hasOwnProperty ("label") ? props.label : property.name;
				}
				props.rsc = props.rsc || this.props.rsc;

				let field;

				if (child.type.displayName == "Field") {
					let type = child.props.type;

					if (!type && this.model && this.model.properties [code]) {
						let property = this.model.properties [code];

						type = property.type;

						if (property.secure) {
							props.secure = true;
						}
						let opts = property.getOpts ();

						Object.assign (props, opts);
						props.label = props.hasOwnProperty ("label") ? props.label : property.name;
					}
					if (!type) {
						return <div key={key} />;
					}
					if (type == 1) {
						field = <StringField {...props} />;
					}
					if (type == 2) {
						field = <NumberField {...props} />;
					}
					if (type == 3) {
						field = <DateField {...props} />;
					}
					if (type == 4) {
						field = <BooleanField {...props} />;
					}
					if (type >= 1000) {
						let property = this.model.properties [code];
						let model = this.props.store.getModel (property.type);

						if (child.props.dict || model.isDictionary () || this.props.store.dict [model.getPath ()] || this.props.store.dict [model.id]) {
							field = <DictField {...props} />;
						} else
						if (child.props.chooseModel) {
							field = <ChooseField
								{...props}
								choose={{cmp: ModelList, ref: `list-${child.props.chooseModel}`, model: child.props.chooseModel}}
							/>;
						} else {
							field = <ChooseField {...props} />;
						}
					}
					if (type == 5) {
						field = <FileField {...props} />;
					}
					if (!field) {
						return <div key={key}>unsupported type: {code}</div>;
					}
				}
				if (!field) {
					field = React.cloneElement (child, props);
				}
				if (this.regModel) {
					if (this.record) {
						if (this.record._renderField) {
							field = this.record._renderField ({field, form: this, store: this.props.store});
						}
					} else if (this.regModel._renderField) {
						field = this.regModel._renderField ({field, form: this, store: this.props.store});
					}
				}
				return field;
			}
			if (child.props.children) {
				let o = {};

				o.children = this.renderChildren (child.props.children);
				return (
					React.cloneElement (child, {
						children: this.renderChildren (child.props.children)
					})
				);
			} else {
				return child;
			}
		});
	}

	render () {
		if (!this.props.record && (!this.props.store || !this.props.rsc || (!this.props.rid && !this.props.mid && this.props.rsc == "record"))) {
			return <EditForm {...this.props} />;
		}
		if (this.state._loading && !this.record) {
			return <div className="alert alert-light text-primary" role="alert">
				<Loading />
			</div>;
		}
		let formChildren = this.renderChildren (this.props.children);
		let disabledSave = !this.isChanged () || this.state._saving || this.props.disableActions;

		return <div className={this.props.className}>
			{this.props.label && <div>
				<h5 className="pl-3 py-2 ml-3">{this.props.label}</h5>
			</div>}
			<div className={this.props.formClassName}>
				{this.state._rid ? (!this.props.hideButtons && !this.props.autoSave && <div className="actions p-1 border-bottom">
					{!this.props.hideSaveButton &&
						<button type="button" className="btn btn-primary mr-1" onClick={this.onSave}
								disabled={disabledSave}>
							{this.state._saving ?
								<span><span className="spinner-border spinner-border-sm mr-2" role="status"
											aria-hidden="true"/>{i18n ("Saving")}</span> :
								<span>{(this.state._saved && disabledSave) ?
									<span><i className="fas fa-check-double mr-2"/>{i18n ("Saved")}</span> :
									<span><i className="fas fa-check mr-2"/>{i18n ("Save")}</span>}</span>
							}
						</button>
					}
					{this.props.rsc == "record" && !this.props.hideLogButton &&
						<button type="button" className="btn btn-primary" onClick={() => this.setState ({_showLog: !this.state._showLog})}>
							<i className="fas fa-history mr-2" />{i18n ("Log")}
						</button>
					}
				</div>) : <div />}
				{this.state._showLog && <div className="border-bottom p-1"><Log form={this} /></div>}
				{this.state._error && <div className="p-1"><div className="alert alert-danger" role="alert">{i18n (this.state._error)}</div></div>}
				<div className={(this.props.autoSave || this.props.hideButtons) ? "" : "actions p-1"}>
					{this.props.autoSave ? <div className="progress mb-1" style={{height: "1px"}}>
						<div className="progress-bar" role="progressbar" style={{width: `${this.state._saveProgress}%`}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" />
					</div> : null}
					{formChildren}
				</div>
				{!this.state._rid && !this.props.hideButtons && !this.props.autoSave && <div className="mt-1 actions border-top p-1">
					<button type="button" className="btn btn-primary mr-1" onClick={this.onCreate} disabled={!this.isChanged () || this.state._creating}>
						{this.state._creating ?
							<span><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"/>{i18n ("Creating")}</span> :
							<span><i className="fas fa-plus-circle mr-2"/>{i18n ("Create")}</span>
						}
					</button>
				</div>}
			</div>
		</div>;
	}
}
Form.displayName = "Form";

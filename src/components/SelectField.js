import React, {Component} from "react";
import {i18n, newId, Tooltip} from "..";

/*
class SelectField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value
		};
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = val.target.value;
		
		if (!isNaN (value)) {
			value = Number (value);
		}
		me.setState ({value});

		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
		}
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value});
		}
	}
	
	render () {
		let me = this;
		let disabled = me.props.disabled;
		let addCls = me.props.error ? " is-invalid" : "";

		if (!me.props.recs && !me.props.records) {
			return <div>recs or records not exist</div>
		}
		return (
			<div className={(me.props.label || me.props.error) ? "form-group" : ""}>
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}{me.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
				<select className={"form-control custom-select" + addCls + (me.props.sm ? " custom-select-sm" : "")} id={me.id} value={me.state.value} onChange={me.onChange} disabled={disabled}>
					{[{id: "", name: "-"}, ...(me.props.recs || me.props.records)].map ((rec, i) => {
						return (
							<option value={rec.id} key={i}>{rec.getLabel ? rec.getLabel () : rec.name}</option>
						);
					})}
				</select>
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
*/
class SelectField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			rsc: this.props.rsc || "record",
			code: this.props.property,
			value: this.props.value === null ? "" : this.props.value,
			recs: this.props.records || this.props.recs || [],
			label: ""
		};
		if (this.state.value) {
			let rec = this.state.recs.find (rec => rec.id == this.state.value);
			
			if (rec) {
				if (rec.getLabel) {
					this.state.label = rec.getLabel ();
				} else {
					this.state.label = rec.name;
				}
			}
		}
		this._refs = {
			"dialog": React.createRef (),
			"button": React.createRef (),
			"inputDiv": React.createRef ()
		};
		this.id = newId ();
	}
	
	componentDidMount () {
		document.addEventListener ("mousedown", this.onDocumentClick)
	}
	
	componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState ({value: this.props.value});
		}
	}
	
	onDocumentClick = (event) => {
		if (this._refs ["dialog"] && this._refs ["dialog"].current && !this._refs ["dialog"].current.contains (event.target) &&
			this._refs ["button"].current && !this._refs ["button"].current.contains (event.target) &&
			this._refs ["inputDiv"].current && !this._refs ["inputDiv"].current.contains (event.target)
		) {
			this.setState ({
				showDialog: false,
				filter: ""
			});
		}
	}
	
	onShowDialog = () => {
		if (this.state.showDialog) {
			return this.setState ({
				showDialog: false,
				filter: ""
			});
		}
		this.setState ({showDialog: true});
	}
	
	onClick = (val) => {
		let value = val.target.id;
		
		if (!isNaN (value)) {
			value = Number (value);
		}
		let state = {
			showDialog: false,
			value,
			filter: ""
		};
		let rec = this.state.recs.find (rec => rec.id == value);
		
		if (rec) {
			if (rec.getLabel) {
				state.label = rec.getLabel ();
			} else {
				state.label = rec.name;
			}
		}
		this.setState (state);
		
		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
	}
	
	filter (inRecs) {
		let recs = [];
		
		inRecs.forEach (rec => {
			if (this.state.filter && (rec.name.toLowerCase () || "").indexOf (this.state.filter.toLowerCase ()) == -1) {
				return;
			}
			recs.push (rec);
		});
		return recs;
	}
	
	renderParameters () {
		let recs = this.filter (this.state.recs);
		
		return (
			<div className="dictfield-dialog text-left" ref={this._refs ["dialog"]}>
				<div className="dictfield-selector border bg-white shadow">
					{(recs.length > 10 || this.state.filter) && <div className="sticky-top p-1 bg-white border-bottom">
						<input
							type="text"
							className="form-control"
							value={this.state.filter}
							onChange={val => this.setState ({filter: val.target.value})}
							placeholder={i18n ("Filter parameters") + " ..."}
						/>
					</div>}
					<ul className="list-group">
						{recs.map ((rec, i) => {
							let label = `${rec.name} (id: ${rec.id})`;
							
							if (rec.getLabel) {
								label = rec.getLabel ();
							}
							return (
								<li className="border-bottom p-1 dictfield-option" id={rec.id} key={i} onClick={this.onClick}>{label}</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
	
	render () {
		let addCls = this.props.error ? " is-invalid" : "";
		
		return (
			<div>
				<div className={(this.props.label || this.props.error) ? "form-group" : ""}>
					{this.props.label && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
					<div className="d-flex dictfield">
						{!this.props.disabled && <div className="border border-right-0 rounded-left">
							<Tooltip label={i18n ("Choose")}><button
								type="button"
								className="btn btn-link btn-sm p-1"
								onClick={this.onShowDialog}
								style={{height: "100%", width: "2.5em"}}
								ref={this._refs ["button"]}
							>
								<i className="fas fa-edit" />
							</button></Tooltip>
						</div>}
						<Tooltip label={this.state.label}>
							<div onClick={this.onShowDialog} ref={this._refs ["inputDiv"]}>
								<input
									type="text"
									className={`form-control ${addCls} ${this.props.disabled ? "" : " dictfield-input"}`}
									id={this.id}
									value={this.state.label}
									disabled
								/>
							</div>
						</Tooltip>
					</div>
					{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
					{this.state.showDialog && this.renderParameters ()}
				</div>
			</div>
		);
	}
};
SelectField.displayName = "SelectField";

export default SelectField;

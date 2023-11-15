import React, {Component} from "react";
import {i18n, newId} from "..";
import _isEmpty from "lodash.isempty";

export default class SelectField extends Component {
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
		let state = {};
		let recs = this.props.records || this.props.recs || [];
		
		if (this.state.recs.length !== recs.length) {
			state.recs = recs;
		}
		if (prevProps.value !== this.props.value) {
			state.value = this.props.value;
			
			let rec = (state.recs ? state.recs : this.state.recs).find (rec => rec.id == state.value);
			
			if (rec) {
				if (rec.getLabel) {
					state.label = rec.getLabel ();
				} else {
					state.label = rec.name;
				}
			}
		}
		if (!_isEmpty (state)) {
			this.setState (state);
		}
	}
	
	onDocumentClick = (event) => {
		if (this._refs ["dialog"] && this._refs ["dialog"].current && !this._refs ["dialog"].current.contains (event.target) &&
			this._refs ["inputDiv"].current && !this._refs ["inputDiv"].current.contains (event.target)
		) {
			this.setState ({
				showDialog: false,
				filter: ""
			});
		}
	}
	
	onShowDialog = () => {
		if (this.props.disabled) {
			return;
		}
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
		
		return <div className="dictfield-dialog text-left" ref={this._refs ["dialog"]}>
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
					{!recs.length ? <div className="p-3">{i18n ("No parameters")}</div> : recs.map ((rec, i) => {
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
		</div>;
	}
	
	onClear = () => {
		let me = this;
		
		me.setState ({value: null, label: ""});
		
		if (me.props.onChange) {
			me.props.onChange ({...me.props, code: me.state.code, value: null, id: me.props.id});
		}
	}
	
	render () {
		let addCls = this.props.error ? " is-invalid" : "";
		
		return <div>
			<div className={(this.props.label || this.props.error) ? "form-group" : ""}>
				{this.props.label && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
				<div className="input-group selectfield">
					<input
						type="text"
						className={`form-control ${(this.props.disabled || this.props.notNull) ? "rounded" : "rounded-left"} ${this.props.disabled ? "" : "bg-white dictfield-input border-primary"} dictfield-option ${addCls} ${this.props.sm ? "form-control-sm" : ""}`}
						id={this.id}
						value={this.state.label}
						title={this.state.label}
						onClick={this.onShowDialog}
						ref={this._refs ["inputDiv"]}
						readOnly
					/>
					{!this.props.disabled && !this.props.notNull && <div className="input-group-append" style={{zIndex: 0}}>
						<button
							type="button"
							className={`btn btn-outline-primary ${this.props.sm ? "btn-sm" : ""}`}
							onClick={this.onClear}
							title={i18n ("Clear")}
						>
							<i className="fas fa-times" />
						</button>
					</div>}
				</div>
				{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
				{this.state.showDialog && this.renderParameters ()}
			</div>
		</div>;
	}
};
SelectField.displayName = "SelectField";

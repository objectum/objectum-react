/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n, newId, Group, Action} from "..";

export default class JsonField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			value: this.props.multi ? [{}] : {}
		};
		if (this.props.value) {
			this.state.value = typeof (this.props.value) == "string" ? JSON.parse (this.props.value) : this.props.value;
			
			if (this.props.multi && this.state.value && !Array.isArray (this.state.value)) {
				this.state.value = [this.state.value];
			}
		}
		this.id = newId ();
	}

	onChange = ({code, value}) => {
		if (this.props.multi) {
			let [prop, i] = code.split ("-");
			let o = JSON.parse (JSON.stringify (this.state.value));
			o [i][prop] = value;
			this.setValue (o);
		} else {
			let o = JSON.parse (JSON.stringify (this.state.value));
			o [code] = value;
			this.setValue (o);
		}
	}
	
	async componentDidUpdate (prevProps) {
		let prevValue = typeof (prevProps.value) == "string" ? prevProps.value : JSON.stringify (prevProps.value);
		let value = typeof (this.props.value) == "string" ? this.props.value : JSON.stringify (this.props.value);

		if (prevValue !== value) {
			let state = {value: JSON.parse (value), refresh: !this.state.refresh};

			if (this.props.multi && state.value && !Array.isArray (state.value)) {
				state.value = [state.value];
			}
			this.setState (state);
		}
	}

	renderFields (rec, suffix = "") {
		let items = this.props.props.map ((o, i) => {
			let Cmp = o.component;

			return <div key={i} className={`${this.props.col ? `col-${o.col || this.props.col}` : ""} ${i ? "mt-1" : ""}`}>
				<Cmp {...o} label={o.label} property={o.prop + suffix} value={rec [o.prop]} onChange={this.onChange} disabled={this.props.disabled}/>
			</div>;
		});
		return <div className={this.props.col ? "row" : ""}>
			{items}
		</div>;
	}

	setValue (value) {
		this.setState ({value});

		if (this.props.onChange) {
			this.props.onChange ({code: this.props.property, value: JSON.stringify (value)});
		}
	}

	onCreate = () => {
		this.setValue ([...JSON.parse (JSON.stringify (this.state.value)), {}]);
	}

	onRemove = (i) => {
		let value = JSON.parse (JSON.stringify (this.state.value));
		value.splice (i, 1);
		this.setValue (value);
	}

	render () {
		if (!this.props.props) {
			return <div className="alert alert-danger">props not exist</div>
		}
		if (this.props.multi) {
			return <Group {...this.props}>
				{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
				{this.state.value.map ((rec, i) => {
					return <div key={i} className="d-flex border p-1 mb-1 align-items-center">
						<Action label={i18n ("Remove")} icon="fas fa-minus-circle" btnClassName="btn btn-primary btn-sm mr-2" onClick={() => this.onRemove (i)} />
						{this.renderFields (rec, `-${i}`)}
					</div>;
				})}
				<Action label={i18n ("Create")} icon="fas fa-plus-circle" btnClassName="btn btn-primary btn-sm" onClick={this.onCreate} />
			</Group>;
		}
		return <div>
			{this.props.label && <div className="mb-1"><strong>{i18n (this.props.label)}</strong></div>}
			{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
			{this.renderFields (this.state.value)}
		</div>;
	}
};
JsonField.displayName = "JsonField";

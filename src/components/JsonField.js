/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n, newId} from "..";

export default class JsonField extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			value: ""
		};
		if (this.props.value) {
			this.state.value = this.props.value;
			
			let o = JSON.parse (this.props.value);
			
			for (let a in o) {
				this.state [a] = o [a];
			}
		}
		this.id = newId ();
	}
	
	onChange = ({code, value}) => {
		let o = {};
		
		this.props.props.forEach (prop => {
			o [prop.prop] = prop.prop == code ? value : this.state [prop.prop];
		});
		o = JSON.stringify (o);
		
		this.setState ({[code]: value, value: o});
		
		if (this.props.onChange) {
			this.props.onChange ({code: this.props.property, value: o});
		}
	}
	
	async componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			let state = {value: this.props.value};
			
			if (this.props.value) {
				let o = JSON.parse (this.props.value);
				
				for (let a in o) {
					state [a] = o [a];
				}
			}
			this.setState (state);
		}
	}

	renderFields () {
		if (this.props.col) {
			return (
				<div className="row">
					{this.props.props.map ((o, i) => {
						let Cmp = o.component;
						
						return (
							<div key={i} className={`col-${o.col || this.props.col} ${i ? "mt-1" : ""}`}>
								<Cmp {...o} label={o.label} property={o.prop} value={this.state [o.prop]} onChange={this.onChange} disabled={this.props.disabled}/>
							</div>
						);
					})}
				</div>
			);
		} else {
			return this.props.props.map ((o, i) => {
				let Cmp = o.component;
				
				return (
					<div key={i} className={i ? "mt-1" : ""}>
						<Cmp {...o} label={o.label} property={o.prop} value={this.state [o.prop]} onChange={this.onChange} disabled={this.props.disabled}/>
					</div>
				);
			});
		}
	}
	
	render () {
		if (!this.props.props) {
			return <div className="alert alert-danger">props not exist</div>
		}
		return <div>
			{this.props.label && <div className="mb-1"><strong>{i18n (this.props.label)}</strong></div>}
			{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}
			{this.renderFields ()}
		</div>;
	}
};
JsonField.displayName = "JsonField";

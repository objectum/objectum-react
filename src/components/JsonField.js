/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n, newId} from "..";

class JsonField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.state = {
			value: ""
		};
		if (me.props.value) {
			me.state.value = me.props.value;
			
			let o = JSON.parse (me.props.value);
			
			for (let a in o) {
				me.state [a] = o [a];
			}
		}
		me.id = newId ();
	}
	
	onChange ({code, value}) {
		let me = this;
		let o = {};
		
		me.props.props.forEach (prop => {
			o [prop.prop] = prop.prop == code ? value : me.state [prop.prop];
		});
		o = JSON.stringify (o);
		
		me.setState ({[code]: value, value: o});
		
		if (me.props.onChange) {
			me.props.onChange ({code: me.props.property, value: o});
		}
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			let state = {value: me.props.value};
			
			if (me.props.value) {
				let o = JSON.parse (me.props.value);
				
				for (let a in o) {
					state [a] = o [a];
				}
			}
			me.setState (state);
		}
	}

	renderFields () {
		let me = this;

		if (me.props.col) {
			return (
				<div className="row">
					{me.props.props.map ((o, i) => {
						let Cmp = o.component;
						
						return (
							<div key={i} className={`col-${o.col || me.props.col} ${i ? "mt-1" : ""}`}>
								<Cmp {...o} label={o.label} property={o.prop} value={me.state [o.prop]} onChange={me.onChange} disabled={me.props.disabled}/>
							</div>
						);
					})}
				</div>
			);
		} else {
			return me.props.props.map ((o, i) => {
				let Cmp = o.component;
				
				return (
					<div key={i} className={i ? "mt-1" : ""}>
						<Cmp {...o} label={o.label} property={o.prop} value={me.state [o.prop]} onChange={me.onChange} disabled={me.props.disabled}/>
					</div>
				);
			});
		}
	}
	
	render () {
		let me = this;
		
		if (!me.props.props) {
			return <div>props not exist</div>
		}
		return (
			<div>
				{me.props.label && <div className="mb-1"><strong>{i18n (me.props.label)}</strong></div>}
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
				{me.renderFields ()}
			</div>
		);
	}
};
JsonField.displayName = "JsonField";

export default JsonField;

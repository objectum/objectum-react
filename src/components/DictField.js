/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {i18n} from "../i18n";
import _ from "lodash";
import Select from "react-select";

const groupStyles = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between"
};
const groupBadgeStyles = {
	backgroundColor: "#EBECF0",
	borderRadius: "2em",
	color: "#172B4D",
	display: "inline-block",
	fontSize: 12,
	fontWeight: "normal",
	lineHeight: "1",
	minWidth: 1,
	padding: "0.16666666666667em 0.5em",
	textAlign: "center"
};
const formatGroupLabel = data => (
	<div style={groupStyles}>
		<span>{data.label}</span>
		<span style={groupBadgeStyles}>{data.options.length}</span>
	</div>
);

class DictField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.state = {
			value: me.props.value === null ? "" : me.props.value,
			label: "",
			recs: [],
			groupRecs: null
		};
		me.model = me.props.store.getModel (me.props.model);
		me.property = me.model.properties [me.props.attr || me.props.property || me.props.prop || me.props.id];
		
		me.onChange = me.onChange.bind (me);
	}
	
	async componentDidMount () {
		let me = this;
		let state = {
			recs: await me.props.store.getDict (me.property.get ("type")),
			label: ""
		};
		if (me.state.value) {
			let record = await me.props.store.getRecord (me.state.value);

			state.label = record.getLabel ();
		}
		let m = me.props.store.getModel (me.property.get ("type"));
		
		for (let code in m.properties) {
			let property = m.properties [code];
			
			if (property.get ("type") >= 1000) {
				let pm = me.props.store.getModel (property.get ("type"));
				
				if (pm.isDictionary ()) {
					me.groupProperty = property;
					state.groupRecs = await me.props.store.getDict (property.get ("type"));
					break;
				}
			}
		}
		me.setState (state);
	}
	
	onChange (option) {
		let me = this;
		let value = option ? option.value : null;
		
		me.setState ({value});
		
		if (me.props.onChange) {
			me.props.onChange ({
				target: {
					id: me.property.get ("code"),
					value
				}
			});
		}
	}
	
	render () {
		let me = this;
		let id = me.property.get ("code");
		let addCls = me.props.error ? " is-invalid" : "";
		let options = _.map (me.state.recs, rec => {
			return {
				value: rec.id, label: `${rec.name} (id: ${rec.id})`
			};
		});
		let value = _.find (options, {value: me.state.value});
		const customStyles = {
			control: base => ({
				...base,
				height: 32,
				minHeight: 32
			})
		};
		let opts = {
			placeholder: i18n ("Select") + " ...",
			options,
			className: "w-100",
			value,
			onChange: me.onChange,
			isClearable: true,
			disabled: me.props.disabled,
			styles: customStyles
		};
		if (me.groupProperty) {
			opts.formatGroupLabel = formatGroupLabel;
			opts.options = _.map (me.state.groupRecs, groupRec => {
				options = _.map (me.state.recs.filter (rec => rec [me.groupProperty.code] == groupRec.id), rec => {
					return {
						value: rec.id, label: `${rec.name} (id: ${rec.id})`
					};
				});
				return {
					label: groupRec.name,
					options
				};
			});
		}
		return (
			<div>
				<div className="form-group">
					{me.props.label && <label htmlFor={id}>{i18n (me.props.label)}</label>}
					<div className="input-group">
						<Select {...opts} />
					</div>
					{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
				</div>
			</div>
		);
	}
};
DictField.displayName = "DictField";

export default DictField;

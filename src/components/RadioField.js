/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */
import React from "react";
import {i18n, newId} from "..";

export default function RadioField ({property, records, value, label, hideLabel, notNull, error, onChange}) {
	let id = newId ();
	let name = Math.random ();

	if (!records) {
		return <div className="alert alert-danger">records not exist</div>;
	}
	let options = records.map ((record, i) => {
		return <div key={i} className="form-check">
			<input className="form-check-input" type="radio" name={name} value={record.id} checked={value == record.id} onChange={() => {
				onChange ({value: record.id, code: property, property});
			}} />
			<label className="form-check-label">{record.getLabel ? record.getLabel () : record.name}</label>
		</div>;
	});
	if (label || error) {
		return <div className="form-group">
			{label && !hideLabel && <label htmlFor={id}>{i18n (label)}{notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
			{options}
			{error && <div className="invalid-feedback">{error}</div>}
		</div>;
	} else {
		return options;
	}
}

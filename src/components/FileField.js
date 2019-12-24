/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {useDropzone} from "react-dropzone";
import {i18n} from "./../i18n";
import {newId} from "./helper";

function File (props) {
	const {acceptedFiles, getRootProps, getInputProps} = useDropzone ({
		multiple: false
	});
	let file;
	
	if (acceptedFiles.length) {
		file = (<div>{acceptedFiles [0].path} - {acceptedFiles [0].size} bytes</div>);
		
		if (acceptedFiles [0].path != props.value) {
			props.onFile (props.id, acceptedFiles [0]);
		}
	} else if (props.value) {
		let propertyId = props.model.properties [props.id].get ("id");
		
		file = (
			<div><a target="_blank" rel="noopener noreferrer" href={props.store.getUrl () + "/files/" + props.record.get ("id") + "-" + propertyId + "-" + props.value}>{props.value}</a></div>
		);
	}
	return (
		<div className="border p-1">
			<div {...getRootProps ({className: "dropzone"})}>
				<input {...getInputProps ()} />
				<div className="border bg-light p-2">Drag 'n' drop some file here, or click to select file</div>
			</div>
			<div className="ml-2"><strong>{file}</strong></div>
		</div>
	);
};

class FileField extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.onChange = me.onChange.bind (me);
		me.onFile = me.onFile.bind (me);
		me.state = {
			code: me.props.property,
			value: me.props.value
		};
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = val.target.value;
		
		me.setState ({value});

		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value, id: me.props.id});
		}
	}
	
	onFile (id, file) {
		let me = this;
		
		me.setState ({value: file.path});

		if (me.props.onChange) {
			me.props.onChange ({code: me.state.code, value: file.path, file, id: me.props.id});
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
		
		return (
			<div className="form-group">
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
				<File id={me.id} onFile={me.onFile} value={me.state.value} store={me.props.store} record={me.props.record} model={me.props.model} />
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
FileField.displayName = "FileField";

export default FileField;

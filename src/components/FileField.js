/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {useDropzone} from "react-dropzone";
import {i18n} from "./../i18n";

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
		let caId = props.cls.attrs [props.id].get ("id");
		
		file = (
			<div><a target="_blank" rel="noopener noreferrer" href={props.store.getUrl () + "files/" + props.object.get ("id") + "-" + caId + "-" + props.value}>{props.value}</a></div>
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
			value: me.props.value
		};
	}
	
	onChange (val) {
		let me = this;
		let v = val.target.value;
		
		me.setState ({value: v});
		me.props.onChange (val);
	}
	
	onFile (id, file) {
		let me = this;
		
		me.setState ({value: file.path});
		me.props.onChange ({
			target: {
				id, value: file.path
			}
		}, file);
	}
	
	render () {
		let me = this;
		let id = me.props.attr || me.props.property || me.props.prop;
		//let disabled = me.props.disabled;
		//let addCls = me.props.error ? " is-invalid" : "";
		
		return (
			<div className="form-group">
				<label htmlFor={id}>{i18n (me.props.label)}</label>
				<File id={id} onFile={me.onFile} value={me.state.value} store={me.props.store} object={me.props.object || me.props.record} cls={me.props.cls || me.props.model} />
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
			</div>
		);
	}
};
FileField.displayName = "FileField";

export default FileField;

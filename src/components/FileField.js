/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {useDropzone} from "react-dropzone";
import {i18n} from "./../i18n";
import {newId} from "./helper";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Modal from "react-modal";

function FileInput (props) {
	let model = props.store.getModel (props.model);
	let property = model.properties [props.property];
	let propertyId = property.id;
	let opts = {
		multiple: false
	};
	if (props.image) {
		opts.accept = "image/*";
	}
	const {acceptedFiles, getRootProps, getInputProps} = useDropzone (opts);
	let file;
	
	if (acceptedFiles.length) {
		file = (<div>{acceptedFiles [0].path} - {acceptedFiles [0].size} bytes</div>);
		
		if (acceptedFiles [0].path != props.value) {
			props.onFile (props.id, acceptedFiles [0]);
		}
	} else if (props.value) {
		file = (
			<div><a target="_blank" rel="noopener noreferrer" href={"/files/" + props.record.id + "-" + propertyId + "-" + props.value}>{props.value}</a></div>
		);
	}
	return (
		<div className="border p-1">
			<div {...getRootProps ({className: "dropzone"})}>
				<input {...getInputProps ()} />
				<div className="bg-light p-1">{i18n ("Drag 'n' drop some file here, or click to select file")}</div>
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
		me.onImageLoaded = me.onImageLoaded.bind (me);
		me.onCropComplete = me.onCropComplete.bind (me);
		me.onCropChange = me.onCropChange.bind (me);
		
		me.state = {
			rsc: me.props.rsc || "record",
			code: me.props.property,
			value: me.props.value
		};
		let model = me.props.store.getModel (me.props.model);
		let property = model.properties [me.props.property];
		let propertyOpts = property.getOpts ();
		
		if (propertyOpts.image) {
			me.state.image = propertyOpts.image;
		}
		me.id = newId ();
	}
	
	onChange (val) {
		let me = this;
		let value = val.target.value;
		
		me.setState ({value});
		
		if (me.props.onChange && !me.state.image) {
			me.props.onChange ({...me.props, code: me.state.code, value, id: me.props.id});
		}
	}
	
	onFile (id, file) {
		let me = this;
		
		me.setState ({value: file.path});
		
		if (me.state.image) {
			const reader = new FileReader ();
			
			reader.addEventListener ("load", () =>
				me.setState ({src: reader.result, showModal: true})
			);
			reader.readAsDataURL (file);
		} else {
			if (me.props.onChange) {
				me.props.onChange ({...me.props, code: me.state.code, value: file.path, file, id: me.props.id});
			}
		}
	}

	componentDidMount () {
		Modal.setAppElement ("body");
	}
	
	async componentDidUpdate (prevProps) {
		let me = this;
		
		if (prevProps.value !== me.props.value) {
			me.setState ({value: me.props.value});
		}
	}
	
	onImageLoaded (image) {
		this.imageRef = image;
	}
	
	async makeClientCrop (crop) {
		let me = this;
		
		if (me.imageRef && crop.width && crop.height) {
			const file = await me.getCroppedImg (
				me.imageRef,
				crop,
				me.state.value
			);
			me.setState ({file});
		}
	}
	
	getCroppedImg (image, crop, fileName) {
		const canvas = document.createElement ("canvas");
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;
		
		canvas.width = crop.width;
		canvas.height = crop.height;
		
		const ctx = canvas.getContext ("2d");
		
		ctx.drawImage (
			image,
			crop.x * scaleX,
			crop.y * scaleY,
			crop.width * scaleX,
			crop.height * scaleY,
			0,
			0,
			crop.width,
			crop.height
		);
		return new Promise ((resolve, reject) => {
			canvas.toBlob (blob => {
				if (!blob) {
					//reject(new Error('Canvas is empty'));
					return console.error ("Canvas is empty");
				}
				blob.name = fileName;
				//window.URL.revokeObjectURL (me.fileUrl);
				//me.fileUrl = window.URL.createObjectURL (blob);
				resolve (new File ([blob], fileName));
			}, "image/jpeg");
		});
	}
	
	onCropComplete (crop) {
		this.makeClientCrop (crop);
	}
	
	onCropChange (crop, percentCrop) {
		this.setState ({image: crop});
	}
	
	render () {
		let me = this;
		
		return (
			<div className="form-group">
				{me.props.label && <label htmlFor={me.id}>{i18n (me.props.label)}</label>}
				<FileInput
					id={me.id} onFile={me.onFile} value={me.state.value} store={me.props.store}
					record={me.props.record} model={me.props.model} property={me.props.property} image={me.state.image}
				/>
				{me.props.error && <div className="invalid-feedback">{me.props.error}</div>}
				{me.state.src && <Modal
					isOpen={me.state.showModal}
					style={{content: {marginLeft: "21em"}}}
				>
					<div className="mb-3">
						<button
							type="button" className="btn btn-primary mr-1"
							onClick={() => {
								if (me.props.onChange) {
									me.props.onChange ({code: me.state.code, value: me.state.value, file: me.state.file});
								}
								me.setState ({showModal: false, src: null});
							}}
						>
							<i className="fas fa-check fa-lg mr-2" />Ok
						</button>
					</div>
					<div>
						<ReactCrop
							src={me.state.src}
							crop={me.state.image}
							ruleOfThirds
							onImageLoaded={this.onImageLoaded}
							onComplete={this.onCropComplete}
							onChange={this.onCropChange}
						/>
					</div>
				</Modal>}
			</div>
		);
	}
};
FileField.displayName = "FileField";

export default FileField;

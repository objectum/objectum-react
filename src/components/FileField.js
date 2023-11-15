/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component, useState, useEffect} from "react";
import {useDropzone} from "react-dropzone";
import {i18n, newId, loadCSS} from "..";
import ReactCrop from "react-image-crop";
import Modal from "react-modal";

function FileInput (props) {
	let propertyId = props.propertyId;

	if (!propertyId && props.model && props.property) {
		let model = props.store.getModel (props.model);
		let property = model.properties [props.property];

		propertyId = property.id;
	}
	let recordId = props.recordId;

	if (!recordId && props.record) {
		recordId = props.record.id;
	}
	let opts = {
		multiple: false
	};
	if (props.image) {
		opts.accept = "image/*";
	}
	if (props.accept) {
		opts.accept = props.accept;
	}
	const {acceptedFiles, getRootProps, getInputProps} = useDropzone (opts);
/*
	let file;

	if (acceptedFiles.length) {
		file = (<div>{acceptedFiles [0].path} - {acceptedFiles [0].size} {i18n ("bytes")}</div>);

		if (acceptedFiles [0].path != props.value) {
			setTimeout (() => {
				props.onFile (props.id, acceptedFiles [0]);
			}, 1);
		}
	} else if (props.value) {
		if (recordId) {
			file = <div><a target="_blank" rel="noopener noreferrer" href={"/files/" + recordId + "-" + propertyId + "-" + props.value}>{props.value}</a></div>;
		} else {
			file = <div>{props.value}</div>;
		}
	}
*/
	let [info, setInfo] = useState ("");
	let [error, setError] = useState (null);
	let fileEl;

	function getSize (n) {
		if (n < 1024 * 1024) {
			return `${(props.maxSize / 1024).toFixed (1)} KB`;
		}
		if (n < 1024 * 1024 * 1024) {
			return `${(props.maxSize / 1024 / 1024).toFixed (1)} MB`;
		}
		if (n < 1024 * 1024 * 1024 * 1024) {
			return `${(props.maxSize / 1024 / 1024 / 1024).toFixed (1)} GB`;
		}
	}
	useEffect (() => {
		if (acceptedFiles.length) {
			let acceptedFile = acceptedFiles [0];

			if (acceptedFile.path != props.value) {
				if (props.maxSize && acceptedFile.size > props.maxSize) {
					return setError (`${i18n ("Maximum file size")}: ${getSize (props.maxSize)}`);
				}
				if (error) {
					setError ("");
				}
				setInfo (`${acceptedFile.path} - ${acceptedFile.size} ${i18n ("bytes")}`);
				props.onFile (props.id, acceptedFile);
			}
		}
	}, [acceptedFiles.length]);

	if (props.value) {
		if (recordId) {
			fileEl = <div className="d-flex align-items-center">
				{!props.disabled && <button className="btn btn-link" onClick={() => {
					setInfo('')
					props.onChange ({target: {value: null}})
				}} title={i18n ("Remove")}>
					<i className="fas fa-times text-danger" />
				</button>}
				<a target="_blank" rel="noopener noreferrer" href={"/files/" + recordId + "-" + propertyId + "-" + props.value}>{props.value}</a>
			</div>;
		} else {
			fileEl = <div className="d-flex align-items-center">
				{!props.disabled && <button className="btn btn-link" onClick={() => {
					setInfo('')
					props.onChange ({target: {value: null}})
				}} title={i18n ("Remove")}>
					<i className="fas fa-times text-danger" />
				</button>}
				{props.value}
			</div>;
		}
	} else if (info) {
		fileEl = info;
	}
	return <div className={`border p-1 ${props.error ? "border-danger" : ""}`}>
		{props.disabled ? null : <div {...getRootProps ({className: "dropzone"})}>
			<input {...getInputProps ()} />
			<div className="bg-light p-1">{i18n ("Drag 'n' drop some file here, or click to select file")}</div>
		</div>}
		<div className="ml-2"><strong>{fileEl}</strong></div>
		{(error || props.error) && <div className="text-danger ml-2"><small>{error || props.error}</small></div>}
	</div>;
};

export default class FileField extends Component {
	constructor (props) {
		super (props);

		this.state = {
			rsc: this.props.rsc || "record",
			code: this.props.property,
			value: this.props.value
		};
		if (this.props.image && this.props.image.aspect) {
			this.state.image = {
				width: this.props.image.width || 50,
				height: this.props.image.height || 50,
				aspect: this.props.image.aspect
			};
			this.state.aspect = this.props.image.aspect;
		}
		if (!this.state.image && this.props.model) {
			let model = this.props.store.getModel (this.props.model);
			let property = model.properties [this.props.property];
			let propertyOpts = property.getOpts ();

			if (propertyOpts.image) {
				this.state.image = {
					width: propertyOpts.image.width || 50,
					height: propertyOpts.image.height || 50,
					aspect: propertyOpts.image.aspect
				};
				this.state.aspect = propertyOpts.image.aspect;
			}
		}
		this.id = newId ();
	}

/*
	onChange = (val) => {
		let value = val.target.value;

		this.setState ({value});

		if (this.props.onChange && !this.state.image) {
			this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
		}
	}
*/

	onChange = (val) => {
		let value = val.target.value;

		this.setState ({value});

		if (this.props.onChange) {
			this.props.onChange ({...this.props, code: this.state.code, property: this.state.code, value, id: this.props.id});
		}
	}

	onFile = (id, file) => {
		this.setState ({value: file.path});

		if (this.state.image) {
			const reader = new FileReader ();

			reader.addEventListener ("load", () =>
				this.setState ({src: reader.result, showModal: true})
			);
			reader.readAsDataURL (file);
		} else {
			if (this.props.onChange) {
				this.props.onChange ({...this.props, code: this.state.code, property: this.state.code, value: file.path, file, id: this.props.id});
			}
		}
	}

	async componentDidMount () {
		Modal.setAppElement ("body");

		if (typeof (window) !== undefined && !window.ReactCropLoaded && this.props.store) {
			window.ReactCropLoaded = true;
			await loadCSS (`${this.props.store.getUrl ()}/public/react-image-crop/ReactCrop.css`);
		}
	}

	async componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState ({value: this.props.value});
		}
	}

	onImageLoaded = (image) => {
		this.imageRef = image;
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
					return console.error ("Canvas is empty");
				}
				blob.name = fileName;
				resolve (new File ([blob], fileName));
			}, "image/jpeg");
		});
	}

	async makeClientCrop (crop) {
		if (this.imageRef && crop.width && crop.height) {
			const file = await this.getCroppedImg (
				this.imageRef,
				crop,
				this.state.value
			);
			this.setState ({file});
		}
	}

	onCropComplete = (crop) => {
		this.makeClientCrop (crop);
	}

	onCropChange = (crop, percentCrop) => {
		this.setState ({image: crop});
	}

	render () {
		return <div className="form-group">
			{this.props.label && !this.props.hideLabel && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
			<FileInput
				id={this.id} onFile={this.onFile} value={this.state.value} store={this.props.store}
				onChange={this.onChange}
				record={this.props.record} model={this.props.model} property={this.props.property} propertyId={this.props.propertyId} recordId={this.props.recordId}
				image={this.state.image} error={this.props.error} disabled={this.props.disabled}
				accept={this.props.accept}
				maxSize={this.props.maxSize}
			/>
			{this.props.error ? <div className="invalid-feedback">{this.props.error}</div> : null}
			{this.props.description && <div className="text-muted"><small>{this.props.description}</small></div>}
			{this.state.src && <Modal
				isOpen={this.state.showModal}
/*
				style={{content: {marginLeft: "21em"}}}
*/
				style={
					{
						content: this.props.modalStyle || (window.OBJECTUM_APP && window.OBJECTUM_APP.sidebar) ? {
							marginLeft: "21em"
						} : {},
						overlay: {zIndex: 1000}
					}
				}
			>
				<div className="mb-3">
					<button
						type="button" className="btn btn-primary mr-1"
						onClick={() => {
							if (this.props.onChange) {
								this.props.onChange ({code: this.state.code, value: this.state.value, file: this.state.file});
							}
							this.setState ({showModal: false, src: null});
						}}
					>
						<i className="fas fa-check fa-lg mr-2" />Ok
					</button>
				</div>
				<div className="">
					<ReactCrop
						src={this.state.src}
						crop={this.state.image}
						ruleOfThirds
						onImageLoaded={this.onImageLoaded}
						onComplete={this.onCropComplete}
						onChange={this.onCropChange}
					/>
				</div>
			</Modal>}
		</div>;
	}
};
FileField.displayName = "FileField";

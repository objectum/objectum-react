import React, {Component} from "react";
import {i18n} from "../i18n";
import Loading from "./Loading";
import FileField from "./FileField";
import Action from "./Action";

export default class ImportCSV extends Component {
	constructor (props) {
		super (props);

		this.state = {
			loading: true,
			file: null,
			cols: [],
			rows: [],
			loaded: false
		};
	}

	async componentDidMount () {
		const model = this.props.store.getModel(this.props.opts.model);
		let properties = model.properties;
		let dicts = {};

		if (this.props.opts.properties) {
			properties = {};
			this.props.opts.properties.forEach(a => {
				properties[a] = model.properties[a];
				properties[i18n(properties[a].name)] = model.properties[a];
			});
		}
		for (let a in properties) {
			let property = properties[a];

			if (property.type >= 1000 && this.props.store.getModel(property.type).isDictionary()) {
				dicts[property.type] = dicts[property.type] || {};
				(await this.props.store.getDict(property.type)).forEach(record => {
					dicts[property.type][record.id] = record.id;
					dicts[property.type][record.code] = record.id;
					dicts[property.type][record.name] = record.id;
				});
			}
		}
		this.setState({ model, properties, dicts, loading: false });
	}

	onLoad = () => {
		const reader = new FileReader ();

		reader.onload = async () => {
			const body = reader.result;
			const rows = body.split ("\r\n").filter(row => row.includes(";")).map(row => row.split (";"));
			const cols = rows[0].map(col => {
				let property = this.state.properties[col];
				let o = { code: property.code };

				if (property) {
					o.label = i18n(property.name);
				} else {
					o.error = i18n("property not exist or forbidden");
				}
				return o;
			});
			rows.splice(0, 1);

			for (let i = 0; i < rows.length; i ++) {
				const row = rows[i];
				const newRow = [];

				for (let j = 0; j < row.length; j ++) {
					const o = { value: row[j] };
					const col = cols[j].code;
					const property = this.state.properties[col];

					if (o.value) {
						if (property) {
							if (property.type == 2) {
								o.value = o.value.split(",").join(".");

								if (isNaN(o.value)) {
									o.error = i18n("Invalid value");
								}
							}
							if (property.type >= 1000) {
								if (this.props.store.getModel (property.type).isDictionary ()) {
									const v = this.state.dicts[property.type][o.value];

									if (v) {
										o.value = v;
									} else {
										o.error = i18n("Invalid value");
									}
								}
							}
						} else {
							o.error = i18n ("property not exist or forbidden");
						}
					}
					newRow.push(o);
				}
				rows[i] = newRow;
			}
			console.log(cols, rows);
			this.setState({ cols, rows, loaded: true });
		};
		reader.readAsText (this.state.file, "utf-8");
	}

	onAdd = async ({progress}) => {
		await this.props.store.transaction(async () => {
			for (let i = 0; i < this.state.rows.length; i ++) {
				progress ({value: i + 1, max: this.state.rows.length});
				const data = {
					_model: this.props.opts.model
				};
				this.state.rows[i].forEach((cell, i) => {
					let col = this.state.cols[i];

					if (!col.error) {
						let property = this.state.properties[col.code];

						if (property && cell.value && !cell.error) {
							data[col.code] = cell.value;
						}
					}
				});
				await this.props.store.createRecord(data);
			}
		});
		return i18n("Added successfully");
	}

	onTemplate = async () => {
		let content = "\ufeff" + [
			`${this.props.opts.properties.map(a => i18n(this.state.properties[a].name)).join (";")}`,
		].join ("\n");
		let createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function (){};
		let blob = null;
		let mimeString = "application/octet-stream";
		window.BlobBuilder = window.BlobBuilder ||
			window.WebKitBlobBuilder ||
			window.MozBlobBuilder ||
			window.MSBlobBuilder;

		if (window.BlobBuilder){
			let bb = new BlobBuilder ();
			bb.append (content);
			blob = bb.getBlob (mimeString);
		} else {
			blob = new Blob ([content], {type : mimeString});
		}
		let url = createObjectURL (blob);
		let a = document.createElement ("a");
		a.href = url
		a.download = "data.csv";
		a.innerHTML = "download file";
		document.body.appendChild (a);
		a.click ();
	}

	render () {
		if (this.state.loading) {
			return <Loading />;
		}
		return <div>
			<div className="mb-3">
				<Action label={i18n("Load template")} icon="fas fa-file-csv" onClick={this.onTemplate} />
			</div>
			<FileField label={i18n("File")} accept=".csv" onChange={({file}) => this.setState({file})} />
			<Action label={i18n("Load")} icon="fas fa-file-import" disabled={!this.state.file} onClick={this.onLoad} />
			<table className="table table-sm table-bordered my-3">
				<thead><tr>
					{this.state.cols.map((col, i) => <th key={i}>{`${col.code} (${col.label || col.error})`}</th>)}
				</tr></thead>
				<tbody>
				{this.state.rows.map((row, i) => {
					return <tr key={i}>
						{row.map(
							(cell, i) => <td key={i} className={cell.error ? "table-danger" : ""}>{cell.value}</td>
						)}
					</tr>;
				})}
				</tbody>
			</table>
			{this.state.loaded ? <Action label={i18n("Add")} icon="fas fa-file-import" confirm onClick={this.onAdd} /> : null}
		</div>;
	}
}

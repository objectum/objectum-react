import React, {Component} from "react";
import Grid from "./Grid";
import Action from "./Action";
import {i18n} from "./../i18n";

export default class Models extends Component {
	constructor (props) {
		super (props);
		
		this.parent = null;
		this.state = {
			refresh: false
		};
		this._refs = {"models": React.createRef ()};
	}
	
	onCreate = () => {
		this.props.history.push ({
			pathname: "/model/new#" + JSON.stringify ({
				opts: {
					parent: this.parent
				}
			}),
		});
	}
	
	onEdit = ({id}) => {
		this.props.history.push ({
			pathname: "/model/" + id + "#" + JSON.stringify ({
				opts: {
					parent: this.parent
				}
			})
		});
	}
	
	onRemove = async ({id}) => {
		let state = {refresh: !this.state.refresh};
		
		try {
			await this.props.store.startTransaction ("Removing model: " + id);
			await this.props.store.removeModel (id);
			await this.props.store.commitTransaction ();
		} catch (err) {
			await this.props.store.rollbackTransaction ();
			
			state.error = err.message;
		}
		this.setState (state);
	}
	
	onRecords = ({id}) => {
		this.props.history.push ({
			pathname: "/records/" + this.props.store.getModel (id).getPath ().split (".").join ("_")
		});
	}
	
	render () {
		return <div className="container">
			<div className="shadow-sm">
				<Grid
					{...this.props}
					id="models" ref={this._refs ["models"]}
					label="Models"
					store={this.props.store}
					query="objectum.model"
					tree={true} system={true}
					refresh={this.state.refresh}
					onSelectParent={parent => this.parent = parent}
					inlineActions
				>
					<div className="d-flex">
						<Action icon="fas fa-plus" label={i18n ("Create")} onClick={this.onCreate} />
						<Action icon="fas fa-edit" label={i18n ("Edit")} onClick={this.onEdit} selected />
						<Action icon="fas fa-minus" label={i18n ("Remove")} confirm onClick={this.onRemove} selected />
						<Action icon="fas fa-eye" label={i18n ("Records")} onClickSelected={this.onRecords} />
					</div>
					{this.state.error && <div className="text-danger ml-3">{`${i18n ("Error")}: ${this.state.error}`}</div>}
				</Grid>
			</div>
		</div>;
	}
};
Models.displayName = "Models";

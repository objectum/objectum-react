import React, {Component} from "react";
import {i18n, newId, DateSelector, getTimestampString} from "..";

class DateField extends Component {
	constructor (props) {
		super (props);
		
		let value = this.props.value;
		
		if (value && typeof (value) == "string") {
			value = new Date (value);
		}
		let localValue = "";
		
		if (value) {
			localValue = getTimestampString (value);
		}
		this.state = {
			rsc: this.props.rsc || "record",
			code: this.props.property,
			value,
			localValue
		};
		this._refs = {
			"input": React.createRef (),
			"content": React.createRef ()
		}
		this.id = newId ();
	}
	
	componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			let value = this.props.value;
			
			if (value && typeof (value) == "string") {
				value = new Date (value);
			}
			let localValue = "";
			
			if (value) {
				localValue = getTimestampString (value);
			}
			this.setState ({value, localValue});
		}
	}

	componentDidMount () {
		document.addEventListener ("mousedown", this.onDocumentClick);
	}
	
	componentWillUnmount () {
		document.removeEventListener ("mousedown", this.onDocumentClick);
	}
	
	onDocumentClick = (event) => {
		if (this.state.showDateSelector &&
			!this._refs ["input"].current.contains (event.target) &&
			!this._refs ["content"].current.contains (event.target)
		) {
			if (this.state.value != this.props.value && this.props.onChange) {
				this.props.onChange ({...this.props, code: this.state.code, value: this.state.value});
			}
			let state = {
				showDateSelector: false
			};
			if (this.state.value) {
				state.localValue = getTimestampString (this.state.value);
			} else {
				state.localValue = "";
			}
			this.setState (state);
		}
	}
	
	onChange = (val) => {
		let localValue = val.target.value;
		let state = {localValue};
		let decodeDate = s => {
			let value;
			let tokens = s.split (".");
			
			if (tokens.length == 3) {
				if (tokens [2].length == 1) {
					tokens [2] = "200" + tokens [2];
				}
				if (tokens [2].length == 2) {
					tokens [2] = "20" + tokens [2];
				}
				value = new Date (tokens [2], Number (tokens [1]) - 1, tokens [0]);
			} else
			if (tokens.length != 3) {
				tokens = s.split ("-");
				
				if (tokens.length == 3) {
					if (tokens [0].length == 1) {
						tokens [0] = "200" + tokens [0];
					}
					if (tokens [0].length == 2) {
						tokens [0] = "20" + tokens [0];
					}
					value = new Date (tokens [0], Number (tokens [1]) - 1, tokens [2]);
				}
			}
			return value;
		};
		if (localValue) {
			let value;
			
			if (typeof (localValue) == "object" && localValue.getMonth) {
				// from DateSelector
				state.value = localValue;
				state.localValue = getTimestampString (localValue);
			} else
			if (this.props.showTime) {
				let tokens = localValue.split (" ");
				
				value = decodeDate (tokens [0]);
				
				if (tokens.length == 2 && value && !isNaN (value)) {
					tokens = tokens [1].split (":");

					if (tokens.length >= 2) {
						value.setHours (tokens [0]);
						value.setMinutes (tokens [1]);

						if (tokens.length >= 3) {
							value.setSeconds (tokens [2]);
						}
					}
				}
			} else {
				value = decodeDate (localValue);
			}
			if (value && !isNaN (value)) {
				state.value = value;
			}
		} else {
			state.value = null;
		}
		this.setState (state);
	}
	
	onFocus = () => {
		this.setState ({showDateSelector: true});
	}
	
	render () {
		return (
			<div className={(this.props.label || this.props.error) ? "form-group" : ""}>
				{this.props.label && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
				<input
					type="text"
					className={`form-control ${this.props.error ? "is-invalid" : ""} datefield`}
					id={this.id}
					value={this.state.localValue}
					onChange={this.onChange}
					disabled={this.props.disabled}
					onFocus={this.onFocus}
					ref={this._refs ["input"]}
				/>
				{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}

				{this.state.showDateSelector ? <div className="date-selector-wrapper" ref={this._refs ["content"]}>
					<div className="date-selector-content bg-white border shadow-sm">
						<DateSelector
							value={this.state.value}
							showTime={this.props.showTime}
							onChange={({value}) => this.onChange ({target: {value}})}
						/>
					</div>
				</div> : <div />}
			</div>
		);
	}
};
DateField.displayName = "DateField";

export default DateField;

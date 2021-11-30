import React, {Component} from "react";
import {i18n, newId, DateSelector, getTimestampString} from "..";

export default class DateField extends Component {
	constructor (props) {
		super (props);
		
		this.state = Object.assign ({
			rsc: this.props.rsc || "record",
			code: this.props.property
		}, this.getValues ());
		
		this._refs = {
			"input": React.createRef (),
			"content": React.createRef ()
		}
		this.id = newId ();
	}
	
	getValues () {
		let value = this.props.value;
		
		if (value && typeof (value) == "string") {
			value = new Date (value);
		}
		let localValue = "";
		
		if (value) {
			if (!this.props.showTime) {
				value.setHours (0);
				value.setMinutes (0);
				value.setSeconds (0);
				value.setMilliseconds (0);
			}
			localValue = getTimestampString (value);
		}
		return {value, localValue};
	}
	
	componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState (this.getValues ());
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

	dateHelper (s) {
		if (s && typeof (s) == "object" && s.getMonth) {
			return s;
		}
		let v = "";

		for (let i = 0; i < s.length; i ++) {
			if ("01234567890.".indexOf (s [i]) > -1) {
				v += s [i];
			}
		}
		return v;
	}

	onChange = (val) => {
		let localValue = this.dateHelper (val.target.value);
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

	onBlur = () => {
		let value = this.state.value;
		let changed = false;

		if (value) {
			if (this.props.min && value < this.props.min) {
				value = this.props.min;
				changed = true;
			}
			if (this.props.max && value > this.props.max) {
				changed = true;
				value = this.props.max;
			}
		}
		if (changed) {
			this.setState ({value, localValue: getTimestampString (value)});

			if (this.props.onChange) {
				this.props.onChange ({...this.props, code: this.state.code, value, id: this.props.id});
			}
		}
	}

	onFocus = () => {
		this.setState ({showDateSelector: true});
	}
	
	render () {
		return <div className={(this.props.label || this.props.error) ? "form-group" : ""}>
			{this.props.label && !this.props.hideLabel && <label htmlFor={this.id}>{i18n (this.props.label)}{this.props.notNull ? <span className="text-danger ml-1">*</span> : null}</label>}
			<input
				type="text"
				className={`${this.props.inputClassName || "form-control"} ${this.props.sm ? "form-control-sm" : ""} ${this.props.error ? "is-invalid" : ""} datefield`}
				id={this.id}
				value={this.state.localValue}
				onChange={this.onChange}
				onBlur={this.onBlur}
				disabled={this.props.disabled}
				onFocus={this.onFocus}
				ref={this._refs ["input"]}
				maxLength={this.props.showTime ? 18 : 11}
				style={{width: `calc(${this.props.showTime ? 18 : 11}ch + 15px)`}}
				placeholder={i18n ("dd.mm.yyyy")}
			/>
			{this.props.error && <div className="invalid-feedback">{this.props.error}</div>}

			{this.state.showDateSelector ? <div className="date-selector-wrapper" ref={this._refs ["content"]}>
				<div className="date-selector-content bg-white border shadow-sm">
					<DateSelector
						value={this.state.value}
						showTime={this.props.showTime}
						onChange={({value}) => this.onChange ({target: {value}})}
						holidays={this.props.holidays || this.holidays}
						min={this.props.min}
						max={this.props.max}
					/>
				</div>
			</div> : <div />}
		</div>;
	}
};
DateField.displayName = "DateField";

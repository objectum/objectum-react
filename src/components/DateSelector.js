import React, {Component} from "react";
import {i18n} from "../i18n";

class DateSelector extends Component {
	constructor (props) {
		super (props);
		
		let value = this.checkValue (this.props.value || new Date ());
		let localValue = new Date (value);
		
		localValue.setDate (1);
		
		this.state = {
			showTime: this.props.showTime,
			value,
			localValue,
			days: [
				i18n ("Mon"),
				i18n ("Tue"),
				i18n ("Wed"),
				i18n ("Thu"),
				i18n ("Fri"),
				i18n ("Sat"),
				i18n ("Sun")
			],
			monthRecs: [
				{id: "0", name: i18n ("January")},
				{id: "1", name: i18n ("February")},
				{id: "2", name: i18n ("March")},
				{id: "3", name: i18n ("April")},
				{id: "4", name: i18n ("May")},
				{id: "5", name: i18n ("June")},
				{id: "6", name: i18n ("July")},
				{id: "7", name: i18n ("August")},
				{id: "8", name: i18n ("September")},
				{id: "9", name: i18n ("October")},
				{id: "10", name: i18n ("November")},
				{id: "11", name: i18n ("December")}
			]
		};
		let yearRecs = [], startYear = new Date ().getFullYear () - 100;
		
		for (let i = 0; i < 150; i ++) {
			yearRecs.push ({id: i + startYear, name: i + startYear});
		}
		this.state.yearRecs = yearRecs;
	}
	
	checkValue (value) {
		if (typeof (value) == "string") {
			value = new Date (value);
		}
		if (!this.props.showTime) {
			value.setHours (0);
			value.setMinutes (0);
			value.setSeconds (0);
			value.setMilliseconds (0);
		}
		return value;
	}
	
	componentDidUpdate (prevProps, prevState) {
		if (this.props.value && this.props.value != this.state.value) {
			let value = this.checkValue (this.props.value);
			let localValue = new Date (value);
			
			localValue.setDate (1);
			
			this.setState ({value, localValue});
		}
	}
	
	renderDays () {
		let rows = [], row = [], prevMonthWas = false;
		let weekDay = 1, num = 0;
		let d = new Date (this.state.localValue);
		
		while (d.getDay () != 1) {
			d.setDate (d.getDate () - 1);
		}
		while (1) {
			let color = (d.getDay () == 6 || d.getDay () == 0) ? "text-danger" : "";
			
			if (d.getMonth () == this.state.localValue.getMonth ()) {
				prevMonthWas = true;
			} else {
				color = "text-secondary";
			}
			let cd = new Date (d);
			let selected = d.getFullYear () == this.state.value.getFullYear () && d.getMonth () == this.state.value.getMonth () && d.getDate () == this.state.value.getDate ();
			
			row.push (
				<td
					key={num}
					className={`${color} text-center`}
					onClick={() => this.onChange (cd)}
					style={{cursor: "pointer"}}
				>
					<div className={selected ? "text-white bg-info" : ""}>{d.getDate ()}</div>
				</td>
			);
			num ++;
			weekDay ++;
			d.setDate (d.getDate () + 1);
			
			if (weekDay == 8) {
				rows.push (<tr key={num}>{row}</tr>);
				weekDay = 1;
				row = [];
			}
			if (prevMonthWas && weekDay == 1 && (d.getMonth () != this.state.localValue.getMonth () || d.getDate () == 1)) {
				break;
			}
		}
		return rows;
	}
	
	onChange = (value) => {
		this.setState ({value});
		
		if (this.props.onChange) {
			this.props.onChange ({value});
		}
	}
	
	renderTime () {
		let hours = [], minutes = [];
		
		for (let i = 0; i < 60; i ++) {
			if (i < 24) {
				hours.push (String (i).padStart (2, "0"));
			}
			minutes.push (String (i).padStart (2, "0"));
		}
		let hour = String (this.state.value.getHours ()).padStart (2, "0");
		let minute = String (this.state.value.getMinutes ()).padStart (2, "0");
		
		return <div className="d-flex justify-content-center">
			<div className="my-auto mr-1">{i18n ("Time")}</div>
			<select
				className="custom-select" style={{width: "4em"}}
				value={hour}
				onChange={val => this.onChange (new Date (this.state.value.setHours (val.target.value)))}
			>
				{hours.map ((v, i) => {
					return <option key={i} value={v}>{v}</option>;
				})}
			</select>
			<select
				className="ml-1 custom-select" style={{width: "4em"}}
				value={minute}
				onChange={val => this.onChange (new Date (this.state.value.setMinutes (val.target.value)))}
			>
				{minutes.map ((v, i) => {
					return <option key={i} value={v}>{v}</option>;
				})}
			</select>
		</div>;
	}
	
	render () {
		return <div className="">
			<div className="d-flex justify-content-between">
				<button
					className="btn btn-link"
					onClick={() => this.setState ({localValue: new Date (this.state.localValue.setMonth (this.state.localValue.getMonth () - 1))})}
				>
					<i className="fas fa-chevron-left" />
				</button>
				<div className="d-flex pt-1">
					<div>
						<select
							className="custom-select"
							style={{width: "10em"}}
							value={this.state.localValue.getMonth ()}
							onChange={val => this.setState ({localValue: new Date (this.state.localValue.setMonth (val.target.value))})}
						>
							{this.state.monthRecs.map ((rec, i) => {
								return <option key={i} value={rec.id}>{rec.name}</option>;
							})}
						</select>
					</div>
					<div className="ml-1">
						<select
							className="custom-select"
							style={{width: "7em"}}
							value={this.state.localValue.getFullYear ()}
							onChange={val => this.setState ({localValue: new Date (this.state.localValue.setFullYear (val.target.value))})}
						>
							{this.state.yearRecs.map ((rec, i) => {
								return <option key={i} value={rec.id}>{rec.name}</option>;
							})}
						</select>
					</div>
				</div>
				<button
					className="btn btn-link"
					onClick={() => this.setState ({localValue: new Date (this.state.localValue.setMonth (this.state.localValue.getMonth () + 1))})}
				>
					<i className="fas fa-chevron-right" />
				</button>
			</div>
			<div className="p-1">
				<table className="table table-sm border-bottom">
					<thead>
					<tr>
						{this.state.days.map ((day, i) => <th key={i} className={i > 4 ? "text-danger" : ""}>{day}</th>)}
					</tr>
					</thead>
					<tbody>
					{this.renderDays ()}
					</tbody>
				</table>
				{this.state.showTime && this.renderTime ()}
			</div>
		</div>;
	}
};
DateSelector.displayName = "DateSelector";

export default DateSelector;

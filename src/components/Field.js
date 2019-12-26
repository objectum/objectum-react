/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import StringField from "./StringField";
import NumberField from "./NumberField";
import DateField from "./DateField";
import BooleanField from "./BooleanField";
import DictField from "./DictField";
import ChooseField from "./ChooseField";
import FileField from "./FileField";

class Field extends Component {
	render () {
		let props = this.props;
		let type = props.type;
		
		if (type == 1) {
			return (<StringField {...props} />);
		}
		if (type == 2) {
			return (<NumberField {...props} />);
		}
		if (type == 3) {
			return (<DateField {...props} />);
		}
		if (type == 4) {
			return (<BooleanField {...props} />);
		}
		if (type >= 1000) {
			if (props.dict) {
				return (<DictField {...props} />);
			} else {
				return (<ChooseField {...props} />);
			}
		}
		if (type == 5) {
			return (<FileField {...props} />);
		}
		return (<div>unsupported type</div>);
	}
};
Field.displayName = "Field";

export default Field;

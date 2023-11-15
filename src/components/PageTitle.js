import React from "react";
import {i18n} from "../i18n";

export default function PageTitle (props) {
	if (props.label) {
		return <h5 className="font-weight-bold ml-1">{i18n (props.label)}</h5>
	} else {
		return null;
	}
}

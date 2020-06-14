import React, {Component} from "react";

class Fade extends Component {
	constructor (props) {
		super (props);
		
		let me = this;
		
		me.smoothShow = me.smoothShow.bind (me);
		
		me.state = {
			opacity: 0
		};
	}
	
	smoothShow () {
		let me = this;
		let opacity = me.state.opacity + 0.02;
		
		
		me.setState ({opacity});
		
		if (opacity < 1) {
			me.timerId = setTimeout (me.smoothShow, 10);
		}
	}
	
	componentDidMount () {
		this.smoothShow ();
	}
	
	componentWillUnmount () {
		clearTimeout (this.timerId);
	}
	
	render () {
		let me = this;
		
		return (
			<div className={me.props.className} style={{opacity: me.state.opacity}}>
				{me.props.children}
			</div>
		);
	}
}
Fade.displayName = "Fade";

export default Fade;

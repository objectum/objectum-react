Under construction.

# objectum-react

Simple react components.

## Components
* [ObjectumApp](#objectum_app)  
* [Auth](#auth)
* [Grid](#grid)  
* [TreeGrid](#tree_grid)  
* [Form](#form)  
* [Tabs](#tabs)  
* [Tab](#tab)  
* [Fields](#fields)  
    * [Field](#field)  
    * [StringField](#string_field)  
    * [NumberField](#number_field)
    * [BooleanField](#boolean_field)  
    * [DateField](#date_field)  
    * [ChooseField](#choose_field)  
    * [FileField](#file_field)  
    * [SelectField](#select_field)
* [Confirm](#confirm)

<a name="objectum_app" />

### ObjectumApp
```js
import React, {Component} from "react";
import store from "objectum-client";
import {ObjectumApp} from "objectum-react";
import "objectum-react/lib/css/bootstrap.css";
import "objectum-react/lib/fontawesome/css/all.css";

class App extends Component {
	constructor (props) {
		super (props);
		
		store.setUrl ("/api/projects/catalog/");
	}
	
	render () {
		return (
			<ObjectumApp store={store} />
		);
	}
};

export default App;
```
Quick login:
```html
<ObjectumApp store={store} username="admin" password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()} />
```

<a name="auth" />

### Auth
Authorization form.

<a name="grid" />

### Grid

<a name="tree_grid" />

### TreeGrid

<a name="form" />

### Form

<a name="tabs" />

### Tabs

<a name="tab" />

### Tab

<a name="fields" />

### Fields

<a name="field" />

### Field

<a name="string_field" />

### StringField

<a name="number_field" />

### NumberField

<a name="boolean_field" />

### BooleanField

<a name="date_field" />

### DateField

<a name="choose_field" />

### ChooseField

<a name="file_field" />

### FileField

<a name="select_field" />

### SelectField

<a name="confirm" />

### Confirm

## Author

**Dmitriy Samortsev**

+ http://github.com/objectum


## Copyright and license

MIT

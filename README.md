# objectum-react

React components for Objectum UI. Based on [Bootstrap](https://getbootstrap.com), [Font Awesome](https://fontawesome.com).

Objectum ecosystem:
* Javascript platform https://github.com/objectum/objectum  
* Isomorhic javascript client https://github.com/objectum/objectum-client  
* Proxy for server methods and access control https://github.com/objectum/objectum-proxy  
* React components https://github.com/objectum/objectum-react  
* Command-line interface (CLI) https://github.com/objectum/objectum-cli  
* Objectum project example https://github.com/objectum/catalog 

Install:
```bash
npm install --save objectum-react
```

## Components
* [ObjectumApp](#objectum_app)  
* [Auth](#auth)
* [Grid](#grid)  
* [Grid (tree)](#tree_grid)  
* [Form](#form)  
* [Tabs](#tabs)  
* [Fields](#fields)  
    * [Field](#field)  
    * [StringField](#string_field)  
    * [NumberField](#number_field)
    * [BooleanField](#boolean_field)  
    * [DateField](#date_field)  
    * [FileField](#file_field)
    * [ChooseField](#choose_field)
    * [DictField](#dict_field)
    * [SelectField](#select_field)
    * [JsonField](#json_field)
    * [JsonEditor](#json_editor)
* [Tooltip](#tooltip)  
* [Fade](#fade)  
* [Action](#action)
* ModelList
* Loading  
* Navbar
* Office
* Pagination
* Panel
* Group
* Tree  
* Model helpers
    * _renderGrid
    * _layout
    * _renderForm
    * static _renderField
    * _renderField
* property JSON options
    * textarea
    * showTime

<a name="objectum_app" />

### ObjectumApp
```js
import React, {Component} from "react";
import {Store} from "objectum-client";
import {ObjectumApp} from "objectum-react";

import "objectum-react/lib/css/bootstrap.css";
import "objectum-react/lib/css/objectum.css";
import "objectum-react/lib/fontawesome/css/all.css";

const store = new Store ();

class App extends Component {
    constructor (props) {
        super (props);
        
        store.setUrl ("/api");
    }
    
    render () {
        return (
            <ObjectumApp store={store} name="Catalog" version="0.0.1" />
        );
    }
};

export default App;
```
Quick login:
```html
<ObjectumApp store={store} username="admin" password={require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ()} />
```
Locale:
```html
<ObjectumApp store={store} locale="ru" />
```
Custom render:
```html
<ObjectumApp store={store} onCustomRender={this.onCustomRender} />
```
```js
onCustomRender ({content, app}) {
    if (...) {
        return (<div>{content}</div>);
    }
    // default render
}
```

<a name="auth" />

### Auth
Authentication form.
```html
<Auth store={store} onConnect={sid => this.setState ({sid})} />
```

<a name="grid" />

### Grid
props:
* **store**: - objectum store
* **id**: - used in url hash navigation
* **ref**: - used in ChooseField.choose.ref
* **label**: - label of grid
* **query, model**: - query or model for data reading
* **pageRecs**: recs on page
* **refresh** - change for refresh grid 

```html
<Grid id="roles" ref="roles" label="Roles" store={store} query="objectum.role" refresh={this.state.refresh} />
```
Query "objectum.role":
```sql
{"data": "begin"}
select
    {"prop": "a.id", "as": "id"},
    {"prop": "a.name", "as": "name"},
    {"prop": "a.code", "as": "code"}
{"data": "end"}

{"count": "begin"}
select
    count (*) as num
{"count": "end"}

from
    {"model": "objectum.role", "alias": "a"}

{"where": "empty"}

{"order": "empty"}    
    
limit {"param": "limit"}
offset {"param": "offset"}
```

<a name="tree_grid" />

### Grid (tree)
props:
* **onSelectParent**: *function* - event listener 

```html
<Grid id="menuItems" ref="menuItems" label="Menu items" store={store} query="objectum.class" refresh={this.state.refresh} tree onSelectParent={parent => this.parent = parent} />
```
```sql
{"data": "begin"}
select
    {"prop": "a.id", "as": "id"},
    {"prop": "a.name", "as": "name"},
    {"prop": "a.order", "as": "order"},
    {"prop": "a.menu", "as": "menu"},
    {"prop": "a.parent", "as": "parent"},
    {"prop": "a.path", "as": "path"},
    {"prop": "a.icon", "as": "icon"}
{"data": "end"}

{"count": "begin"}
select
    count (*) as num
{"count": "end"}

{"tree": "begin"}
select
    {"prop": "a.parent", "as": "parent"}, count (*) as num
{"tree": "end"}

from
    {"model": "objectum.menuItem", "alias": "a"}

{"where": "begin"}
    {"prop": "a.menu"} = {"param": "menu"} and
    {"prop": "a.parent"} {"tree": "filter"}
{"where": "end"}    

{"order": "begin"}
    {"prop": "a.order"}
{"order": "end"}

{"tree": "begin"}
group by
    {"prop": "a.parent"}
{"tree": "end"}

limit {"param": "limit"}
offset {"param": "offset"}  
```

<a name="form" />

### Form
props:
* **store** - objectum store 
* **rsc** - objectum resource (record, model, property, query, column) 
* **rid** - resource id
* **mid** - model id. Used with resource "record"
* **defaults** - default values for creating record
* **record** - instead rsc, rid, mid

```js
class User extends Component {
    constructor (props) {
        super (props);
        
        let rid = this.props.rid;

        this.state = {
            rid: rid == "new" ? null : rid
        };
    }
	
	onCreate = (rid) => {
		this.setState ({rid});
		goRidLocation (this.props, rid);
	}
    
    render () {
        return (
            <Form store={store} rsc="record" rid={this.state.rid} mid="objectum.user" onCreate={this.onCreate}>
                <Field property="name" />
                <Field property="login" />
                <Field property="password" />
                <Field property="role" dict />
                <Field property="file" />
            </Form>
        );
    }
};
```

<a name="tabs" />

### Tabs
```html
<Tabs id="tabs">
    <Tab label="Main info">
        ...
    </Tab>
    <Tab label="Additional">
        ...
    </Tab>
</Tabs>
```

<a name="fields" />

### Fields

<a name="field" />

### Field
Component selects objectum field by type.
props:
* **type**: *number* - objectum type id

Objectum types:
* 1 - string
* 2 - number
* 3 - timestamp (date)
* 4 - boolean
* 5 - file
* 1000 - ... - models

Common props for all fields:
* **property**: *string* - resource property
* **label**: *string* - field label
* **value**: field value
* **disabled**: *boolean*
* **onChange**: *function* - event listener
* **error**: *boolean* - error in field

<a name="string_field" />

### StringField
String field. Type id: 1
props:
* **textarea**: *boolean* - textarea editor
* **monospace**: *boolean* - monospace font in textarea editor
* **wysiwig**: *boolean* - wysiwig editor

<a name="number_field" />

### NumberField
Number field. Type id: 2  
props:
* **min**: *number* - min value
* **max**: *number* - max value

<a name="date_field" />

### DateField
Date field. Type id: 3  
props:
* **showTime**: *boolean* - enable time (hh:mm:ss)

<a name="boolean_field" />

### BooleanField
Boolean field. Type id: 4

<a name="file_field" />

### FileField
props:
* **store** - objectum store
* **record** - record
* **model** - model

<a name="choose_field" />

### ChooseField
Field for selecting value.  
From component:
```html
<ChooseField property="type" choose={{cmp: ItemTypes, ref: "d.item.type"}} />
```
From model:
```html
<ChooseField property="type" choose={{model: "d.item.type"}} />
```

<a name="select_field" />

### SelectField
Field for selecting from list (dictionary).
```js
let recs = [{id: 1, name: "Item 1"}, {id: 2, name: "Item 2"}];
```
```html
<SelectField property="type" recs={recs} />
```

<a name="json_field" />

### JsonField
Composite field
```html
<JsonField
    label="My options"
    property="opts"
    value='{"p1": true, "p2": false}'
    props={[
        {prop: "p1", label: "P1", component: BooleanField},
        {prop: "p2", label: "P2", component: BooleanField},
        {prop: "p3", label: "P3", component: BooleanField}
    ]}
/>
```

<a name="json_editor" />

### JsonEditor
Textarea editor. You can select tag from JSON for multiline editing.
```html
<JsonEditor property="opts" label="Options" />
```

<a name="tooltip" />

### Tooltip
```html
<Tooltip label="My tooltip">
    <div>...</div>
</Tooltip>
```

<a name="fade" />

### Fade
Smooth appearance animation
```html
<Fade>
    <div>...</div>
</Fade>
```

<a name="action" />

### Action
Action is a button. Helps with:
* Execute sync and async functions
* Catches and displays exceptions
* Shows confirmation before execute
* Shows progress (client and server methods)
* Shows result
* User can stop execution

Simple:
```html
<Action
    label="My action"
    onClick={() => {
        ...
    }}
/>
```

Confirmation, progress, result:
```html
<Action
    label="My action"
    confirm
    onClick={async ({store, progress}) => {
        for (let i = 0; i < 10; i ++) {
            progress ({label: "My label", value: i + 1, max: 10});
        }
        return "My result";
    }}
/>
```

## Author

**Dmitriy Samortsev**

+ http://github.com/objectum


## Copyright and license

MIT

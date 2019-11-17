# objectum-react

Simple react components for objectum UI. Based on [Bootstrap](https://getbootstrap.com), [Font Awesome](https://fontawesome.com).


Install:
```bash
npm install objectum-react
```

## Components
* [ObjectumApp](#objectum_app)  
* [Auth](#auth)
* [Grid](#grid)  
* [TreeGrid](#tree_grid)  
* [Form](#form)  
* [Tabs](#tabs)  
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
Authentication form.
```html
<Auth store={store} onConnect={sid => this.setState ({sid})} />
```

<a name="grid" />

### Grid
props:
* **store**: - objectum store
* **id**: - used in url hash navigation
* **ref**: - used in ChooseField.chooseRef
* **title**: - title of grid
* **query**: - query
* **pageRecs**: default 10 - recs on page
* **refresh**: *boolean* - change for refresh grid 

```html
<Grid id="roles" ref="roles" title="Roles" store={this.props.store} query="objectum.role" pageRecs={10} refresh={this.state.refresh} />
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
limit {"param": "limit"}
offset {"param": "offset"}
```

<a name="tree_grid" />

### TreeGrid
props:
* **onSelectParent**: *function* - event listener 

```html
<TreeGrid id="menuItems" ref="menuItems" title="Menu items" store={this.props.store} query="objectum.class" pageRecs={10} refresh={this.state.refresh} onSelectParent={parent => this.parent = parent}>
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
* **rsc** - objectum resource 
* **rid** - resource id
* **mid** - model id. Used with resource "record"

```js
class User extends Component {
    constructor (props) {
        super (props);
        
        let rid = this.props.rid;

        this.state = {
            rid: rid == "new" ? null : rid
        };
    }
    
    render () {
        return (
            <Form key="form1" store={this.props.store} rsc="record" rid={this.state.rid} mid="objectum.user">
                <Field attr="name" />
                <Field attr="login" />
                <Field attr="password" />
                <Field attr="role" dict={true} />
                <Field attr="file" />
            </Form>
        );
    }
};
```

<a name="tabs" />

### Tabs
```html
<Tabs key="tabs" id="tabs">
    <Tab key="tab1" title="Main info">
        <Form />
    </Tab>
    <Tab key="tab2" title="Additional">
        <Form />
    </Tab>
</Tabs>
```

<a name="fields" />

### Fields

<a name="field" />

### Field
Component selects objectum field by type.
props:
* **type**: *number* - objectum model id

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
* **codemirror**: *boolean* - codemirror editor

<a name="number_field" />

### NumberField
Number field. Type id: 2

<a name="date_field" />

### DateField
Date field. Type id: 3

<a name="boolean_field" />

### BooleanField
Boolean field. Type id: 4

<a name="file_field" />

### FileField
props:
* **store** - objectum store
* **record** - record
* **model** - record model

<a name="choose_field" />

### ChooseField
Field for selecting from query. Type id: >= 1000
```html
<ChooseField property="type" label="Type" rsc="record" value={this.state.type} choose={ItemTypes} chooseRef="d.item.type" />
```

<a name="select_field" />

### SelectField
Field for selecting from list (dictionary). Type id: >= 1000
```js
let recs = [{id: 1, name: "Item 1"}, {id: 2, name: "Item 2"}];
```
```html
<SelectField property="type" label="Type" recs={recs} />
```

<a name="confirm" />

### Confirm
```js
class Items extends Component {
    constructor (props) {
        super (props);
        
        this.state = {
            removeConfirm: false
        };
    }

    async onRemove (confirmed) {
        if (confirmed) {
            ...
        }
        this.setState ({removeConfirm: false});
    }

    render () {
        return (
            <div>
                ...
                
                <Confirm title="Are you sure?" visible={this.state.removeConfirm} onClick={this.onRemove} />
            </div>
        );
    }
};	

```

## Author

**Dmitriy Samortsev**

+ http://github.com/objectum


## Copyright and license

MIT

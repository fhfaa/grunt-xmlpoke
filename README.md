# grunt-xmlstoke

> An extended version of [grunt-xmlpoke](https://github.com/bdukes/grunt-xmlpoke) by [Brian Dukes](https://github.com/bdukes) - a gruntjs port of the `xmlpoke` NAnt task.

> In addition to **updating** the values of existing nodes, as provided by grunt-xmlpoke, grunt-xmlstoke can perform all basic CRUD operations on XML Files: **creating/inserting** new nodes, **deleting** existing nodes, and **reading** the values of existing nodes (to then save them in `grunt.option`).

> The current API should be completely backward-compatible with grunt-xmlpoke

<hr>
## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-xmlstoke --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-xmlstoke');
```
<hr>
## The "xmlstoke" task

### Overview
In your project's Gruntfile, add a section named `xmlstoke` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  xmlstoke: {
    updateTitle: {
      options: {
        actions: [{
          xpath: '//title',
          value: 'The Good Parts'
        }],
      }
      files: { 'dest.xml': 'src.xml' },
    },
  },
})
```
<hr>
### Action Options
grunt-xmlstoke is configured with a series of actions (an array of objects), each of which is a single Read, Create/Insert, Update, or Delete operation.

<br />
#### action.type (all actions)
Type: `String`, Default value: `undefined` (Default operation is Update)<br />
Denotes the type of operation. Only the first character is evaluated (case-insensitive) so you can pretty much name it whatever for readability in your gruntfile. `i`, `Ins`, `INSERT` and even `indian food` all denote an insertion. 

First character should be:
```
C or I - Create/Insert
R - Read
U - Update (this is the default, type can be left blank for Update as well)
D - Delete
```
<br />
#### action.xpath (all actions)
Type: `String` or `Array of Strings` of valid XPath selectors.<br />
Note that for Read operations only the first selector is evaluated.

For Insertion operations, this points to the parentNode/ownerNode to have the new elements/attributes inserted into.

<br />
#### action.value (only Insert and Update)
Type: `String` or `Function(node?)` returning a `String`

For **Updates**, this function is passed the selected node.<br />
For **Insertions**, this function is passed the selected parentNode/ownerNode.

<br />
#### action.node (only Insert)
Type: `String`

The name of the node to be inserted, e.g. `"my-node"` to insert `<my-node/>` into, or `"@myattr"` to add the `myattr` attribute to the node(s) selected with `action.xpath`. Can also contain an XPath index (**NOTE: unlike JavaScript Arrays ,XPath is 1-index**) which is stripped from the name upon node creation, in order to create more than one of a kind:

```js
actions: [
  { type: 'I', xpath: '/cds', node: 'cd', value: 'Slayer' },
  { type: 'I', xpath: '/cds', node: 'cd', value: 'More Slayer' }
]
```
Would find that `/cds/cd` already exists after the first insertion, and instead update its value (compare: mysql insert on duplicate key update).

```js
actions: [
  { type: 'I', xpath: '/cds', node: 'cd[1]', value: 'Slayer' },
  { type: 'I', xpath: '/cds', node: 'cd[2]', value: 'More Slayer' }
]
```
Would correctly insert two different CDs, the index being optional in the first line.

<br />
#### action.saveAs (only Read)
Type: `String`<br />
The key with which to save the retrieved value(s) in `grunt.option`. If set to `myFoo`, the value can later be retrieved by calling `grunt.option('myFoo')`. Note that the value saved can be a string if only one node was found, or an array of strings if more than one were found. This behaviour can be overridden using `action.returnArray`.

<br />
#### action.returnArray (only Read)
Type: `String`<br />
Always saves an array in `grunt.option`, even if only a single node was matched. I.e. turns `"result"` into `["result"]`

<br />
#### action.callback (only Read)
Type: `Function`<br />
A post-processor for the extracted value(s) if you will. Applied the the extracted values before saving them in `grunt.option`.

Examples: 
```js

callback: function (readValues) { // readValues := "100"
    // Typecast to int before storing
    return parseInt(readValues, 10);
}

callback: function (readValues) { // readValues := ["A", "B"]
    if (readValues.length < 3) {
        // Return null to throw a grunt.error and abort the task
        // grunt.log.verbose("Aborting because there were only 2 nodes, expecting: 3+");
        return null;
    }
    return readValues;
}

callback: function (readValues) { // readValues := null
    if (readValues === null) {
        // Prevent grunt from throwing an Error because no nodes matched
        // grunt.log.verbose("Config elem not found, using default");
        return grunt.option('myDefaultValue');;
    }
    return readValues;
}
```

<hr>
### Task Options
#### options.actions
Type: `Array`, Default value: `undefined`

An array of `Action` objects, see Actions Options.<br />
Examples:
```js
actions: [
  // Delete all <foo> nodes
  {type: 'D', xpath: '//foo'},
  
  // Insert <baz> into all <baz> under /myroot
  {type: 'I', xpath: '/rootelem/bar', node: 'baz', },
  
  // Add an athe foobar="100" attribute to them
  {type: 'I', xpath: '/rootelem/bar/baz', node: '@foobar', value: '100'},
  
  // Change it to 200 for the second of those <baz>, type=update assumed as default
  {xpath: '/rootelem/bar/baz[2]/@foobar', value: '200'},
  
  // Read the value of the foobar attr from the 5th overall occurence of <baz>,
  // Save it in grunt.option as "myData"
  {type: 'R', xpath: '//baz[5]/@foobar', saveAs: 'myData' }
}]
```

Alternatively, the `reads`, `deletions`, `insertions` and `updates`/`replacements` shorthands can be used instead of `actions`. That way you don't have to specify the action type manually.
The config arrays are processed in the order reads, deletions, insertions, replacements || updates, actions.

#### options.updates (alias: options.replacements)
Type: `Array`,
Default value: `undefined`<br />
An Array of Update Actions. `action.type` is set automatically.
<br>
#### options.deletions
Type: `Array`,
Default value: `undefined`<br />
An Array of Deletion Actions. `action.type` is set automatically.
<br>
#### options.reads
Type: `Array`,
Default value: `undefined`<br />
An Array of Read Actions. `action.type` is set automatically.
<br>
#### options.insertions
Type: `Array`,
Default value: `undefined`<br />
An Array of Insertion Actions. `action.type` is set automatically.
<br>
<hr>
### Usage Examples
#### Example - Basic Updates
In this example, the text content of an element is set to a static value. So if the `test.xml` file has the content `<abc attr="1"></abc>`, the generated result would be `<abc attr="2">123</abc>`.
```js
grunt.initConfig({
  xmlstoke: {
    setTheNumber: {
      options: {
        actions: [{
          xpath: '/abc',
          value: '123'
        }, {
          xpath: '/abc/@attr',
          value: '2'
        }],
      }
      files: { 'dest/output.xml': 'src/test.xml' }
    },
  },
})
```

#### Example - Update with function as value
In this example, the value of an attribute is modified. So if the `test.xml` file has the content `<x y="abc" />`, the generated result in this case would be `<x y="ABC" />`.

```js
grunt.initConfig({
  xmlstoke: {
    upperCaseAttr: {
      options: {
        actions: [{
          xpath: '/x/@y',
          value: function (node) { return node.value.toUpperCase(); }
        }]
      },
      files: {
        'dest/output.xml': 'src/test.xml',
      },
    },
  },
})
```

#### Example - Multiple XPath Selectors
In this example, the same value is updated in multiple locations. So if the `testing.xml` file has the content `<x y="999" />`, the generated result in this case would be `<x y="111">111</x>`.

```js
grunt.initConfig({
  xmlstoke: {
    updateAllTheThings: {
      options: {
        actions: [{
          xpath: ['/x/@y','/x'],
          value: '111'
        ]}
      },
      files: {
        'dest/output.xml': 'src/test.xml',
      },
    },
  },
})
```

#### Example - Deleting Nodes
Given `<x><a /><a /><b /><c /></x>`, will delete all matched nodes and return `<x></x>` (`<x />`)
```js
grunt.initConfig({
  xmlstoke: {
    deleteStuff: {
      options: {
        actions: [{
          type: 'del'
          xpath: ['/x/a', '//b'],
        }]
      },
      files: {
        'dest/output.xml': 'src/test.xml',
      },
    },
  },
})
```

#### Example - Inserting Elements and Attributes
Given `<x a="1"></x>`, returns `<x a="2"><foo bar="baz"/></a>`. Notice how an Insertion just performs an update if the node exists already as seen with the `@a` attribute
```js
grunt.initConfig({
  xmlstoke: {
    updateAllTheThings: {
      options: {
        actions: [{
          type: 'ins'
          xpath: '//x',
          node: '@a
          value: '2'
        }, {
          type: 'ins'
          xpath: '//x',
          node: 'foo'
        }, {
          type: 'ins'
          xpath: '//x/foo',
          node: '@bar'
          value: 'baz'
        }]
      },
      files: {
        'dest/output.xml': 'src/test.xml',
      },
    },
  },
})
```

#### Example - Namespaces and Reads
This example covers both basic Reads and namespaces. `options.namespaces` must be specified whenever operations inolve namespaces. After that, simply use the usual `ns:elemName` or `ns:attrName` syntax everywhere.

Given `<RDF><foo>A</foo><em:bar>B</em:bar></RDF>`, persists the values read from the tags in grunt.option, then retrieves them in value callbacks in order to swap them in the resulting XML: `<RDF><foo>B</foo><em:bar>A</em:bar></RDF>`)
```js
grunt.initConfig({
  xmlstoke: {
    rebuildScreensTag: {
      options: {
       namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
        actions: [{
          type: 'R'
          xpath: '//foo',
          saveAs: 'myFoo'
        }, {
          type: 'R'
          xpath: '//em:bar',
          saveAs: 'myBarAsArray',
          returnArray: true
        }, {
          xpath: '//em:bar',
          value: function (node) { return grunt.option('myFoo'); }
        }, , {
          xpath: '//foo',
          value: function (node) { return grunt.option('myBarAsArray')[0]; }
        }]
      },
      files: {
        'dest/output.xml': 'src/test.xml',
      },
    },
  },
})
```


<hr>
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 - 0.1.0
 <br/>&mdash; Initial release
 - 0.2.0
 <br/>&mdash; Multiple replacements at once
 - 0.2.1
 <br/>&mdash; Color filename when logged
 - 0.3.0
 <br/>&mdash; Allow specifying replacement value as a function
 - 0.4.0
 <br/>&mdash; Allow specifying namespaces
 - 0.5.0 *(point of fork from grunt-xmlpoke)*
 <br/>&mdash; Allow adding elements or attributes via `insertions` option
 - 0.5.1
 <br/>&mdash; Bugfixes
 - 0.5.2
   <br/>&mdash; Allow [index] selection for insertion xpath (stripped from name for actual element creation)
   <br/>&mdash; Allow removing elements via `deletions` option (barely tested)
 - 0.6.0
 <br/>&mdash; Code cleanup
 - 0.7.0 
 <br/>&mdash; Fixed deleting attribute nodes
 <br/>&mdash; Added `updates` option as an alias for `replacements`
 <br/>&mdash; Added `reads` option to extract node values by xpath and save them to `grunt.option`
 <br/>&mdash; Added `actions` option as a series of CRUD actions in arbitrary order
 <br/>&mdash; Added tests for deletions, reads and new alias parameters
 <br/>&mdash; **TODO:** Add tests for expected error scenarios

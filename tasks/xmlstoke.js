/*
 * grunt-xmlstoke
 * https://github.com/fhfaa/grunt-xmlstoke
 * Copyright (c) 2014 Flo Ziemer
 *
 * Based on grunt-xmlstoke
 * https://github.com/bdukes/grunt-xmlpoke
 * Copyright (c) 2014 Brian Dukes
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	var xmldom = require('xmldom'),
		xpath = require('xpath'),
		
		domParser = new xmldom.DOMParser(),
		xmlSerializer = new xmldom.XMLSerializer(),
		
		ATTRIBUTE_NODE = 2;
	
	
	
	
	// Helper function -
	// DELETES a node from the XML document
	function deleteNode(node) {
		if (node.nodeType === ATTRIBUTE_NODE) {
			node.ownerElement.removeAttributeNode(node);
		} else {
			node.parentNode.removeChild(node);
		}
		
	}
	
	
	
	
	// Helper function -
	// UPDATES the value of a node, value being either a scalar value
	// or a callback that receives the node to be manipulated
	// Allows for i.e. fn prepend1(node) { return '1' + node.textContent; }
	function updateNodeValue(node, value) {
		// If value is a function, call it and pass the node as arg1
		// Default to '' if value is null/undef/false
		// Watch out for falsy 0
		value = typeof value !== 'function' ? value : value(node);
		value = value === 0 ? value : (value || '');
		
		if (node.nodeType === ATTRIBUTE_NODE) {
			node.value = value;
		} else {
			node.textContent = value;
		}
	}
	
	
	
	// Helper function -
	// INSERT-IFEXIST-UPDATES an attribute node
	function insertUpdateAttributeNode(node, name, val, ns, nsUri) {
		if (ns) {
			node.setAttributeNS(nsUri, ns + ':' + name, val);
		} else {
			node.setAttribute(name, val);
		}
	}
	
	
	
	// Helper function -
	// INSERT-IFEXIST-UPDATES an element node
	function insertUpdateElementNode(document, selectFn, node, name, val, ns, nsUri) {
		var newNode = selectFn(name, node)[0];
		
		if (!newNode) {
			if (ns) {
				newNode = document.createElementNS(nsUri, ns + ':' + name.replace(/\[\d+?\]$/g, ''));
			} else {
				newNode = document.createElement(name.replace(/\[\d+?\]$/g, ''));
			}
			node.appendChild(newNode);
		}
		
		if (val) { 
			newNode.textContent = val;
		}
	}
	
	
	
	
	// Helper function -
	// Extracts the value or text content of a node depending on its type (attr/elem)
	function extractNodeValue(node) {
		if (!node) { return null; }
		
		if (node.nodeType === ATTRIBUTE_NODE) {
			return node.value;
		} else {
			return node.textContent;
		}
	}
	
	
	
	
	// Helper function - 
	// Takes <mixed> or [<mixed>*] and returns [<mixed>*]
	// Defaults to []
	function toArray(maybeArray) {
		return maybeArray instanceof Array ? maybeArray : 
			(maybeArray ? [maybeArray] : []);
	}
	
	
	
	
	function handleReadQuery(selectFn, returnArray, saveAs, callback, query) {
		var nodes,
			ret;
		
		callback = typeof callback === 'function' ? callback : false;
		saveAs = String(saveAs);
		
		// Abort if there is no valid string to be used as grunt.option name
		if (!saveAs) {
			throw new Error ('Invalid config name saveAs<string> for read query "' + query + '"');
		}
		
		nodes = selectFn(query);
		
		
		// If no node was found, return null.
		// This will throw an error unless handled by a callback.
		if (nodes.length === 0) {
			ret = null;
			
		// With just one result and the returnArray option not set,
		// return a single value.
		} else if (nodes.length === 1 && !returnArray) {
			ret = extractNodeValue(nodes[0]);
		
		// Return an array of values if multiple nodes were found.
		// Single value results can be returned as [val] with the returnArray opt.
		} else {
			ret = toArray(nodes).map(extractNodeValue);
		}
		
		// If a callback is given, pass the extracted value/s to it.
		// The callback can now either post-process the values, or 
		// return null to reject the result and fail the task.
		if (callback) {
			ret = callback(ret);
			
			if (ret === null) {
				throw new Error('Node value rejected by callback (Query: "' + query + '", Option: "' + saveAs + '"');
			}
			
		} else if (ret === null) {
			throw new Error('Failed to extract node value (Query: "' + query + '", Option: "' + saveAs + '"');
		}
		
		grunt.option(saveAs, ret);
	}
	
	
	
	
	function handleDeletionQuery(selectFn, query) {
		var nodes = selectFn(query);
					
		grunt.verbose.writeln('Deleting ' + nodes.length + ' node(s) for query: ' + query);
		if (!nodes.length) { return; }
		
		nodes.forEach(deleteNode);
	}
	
	
	
	
	function handleUpdateQuery(selectFn, value, query) {
		var nodes = selectFn(query);
		
		grunt.verbose.writeln(
			'Updating value of ' + nodes.length + ' node(s) ' + 
			(typeof value === 'function' ? 'via callback' : 'to "' + ("" + value) + '"') +
			'for query: ' + query
		);
		if (!nodes.length) { return; }
		
		nodes.forEach(function (node) {
			updateNodeValue(node, value);
		});
	}
	
	
	
	
	function handleInsertionQuery(selectFn, document, namespaces, value, nodeName, query) {
		var name = typeof nodeName === 'string' ? nodeName : null,
			isAttr = false,
			ns = false,
			nodes;
		
		if (!name) {
			throw new Error('No node<string> given for insertion into "' + query + '"');
		}
		
		// Check if it's an attribute
		if (name.charAt(0) === '@') {
			isAttr = true;
			name = name.substring(1);
		}
		
		// Check if the name contains a namespace
		if (name.lastIndexOf(':') > -1) {
			ns = name.substring(0, name.lastIndexOf(':'));
			name = name.substring(name.lastIndexOf(':') + 1);
			
			if (!namespaces[ns]) {
				throw new Error('No URI given for namespace "' + ns + '" in options.namespaces');
			}
			
		}
		
		nodes = selectFn(query);
		
		grunt.verbose.writeln(
			'Insert/updating childNode "' + (ns ? ns + ':' : '') + name + '" in ' +
			nodes.length + ' node(s) ' + 
			(typeof value === 'function' ? 'via callback' : 'to "' + ("" + value) + '"') +
			' for query: ' + query
		);
		if (!nodes.length) { return false; }
		
		nodes.forEach(function (node) {
			var val = typeof value !== 'function' ? value : value(node);
			if (!val && val !== 0) { val = ''; }
			
			
			if (isAttr) {
				// Pass ALL the params
				insertUpdateAttributeNode(node, name, val, ns, namespaces[ns]);
			} else {
				// But wait, there's more...
				insertUpdateElementNode(document, selectFn, node, name, val, ns, namespaces[ns]);
			}
		});
	}
	
	
	
	
	grunt.registerMultiTask('xmlstoke', 'Updates values in XML files based on XPath queries', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options();
		
		try {
		
		// Iterate over all given file groups.
		this.files.forEach(function (f) {
		
			// Accept only a single src file per dest
			if (f.src.length > 1) {
				throw new Error('Only a single src file per dest is supported. ' + f.src.length + ' given.');
			}
			
			// Make sure the source file exists
			if (!grunt.file.exists(f.src[0])) {
				throw new Error('Source file "' + f.src[0] + '" not found.');
			}
			
			
			
			var doc = domParser.parseFromString(grunt.file.read(f.src[0])),
				select = options.namespaces ?
					xpath.useNamespaces(options.namespaces) :
					xpath.select,
					
				wrappedSelect = function (query, context) {
					return select(query, context || doc);
				},
				
				// Bind file-level "globals" to handlerFns
				readFn = handleReadQuery.bind(null, wrappedSelect),
				deletionFn = handleDeletionQuery.bind(null, wrappedSelect),
				updateFn = handleUpdateQuery.bind(null, wrappedSelect),
				insertionFn = handleInsertionQuery.bind(null, wrappedSelect, doc, options.namespaces || {});
			
			
			// Treat .updates as an alias for .replacements.
			// If "xpath" is given directly inside of the options object,
			// treat it as the config for a single update action.
			options.replacements = options.replacements || options.updates || 
				(options.xpath ? [options] : []);
			
			
			// Actions is a customizable array of reads, insertions, deletions and updates,
			// but in any order.
			// The type of action is denoted by the first char of the "type" option string (CI)
			// That way, "i", "INS", "inSert", and even "idiotic c0de" all denote an Insertion.
			//
			// C or I: Insert
			// R: Read
			// U: Update (assumed default)
			// D: Delete
			[].concat(
				toArray(options.reads).map(function (e) { e.type = 'R'; return e; }),
				toArray(options.deletions).map(function (e) { e.type = 'D'; return e; }),
				toArray(options.insertions).map(function (e) { e.type = 'I'; return e; }),
				toArray(options.replacements),
				toArray(options.actions)
			).
				forEach(function (action) {
					var type = (action.type || '').toUpperCase().charAt(0);
					
					switch (type) {
						case 'R': // READ
							toArray(action.xpath).
								filter(function (xpath, i) {
									// Allow only one xpath per read action so as not to overcomplicate returns
									if (i === 0) { return true; }
									grunt.log.warn('Discarding secondary xpath "' + xpath + '" in read action');
									return false;
								}).
								forEach(readFn.bind(null, !!action.returnArray, action.saveAs, action.callback));
								break;
						case 'D': // DELETE
							toArray(action.xpath).
								forEach(deletionFn);
							break;
						case 'I': // INSERT-UPDATE
							toArray(action.xpath).
								forEach(insertionFn.bind(null, action.value, action.node));
							break;
						default: // UPDATE
							toArray(action.xpath).
								forEach(updateFn.bind(null, action.value));
					}
				});
			
			
			// Write the destination file.
			grunt.file.write(f.dest, xmlSerializer.serializeToString(doc));
			
			// Print a success message.
			grunt.log.writeln('File ' + f.dest.cyan + ' created.');
		});
		
		} catch (ex) {
			// Fail the task if an error was encountered
			grunt.log.error(ex.message);
			return false;
		}
	});
};
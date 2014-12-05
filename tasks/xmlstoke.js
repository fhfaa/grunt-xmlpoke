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
	
	
	
	
	// Removes a node from the XML document
	function deleteNode(node) {
		node.parentNode.removeChild(node);
	}
	
	
	
	
	// Updates the value of a node, value being either a scalar value
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
	
	
	
	function handleDeletionQuery(document, selectFn, query) {
		var nodes = selectFn(query, document);
					
		grunt.verbose.writeln('Deleting ' + nodes.length + ' node(s) for query: ' + query);
		if (!nodes.length) { return; }
		
		nodes.forEach(deleteNode);
	}
	
	
	
	
	function handleUpdateQuery(document, selectFn, value, query) {
		var nodes = selectFn(query, document);
		
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
	
	
	
	
	function handleInsertionQuery(document, selectFn, namespaces, value, nodeName, query) {
		var name = typeof nodeName === 'string' ? nodeName : null,
			isAttr = false,
			ns;
		
		namespaces = namespaces || {};
		
		if (!name) {
			grunt.log.warn('No node<string> given for insertion at ' + query);
			return;
		}
		
		if (name.charAt(0) === '@') {
			isAttr = true;
			name = name.substring(1);
		}
		
		if (name.lastIndexOf(':') > -1) {
			ns = name.substring(0, name.lastIndexOf(':'));
			name = name.substring(name.lastIndexOf(':') + 1);
			
			if (!namespaces[ns]) {
				grunt.log.error('No URI given for namespace "' + ns + '" in options.namespaces');
				return;
			}
			
		}
		
		var nodes = selectFn(query, document);
		if (!nodes.length) { return; }
		
		nodes.forEach(function (node) {
			var val = typeof value !== 'function' ? value : value(node),
				newNode;
			
			if (!val && val !== 0) { val = ''; }
			
			if (isAttr) {
				if (ns) {
					node.setAttributeNS(namespaces[ns], ns + ':' + name, val);
				} else {
					node.setAttribute(name, val);
				}
			} else {
				
				newNode = selectFn(name, node)[0];
				if (!newNode) {
					
					if (ns) {
						newNode = document.createElementNS(namespaces[ns], ns + ':' + name.replace(/\[\d+?\]$/g, ''));
					} else {
						newNode = document.createElement(name.replace(/\[\d+?\]$/g, ''));
					}
					node.appendChild(newNode);
				}
				if (val) { 
					newNode.textContent = val;
				}
			}
		});
	}
	
	
	
	
	grunt.registerMultiTask('xmlstoke', 'Updates values in XML files based on XPath queries', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options();
		
		// Iterate over all given file groups.
		this.files.forEach(function (f) {
			// Accept only a single src file per dest
			if (f.src.length > 1) {
				grunt.log.warn('Only a single src file per dest is supported. ' + f.src.length + ' given.');
				return false;
			}
			
			// Make sure the source file exists
			if (!grunt.file.exists(f.src[0])) {
				grunt.log.warn('Source file "' + f.src[0] + '" not found.');
				return false;
			}
			
			var doc = domParser.parseFromString(grunt.file.read(f.src[0])),
				select = options.namespaces ? xpath.useNamespaces(options.namespaces) : xpath.select,
				
				replacements = options.replacements || (options.xpath ? [options] : []),
				insertions = options.insertions || [],
				deletions = options.deletions || [],
				
				deletionFn = handleDeletionQuery.bind(null, doc, select),
				updateFn = handleUpdateQuery.bind(null, doc, select),
				insertionFn = handleInsertionQuery.bind(null, doc, select, options.namespaces || {});
			
			
			
			deletions.forEach(function (deletion) {
				var queries = typeof deletion.xpath === 'string' ? [deletion.xpath] : deletion.xpath;
				
				queries.forEach(deletionFn);
			});
			
			
			
			
			replacements.forEach(function (replacement) {
				var queries = typeof replacement.xpath === 'string' ? [replacement.xpath] : replacement.xpath;
				
				queries.forEach(updateFn.bind(null, replacement.value));
			});
			
			
			
			
			insertions.forEach(function (insertion) {
				var queries = typeof insertion.xpath === 'string' ? [insertion.xpath] : insertion.xpath;
				
				queries.forEach(insertionFn.bind(null, insertion.value, insertion.node));
			});
			
			
			
			
			// Write the destination file.
			grunt.file.write(f.dest, xmlSerializer.serializeToString(doc));
			
			// Print a success message.
			grunt.log.writeln('File ' + f.dest.cyan + ' created.');
		});
	});
};
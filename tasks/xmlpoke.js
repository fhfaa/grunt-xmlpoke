/*
 * grunt-xmlpoke
 * https://github.com/bdukes/grunt-xmlpoke
 *
 * Copyright (c) 2014 Brian Dukes
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var xmldom = require('xmldom'),
        xpath = require('xpath'),
        _ = require('lodash'),
        ATTRIBUTE_NODE = 2;

    grunt.registerMultiTask('xmlpoke', 'Updates values in XML files based on XPath queries', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options();

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            if (f.src.length > 1) {
                grunt.log.warn('Only a single src per dest is supported');
                return false;
            }
            
            var src = f.src.filter(function (filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                }).map(function (filepath) {
                    // Read file source.
                    return grunt.file.read(filepath);
                })[0],
                domParser = new xmldom.DOMParser(),
                doc = domParser.parseFromString(src),
                xmlSerializer = new xmldom.XMLSerializer(),
                replacements = options.replacements || (options.xpath ? [options] : []),
				insertions = options.insertions || [];
			
            replacements.forEach(function (replacement) {
                var queries = typeof replacement.xpath === 'string' ? [replacement.xpath] : replacement.xpath,
                    getValue = _.isFunction(replacement.value) ? replacement.value : function () { return replacement.value || ''; };
                queries.forEach(function (query) {
                    var select = options.namespaces ? xpath.useNamespaces(options.namespaces) : xpath.select;
                    var nodes = select(query, doc);
                    nodes.forEach(function (node) {
                        var value = getValue(node);
                        grunt.verbose.writeln('setting value of "' + query + '" to "' + value + '"');
                        if (node.nodeType === ATTRIBUTE_NODE) {
                            node.value = value;
                        } else {
                            node.textContent = value;
                        }
                    });
                });
            });
			
			
			insertions.forEach(function (insertion) {
				var query = insertion.xpath,
					name = typeof insertion.node === 'string' ? insertion.node : null,
					getValue = _.isFunction(insertion.value) ? insertion.value : function () { return insertion.value || ''; },
					isAttr = false,
					ns;
				
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
					if (!options.namespaces[ns]) {
						grunt.log.error('No URI given for namespace ' + ns + ' in options.namespaces');
						return;
					}
					name = name.substring(name.lastIndexOf(':') + 1);
				}
				
				var select = options.namespaces ? xpath.useNamespaces(options.namespaces) : xpath.select,
					nodes = select(query, doc);
					
				nodes.forEach(function (node) {
					var value = getValue(),
						newNode;
						
					if (isAttr) {
						if (ns) {
							node.setAttributeNS(options.namespaces[ns], ns + ':' + name, value);
						} else {
							node.setAttribute(name, value);
						}
					} else {
						newNode = select(name, node)[0];
						if (!newNode) {
							
							if (ns) {
								newNode = doc.createElementNS(options.namespaces[ns], ns + ':' + name);
							} else {
								newNode = doc.createElement(name);
							}
							node.appendChild(newNode);
						}
						newNode.textContent = value;
					}
				});
			});

            // Write the destination file.
            grunt.file.write(f.dest, xmlSerializer.serializeToString(doc));

            // Print a success message.
            grunt.log.writeln('File ' + f.dest.cyan + ' created.');
        });
    });
};
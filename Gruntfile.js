/*
 * grunt-xmlstoke
 * https://github.com/fhfaa/grunt-xmlstoke
 * Copyright (c) 2014 Flo Ziemer
 *
 * Based on grunt-xmlpoke
 * https://github.com/bdukes/grunt-xmlpoke
 * Copyright (c) 2014 Brian Dukes
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		
		 // Unit tests.
		nodeunit: {
			tests: ['test/*_test.js']
		},
		
		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp/*.*']
		},
		
		// Configuration to be run (and then tested).
		xmlstoke: {
			
			// -------------------------------
			// UPDATES (xmlpoke functionality)
			// -------------------------------
			
			testing_attribute: {
				options: {
					xpath: '/data/@test-value',
					value: 'UPDATE'
				},
				files: { 'tmp/testing_attribute.xml': 'test/fixtures/testing.xml' }
			},
			
			testing_element: {
				options: {
					xpath: '/data',
					value: 'UPDATED information'
				},
				files: { 'tmp/testing_element.xml': 'test/fixtures/testing.xml' }
			},
			
			numbers_elements: {
				options: {
					xpath: '//Number',
					value: '90'
				},
				files: { 'tmp/numbers_elements.xml': 'test/fixtures/numbers.xml' }
			},
			
			numbers_no_match: {
				options: {
					xpath: '//Numbering',
					value: '999'
				},
				files: { 'tmp/numbers_no_match.xml': 'test/fixtures/numbers.xml' }
			},
			
			default_value_is_empty: {
				options: {
					xpath: '/x/@y'
				},
				files: { 'tmp/default_value_is_empty.xml': 'test/fixtures/simple.xml' }
			},
			
			multiple_xpath_queries: {
				options: {
					xpath: ['/x/@y','/x'],
					value: '111'
				},
				files: { 'tmp/multiple_xpath_queries.xml': 'test/fixtures/simple.xml' }
			},
			
			multiple_replacements: {
				options: {
					replacements: [{
						xpath: '/x/@y',
						value: '111'
					}, {
						xpath: '/x',
						value: 'M'
					}]
				},
				files: { 'tmp/multiple_replacements.xml': 'test/fixtures/simple.xml' }
			},
			
			value_as_function: {
				options: {
					xpath: '/x/@y',
					value: function () {
						return 'value from a function';
					}
				},
				files: { 'tmp/value_as_function.xml': 'test/fixtures/simple.xml' }
			},
			
			value_as_function_with_callback: {
				options: {
					xpath: '/data/@test-value',
					value: function (node) {
						return node.value.toUpperCase();
					}
				},
				files: { 'tmp/value_as_function_with_callback.xml': 'test/fixtures/testing.xml' }
			},
			
			
			// ----------
			// NAMESPACES
			// ----------
			
			namespaces: {
				options: {
					namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
					xpath: '/RDF/Description/em:version',
					value: '1.2.4'
				},
				files: { 'tmp/namespaces.xml': 'test/fixtures/namespaces.xml' }
			},
			
			
			// ---------
			// INSERTION
			// ---------
			
			create_attr: {
				
				options: {
					namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
					insertions: [{
						xpath: '//Description',
						node: '@hello',
						value: 'world'
					}]
				},
				files: { 'tmp/create_attr.xml': 'test/fixtures/namespaces.xml' }
			},
			
			create_attr_ns: {
				options: {
					namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
					insertions: [{
						xpath: '//Description',
						node: '@em:helloTwo',
						value: 'world'
					}]
				},
				files: { 'tmp/create_attr_ns.xml': 'test/fixtures/namespaces.xml' }
			},
			
			create_element: {
				options: {
					namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
					insertions: [{
						xpath: '//Description',
						node: 'new-elem',
						value: 'world'
					}]
				},
				files: { 'tmp/create_element.xml': 'test/fixtures/namespaces.xml' }
			},
			
			create_element_ns: {
				options: {
					namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
					insertions: [{
						xpath: '//Description',
						node: 'em:new-elem',
						value: 'worldTwo'
					}]
				},
				files: { 'tmp/create_element_ns.xml' : 'test/fixtures/namespaces.xml' }
			},
			
			
			// --------
			// DELETION
			// --------
			
			xmldom_is_live: {
				files: { 'tmp/xmldom_is_live.xml' : 'test/fixtures/numbers.xml' },
				options: {
					deletions: [{
						xpath: ['/Numbers/Number[2]', '/Numbers/Number[2]']
					}]
				}
			},
			
			delete_element: {
				files: { 'tmp/delete_element.xml' : 'test/fixtures/numbers.xml' },
				options: {
					deletions: [{
						xpath: '/Numbers/Number[2]'
					}]
				}
			},
			
			delete_element_multi: {
				files: { 'tmp/delete_element_multi.xml' : 'test/fixtures/numbers.xml' },
				options: {
					deletions: [{
						xpath: ['/Numbers/Number']
					}]
				}
			},
			
			delete_element_multi_xpaths: {
				files: { 'tmp/delete_element_multi_xpaths.xml' : 'test/fixtures/numbers.xml' },
				options: {
					deletions: [{
						xpath: ['/Numbers/Number[3]', '/Numbers/Number[2]']
					}]
				}
			},
			
			delete_element_nonexistent: {
				files: { 'tmp/delete_element_nonexistent.xml' : 'test/fixtures/numbers.xml' },
				options: {
					deletions: [{
						xpath: ['/Numbers/Strings']
					}]
				}
			},
			
			delete_element_ns: {
				files: { 'tmp/delete_element_ns.xml' : 'test/fixtures/namespaces2.xml' },
				options: {
					namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
					deletions: [{
						xpath: ['//em:version']
					}]
				}
			},
			
			delete_attribute: {
				files: { 'tmp/delete_attribute.xml' : 'test/fixtures/simple.xml' },
				options: {
					deletions: [{
						xpath: ['/x/@y']
					}]
				}
			},
			
			delete_attribute_ns: {
				files: { 'tmp/delete_attribute_ns.xml' : 'test/fixtures/namespaces2.xml' },
				options: {
					namespaces: { 'em': 'http://www.mozilla.org/2004/em-rdf#' },
					deletions: [{
						xpath: ['//Description/@em:hello']
					}]
				}
			},
			
			
			
			// -------
			// Aliases
			// -------
			
			updates_as_replacements: {
				options: {
					updates: [{
						xpath: '/data',
						value: 'UPDATED information'
					}]
				},
				files: { 'tmp/updates_as_replacements.xml': 'test/fixtures/testing.xml' }
			},
			
			replacements_as_actions: {
				options: {
					actions: [{
						xpath: '/data',
						value: 'UPDATED information'
					}]
				},
				files: { 'tmp/replacements_as_actions.xml': 'test/fixtures/testing.xml' }
			},
			
			insertions_as_actions: {
				options: {
					actions: [{
						type: 'I',
						xpath: '/Numbers',
						node: 'something'
					}]
				},
				files: { 'tmp/insertions_as_actions.xml' : 'test/fixtures/numbers.xml' }
			},
			
			deletions_as_actions: {
				options: {
					actions: [{
						type: 'D',
						xpath: '/Numbers/Number[2]'
					}]
				},
				files: { 'tmp/deletions_as_actions.xml' : 'test/fixtures/numbers.xml' }
			},
			
			
			// -----
			// Reads
			// -----
			
			read_write_swap: {
				options: {
					actions: [{
						type: 'R',
						xpath: '/Numbers/Number[1]',
						saveAs: 'myValue1'
					}, {
						type: 'R',
						xpath: '/Numbers/Number[2]',
						saveAs: 'myValue2'
					}, {
						xpath: '/Numbers/Number[1]',
						value: function () { return grunt.option('myValue2'); }
					}, {
						xpath: '/Numbers/Number[2]',
						value: function () { return grunt.option('myValue1'); }
					}]
				},
				files: { 'tmp/read_write_swap.xml' : 'test/fixtures/numbers.xml' }
			},
			
			read_array: {
				options: {
					actions: [{
						type: 'R',
						xpath: '/Numbers/Number',
						saveAs: 'myArray'
					}, {
						xpath: '/Numbers/Number[2]',
						value: function () { return grunt.option('myArray').join('/'); }
					}]
				},
				files: { 'tmp/read_array.xml' : 'test/fixtures/numbers.xml' }
			},
			
			read_single_as_array: {
				options: {
					actions: [{
						type: 'R',
						xpath: '/Numbers/Number[1]',
						saveAs: 'myArray2',
						returnArray: true
					}, {
						xpath: '/Numbers/Number[2]',
						value: function () { return grunt.option('myArray2') instanceof Array ? "OK!" : ":("; }
					}]
				},
				files: { 'tmp/read_single_as_array.xml' : 'test/fixtures/numbers.xml' }
			},
			
			postprocess_read_result: {
				options: {
					actions: [{
						type: 'R',
						xpath: '/Numbers/Number[1]',
						saveAs: 'something',
						callback: function (readResult) {
							return readResult === '1' ? 'It\'s ' + readResult + '!' : 'It\'s something bad';
						}
					}, {
						xpath: '/Numbers/Number[2]',
						value: function () { return grunt.option('something'); }
					}]
				},
				files: { 'tmp/postprocess_read_result.xml' : 'test/fixtures/numbers.xml' }
			},
			
			recover_from_nullread: {
				options: {
					actions: [{
						type: 'R',
						xpath: '/Numbers/Number[4]',
						saveAs: 'maybenull',
						callback: function (readResult) {
							return readResult === null ? "recovered" : ":(";
						}
					}, {
						xpath: '/Numbers/Number[2]',
						value: function () { return grunt.option('maybenull'); }
					}]
				},
				files: { 'tmp/recover_from_nullread.xml' : 'test/fixtures/numbers.xml' }
			},
			
			discard_surplus_xpaths_for_read: {
				options: {
					actions: [{
						type: 'R',
						xpath: ['/Numbers/Number[1]', '/Numbers/Number[2]'],
						saveAs: 'oneortwo'
					}, {
						xpath: '/Numbers/Number[3]',
						value: function () { return grunt.option('oneortwo') === '1' ? 'OK!' : ':('; }
					}]
				},
				files: { 'tmp/discard_surplus_xpaths_for_read.xml' : 'test/fixtures/numbers.xml' }
			}
		}
	});
	
	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');
	
	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	
	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'xmlstoke', 'nodeunit']);
	
	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'test']);
};
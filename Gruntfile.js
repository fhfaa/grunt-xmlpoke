/*
 * grunt-xmlpoke
 * https://github.com/bdukes/grunt-xmlpoke
 *
 * Copyright (c) 2014 Brian Dukes
 * Extended by github/fhfaa
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

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        xmlpoke: {
            testing_attribute: {
                options: {
                    xpath: '/data/@test-value',
                    value: 'UPDATE'
                },
                files: {
                    'tmp/testing_attribute.xml': 'test/fixtures/testing.xml'
                }
            },
            testing_element: {
                options: {
                    xpath: '/data',
                    value: 'UPDATED information'
                },
                files: {
                    'tmp/testing_element.xml': 'test/fixtures/testing.xml'
                }
            },
            numbers_elements: {
                options: {
                    xpath: '//Number',
                    value: '90'
                },
                files: {
                    'tmp/numbers_elements.xml': 'test/fixtures/numbers.xml'
                }
            },
            numbers_no_match: {
                options: {
                    xpath: '//Numbering',
                    value: '999'
                },
                files: {
                    'tmp/numbers_no_match.xml': 'test/fixtures/numbers.xml'
                }
            },
            default_value_is_empty: {
                options: {
                    xpath: '/x/@y'
                },
                files: {
                    'tmp/default_value_is_empty.xml': 'test/fixtures/simple.xml'
                }
            },
            multiple_xpath_queries: {
                options: {
                    xpath: ['/x/@y','/x'],
                    value: '111'
                },
                files: {
                    'tmp/multiple_xpath_queries.xml': 'test/fixtures/simple.xml'
                }
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
                files: {
                    'tmp/multiple_replacements.xml': 'test/fixtures/simple.xml'
                }
            },
            value_as_function: {
                options: {
                    xpath: '/x/@y',
                    value: function(){
                        return 'value from a function';
                    }
                },
                files: {
                    'tmp/value_as_function.xml': 'test/fixtures/simple.xml'
                }
            },
            value_as_function_with_callback: {
                options: {
                    xpath: '/data/@test-value',
                    value: function(node){
                        return node.value.toUpperCase();
                    }
                },
                files: {
                    'tmp/value_as_function_with_callback.xml': 'test/fixtures/testing.xml'
                }
            },
            namespaces: {
                dest: 'tmp/namespaces.xml',
                src: 'test/fixtures/namespaces.xml',
                options: {
                    namespaces: {
                        'em': 'http://www.mozilla.org/2004/em-rdf#'
                    },
                    xpath: '/RDF/Description/em:version',
                    value: '1.2.4'
                },
			},
			create_attr: {
				dest: 'tmp/create_attr.xml',
				src: 'test/fixtures/namespaces.xml',
				options: {
					namespaces: {
						'em': 'http://www.mozilla.org/2004/em-rdf#'
					},
					insertions: [{
						xpath: '//Description',
						node: '@hello',
						value: 'world'
					}]
				}
			},
			create_attr_ns: {
				dest: 'tmp/create_attr_ns.xml',
				src: 'test/fixtures/namespaces.xml',
				options: {
					namespaces: {
						'em': 'http://www.mozilla.org/2004/em-rdf#'
					},
					insertions: [{
						xpath: '//Description',
						node: '@em:helloTwo',
						value: 'world'
					}]
				}
			},
			create_element: {
				dest: 'tmp/create_element.xml',
				src: 'test/fixtures/namespaces.xml',
				options: {
					namespaces: {
						'em': 'http://www.mozilla.org/2004/em-rdf#'
					},
					insertions: [{
						xpath: '//Description',
						node: 'new-elem',
						value: 'world'
					}]
				}
			},
			create_element_ns: {
				dest: 'tmp/create_element_ns.xml',
				src: 'test/fixtures/namespaces.xml',
				options: {
					namespaces: {
						'em': 'http://www.mozilla.org/2004/em-rdf#'
					},
					insertions: [{
						xpath: '//Description',
						node: 'em:new-elem',
						value: 'worldTwo'
					}]
				}
			}
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
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
    grunt.registerTask('test', ['clean', 'xmlpoke', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
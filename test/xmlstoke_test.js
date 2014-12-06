'use strict';

var grunt = require('grunt');


// Names should be reflected in all of the following:
// - grunt xmlstoke:__ task name
// - grunt output filename: tmp/__.xml
// - expected test result xml file test/expected/__.xml
var xmlDiffSpecs = [{
	name: 'testing_attribute',
	desc: 'should change attribute value.'
}, {
	name: 'testing_attribute',
	desc: 'should change element value.'
}, {
	name: 'numbers_elements',
	desc: 'should change several element values'
}, {
	name: 'numbers_no_match',
	desc: 'should not change anything'
}, {
	name: 'default_value_is_empty',
	desc: 'should have empty attribute'
}, {
	name: 'multiple_xpath_queries',
	desc: 'should update both text and attribute values to "111".'
}, {
	name: 'multiple_replacements',
	desc: 'should update text and attribute values.'
}, {
	name: 'value_as_function',
	desc: 'should use a function return value.'
}, {
	name: 'value_as_function_with_callback',
	desc: 'should use a function return value'
}, {
	name: 'namespaces',
	desc: 'should support namespace in xpath'
}, {
	name: 'create_attr',
	desc: 'should create regular attributes'
}, {
	name: 'create_attr_ns',
	desc: 'should create namespaced attributes'
}, {
	name: 'create_element',
	desc: 'should create regular elements'
}, {
	name: 'create_element_ns',
	desc: 'should create namespaced elements'
}, {
	name: 'xmldom_is_live',
	desc: 'should use live dom (del[2],del[2] deletes [2..3])'
}, {
	name: 'delete_element',
	desc: 'should delete single element'
}, {
	name: 'delete_element_multi',
	desc: 'should delete multiple elements'
}, {
	name: 'delete_element_multi_xpaths',
	desc: 'should delete elements given multiple xpaths'
}, {
	name: 'delete_element_nonexistent',
	desc: 'should do nothing if element-to-delete is not found'
}, {
	name: 'delete_element_ns',
	desc: 'should delete namespaced elements'
}, {
	name: 'delete_attribute',
	desc: 'should delete attributes'
}, {
	name: 'delete_attribute_ns',
	desc: 'should delete namespaced attribute'
}, {
	name: 'updates_as_replacements',
	desc: 'should allow updates as alias for replacements'
}, {
	name: 'replacements_as_actions',
	desc: 'should allow replacements as part of actions array'
}, {
	name: 'insertions_as_actions',
	desc: 'should allow insertions as part of actions array'
}, {
	name: 'deletions_as_actions',
	desc: 'should allow deletions as part of actions array'
}];




var tests = {
    setUp: function (done) { done(); }
};



xmlDiffSpecs.forEach(function (spec) {
	tests[spec.name] = function (test) {
		test.expect(1);
		
		var actual = grunt.file.read('tmp/' + spec.name + '.xml'),
			expected = grunt.file.read('test/expected/' + spec.name + '.xml');
		
		test.equal(actual, expected, spec.desc);
		test.done();
	};
});




exports.xmlstoke = tests;
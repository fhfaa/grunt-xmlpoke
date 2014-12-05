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
	desc: 'should be able to create regular attributes'
}, {
	name: 'create_attr_ns',
	desc: 'should be able to create namespaced attributes'
}, {
	name: 'create_element',
	desc: 'should be able to create regular elements'
}, {
	name: 'create_element_ns',
	desc: 'should be able to create namespaced elements'
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
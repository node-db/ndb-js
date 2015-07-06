var node = {
	root : {
	    parent : {
			name : "green",
	    	child : [{
	    			name: "jim",
	    			age: 20,
	    			sex: "male"
	    			}, {
	    			name: "lily",
	    			age: 17,
	    			sex: "female"
	    			}, {
	    			name: "tom",
	    			age: 28,
	    			sex: "male"
	    		}], 
			nephew : {
				name: "lucy",
				age: 12,
				sex: "female"
			}
	    }	
	}	
}

QUnit.test("one", function(assert) {
	var r = null;
	var query = null;
	
	query = "one:root->parent->child->sex:male";
	r = execute(node, query)
	assert.ok(r.name == "jim", "Passed!");
	assert.ok(r.age == 20, "Passed!");
});

QUnit.test("select test", function(assert) {
	var r = null;
	var query = null;
	
	query = "select:root->parent->child->name:/.*m/";
	r = execute(node, query)
	assert.ok(r.length == 2, "Passed!");
	assert.ok(r[0].name == "jim", "Passed!");
	assert.ok(r[1].name == "tom", "Passed!");
	
	query = "select:root->parent->child->age:[15,25]";
	r = execute(node, query);
	assert.ok(r.length == 2, "Passed!");
	assert.ok(r[0].name == "jim", "Passed!");
	assert.ok(r[1].name == "lily", "Passed!");
	
	query = "select:root->parent->child->sex:^fe";
	r = execute(node, query);
	assert.ok(r.length == 1, "Passed!");
	assert.ok(r[0].name == "lily", "Passed!");
	
	query = "select:root->parent->child->name:m$";
	r = execute(node, query);
	assert.ok(r.length == 2, "Passed!");
	assert.ok(r[0].name == "jim", "Passed!");
	assert.ok(r[1].name == "tom", "Passed!");
	
	query = "select:root->parent->child->sex:male && age:[15,25]";
	r = execute(node, query);
	assert.ok(r.length == 1, "Passed!");
	assert.ok(r[0].name == "jim", "Passed!");
	
	query = "select:root->parent->child";
	r = execute(node, query);
	assert.ok(r.length == 3, "Passed!");
	assert.ok(r[0].name == "jim", "Passed!");
	assert.ok(r[1].name == "lily", "Passed!");
	assert.ok(r[2].name == "tom", "Passed!");
	
	query = "select:root->parent->:/child|nephew/->sex:female";
	r = execute(node, query);
	assert.ok(r.length == 2, "Passed!");
	assert.ok(r[0].name == "lily", "Passed!");
	assert.ok(r[1].name == "lucy", "Passed!");
});

QUnit.test("update test", function(assert) {
	var r = null;
	var query = null;
	
	query = "update:root->parent->child->name:jim !! age=21, address=China";
	r = execute(node, query)
	query = "select : root->parent->child->name:jim";
	r = execute(node, query)
	assert.ok(r[0].age == "21", "Passed!");
	assert.ok(r[0].address == "China", "Passed!");
});

QUnit.test("insert test", function(assert) {
	var r = null;
	var query = null;
	
	query = "insert:root->parent->child !! name=bill, sex=male, age=31";
	r = execute(node, query)
	query = "select:root->parent->child->name:bill";
	r = execute(node, query)
	assert.ok(r[0].sex == "male", "Passed!");
	assert.ok(r[0].age == "31", "Passed!");
});

QUnit.test("delete test", function(assert) {
	var r = null;
	var query = null;
	
	query = "delete:root->parent->child->name:jim !! [sex, age]";
	r = execute(node, query)
	query = "select : root->parent->child->name:jim";
	r = execute(node, query)
	assert.ok(r[0].name == "jim", "Passed!");
	assert.ok(r[0].sex == undefined, "Passed!");
	assert.ok(r[0].age == undefined, "Passed!");
	
	query = "delete:root->parent->child->name:jim !! block";
	r = execute(node, query)
	query = "select : root->parent->child->name:jim";
	r = execute(node, query)
	assert.ok(r.name == undefined, "Passed!");
});
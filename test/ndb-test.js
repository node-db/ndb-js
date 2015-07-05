var node = {
		
	a : {
		b : [
		     {
		    	 c : "hello world",
		    	 d : 12,
		     }, 
		     {
		    	 c : "no kim",
		    	 d : 12,
		     }, 
		     ],
		e : {
			c : "test word",
			d : 14
		},
		f : {
			c : "just say",
			d : 13
		}
		
	}
}

QUnit.test("one", function(assert) {
	var r = null;
	var query = null;
	
	query = "one : a->b->c:/hello/";
	r = execute(node, query)
	assert.ok(r.c == "hello world", "Passed!");
	assert.ok(r.d == 12, "Passed!");
});

QUnit.test("select test", function(assert) {
	var r = null;
	var query = null;
	
	query = "select : a->b->c:/hello/";
	r = execute(node, query)
	assert.ok(r.length == 1, "Passed!");
	assert.ok(r[0].c == "hello world", "Passed!");
	assert.ok(r[0].d == 12, "Passed!");
	
	query = "select : a->:/[be]/->d:[11,15]";
	r = execute(node, query);
	assert.ok(r.length == 3, "Passed!");
	assert.ok(r[0].c == "hello world", "Passed!");
});

QUnit.test("update test", function(assert) {
	var r = null;
	var query = null;
	
	query = "update : a->b->c:/hello world/ !! e = ticket one, f=12";
	r = execute(node, query)
	query = "select : a->:b->c:/hello world/";
	r = execute(node, query)
	assert.ok(r[0].e == "ticket one", "Passed!");
	assert.ok(r[0].f == "12", "Passed!");
});

QUnit.test("insert test", function(assert) {
	var r = null;
	var query = null;
	
	query = "insert : a->k !! e = ticket two , f=14";
	r = execute(node, query)
	query = "select : a->k";
	r = execute(node, query)
	assert.ok(r[0].e == "ticket two", "Passed!");
	assert.ok(r[0].f == "14", "Passed!");
});

QUnit.test("delete test", function(assert) {
	var r = null;
	var query = null;
	
	query = "delete : a->f !! [d]";
	r = execute(node, query)
	query = "select : a->f";
	r = execute(node, query)
	assert.ok(r[0].c == "just say", "Passed!");
	assert.ok(r[0].d == undefined, "Passed!");
	
	query = "delete : a->f !! block";
	r = execute(node, query)
	query = "one : a->f";
	r = execute(node, query)
	assert.ok(r.c == undefined, "Passed!");
});
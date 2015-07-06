/**
 * node database for javascript
 * 
 * @author Huiyugeng
 */

function execute(node, query) {
	var command = null;
	
	if (node == null || ((node instanceof Object) == false || (node instanceof Object) == false)) {
		return null;
	}
	
	if (query.indexOf(":") > -1 ) {
		command = query.substring(0, query.indexOf(":")).trim();
		query = query.substring(query.indexOf(":") + 1, query.length).trim();
	}
	
	var queryItems = query.split("!!");
	
	if (queryItems != null) {
		var path = null;
		var value = null;
		if (queryItems.length > 0) {
			path = queryItems[0].trim();
		}
		if (queryItems.length > 1) {
			value = queryItems[1].trim();
		}
		
		function __execute(node, command, path, value) {
			var result = null;
			if (command != null) {
				if (command == "exist") {
					result = select(node, path, true);
					if (result != null && result instanceof Array && result.length > 0) {
						result = true;
					} else {
						result = false;
					}
				} else if (command == "select") {
					result = select(node, path, true);
				} else if (command == "one") {
					result = select(node, path, true);
					if (result != null && result instanceof Array && result.length > 0) {
						result = result[0];
					}
				} else if (command == "delete") {
					result = remove(node, path, value);
				} else if (command == "update") {
					result = update(node, path, value);
				} else if (command == "insert") {
					result = insert(node, path, value);
				}
			}
			
			return result;
		}
		
		if (node instanceof Array) {
			var result = new Array();
			for (var item in ndb) {
				if (item instanceof Object) {
					result.push(__execute(node, command, path, value));
				}
			}
			return result;
		} else if (node instanceof Object) {
			return __execute(node, command, path, value);
		}
	}
	
	return null;
}

/* select node */
var selectResult = null;
selectAction = function (node) {
	selectResult.push(node);
};

function select(ndb, query) {
	this.selectResult = new Array();
	locate(ndb, query, false, selectAction);
	return selectResult;
}

/* update node */
var updateData = null;
updateAction = function (node) {
	if (updateData != null && typeof(updateData) == "object") {
		for (var key in updateData) {
			var value = updateData[key];
			node[key] = value;
		}
	}
};
function update(ndb, query, updateValue) {
	this.updateData = this.parseValue(updateValue);
	locate(ndb, query, false, updateAction);
	return ndb;
}

/* insert node */
var insertData = null;
insertAction = function (node) {
	if (insertData != null && typeof(insertData) == "object") {
		for (var key in insertData) {
			var value = insertData[key];
			node[key] = value;
		}
	}
};
function insert(ndb, query, insertValue) {
	this.insertData = this.parseValue(insertValue);
	locate(ndb, query, true, insertAction);
	return ndb;
}

/* delete node */
var removeColumns = null;
removeAction = function (node) {
	if (removeColumns == "block") {
		for (var key in node) {
			delete node[key];
		}
	} else if (typeof(removeColumns) == "object" && removeColumns.length > 0) {
		for (var i = 0 ; i < removeColumns.length ; i++) {
			var column = removeColumns[i];
			if (column != undefined) {
				delete node[column.trim()];
			}
		}
	}
};
function remove(ndb, query, column) {
	if (column != null && column.startsWith("[") && column.endsWith("]")) {
		this.removeColumns = column.substring(1, column.length - 1).split(",");
	} else {
		this.removeColumns = "block";
	}
	locate(ndb, query, false, removeAction);
	return ndb;
}

function locate(ndb, query, isCreate, action) {
	if(query == null || query == ""){
		return;
	}
	
	var queryKey = query; //当前项
	var subQuery = query; //子查询

	if(ndb instanceof Array){

		for(var i = 0 ; i < ndb.length ; i++){
			var ndbItem = ndb[i];
			locate(ndbItem, subQuery, isCreate, action);
		}
		
	} else if(ndb instanceof Object) {

		if (query.indexOf("->") > -1) {
			queryKey = query.substring(0, query.indexOf("->")).trim();
			subQuery = query.substring(query.indexOf("->") + 2, query.length).trim();
		}

		if (isCreate && ndb[queryKey] == null) {
			ndb[queryKey] = {};
		}
		if( subQuery != queryKey || queryKey.startsWith(":")){
			if(queryKey.startsWith(":")){ //根据路径进行查询
				var exp  = queryKey.substring(1, queryKey.length);
					
				for (var key in ndb) {
					var check = checkValue(key, exp);
					if (check == true) {
						if (subQuery.startsWith(":")){
							locate(ndb, key, isCreate, action);
						} else {
							locate(ndb[key], subQuery, isCreate, action);
						}
						
					}
				}
			} else {
				locate(ndb[queryKey], subQuery, isCreate, action);
			}
		}else{
			if(subQuery.indexOf(":") > -1){ //根据值进行查询
				var matchItems = subQuery.split("&&");
				
				var matchResult = true;
				for (var i = 0 ; i < matchItems.length ; i++) {
					var matchItem = matchItems[i];
					var items = matchItem.split(":");
					if(items.length == 2){
						var key = items[0].trim();
						var exp = items[1].trim();
						
						var value = ndb[key];
						
						var check = checkValue(value, exp);
						if (check == false) {
							matchResult = false;
						}
					}
				}
				
				if (matchResult) {
					action(ndb);
				}
			} else {
				var result = ndb[queryKey];
				//创建模式
				if (isCreate) {
					if (result instanceof Array) {
						var list = result;
						
						var item = {};
						action(item);
						list.push(item);
					} else if (result instanceof Object) {
						var item = result;
						if (countObject(item) == 0) {
							action(item);
						} else {
							var newItem = {};
							action(newItem);
							
							var list = new Array();
							list.push(item);
							list.push(newItem);
							
							ndb[queryKey] = list;
						}
						
					}
				} else {
					if (result instanceof Array) {
						var list = result;
						for (var i = 0 ; i < list.length ; i++){
							var item = list[i];
							action(item);
						}
					}else{
						action(result);
					}
				}
			}
		}
	}
}

function checkValue(value, exp) {
	
	if (exp.length > 2 && exp.startsWith("/") && exp.endsWith("/")) {
		var regex = exp.substring(1, exp.length - 1);
		var re = new RegExp(regex);
		if (re.test(value)) {
			return true;
		}
	} else if (exp.length > 3 && exp.startsWith("[") && exp.endsWith("]") && exp.indexOf(",") > 0) {
		var region = exp.substring(1, exp.length - 1).split(",");
		if (region.length == 2) {
			var _min = parseInt(region[0]);
			var _max = parseInt(region[1]);
			var _value = parseInt(value);
			if (_min != NaN && _max != NaN && _value >= _min && _value <= _max) {
				return true;
			}
		}
	} else if (exp.startsWith("^")) {
		if (value.startsWith(exp.substring(1, exp.length))) {
			return true;
		}
	} else if (exp.endsWith("$")) {
		if (value.endsWith(exp.substring(0, exp.length-1))) {
			return true;
		}
	} else {
		if (exp == value) {
			return true;
		}
	}
	
	return false;
}

function countObject(obj) {
	var count = 0;
	if (obj != null && obj instanceof Object && (obj instanceof Array) == false) {
		for (var key in obj) {
			if(obj.hasOwnProperty(key))	{
				count++;
			}
		}
	}
	return count;
}

function parseValue(value) {
	var data = new Object();
	if (value != undefined && value != "") {
		var values = value.split(",");
		for (var i = 0 ; i < values.length ; i++) {
			var tempValue = values[i];
			var valuePair = tempValue.split("=");
			if (valuePair != null && valuePair.length == 2) {
				data[valuePair[0].trim()] = valuePair[1].trim();
			}
		}
	}
	return data;
}

function read(ndb) {

}

String.prototype.trim = function() {
	return this.replace(/^\s+/g,"").replace(/\s+$/g,"");
}

String.prototype.startsWith = function(str) {
	if (str == undefined) {
		return false;
	}
	var len = str.length;
	if (len > this.length) {
		return false;
	}
	var subString = this.substring(0, len);
	return (subString == str);
};

String.prototype.endsWith = function(str) {
	if (str == undefined) {
		return false;
	}
	var len = str.length;
	if (len > this.length) {
		return false;
	}
	var subString = this.substring(this.length - len, this.length);
	return (subString == str);
};

/**
 * ndb4js
 * 
 * @author Huiyugeng
 */

function select(node, query) {
	return locate(node, query, true);
}

function update(node, query) {
	
}

function insert(node, query) {
	
}

function remove(node, query) {
	
}

function locate(node, query, multi) {
	var query_item = query;
	var sub_query = query;

	if (node != undefined && node != null){

			if (query.indexOf("->") > -1){
				query_item = query.substring(0, query.indexOf("->"));
				sub_query = query.substring(query.indexOf("->") + 2, query.length);
			}

			if (query_item != sub_query){
				if (query_item.length > 2 && query_item.startsWith("/") && query_item.endsWith("/")){
					query_item = query_item.substring(1, query_item.length - 1);

				}else{
					if (node[query_item] != undefined){
						return locate(node[query_item], sub_query, multi);
					}
				}
			} else {
				if (query_item.indexOf(":") > -1){
					var items = query_item.split(":");
					if (items.length == 2){
						var src_value = items[1];
						var dst_value = node[items[0]];

						if (src_value.length > 2 && src_value.startsWith("/") && src_value.endsWith("/")){
							var regex = src_value.substring(1, src_value.length - 1);
							var re = new RegExp(regex);
							if (re.test(dst_value)){
								return node;
							}
						} else if (src_value.length > 3 && src_value.startsWith("[") && src_value.endsWith("]") && src_value.indexOf(",") > 0){
							var region = src_value.substring(1, src_value.length - 1).split(",");
							if (region.length == 2){
								var _min = parseInt(region[0]);
								var _max = parseInt(region[1]);
								var _value = parseInt(dst_value);
								if (_min != NaN && _max != NaN && _value >= _min && _value <= _max){
									return node;
								}
							}
						} else if (src_value.startsWith("^")) {
							if (dst_value.startsWith(src_value.substring(1, src_value.length))){
								return node;
							}
						} else if (src_value.endsWith("$")){
							if (dst_value.endsWith(src_value.substring(1, src_value.length))){
								return node;
							}
						}else {
							if (src_value == dst_value){
								return node;
							}
						}
					}
				}
			}
	}
}

String.prototype.startsWith = function(str){
	if (str == undefined){
		return false;
	}     
		var len = str.length;
		if (len > this.length){
			return false;
		}
		var sub_string = this.substring(0, len);
		return (sub_string == str);
}  

String.prototype.endsWith = function(str){     
	if (str == undefined){
		return false;
	}     
		var len = str.length;
		if (len > this.length){
			return false;
		}
		var sub_string = this.substring(this.length - len, this.length);
		return (sub_string == str);       
}


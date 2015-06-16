ndb4js
=====

ndb是一种轻量级的节点型数据库，ndb4js是ndb数据库的javascript实现

=====

ndb语法规则

格式：
operate:path->query:value

查询：
select:node->node->item1 : value1 && item2 : value2

需要支持多条件查询，每个item都与value对应

value 支持正则表达式，数值区域，startwith 和 end with：
正则表达式使用 / 进行分割，例如 /[aA].*/
数值区域仅对整数区域有效，使用 [min, max] 描述，例如 [12,17]
startwith使用^开头，例如^hello
endwith使用$结尾，例如hello$

如果不含item检索条件，则返回整个node

查询单个：
one:node->node->item1 : value1 && item2 : value2
与查询一致，当出现多个结果时，仅返回第一个结果

修改：
update:node->node->item : value $$ item1=new value1,item2=new value2…
item : value用于检索对应的node，然后根据后面的值对node中的item进行修改

删除：
delete:node->node->item : value $$ item / block
如果使用item 标注，则仅删除item项目
如果使用block标注，则删除item的父node项目


新增：
insert:node->node && item1=new value1,item2=new value2…
在node中新建item，如果父路径不存在，则自动建立父路径

遍历：
travel
遍历所有的节点，通常需要配合处理函数（Java，Python，Javascript）


举例说明：
firewall {
host {
name : OA-FW
ip: 192.168.0.12
security: 50
}
}

检索host节点：
select:firewall->host->name:/.*FW/
select:firewall->host->security:[40,60] 
select:firewall->host->ip:^192.168 
select:firewall->host->name:FW$ 
select:firewall->host->name:OA-FW
select:firewall->host

删除name项目：
delete:firewall->host->name:OA-FW && item 
删除host节点：
delete:firewall->host->name:OA-FW && block 

节点host中name值变化为OA，ip值变化为192.168.0.15：
update:firewall->host->name:OA-FW && name=OA,ip=192.168.0.15 

节点firewall中增加节点interface，并将name=eth0,ip=192.168.0.16赋值如interface节点中：
insert:firewall->interface && name=eth0,ip=192.168.0.16 

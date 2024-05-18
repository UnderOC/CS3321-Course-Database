# CS3321-Course-Database
This is a repository for CS3321 course project, 2024 spring.



database：存放了对数据库进行操作的js脚本

- import_course_data.js：将课程信息与课程文档信息插入数据库
- search_function.js：输入关键词和限制条件，输出查询结果



back_up：数据库备份文件

mongodb安装与使用详见https://notes.sjtu.edu.cn/eelKd0zISl2AG3lYn0ZegA#



key_word_extract_result：使用text_process.py脚本对txt格式的课程资料提取关键词后的结果



course_search_api:存放接口函数，测试函数，yaml文件

- coursedb.yaml：目前只规范了search的输入和输出结构
- server.js：后端服务器接口代码，目前只实现了search函数，其中uri需要修改成本地mongodb的uri
- test_script.js：用于测试server接口的代码


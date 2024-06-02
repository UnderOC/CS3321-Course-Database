# Course_Stack 数据库管理系统项目文档



## 项目概述
本项目旨在使用MongoDB作为后端框架，并结合Node.js，搭建一个用于管理课程资料的数据库及对应的管理系统。系统主要功能包括课程资料的导入，课程资料的增删改查，课程资料检索，课程喜好标记，用户权限管理，以及数据库资料的备份与恢复。



## 开发环境
- **操作系统**: Windows 11
- **编程语言**: JavaScript (Node.js)
- **数据库**: MongoDB
- **框架与工具**:
  - Node.js v20.12.2
  
    ```json
    //package.json
      "dependencies": {
        "@node-rs/jieba": "^1.10.3",
        "axios": "^1.7.2",
        "bcrypt": "^5.1.1",
        "cors": "^2.8.5",
        "express": "^4.19.2",
        "jieba": "^1.0.0",
        "mongodb": "^6.7.0",
        "node-fetch": "^2.7.0"
      }
    ```
  - MongoDB shell v4.2.25
  - MongoDB Compass (用于数据库可视化与管理)
  
  

## 数据库数据组织方式

在Mongodb Compass可视化界面中，COURSE_DB数据库的整体组织形式如下：

<div style="text-align: center;">     
    <img src="images/sample.png" alt="数据库整体结构" /> 
</div>

COURSE_DB数据库主要包括以下几个集合（Collections）：

### 1. 用户集合 (Users_Inform)

- 这里定义的用户主要是数据库的使用者，分为学生和教师两类。数据库管理员拥有最高权限，暂时没有登记在用户集合内。

- **字段**:
  - `_id`: 用户唯一标识 (Object Id)
  - `user_name`: 用户名 (String)
  - `password`: 密码 (String, 加密存储)
  - `role`: 角色 (String,  `teacher` 或 `student`)
  
    上述字段为用户元数据，不能为空
  
    
  
    下面的字段与用户操作相关，可以为空
  
  - `recentActions`：用户近期增删改操作记录（Array of Action Objects）
  
  - `likedCourses`：用户标记的喜爱课程（Array of Class Name Strings）
  
  

### 2. 教师身份验证集合 （Teacher_Inform）

- 教师只对教授课程集合内的课程有创建和增删改权限

- **字段**：
    - `_id`: 身份唯一标识（Object Id）
    - `Tname`: 教师姓名（String）
    - `id`: 教师工号（String）
    - `class`: 教授课程集合（Array of Class Name String）
    
    

### 3. 学生身份验证集合 （Student_Inform）

- 学生只有搜索课程资料和标记喜爱课程的权限

- **字段**：
    - `_id`: 身份唯一标识（Object Id）
    - `Sname`: 学生姓名（String）
    - `id`: 学生学号（String）
    
    

### 4. 课程信息集合 (Course_Inform)

- 本项目使用的课程数据来源于[canvas网站](https://oc.sjtu.edu.cn)，课程信息可以以json文件的形式从后端批量导入数据库

- **字段**:
  - `_id`: 课程唯一标识 (Object Id)
  - `course_name`: 课程名 (String)
  - `course_url`: 课程网址 (String)
  - `course_id`: 课程id (String)
  
  以上是课程的元数据，不能为空
  
  
  
  下面是不同模块的数据，可以初始化为空列表：
  
  - `video`: 课程视频（Array of Objects）
  
    - `video_id`：视频id（String）
    - `video_discrption`：视频描述（String）
    - `video_link1`，`video_link2`：视频链接（String）
  
  - `files`：课程文件（Array of Objects）
    - `file_id`：文件id（String）
    - `file_name`：文件名（String）
    - `file_url`：文件地址（String）
    - `file_folder`：文件目录（Array of String）
    - `download_path`：下载路径（String）
  
  - `announcements`：课程公告（Array of Objects）
    - `ann_id`：公告id（String）
    - `ann_title`：公告标题（String）
    - `ann_message`：公告信息（String）
  
  - `assignments`：课程作业（Array of Objects）
    - `assign_id`：作业id（String）
    - `assign_title`：作业标题（String）
    - `assign_ddl`：作业截止时间（String）
    - `assign_message`：作业信息（String）
    - `assign_file`：作业文件（Array of File Objects）
  
  - `modules`：课程单元（Array of Objects）
    - `module_id`：单元id（String）
    - `module_name`：单元名称（String）
    - `attachments`：单元附件（Array of Objects）
      - `attachment_id`：附件id（String）
      - `attachment_url`：附件地址（String）
      - `attachment_name`：附件名（String）



### 5. 课程文件集合 (Course_Files)

- 为了实现类似全文检索的效果，同时尽量降低检索的复杂度和尽量减少存储数据的量，将课程文件(files列表中的文件）进行ocr识别后转换为txt文本，使用jieba分词工具对于文本进行处理，筛选出其中权重最高的至多两百个词汇，作为关键词列表记录在本集合中。
- **字段**:
  - `_id`: 资料唯一标识 (Object Id)
  - `file_id@@file_name`: 文档关键词列表（Array of Keyword Strings）



## 操作函数

以下涉及数据库的操作函数为管理员权限下的操作，均封装为Node js脚本的形式，位于main分支的main/database目录和main/course_db_api目录中。

### 数据库连接

- **连接到数据库**：`connectToDatabase()`
  - 给定uri和数据库名称，连接到本地mongodb数据库
- **关闭数据库连接**：`closeDatabaseConnection()`
  - 关闭之前开启的数据库连接

### 课程操作

课程操作分为可以在后端直接对数据库操作的接口和与前端对接供用户操作的接口，后者在用户操作中详细说明，此处仅说明管理员权限下的接口

- **导入课程数据**：`importCourseData(collection, filepath)`
  - 将对应filepath下的一个json文件作为一个完整的课程数据文档直接导入collection中
- **批量导入课程数据**：`importDataFromFile(filePath, collection)`
  - 将对应filepath下的所有json文件作为多个完整的课程数据文档直接导入collection中

- **新建课程**: `createCourse(collection, courseName, courseUrl, courseId)`
  - 使用课程的元数据建立一个新的课程文档，并将其余数据列表初始化为空

- **插入课程数据**: `insertCourseData(collection, className, moduleName, data, idField)`
  - 将

- **更新课程数据**: `updateCourse(courseId, updateData)`
- **删除课程数据**: `deleteCourse(courseId)`

### 搜索函数

搜索函数为Course-Stack的核心功能，目标是对于给定的搜索



## 用户操作

- **用户注册**: `registerUser(db, username, password, role, identifier)`
  - 用户在注册时需要创建用户名（不允许重名），设置密码（加密后在数据库中存储），指定角色并通过id在Student/Teacher集合中验证是否符合角色权限

- **用户登录**：`loginUser(db, username, password)`
  - 用户在登录时只需要输入用户名和密码






## 前端接口

### 用户接口
- **注册**: `POST /api/users/register`
  - **请求参数**: `username`, `password`, `role`
  - **响应**: 成功消息或错误消息

- **登录**: `POST /api/users/login`
  - **请求参数**: `username`, `password`
  - **响应**: 成功消息（包括token）或错误消息

- **获取用户信息**: `GET /api/users/:id`
  - **请求参数**: 用户ID
  - **响应**: 用户信息

### 课程接口
- **创建课程**: `POST /api/courses`
  - **请求参数**: `title`, `description`
  - **响应**: 成功消息或错误消息

- **获取所有课程**: `GET /api/courses`
  - **响应**: 课程列表

- **更新课程**: `PUT /api/courses/:id`
  - **请求参数**: `title`, `description`
  - **响应**: 成功消息或错误消息

- **删除课程**: `DELETE /api/courses/:id`
  - **请求参数**: 课程ID
  - **响应**: 成功消息或错误消息

### 资料接口
- **添加资料**: `POST /api/materials`
  - **请求参数**: `name`, `type`, `url`
  - **响应**: 成功消息或错误消息

- **获取所有资料**: `GET /api/materials`
  - **响应**: 资料列表

- **更新资料**: `PUT /api/materials/:id`
  - **请求参数**: `name`, `type`, `url`
  - **响应**: 成功消息或错误消息

- **删除资料**: `DELETE /api/materials/:id`
  - **请求参数**: 资料ID
  - **响应**: 成功消息或错误消息


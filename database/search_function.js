const jieba = require('@node-rs/jieba');
//先在Course_Inform集合中对于关键词进行搜索
const searchCourseInform = async (db, keyword, modules) => {
    let query = {};
    let fields = { course_name: 1, course_url: 1 }; // 保留基础信息

    // 这里手动规定哪一些字段需要输出
    if (modules.includes('all')) {
        // 如果包含'all'，搜索所有内容
        fields = {
          ...fields,
            'announcements.ann_title': 1,
            'announcements.ann_message': 1,
            'assignments.assign_title': 1,
            'assignments.assign_message': 1,
            'assignments.assign_file.file_name': 1,
            'assignments.assign_file.file_url': 1,
            'assignments.assign_file.download_path': 1,
            'files.file_name': 1,
            'files.file_url': 1,
            'video.video_description': 1,
            'video.video_link1': 1,
            'video.video_link2': 1,
            'modules.module_name': 1,
            'modules.attachments.attachment_name': 1,
            'modules.attachments.attachment_url': 1
        };
      } else {
        // 只搜索特定模块
        modules.forEach(mod => {
          if (mod === 'announcements') {
            fields['announcements.ann_title'] = 1;
            fields['announcements.ann_message']= 1;
          };
          if (mod === 'assignments'){
            fields['assignments.assign_title'] = 1;
            fields['assignments.assign_message'] = 1;
            fields['assignments.assign_file.file_name'] = 1;
            fields['assignments.assign_file.file_url'] =1;
            fields['assignments.assign_file.download_path'] =1;
          };
          if (mod === 'files'){
            fields['files.file_name'] =1;
            fields['files.file_url'] =1;
          };
          if (mod === 'video'){
            fields['video.video_description']=1;
            fields['video.video_link1'] = 1;
            fields['video.video_link2'] = 1;
          };
          if (mod === 'modules'){
            fields['modules.module_name']=1;
            fields['modules.attachments.attachment_name']=1;
            fields['modules.attachments.attachment_url']=1;
          };
        });
      }
    
    query = { 'course_name': { $regex: keyword, $options: 'i' } };
    const first_result = await db.collection('Course_Inform').find(query).project(fields).toArray();
    //console.log('first result',first_result);
    // 使用聚合管道查询匹配的嵌套字段项
    const pipeline = [
      {
        // 筛选符合条件的文档
        $match: {
          $and: [
            {
              $nor: [
                { 'course_name': { $regex: keyword, $options: 'i' } }
              ]
            },
            {
              $or: [
                { 'announcements.ann_title': { $regex: keyword, $options: 'i' } },
                { 'announcements.ann_message': { $regex: keyword, $options: 'i' } },
                { 'assignments.assign_title': { $regex: keyword, $options: 'i' } },
                { 'assignments.assign_message': { $regex: keyword, $options: 'i' } },
                { 'assignments.assign_file.file_name': { $regex: keyword, $options: 'i' } },
                { 'assignments.assign_file.file_id': { $regex: keyword, $options: 'i' } },
                { 'files.file_name': { $regex: keyword, $options: 'i' } },
                { 'files.file_id': { $regex: keyword, $options: 'i' } },
                { 'video.video_description': { $regex: keyword, $options: 'i' } },
                { 'modules.module_name': { $regex: keyword, $options: 'i' } },
                { 'modules.attachments.attachment_name': { $regex: keyword, $options: 'i' } },
                { 'modules.attachments.attachment_id': { $regex: keyword, $options: 'i' } },
              ]
            }
          ]
        }
      },
      {
        // 在输出中仅保留与查询相关的嵌套字段项
        $project: {
          _id: 0,
          course_name: 1,
          announcements: {
            $filter: {
              input: '$announcements',
              as: 'ann',
              cond: {
                $or: [
                  { $regexMatch: { input: '$$ann.ann_title', regex: keyword, options: 'i' } },
                  { $regexMatch: { input: '$$ann.ann_message', regex: keyword, options: 'i' } }
                ]
              }
            }
          },
          assignments: {
            $filter: {
              input: '$assignments',
              as: 'assign',
              cond: {
                $or: [
                  { $regexMatch: { input: '$$assign.assign_title', regex: keyword, options: 'i' } },
                  { $regexMatch: { input: '$$assign.assign_message', regex: keyword, options: 'i' } },
                  {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: '$$assign.assign_file',
                            as: 'assignf',
                            cond: {
                              $or:[
                                { $regexMatch: { input: '$$assignf.file_name', regex: keyword, options: 'i' } },
                                { $regexMatch: { input: '$$assignf.file_id', regex: keyword, options: 'i' } }
                              ]
                            }
                          }
                        }
                      },
                      0
                    ]
                  }
                ]
              }
            }
          },
          files: {
            $filter: {
              input: '$files',
              as: 'file',
              cond: {
                $or:[
                  { $regexMatch: { input: '$$file.file_name', regex: keyword, options: 'i' } },
                  { $regexMatch: { input: '$$file.file_id', regex: keyword, options: 'i' } }
                ]
              }
              
            }
          },
          video: {
            $filter: {
              input: '$video',
              as: 'vid',
              cond: {
                $regexMatch: { input: '$$vid.video_discription', regex: keyword, options: 'i' }
              }
            }
          },
          modules: {
            $filter: {
                input: {
                    $map: {
                        input: "$modules",
                        as: "module",
                        in: {
                            $cond: {
                                if: { $regexMatch: { input: "$$module.module_name", regex: keyword, options: 'i' } },
                                then: "$$module", // 如果 module_name 匹配，返回整个 module 对象
                                else: {
                                    // module_name 不匹配时，进行 attachments 筛选
                                    module_name: "$$module.module_name",
                                    attachments: {
                                        $filter: {
                                            input: "$$module.attachments",
                                            as: "attachment",
                                            cond: {
                                              $or:[
                                                { $regexMatch: { input: "$$attachment.attachment_name", regex: keyword, options: 'i' } },
                                                { $regexMatch: { input: "$$attachment.attachment_id", regex: keyword, options: 'i' } }
                                              ]
                                            }
                                            
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                as: "filteredModule",
                cond: { $gt: [{ $size: "$$filteredModule.attachments" }, 0] } // 只返回 attachments 不为空的 module
            }
          }                                
        }
      }
    ];

    // 执行聚合查询
    const second_result = await db.collection('Course_Inform').aggregate(pipeline).project(fields).toArray();
    const results = first_result.concat(second_result);
    //console.log('中间检索结果:', JSON.stringify(results, null, 2));
  
    for (let item of results) {
      //console.log(item);
      Object.entries(item).forEach(([key, value]) =>{
        //console.log(key, value);
        if (Array.isArray(value) && value.length == 0) {
          delete item[key]; // 删除长度为0的数组类型的键值对
        }
      });
    }
    //console.log('中间检索结果:', results);
    return results;

}

//对于Course_Inform中无法查找到的关键词，在Course_Files中进行进一步查询
const searchFilesAndFindCourse = async (db, keyword, modules) => {
    const cursor = db.collection('Course_Files').find({});
    const matchedFiles = [];
    //使用cursor遍历Course_Files中的每一个document，返回含有关键词的课程号和文件名
    await cursor.forEach(document => {
        Object.entries(document).forEach(([key, value]) => {
            if (key !== '_id' && key !== 'course_id' && value.includes(keyword)) {
                matchedFiles.push({ course_id: document.course_id, file_name: key });
            }
        });
    });
    //console.log('file匹配结果:', JSON.stringify(matchedFiles, null, 2));

    const promises = matchedFiles.map(item => {
      // 使用 split 方法切割字符串, 提取文件名信息
      const parts = item.file_name.split("@@");

      //const parts_ = parts[1].split(".");
      //const fileNamePart = parts_[0]; 
      //这里使用了文件id作为查找条件，如果使用文件名作为查找条件，可能存在重复查询结果
      const fileNamePart = parts[0]; 
      //console.log(fileNamePart);
      // 调用 searchCourseInform 函数，使用切割后的字符串作为keyword
      return searchCourseInform(db, fileNamePart, modules);
    });
    const results = await Promise.all(promises)
    //console.log(JSON.stringify(results, null, 2));

    //将得到的结果按照课程进行分类合并
    const merged_results = {};
    results.forEach(item => {
      //console.log(item);
      if (item.length > 0) {
        const course_name = item[0]['course_name'];
        if (!merged_results[course_name]){
          merged_results[course_name] = {};
        }
        Object.entries(item[0]).forEach(([key, value]) => {
          //console.log(key, value)
          if (Array.isArray(value) && value.length > 0) {
              // 如果已存在这个key，则合并数组，否则直接赋值
              if (merged_results[course_name][key]) {
                  merged_results[course_name][key] = [...new Set([...merged_results[course_name][key], ...value])];
              } else {
                  merged_results[course_name][key] = value;
              }
          }
        });
      }
    });
    //console.log(merged_results);

    //将合并的结果进一步规范化输出
    const final_result = [];
    Object.entries(merged_results).forEach(([key, value])=>{
      const tmp = {};
      tmp['course_name'] = key;
      Object.entries(value).forEach(([type, item]) =>{
        tmp[type] = item;
      });
      final_result.push(tmp);
    });
    //console.log(JSON.stringify(final_result, null, 2));
    
    return final_result;

}

const searchAllCourse= async (db, keyword, modules) =>{
  const results = await searchCourseInform(db, keyword, modules);
  const filesResults = await searchFilesAndFindCourse(db, keyword, modules);
  if (results.length == 0) {
    // 如果Course_Inform中没有匹配的结果，查询Course_Files集合
    if (filesResults.length > 0) {
        console.log('Matched in Course_Files...');
        return filesResults;
    } else {
        console.log('No matches found.');
        return results;
        }
  } else {
    console.log('Matched in Course_Inform...');
    return results;
    //return results.concat(filesResults);
  }
}

//最外层搜索函数，对于长输入进行分词，按照权重进行搜索
const searchParsedKeywords = async (db, keyword, modules) =>{
  const first_result = await searchAllCourse(db, keyword, modules);
  //一旦直接匹配失败，则对于输入进行分词
  if (first_result.length == 0) {
    const keywords = jieba.extract(keyword, 10); // 假设提取权重最高的10个词
    keywords.sort((a, b) => b.weight - a.weight); // 按权重排序
    console.log(keywords);
    let results = [];
      for (let item of keywords) {
          let searchResult = await searchAllCourse(db, item.keyword, modules);
          if (searchResult.length > 0){
            results.push(searchResult);
          }
          else{
            console.log('Failed Search For Word ', item.word);
          }
      }
      return results;
  }
  else{
    return first_result;
  }
}

module.exports = searchParsedKeywords;
//insertCourseData: 将数据插入指定课程的对应模块，可以插入内层模块
//updateCourseData: 将指定课程指定id的数据更新，可以更新内层模块的数据，对于一个object可以一次更新多条数据
//deleteCourseData: 将指定课程指定id的数据删除，可以删除内层模块的数据
//deleteManyCourseData: 将指定课程指定模块的所有数据删除，需要谨慎使用

// 指定了可以修改的内层数据块
const validModules = {
  video: [],
  files: [],
  announcements: [],
  assignments: ['assign_file'],
  modules: ['attachments']
};

// 将数据修改成统一的格式插入
const validateData = (moduleName, data) => {
  const mainModule = moduleName[0];
  const subModule = moduleName[1];

  const ensureString = (value) => (value !== undefined && value !== null ? String(value) : null);

  // 对于不同模块的数据分类进行处理
  switch (mainModule) {
    case 'video':
      if (!data.video_id || !data.video_link1) {
        throw new Error('video_id and video_link1 are required.');
      }
      return {
        video_id: ensureString(data.video_id),
        video_description: ensureString(data.video_description) || null,
        video_link1: ensureString(data.video_link1),
        video_link2: ensureString(data.video_link2) || null
      };

    case 'files':
      if (subModule === 'file_folder') {
        if (typeof data !== 'string') {
          throw new Error('file_folder must be a string.');
        }
        return data;
      } else {
        if (!data.file_id || !data.file_url) {
          throw new Error('file_id and file_url are required.');
        }
        return {
          file_id: ensureString(data.file_id),
          file_name: ensureString(data.file_name) || null,
          file_url: ensureString(data.file_url),
          file_folder: data.file_folder ? ensureString(data.file_folder) : [],
          download_path: ensureString(data.download_path) || null
        };
      }

    case 'announcements':
      if (!data.ann_id || !data.ann_title){
        throw new Error('ann_id and ann_title are required.');
      } else {
        return {
          ann_id: ensureString(data.ann_id),
          ann_title: ensureString(data.ann_title) || null,
          ann_message: ensureString(data.ann_message) || null,
        };
      }


    case 'assignments':
      if (subModule === 'assign_file') {
        if (!data.file_id || !data.file_url) {
          throw new Error('file_id and file_url are required.');
        }
        return {
          file_name: ensureString(data.file_name) || null,
          file_id: ensureString(data.file_id),
          file_url: ensureString(data.file_url)
        };
      } else {
        if (!data.assign_id || !data.assign_title || !data.assign_ddl) {
          throw new Error('assign_id, assign_title and assign_ddl are required.');
        }
        return {
          assign_id: ensureString(data.assign_id),
          assign_title: ensureString(data.assign_title),
          assign_ddl: ensureString(data.assign_ddl),
          assign_message: ensureString(data.assign_message) || null,
          assign_file: data.assign_file ? data.assign_file.map(file => ({
            file_name: ensureString(file.file_name),
            file_id: ensureString(file.file_id),
            file_url: ensureString(file.file_url)
          })) : []
        };
      }

    case 'modules':
      if (subModule === 'attachments') {
        if (!data.attachment_id) {
          throw new Error('attachment_id is required.');
        }
        return {
          attachment_id: ensureString(data.attachment_id),
          attachment_url: ensureString(data.attachment_url) || null,
          attachment_name: ensureString(data.attachment_name) || null
        };
      } else {
        if (!data.module_id) {
          throw new Error('module_id is required.');
        }
        return {
          module_id: ensureString(data.module_id),
          module_name: ensureString(data.module_name) || null,
          attachments: data.attachments ? data.attachments.map(attachment => ({
            attachment_id: ensureString(attachment.attachment_id),
            attachment_url: ensureString(attachment.attachment_url),
            attachment_name: ensureString(attachment.attachment_name)
          })) : []
        };
      }

    default:
      throw new Error('Invalid module.');
  }
};

// 检查插入模块名的有效性
const isValidModuleName = (moduleName) => {
  if (!Array.isArray(moduleName) || moduleName.length === 0 || moduleName.length > 2) {
    return false;
  }
  const mainModule = moduleName[0];
  const subModule = moduleName[1];

  if (!validModules.hasOwnProperty(mainModule)) {
    return false;
  }
  if (subModule && !validModules[mainModule].includes(subModule)) {
    return false;
  }
  return true;
};

async function insertCourseData(collection, className, moduleName, data, idField) {
  if (!isValidModuleName(moduleName)) {
    throw new Error('Invalid moduleName.');
  }

  const validatedData = validateData(moduleName, data);

  try {
    let filter;
    let update;

    if (moduleName.length === 1) {
      filter = { course_name: className };
      update = {
        $push: { [moduleName[0]]: validatedData }
      };
    } else {
      const mainModule = moduleName[0];
      const subModule = moduleName[1];
      const idKey = Object.keys(idField)[0];
      const idValue = idField[idKey];

      filter = {
        course_name: className,
        [`${mainModule}.${idKey}`]: idValue
      };

      update = {
        $push: { [`${mainModule}.$.${subModule}`]: validatedData }
      };
    }
    const match = await collection.findOne(filter);
    
    // console.log('匹配的元素:', JSON.stringify(match, null, 2));
    await collection.updateOne(filter, update, { upsert: true });
    console.log('Successfully insert data into class file', className);
  } catch (error) {
    console.error('Error when inserting data:', error);
  }
}

async function checkFilter(collection, filter) {
  const document = await collection.findOne(filter);
  if (document) {
    console.log('Document found:', JSON.stringify(document, null, 2));
  } else {
    console.log('No matching document found.');
  }
}

async function deleteCourseData(collection, className, moduleName, idObject) {
  if (!isValidModuleName(moduleName)) {
    throw new Error('Invalid moduleName.');
  }

  try {
    let filter = { course_name: className };
    let update = {};
    const idName = Object.keys(idObject)[0];
    const idValue = idObject[idName];

    if (moduleName.length === 1) {
      const mainModule = moduleName[0];
      filter = { course_name: className };
      update = {
        $pull: { [mainModule]: { [idName]: idValue } }
      };
    } else if (moduleName.length === 2) {
      const mainModule = moduleName[0];
      const subModule = moduleName[1];
      const subIdName = Object.keys(idObject)[1];
      const subIdValue = idObject[subIdName];

      filter = { course_name: className, [`${mainModule}.${idName}`]: idValue };
      update = {
        $pull: { [`${mainModule}.$.${subModule}`]: { [subIdName]: subIdValue } }
      };
    }
    //checkFilter(collection, filter);
    //console.log('Filter:', JSON.stringify(filter, null, 2));
    //console.log('Update:', JSON.stringify(update, null, 2));

    const result = await collection.updateOne(filter, update);

    //console.log('Result:', result);

    if (result.matchedCount === 0) {
      throw new Error('No matching document found to delete.');
    }

    if (result.modifiedCount === 0) {
      throw new Error('Document matched but no modification was made.');
    }

    console.log('Successfully deleted object with ID:', idValue);

    // Fetch the document to verify the deletion
    //const documentAfterUpdate = await collection.findOne(filter);
    //console.log('Document after update:', JSON.stringify(documentAfterUpdate, null, 2));
  } catch (error) {
    console.error('Error when deleting data:', error);
  }
}


async function updateCourseData(collection, className, moduleName, idObject, updateFields) {
  if (!isValidModuleName(moduleName)) {
    throw new Error('Invalid moduleName.');
  }

  try {
    let filter = { course_name: className };
    let update = { $set: {} };
    const idName = Object.keys(idObject)[0];
    const idValue = idObject[idName];

    if (moduleName.length === 1) {
      const mainModule = moduleName[0];
      filter[`${mainModule}.${idName}`] = idValue;

      for (const [field, value] of Object.entries(updateFields)) {
        update.$set[`${mainModule}.$.${field}`] = value;
      }

      const result = await collection.updateOne(filter, update);
      if (result.matchedCount === 0) {
        throw new Error('No matching document found to update.');
      }
      console.log('Successfully updated data in class file', className);

    } else if (moduleName.length === 2) {
      const mainModule = moduleName[0];
      const subModule = moduleName[1];
      const subIdName = Object.keys(idObject)[1];
      const subIdValue = idObject[subIdName];

      filter[`${mainModule}.${idName}`] = idValue;
      filter[`${mainModule}.${subModule}.${subIdName}`] = subIdValue;
      let modify_count = 0
      const cursor = collection.find(filter);
      for (const [field, value] of Object.entries(updateFields)) {
        while (await cursor.hasNext()) {
          const post = await cursor.next();
          //console.log(post);
          //console.log(idName);
          //console.log(post[mainModule]);
          post[mainModule].forEach(subpost => {
            if (subpost[idName] === idValue){
              //console.log(subpost);
              subpost[subModule].forEach(subsubpost => {
                console.log(subsubpost);
                if (subsubpost[subIdName] === subIdValue){
                  subsubpost[field] = value;
                  modify_count++;
                }
              });
            }
          });
          await collection.updateOne({ _id: post._id }, { $set: post });
        }
          
          
        }
      if (modify_count === 0) {
        throw new Error('No matching document found to update.');
      }
      console.log('Successfully updated data in class file', className);
      
    }

    //console.log('Filter:', JSON.stringify(filter, null, 2));
    //console.log('Update:', JSON.stringify(update, null, 2));
    //const matchedDocs = await collection.find(filter).toArray();
    //console.log('Matched Documents:', JSON.stringify(matchedDocs, null, 2));

    //const result = await collection.updateOne(filter, update);
    
  } catch (error) {
    console.error('Error when updating data:', error);
  }
}

async function deleteCourseDatabyIndex(collection, className, moduleName, indexes) {
  if (!isValidModuleName(moduleName)) {
    throw new Error('Invalid moduleName.');
  }

  try {
    let filter = { course_name: className };
    let update = {};

    if (moduleName.length === indexes.length) {
      // 删除数组中的某个元素
      if (moduleName.length === 1) {
        const mainModule = moduleName[0];
        filter = { course_name: className };
        update = {
          $unset: { [`${mainModule}.${indexes[0]}`]: "" }
        };
        // 移除为null的元素
        await collection.updateOne(filter, update);
        update = {
          $pull: { [mainModule]: null }
        };
      } else if (moduleName.length === 2) {
        const mainModule = moduleName[0];
        const subModule = moduleName[1];
        filter = { course_name: className };
        update = {
          $unset: { [`${mainModule}.${indexes[0]}.${subModule}.${indexes[1]}`]: "" }
        };

        await collection.updateOne(filter, update);
        update = {
          $pull: { [`${mainModule}.${indexes[0]}.${subModule}`]: null }
        };
      }
    }

    const result = await collection.updateOne(filter, update);
    if (result.matchedCount === 0) {
      throw new Error('No matching document found to delete.');
    }
    console.log('Successfully delete data in class file', className);
  } catch (error) {
    console.error('Error when deleting data:', error);
  }
}


async function deleteManyCourseData(collection, className, moduleName) {
  if (!isValidModuleName(moduleName)) {
    throw new Error('Invalid moduleName.');
  }

  try {
    let filter = { course_name: className };
    let update = {};
    const cursor = await collection.find(filter);
    const post = await cursor.next();
    let len_of_module = post[moduleName].length;
    console.log(len_of_module);
    let i = len_of_module-1;
    while (i >= 0) {
      console.log(i);
      await deleteCourseDatabyIndex(collection, className, moduleName, [i]);
      i--;
    }
  } catch (error) {
    console.error('Error when inserting data:', error);
  }
}


module.exports = {
  insertCourseData,
  deleteCourseData,
  updateCourseData,
  deleteManyCourseData
};
//insertCourseData: 将特定课程的指定数据条目删除，可以删除内层条目
//注意这里是以条目（模块列表中的元组）为粒度删除的，并不能删除元组中的某一条属性

// 指定了可以删除的内层数据块
const validModules = {
    video: [],
    files: ['file_folder'],
    announcements: [],
    assignments: ['assign_file'],
    modules: ['attachments']
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
  
  
  
  module.exports = {
    deleteCourseData
  };
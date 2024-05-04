const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

// MongoDB URL
const url = 'mongodb://localhost:27017';
// 数据库名
const dbName = 'COURSE_DB';

const { ObjectId } = require('mongodb');

//先在Course_Inform集合中对于关键词进行搜索
const searchCourseInform = async (db, keyword, modules) => {
    let query = {};
    let fields = { _id: 0, course_name: 1, course_url: 1, course_id: 0 }; // 保留基础信息

    if (modules.includes('all')) {
        // 如果包含'all'，搜索所有内容
        fields = { ...fields, announcements: 1, assignments: 1, files: 1, video: 1, modules: 1 };
    } else {
        // 只搜索特定模块
        modules.forEach(mod => fields[mod] = 1);
    }

    // 基础查询用于获取所有相关的课程
    query = { $or: [
        { 'course_name': {$regex: keyword, $options: 'i'} },
        { 'announcements.ann_title': { $regex: keyword, $options: 'i' } },
        { 'announcements.ann_message': { $regex: keyword, $options: 'i' } },
        { 'assignments.assign_title': { $regex: keyword, $options: 'i' } },
        { 'assignments.assign_message': { $regex: keyword, $options: 'i' } },
        { 'assignments.assign_file.file_name': { $regex: keyword, $options: 'i' } },
        { 'files.filename': { $regex: keyword, $options: 'i' } },
        { 'video.video_description': { $regex: keyword, $options: 'i' } },
        { 'modules.modules_name': { $regex: keyword, $options: 'i' } },
        { 'modules.attachments.attachment_name': { $regex: keyword, $options: 'i' } }
    ]};
    

    const results = await db.collection('Course_Inform').find(query, { projection: fields }).toArray();

    if (results.length === 0) {
        // 如果Course_Inform中没有匹配的结果，查询Course_Files集合
        const filesResults = await searchFilesAndFindCourse(db, keyword);
        if (filesResults.length > 0) {
            console.log('Matched in Course_Files...');
        } else {
            console.log('No matches found.');
            }
    } else {
        console.log('Matched in Course_Inform...');
    }

    const filteredResults = results.map(doc => {
        const result = {
            course_name: doc.course_name,
            course_url: doc.course_url
        };

        //TODO：这里如果课程名匹配，只返回对应的课程名和url，需要后续进一步修改
        if (doc.course_name.toLowerCase().includes(keyword.toLowerCase())) {
            return result;  
        }

        // Filter announcements
        if (doc.announcements) {
            const matchedAnnouncements = doc.announcements.filter(ann =>
                ann.ann_title.toLowerCase().includes(keyword.toLowerCase()) ||
                ann.ann_message.toLowerCase().includes(keyword.toLowerCase())
            ).map(ann => ({
                ann_title: ann.ann_title,
                ann_message: ann.ann_message
            }));

            results.announcements = matchedAnnouncements;
        }

        // Filter assignments
        if (doc.assignments) {
            const matchedAssignments = doc.assignments.filter(assign =>
                assign.assign_title.toLowerCase().includes(keyword.toLowerCase()) ||
                assign.assign_message.toLowerCase().includes(keyword.toLowerCase()) ||
                (assign.assign_file && assign.assign_file.some(file => file.file_name.toLowerCase().includes(keyword.toLowerCase())))
            ).map(assign => ({
                assign_title: assign.assign_title,
                assign_ddl: assign.assign_ddl,
                assign_message: assign.assign_message,
                files: assign.assign_file ? assign.assign_file.filter(file => 
                    file.file_name.toLowerCase().includes(keyword.toLowerCase())
                ).map(file => ({
                    file_name: file.file_name,
                    file_url: file.file_url
                })) : []
            }));

            results.assignments = matchedAssignments;
        }

        //filter files
        if (doc.files) {
            const matchedFiles = doc.files.filter(files =>
                files.file_name.toLowerCase().includes(keyword.toLowerCase())
            ).map(files => ({
                file_name: files.file_name,
                file_url: files.file_url,
                download_path: files.download_path
            }));

            results.files = matchedFiles;
        }

        //filter video
        if (doc.video) {
            const matchedVideo = doc.video.filter(video =>
                video.video_description.toLowerCase().includes(keyword.toLowerCase())
            ).map(video => ({
                video_description: video.video_description
            }));

            results.video = matchedVideo;
        }

        //filter modules
        if (doc.modules) {
            const matchedModules = doc.modules.filter(modules =>
                modules.modules_title.toLowerCase().includes(keyword.toLowerCase()) ||
                (modules.attachments && modules.attachments.some(attach => attach.attachment_name.toLowerCase().includes(keyword.toLowerCase())))
            ).map(modules => ({
                modules_title: modules.modules_title,
                attachments: modules.attachments ? modules.attachments.filter(attach => 
                    attach.attachment_name.toLowerCase().includes(keyword.toLowerCase())
                ).map(attach => ({
                    attachment_name: attach.attachment_name,
                    attachment_url: attach.attachment_url
                })) : []
            }));

            results.announcements = matchedAnnouncements;
        }
    });

    return filteredResults;
};

//对于Course_Inform中无法查找到的关键词，在Course_Files中进行进一步查询
const searchFilesAndFindCourse = async (db, keyword) => {
    const filesCollectionName = `${courseId}_Files`;
    const files = await db.collection(filesCollectionName).find({ $text: { $search: keyword } }).toArray();
    if (!files.length) return [];
    const fileNames = files.map(file => file.name);
    return db.collection('Course_Inform').find({ fileName: { $in: fileNames } }).toArray();
};

module.exports = { searchCourseInform, searchFilesAndFindCourse };

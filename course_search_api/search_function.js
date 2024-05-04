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
        const filesResults = await searchFilesAndFindCourse(db, keyword, modules);
        if (filesResults.length > 0) {
            console.log('Matched in Course_Files...');
            return(filesResults)
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

    let query = {};
    let fields = { _id: 0, course_name: 1, course_url: 1, course_id: 0 }; // 保留基础信息

    if (modules.includes('all')) {
        // 如果包含'all'，搜索所有内容
        fields = { ...fields, announcements: 1, assignments: 1, files: 1, video: 1, modules: 1 };
    } else {
        // 只搜索特定模块
        modules.forEach(mod => fields[mod] = 1);
    }

    //根据返回结果在Course_Inform中查找对应信息
    //TODO: 这里有个问题，第二层搜索只能返回相关的文件信息，需要进一步完善
    const results = [];
    for (let match of courseFilesMatches) {
        const courseInfo = await db.collection('Course_Inform').findOne({ course_id: match.course_id });
        if (courseInfo) {
            // 假设课程文件信息存储在一个数组或对象中，需要根据你的数据结构调整这部分代码
            const fileInfo = courseInfo.files.find(f => f.file_name === match.file_name);
            if (fileInfo) {
                results.push({
                    course_name: courseInfo.course_name,
                    file_name: fileInfo.file_name,
                    file_url: fileInfo.file_url
                });
            }
        }
    }
    return results;
};

module.exports = searchCourseInform;
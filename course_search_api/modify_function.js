const { connectToDatabase } = require('./db_connect');

async function addCourseInfo(className, moduleName, info) {
    const collection = await connectToDatabase();

    const course = await collection.findOne({ course_name: className });
    if (!course) {
        throw new Error(`Course with name "${className}" does not exist in the collection.`);
    }
    
    let updateData;
    switch (moduleName) {
        case 'announcements':
            updateData = {
                [moduleName]: {
                    ann_id: info.ann_id || null,
                    ann_title: info.ann_title || null,
                    ann_message: info.ann_message || null
                }
            };
            break;
        case 'assignments':
            updateData = {
                [moduleName]: {
                    assign_id: info.assign_id || null,
                    assign_title: info.assign_title || null,
                    assign_ddl: info.assign_ddl || null,
                    assign_message: info.assign_message || null,
                    assign_file: info.assign_file || null
                }
            };
            break;
        case 'video':
            updateData = {
                [moduleName]: {
                    video_id: info.video_id || null,
                    video_discrption: info.video_discrption || null,
                    video_link1: info.video_link1 || null,
                    video_link2: info.video_link2 || null
                }
            };
            break;
        case 'files':
            updateData = {
                [moduleName]: {
                    file_id: info.file_id || null,
                    file_name: info.file_name || null,
                    file_url: info.file_url || null,
                    file_folder: info.file_folder || null,
                    download_path: info.download_path || null
                }
            };
            break;
        case 'modules':
            updateData = {
                [moduleName]: {
                    module_id: info.module_id || null,
                    module_name: info.module_name || null,
                    attatchments: info.attatchments || null
                }
            };
            break;
        default:
            throw new Error(`Unknown module name: ${moduleName}`);
    }
    await collection.updateOne(
        { course_name: className },
        { $push: updateData }
    );
    console.log('Information added to', moduleName);
}

// 删除信息
async function deleteCourseInfo(className, moduleName, info) {
    const collection = await connectToDatabase();
    await collection.updateOne(
        { course_name: className },
        { $pull: { [moduleName]: info } }
    );
    console.log('Information deleted from', moduleName);
}

// 修改信息
async function updateCourseInfo(className, moduleName, query, updateInfo) {
    const collection = await connectToDatabase();
    const updateData = {};
    for (let key in updateInfo) {
        if (key !== 'ann_id') {
            updateData[`${moduleName}.$.${key}`] = updateInfo[key];
        }
    }
    await collection.updateOne(
        { course_name: className, [`${moduleName}.ann_id`]: query.ann_id },
        { $set: updateData }
    );
    console.log('Information updated in', moduleName);
}

module.exports = {
    addCourseInfo,
    deleteCourseInfo,
    updateCourseInfo
};

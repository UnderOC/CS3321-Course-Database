const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB Connection URI
const uri = 'mongodb://localhost:27017';
const dbName = 'COURSE_DB';

// Read and parse JSON file
function readJSONFile(filepath) {
    const contents = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(contents);
  }


const rawData = fs.readFileSync(jsonFilePath);
const jsonData = JSON.parse(rawData);

// MongoDB collections names
const courseInformCollection = 'Course_Inform';
const collectionsMap = {
    announcements: 'Course_Ann',
    assignments: 'Course_Assignment',
    files: 'Course_File',
    video: 'Course_Video',
    modules: 'Course_Module'
};

// MongoDB client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to insert a course
async function insertCourseInformation(db, course) {
    const courseInformData = {
        course_name: course.course_name,
        course_url: course.course_url,
        course_id: course.course_id
    };
    await db.collection(courseInformCollection).insertOne(courseInformData);
}

// Function to insert a sub-collection (e.g., announcements, assignments, etc.)
async function insertSubCollection(db, collectionName, data, courseId) {
    const collection = collectionsMap[collectionName];
    const formattedData = data.map((item) => ({ course_id: courseId, ...item }));
    await db.collection(collection).insertMany(formattedData);
}

// Main function
async function main() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');

        const db = client.db('your_database_name');

        // Insert course information
        await insertCourseInformation(db, jsonData);

        // Insert sub-collections
        for (const [key, value] of Object.entries(collectionsMap)) {
            if (jsonData[key]) {
                await insertSubCollection(db, key, jsonData[key], jsonData.course_id);
            }
        }

        console.log('Data insertion completed');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

main();

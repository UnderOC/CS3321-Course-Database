
mongorestore --uri="mongodb://localhost:27017/COURSE_DB" ./back_up/COURSE_DB/

cd ./course_search_api/

[ -d "node_modules" ] && exec node ./server.js || npm install && exec node ./server.js

exec node ./server.js
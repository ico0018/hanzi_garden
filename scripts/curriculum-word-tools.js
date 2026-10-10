const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(app.slice(app.indexOf('function parseLessonsText('), app.indexOf('async function loadLessonsFromTxt(')), context);
module.exports = { root, parse: context.parseLessonsText };

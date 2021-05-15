import dotenv from 'dotenv';
import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
// import hbs from 'hbs';

// ------------------------------------------------
// CONFIG
// ------------------------------------------------
//adding environment var
dotenv.config();
process.env.PORT = process.env.PORT || 8080;

//adding express
const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//adding public folder, default home
// app.use(express.static('public', {
//     extensions: ['html']
// }));

//adding dirname and filename path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//adding render engine - HBS handlebars/
// app.set('view engine', 'hbs');
// hbs.registerPartials(__dirname + '/views/partials', function (err) {});

// const pageData = {
//     name: 'Static',
//     title: 'Node course'
// };

// ------------------------------------------------
// Serving
// ------------------------------------------------
app.get("/", (req, res, next) => {
    res.send(`hello world at port ${process.env.PORT}`);
});

// app.get(['/', '/index', '/home'], (req, res, next) => {
//     res.render(`home`, pageData);
// });

// app.get("/generic", (req, res, next) => {    
//     res.render(`generic`, pageData);
// });

// app.get("/elements", (req, res, next) => {    
//     res.render(`elements`, pageData);
// });

// app.get("*", (req, res, next) => {    
    // res.render(`404`);
//     res.sendFile(__dirname + '/public/index.html')
// });
// ------------------------------------------------
// Running
// ------------------------------------------------
app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});

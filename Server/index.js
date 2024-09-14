//Libraries
const path = require('path');
const express = require('express');
const multer = require('multer');
const { check, checkSchema, validationResult, body } = require('express-validator');
const mysql = require('mysql2');
const cors = require('cors');

//Setup defaults for script
const app = express();

app.use(express.static('Public'))
app.use(cors());
const users = require("./Models/users")

const storage = multer.diskStorage({
    //Logic where to upload file
    destination: function (request, pfp, callback) {
        callback(null, 'Uploads/')
    },
    //Logic to name the file when uploaded
    filename: function (request, pfp, callback) {
        thePic = pfp.originalname + '-' + Date.now() + path.extname(pfp.originalname)
        callback(null, thePic)
    }
})
const upload = multer({
    storage: storage,
    //Validation for file upload
    fileFilter: (request, pfp, callback) => {
        const allowedFileMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
        callback(null, allowedFileMimeTypes.includes(pfp.mimetype));
    }
});

const port = 80; //Default port to http server

const connection = mysql.createConnection({
    host: "A Host",
    user: "A User Name",
    password: "A Password",
    database: 'A Database'
});

app.get(
    '/user-data/',
    upload.none(),
    (request, response) => {
        if (!userPersonalData) {
            return response
                .status(500) //Error code when something goes wrong with the server
                .json({ message: 'Something went wrong with the server.' });
        }
        else {
            response
                .json({ userdata: userPersonalData });
        }
    }
);

app.get(
    '/allusers/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await users.AllUsers(request.query);
        } catch (error) {
            return response
                .status(500) //Error code when something goes wrong with the server
                .json({
                    message: 'Something went wrong with the server.',
                    error: String(error)
                });
        }
        //Default response object
        response
            .json({ alluserdata: result });

    });

app.get(
    '/user_results/:id',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await users.GetUserbyID(request.params);

        }
        catch (error) {
            return response
                .status(500) //Error code when something goes wrong with the server
                .json({
                    message: 'Something went wrong with the server.',
                    error: String(error) + " Made it HERE AAAAAAAAAAAAAA"
                });
        }

        response
            .json({ userdata: result });
    });

app.post(
    '/new_user/',
    upload.single('pfp'),
    check('username', 'Please create a username.').isLength({ min: 1 }),
    check('first', 'Please enter your first name.').isLength({ min: 1 }),
    check('last', 'Please enter your last name.').isLength({ min: 1 }),
    check('email', 'Please enter a valid email address.').isEmail(),

    checkSchema({
        'pfp': {
            custom: {
                options: (value, { req, path }) => !!req.file.path,
                errorMessage: 'Please upload a profile picture as an image file'
            },
        },
    }),

    check('pass', 'Please Create a password that is more than 5 charaters.').isLength({ min: 5 }),
    body('passcheck').custom((value, { req }) => {
        if (value !== req.body.pass) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),

    async (request, response) => {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            return response
                .status(400)
                .json({
                    message: 'There where errors with the account creation',
                    errors: errors.array(),
                });
        }

        try {
            await users.InsertUser(request.body);
            return response
                .status(200)
                .json({ message: "New User Added!" })
        }
        catch (error) {
            return response
                .status(500) //Error code when something goes wrong with the server
                .json({
                    message: 'Something went wrong with the server.',
                    error: String(error) + "Made it HERE AAAAAAAAAAAAAA"
                });
        }

    });
    
let userPersonalData;
app.post(
    '/user_login/',
    upload.none(),
    check('username', 'Enter a username').isLength({ min: 1 }),
    check('pass', 'Enter a password').isLength({ min: 1 }),

    (request, response) => {
        const errors = validationResult(request)

        if (!errors.isEmpty()) {
            return response
                .status(400)

                .json({
                    message: 'There where errors with logging in',
                    errors: errors.array(),
                });
        }

        const loginSql = 'select * from user_registration where username = ? and user_password = ?;';
        let queryParameters = [
            request.body.username,
            request.body.pass];

        connection.query(loginSql, queryParameters, (error, result) => {
            userPersonalData = null;

            for (data of result) {
                userPersonalData = data;
            }

            if (!userPersonalData) {
                return response
                    .status(500) //Error code when something goes wrong with the server
                    .json({ message: 'Something went wrong with the server.' });
            }
            else {

                response
                    .json({
                        message: 'Form submission was succesful!',
                        userdata: userPersonalData
                    });
            }
        });

    });


app.put(
    '/update_user/',
    upload.none(),
    check('f_name', 'Orders must have a first name').isLength({ min: 1 }),
    check('l_name', 'Orders must have a last name').isLength({ min: 1 }),
    check('email', 'Orders must have an email').isLength({ min: 1 }),
    check('p_name', 'Orders must have a product name').isLength({ min: 1 }),
    check('p_price', 'Enter a valid price').isLength({ min: 3 }),
    check('a_num', 'Orders must have an address number').isLength({ min: 1 }),
    check('a_street', 'Orders must have a street name').isLength({ min: 1 }),
    check('a_city', 'Orders must have a city').isLength({ min: 1 }),
    check('a_state', 'Orders must have a state').isLength({ min: 1 }),
    check('method', 'Orders must have a payment method').isLength({ min: 1 }),
    async (request, response, json) => {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            return response
                .status(400)

                .json({
                    message: 'Here are the errors found in the submission',
                    errors: errors.array(),
                });
        }
        try {
            await users.UpdateUser(request.body);
            return response
                .status(200)
                .json({ message: "Updated USER!" })
        }
        catch (error) {
            return response
                .status(500) //Error code when something goes wrong with the server
                .json({
                    message: 'Something went wrong with the server.',
                    error: String(error) + "Made it HERE AAAAAAAAAAAAAA"
                });
        }
    });

//For Delete PA

app.delete('/delete_user/',
    upload.none(),
    async (request, response, json) => {
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            return response
                .status(400)

                .json({
                    message: 'Here are the errors found in the submission',
                    errors: errors.array(),
                });
        }
        try {
            await users.DeleteUser(request.body);
            return response
                .status(200)
                .json({ message: "DELETED ORDER!" })
        }
        catch (error) {
            return response
                .status(500) //Error code when something goes wrong with the server
                .json({
                    message: 'Something went wrong with the server.',
                    error: String(error) + "Made it HERE AAAAAAAAAAAAAA"
                });
        }
    });

app.listen(port, () => {
    console.log(`This app is listening at http://localhost:${port}`);
});
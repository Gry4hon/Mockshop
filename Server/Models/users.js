const { Result } = require('express-validator');
const connection = require('./connection');

async function AllUsers(parameters = {}) {
    let selectSql = `SELECT CONCAT(u.first_name, ' ',u.last_name) as Customer_Name, 
                     u.email as Customer_Email, c.item_name as Product_Name, 
                     c.item_price as Product_Price, CONCAT(c.address_num,  ' ',c.address_street, ' ',c.state_abbrv) as Street_Address, 
                     c.address_city as City, c.state_abbrv as State, c.payment_method as Payment_Method, c.id as Order_id
                     FROM user_registration u, user_cart c
                     WHERE u.id = c.user_id`,
        whereStatements = [],
        orderByStatements = [],
        queryParameters = [];

    if (typeof parameters.exclude !== 'undefined' && parameters.exclude === 'Yes') {
        whereStatements.push("u.last_name NOT LIKE 'Musk'");
    }

    if (typeof parameters.products !== 'undefined' && parameters.products.length > 0 && parameters.products !== "Select") {
        const product = parameters.products;
        //Contatiation of first name
        if (product === "Musk") {
            whereStatements.push("u.last_name LIKE ?");
            queryParameters.push(product);
        } else {
            whereStatements.push("c.item_name LIKE ?");
            queryParameters.push(product);
        }
    }

    if (typeof parameters.price !== 'undefined' && parseInt(parameters.price) !== 0) {
        const priceLevel = parseInt(parameters.price);
        switch (priceLevel) {
            case 1:
                whereStatements.push('c.item_price BETWEEN ? AND ?');
                queryParameters.push(priceLevel);
                queryParameters.push((priceLevel + 49));
                break;
            case 51:
                whereStatements.push('c.item_price BETWEEN ? AND ?');
                queryParameters.push(priceLevel);
                queryParameters.push((priceLevel + 149));
                break;
            case 201:
                whereStatements.push('c.item_price BETWEEN ? AND ?');
                queryParameters.push(priceLevel);
                queryParameters.push((priceLevel + 299));
                break;
            case 501:
                whereStatements.push('c.item_price BETWEEN ? AND ?');
                queryParameters.push(priceLevel);
                queryParameters.push((priceLevel + 499));
                break;
        }

    }

    if (typeof parameters.sort !== 'undefined') {
        const sort = parameters.sort;
        if (sort === 'ASC') {
            orderByStatements.push('c.item_price ASC');
        } else if (sort === 'DESC') {
            orderByStatements.push('c.item_price DESC')
        }
    }


    //Dynamically add WHERE expressions to SELECT statements if needed
    if (whereStatements.length > 0) {
        selectSql = selectSql + ' AND ' + whereStatements.join(' AND ');
    }

    //Dynamically add ORDER BY expressions to SELECT statements if needed
    if (orderByStatements.length > 0) {
        selectSql = selectSql + ' ORDER BY ' + orderByStatements.join(', ');
    }


    //Dynamically add ORDER BY expressions to SELECT statements if needed
    if (typeof parameters.limit !== 'undefined' && parameters.limit > 0 && parameters.limit < 6) {
        selectSql = selectSql + ' LIMIT ' + parameters.limit;
    }


    return await connection.query(selectSql, queryParameters);
}

async function GetUserbyID(parameters = {}){

        const selectSql = `SELECT u.first_name, u.last_name, u.email, c.item_name, c.item_price, 
                                  c.address_num, c.address_street, c.address_city, c.state_abbrv, 
                                  c.payment_method, c.id as Order_id
                           FROM user_registration u, user_cart c
                           WHERE u.id = c.user_id and c.id = ?`;
    let queryParameters = [
        parameters.id
    ];


    return await connection.query(selectSql, queryParameters);
}

async function InsertUser(parameters = {}){
    const insertSql = 'INSERT INTO user_registration (username, first_name, last_name, email, user_password) VALUES (?, ?, ?, ?, ?)';
    let queryParameters = [
        parameters.username,
        parameters.first,
        parameters.last,
        parameters.email,
        parameters.pass];


    return await connection.query(insertSql, queryParameters);
}   

async function UpdateUser(parameters = {}, UserID){
    const insertSql = 'UPDATE user_cart c INNER JOIN user_registration u ON u.id = c.user_id SET u.first_name = ?, u.last_name = ?, u.email = ?, c.item_name = ?, c.item_price = ?, c.address_num = ?, c.address_street = ?, c.address_city = ?, c.state_abbrv = ?,  c.payment_method = ? WHERE c.id = ?';
    let queryParameters = [
        parameters.f_name,
        parameters.l_name,
        parameters.email,
        parameters.p_name,
        parameters.p_price,
        parameters.a_num,
        parameters.a_street,
        parameters.a_city,
        parameters.a_state,
        parameters.method,
        parameters.id];

        return await connection.query(insertSql, queryParameters);
}

async function DeleteUser(parameters = {}, UserID){
    const deletesql = `DELETE c FROM user_cart c INNER JOIN user_registration u ON u.id = c.user_id WHERE c.id = ?`
        let queryParameters = [parameters.id
        ];

        return await connection.query(deletesql, queryParameters);
}

module.exports = {
    AllUsers,
    GetUserbyID,
    InsertUser,
    UpdateUser,
    DeleteUser
}
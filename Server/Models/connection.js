const mysql = require('mysql2/promise');

let connection = null;

async function query(sql, params) {
    //Singleton DB connection
    if (null === connection) {
        connection = await mysql.createConnection({
            host: "A Host",
            user: "A User Name",
            password: "A Password",
            database: 'A Database'
        });
    }
    const [results,] = await connection.execute(sql, params);
    return results;
}

module.exports = {
    query
}



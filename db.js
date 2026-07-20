import mysql from 'mysql2/promise'


const db = await mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'dany_massas',
    password: 'Lruthes907',
    dateStrings: true
})

export default db;
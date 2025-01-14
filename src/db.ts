import pg from "pg";
const { Client } = pg;
const pgClient = new Client({
  user: "user",
  password: "444555666", // this should be a secret env
  host: "localhost",
  port: 5432,
  database: "database",
});

export default pgClient;
// await client.connect();
//
// const res = await client.query("SELECT $1::text as message", ["Hello world!"]);
// console.log(res.rows[0].message); // Hello world!
// await client.end();

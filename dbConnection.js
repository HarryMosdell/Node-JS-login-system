import { Client } from "pg";

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    database: "mydb"
  });

async function dbConnect() {
  
     try {
        await client.connect() 
        console.log("DB Connected Securly!")
     }

     catch(err){
        console.log("conncection refused", err)
     }

}

export { client, dbConnect };
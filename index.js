import http from "node:http";
import fs from "node:fs";
import { Client } from "pg";
import {client, dbConnect} from "./dbConnection.js";
import authUser from "./authUser.js";
import jwt from "jsonwebtoken";

let users = [];

dbConnect();

try {
  const file = fs.readFileSync("users.json", "utf-8");
  users = JSON.parse(file);
} catch (err) {
  users = [
    { name: "harry", age: 31 },
    { name: "andrew", age: 41 }
  ];
}

const master= {login:"master", password:1234};

const server = http.createServer((req, res) => {
 
  //res.setHeader("Content-Type", "text/plain");
  console.log(req.headers);
  
  if(req.url ==='/req.html') {

 const html =fs.readFileSync('req.html', 'utf-8');
 res.setHeader("Content-Type","text/html");
 res.end(html);

  }
  
  if(req.url ==='/login' && req.method==="POST") {
//console.log(req.data);
let body="";

  req.on("data" , chunk => 
  body += chunk 
  ); 
   

  req.on("end", async ()=> {
    
    let data = JSON.parse(body);
    if(data.name.length<5){
        res.statusCode=400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({error:"username too short"}))
        return;
    }
     console.log(data.name);
    let username=data.name
    const result= await client.query("SELECT * FROM USERS WHERE username=$1",
       [username]
      );

     console.log(result.rows);

     if(result.rows.length>0){
     
       const resultUsername=result.rows[0].username;

       if(username===resultUsername) {
      res.setHeader("Content-Type", "application/json");

      const token= jwt.sign(
       {username:resultUsername},
       "S_Key",
       {expiresIn: "10s"}
      )
      
      const refreshToken= jwt.sign(
        {username:resultUsername},
        "R_S_Key",
        {expiresIn: "7d"}
       )


       res.setHeader("Set-Cookie", [
        `token=${token}; HttpOnly; Path=/; Max-Age=10; SameSite=Lax`,
        `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${60*60*24*7}; SameSite=Lax`
      ]);
      

      res.end(JSON.stringify({ message:`${resultUsername} has logged in`, redirect: `/users?name=${resultUsername}`}));
      
       }

       else{
        res.statusCode=401;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({error:"invalid username"}));
       }

     }

     else {
        res.statusCode=401;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({error:"username doesnt exist"}));
     }
    
  })

}

if(req.url === '/refresh') {
   //refresh code here

  const cookie= req.headers.cookie || "";
 
   

   const refreshToken = cookie
   .split("; ")
    .find(c => c.startsWith("refreshToken="))
    ?.slice("refreshToken=".length);
 
   if(!refreshToken) {
    res.statusCode = 401;
    return res.end("no res");
   } 
  

    try {
   const user = jwt.verify( refreshToken, "R_S_Key");
   
   const accessToken= jwt.sign(
    {username: user.username},
    "S_Key",
    {expiresIn: "10s"}
   )

   jwt.verify(accessToken, "S_Key");


  res.setHeader("Set-Cookie", [
    `token=${accessToken}; HttpOnly; Path=/; Max-Age=10; SameSite=Lax`
  ]);

   res.end(accessToken);

   }

   catch {
    res.end("refresh token is expired or not set cannot refresh the access token");
   }

}




  if(req.url === '/' || req.url === '/index.html') {
  const html = fs.readFileSync('index.html', 'utf-8');
  res.setHeader("Content-Type", "text/html");
  res.end(html);

  }

  if(req.url ==="/users") {
    res.setHeader("Content-Type", "application/json");

    res.end(JSON.stringify(users));
    console.log("users route hit")
    return; 
 }

const urlObj = new URL(req.url, `http://${req.headers.host}`);
const pathname = urlObj.pathname;       // "/users"
const params= urlObj.searchParams;
 
const s= params.get('name')


 console.log(pathname);
 console.log(params);


 if(pathname ==="/users" && req.url!="/users") {
   
 return authUser(req, res);
  
   
 }


});


const port = 3033;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

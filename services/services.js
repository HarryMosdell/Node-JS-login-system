

  const getUser = async (id)=> {
 
   const result = await client.query('SELECT * FROM users WHERE id = $1',
   [id]);

   const user = result.rows[0];

   if(user) {
    return user;
   }

   console.log("no user found");
  }

updateUser = async (newUsername, oldUsername) => {

 const result = await client.query('UPDATE users SET username=$1 WHERE username=$2', 
 [newUsername, oldUsername]);

 if (result.rowCount > 0) {
    console.log("User updated!");
  } else {
    console.log("No user found.");
  }

  }

 deleteUser= async (username)=> {

   const result= await client.query('DELETE FROM users where username=$1',
    [username]
    ); 

    if(result.rowCount >0) {
    console.log("User deleted!");
  } else {
    console.log("No User deleted.");
  }

 }



  export {getUser, updateUser, deleteUser};




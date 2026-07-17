import jwt from "jsonwebtoken";
function authUser(req, res) {
  
  const cookie= req.headers.cookie || "";
  const token = cookie?.split("; ")
  .find(c => c.startsWith("token="))
  ?.slice("token=".length);

  const refreshToken = cookie?.split("; ")
  .find(c => c.startsWith("refreshToken="))
  ?.slice("refreshToken=".length);


  if(!token) {
    return tryRefresh(res,refreshToken);
   }
  
  try {
  const decoded = jwt.verify(token,"S_Key")
  return res.end(" logged in");
  }

  catch(err) {
    console.log(err)
    res.statusCode=401;
    
    return res.end("no token you must login");
  }

}


function tryRefresh(res,refreshToken) {

    if(!refreshToken) return res.end("no Refresh token you need to login again!");
    
   try{
   const refreshTokenDecoded=jwt.verify(refreshToken, "R_S_Key");

   const accessToken= jwt.sign(
    {userName: refreshTokenDecoded.username},
    "S_Key",
    { expiresIn:"10s" }
   );

    const accessTokenVerified= jwt.verify(accessToken,"S_Key");

   res.setHeader("Set-Cookie", [
    `token=${accessToken}; HttpOnly; Path=/; Max-Age=10; SameSite=Lax`
  ]);
  
  return res.end("logged in (refreshed)");
   
}

   catch(err) {
    console.log(err)
    return res.end(" refresh token doesnt exist")
   }

}


export default authUser;

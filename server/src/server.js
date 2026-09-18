 const express = require ("express");
 const app = express ()
app.use(express.json());
require("dotenv").config();
const {nanoid} = require("nanoid"); 
const pool = require("./db");

 const PORT=   process.env.PORT || 3000;

app.get( "/" ,(req,res)=>{
    console.log ("it is working ")
})
app.get("/api/test", (req,res )=> {
    res.json({
        message:"Api lets start"
    })
}
)

 app.post( "/api/shorten",( req,res)=>{
  
const { longUrl } = req.body || {};

if (!longUrl || typeof longUrl !== "string" || !longUrl.trim()) {
  return res.status(400).json({
    error: "longUrl is required and must be a string",
  });
}

  console.log("got:", longUrl);
//  const newUrl=new URL(longUrl);
try {
    const newUrl=new URL(longUrl);
    const shortCode=nanoid(7)
   console.log("slug:", shortCode, "for:", newUrl.toString());
return res.status(200).json({slug: shortCode, cleaned: newUrl.toString()});
    // return  res.status(200).json({  message : "valid Destination Url "})

}
catch (error){
 console.log("REAL ERROR:", error.message);
    return res.status(400).json({  error : "Invalid URL. Include http://..."})
}




 })













pool.query("SELECT NOW()", (error, result) => {
  if (error) {
    console.error("Database connection failed:", error);
  } else {
    console.log("Database connected:", result.rows[0]);
  }
});
app.listen (  PORT ,()=>{

    console.log(`Server is running on port ${PORT}`);
})

 
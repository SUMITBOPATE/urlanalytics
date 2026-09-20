 const express = require ("express");
 const app = express ()
app.use(express.json());
require("dotenv").config();
const {nanoid} = require("nanoid"); 
const pool = require("./db");
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" }));


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

 app.post( "/api/shorten",async ( req,res)=>{
  
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

         const result = await pool.query(
         "INSERT INTO urls (short_code, long_url, expires_at) VALUES ($1, $2, NOW() + INTERVAL '24 hours') RETURNING short_code, long_url, expires_at",
             [shortCode, newUrl.toString()]
        );

            const row = result.rows[0];
        return res.status(201).json({
            shortCode: row.short_code,
            shortUrl: `${req.protocol}://${req.get("host")}/${row.short_code}`,
            expiresAt: row.expires_at
            });
    

    }



    catch (error){
        console.log("REAL ERROR:", error.message);
          return res.status(400).json({  error : "Invalid URL. Include http://..."})
        }

     })

app.get("/:code", async (req, res) => {
  const { code } = req.params;
  console.log("ticket:", code);

  try {
   
    const result = await pool.query(
      "SELECT short_code, long_url, expires_at, click_count FROM urls WHERE short_code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const row = result.rows[0];

    
    if (new Date(row.expires_at) < new Date()) {
      await pool.query("DELETE FROM urls WHERE short_code = $1", [code]);
      return res.status(410).send("Link expired (24h) and deleted");
    }


    await pool.query("UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1", [code]);
    return res.redirect(302, row.long_url);
  } catch (err) {
    console.log("REAL ERROR:", err.message);
    return res.status(500).json({ error: "DB error" });
  }
});







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

 
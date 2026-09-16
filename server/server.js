const express = require ("express");
 const app = express ()

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
app.listen (  PORT ,()=>{

    console.log(`Server is running on port ${PORT}`);
})

 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 


const Authenticator = (req,res,next)=>{
  const data = req.body;
  if(data.admin == "bismillah"){
    next();
  }
}
// Server Listen
app.listen(5000, () => {
  console.log("✅ Server is running at http://localhost:5000");
});

// MongoDB Connection
const connectionString = "mongodb+srv://userPirsab:passwordPirsab@clusterpirsab.ye81qkn.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPirsab"
  
mongoose
  .connect(connectionString)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Schema & Model
const Mamla = mongoose.model(
  "mamlaDatabase",
  new mongoose.Schema({
    mamlaNO: String,
    courtName: String,
    mamlakarigon: String,
    mamlarPokkho: String,
    mobile: String,
    mamladetails:[
      {
        date: String,
        nextStep: String,
        nextDate: String,
        comment: String
      }
    ]

  })
);

// ---------------- REST API -----------------

// 1️⃣ Get All Data
app.get("/api/mamla", async (req, res) => {
 res.send("Bismillah");
});

// 2️⃣ Get Single Data by ID
app.get("/api/mamla/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const {year,date}= req.query;
    let searchId;
    if(parseInt(year)&&parseInt(date)){
      searchId = id +"/" + year+"/"+date;
    }else if(parseInt(year)){
      searchId = id + "/"+year;
    }else{
      searchId = id;
    }
    const data = await Mamla.find({$or:[{mamlaNO:searchId},{mamlakarigon:searchId},{mobile:searchId},{"mamladetails.nextDate":searchId}]});
    if (!data) return res.status(404).json({ error: "Not Found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Create New Data (POST)
app.post("/api/mamla",Authenticator, async (req, res) => {
  try {
    const { mamlaNO,courtName,mamlakarigon,mamlarPokkho,mobile,mamladetails } = req.body;
    const newMamla = new Mamla({ mamlaNO,courtName,mamlakarigon,mamlarPokkho,mobile,mamladetails });
    const saved = await newMamla.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4️⃣ Update Data by ID (PUT)
app.put("/api/mamla/:id/:year",Authenticator, async (req, res) => {
  try {
    const { date,nextStep,nextDate,comment} = req.body;
    const newObject = {date,nextStep,nextDate,comment}
    const {id,year} = req.params;
    const mamlaID = id +"/" + year;

    const updated = await Mamla.findOneAndUpdate({mamlaNO:mamlaID},{$push:{mamladetails:newObject}},{new:true})
    if (!updated) return res.status(404).json({ error: "Not Found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



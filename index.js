require("dotenv").config();
const bodyParser = require('body-parser');
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')

const app = express();

app.use(cors())

app.use(bodyParser.json());
app.use(express.json());

const PasteSchema = new mongoose.Schema({
  id: String,
  number: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

PasteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

const Paste = mongoose.model("Paste", PasteSchema);

mongoose.connect(process.env.MONGO_URL);
app.get("/", async (req,res ) =>{
    res.json({ success : true})
})

app.post("/create", async (req, res) => {
  const { id, number, content } = req.body;
  if (!id || !content || !number) {
    return res.json({ success: false, message: "ID, number, and content are required" });
  }
  try {
    const paste = new Paste({ id, number, content });
    await paste.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.post("/restore", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.json({ success: false, message: "ID is required" });
  }
  try {
    const paste = await Paste.findOne({ id });
    if (!paste) {
      return res.json({ success: false, message: "Paste not found" });
    }
    res.json({ content: paste.content });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

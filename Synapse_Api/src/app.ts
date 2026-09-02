import  express  from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Synapse API is running successfully!");
});

export default app;


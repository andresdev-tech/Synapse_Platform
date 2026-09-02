import app from "./app.ts";

const PORT = process.env.PORT || 9090;

app.listen(PORT, () => {
  console.log(`Synapse listen in  http://localhost:${PORT}`);
});
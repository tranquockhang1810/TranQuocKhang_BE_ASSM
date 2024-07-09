const app = require("./src/App");

const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
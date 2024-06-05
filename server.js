const express = require("express")
const GRBRoutes = require("./src/GRB/routes");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Holla");
});

app.use("/GRB", GRBRoutes);

app.listen(port, () => console.log(`app listening to port ${port}`));
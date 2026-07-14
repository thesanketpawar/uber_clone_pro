const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");  // Import the rate-limiter
const PORT = process.env.PORT || 4000;
require("./config/connection");
const { initializeSocket } = require('./socket');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/user", express.static(path.join(__dirname, "public/user")));
app.use("/captain", express.static(path.join(__dirname, "public/captain")));

// Apply rate-limiting to prevent rapid requests to certain routes
const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 10, 
    message: "Too many requests, please try again later."
});

app.use("/maps", limiter);

app.use("/user", require("./routes/user.routes"));
app.use("/captain", require("./routes/captain.routes"));
app.use("/maps", require("./routes/map.routes"));
app.use("/rides", require("./routes/ride.routes"));

app.get("/", (req, res) => {
    res.send("API is running");
});

const server = http.createServer(app);
initializeSocket(server); 

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

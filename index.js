import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import React from "react";
import affirmation from "./components/affirmation.js";

const app = express();
const port = 3000;
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configure dotenv to load environment variables from .env file
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

app.get("/", async (req, res) => {
  try {
    const result = await db.query("select * from items order by priority ASC, id ASC");
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; 
    const year = today.getFullYear(); 
    const formattedDate = `${day}/${month}/${year}`;

    const dailyAffirmationQuery = await db.query(
      "SELECT affirmation_text FROM daily_affirmation WHERE date = $1",
      [formattedDate]
    );

    let dailyAffirmation;
    if (dailyAffirmationQuery.rows.length > 0) {
      // Using today's stored affirmation
      dailyAffirmation = dailyAffirmationQuery.rows[0].affirmation_text;
    } else {
      // Picking a new random affirmation and store it
      const randomIndex = Math.floor(Math.random() * affirmation.length);
      dailyAffirmation = affirmation[randomIndex].text;

      await db.query(
        "INSERT INTO daily_affirmation (date, affirmation_text) VALUES ($1, $2)",
        [formattedDate, dailyAffirmation]
      );
    }

    res.render("index.ejs", {
      affirmationText: dailyAffirmation,
      todayDate: formattedDate,
      listTitle: "To DO List",
      listItems: result.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  const priority = req.body.priority;
  if (!priority) {
    return res.status(400).send("Priority is required");
  }
  try {
    db.query("insert into items (title, priority) values ($1,$2) ", [
      item,
      priority,
    ]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while adding the task");
  }
});

app.post("/edit", (req, res) => {
  const id = req.body["updatedItemId"];
  const title = req.body["updatedItemTitle"];

  try {
    db.query("update items set title = $1 where id = $2", [title, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});
app.post("/delete", (req, res) => {
  const id = req.body["deleteItemId"];
  try {
    db.query("delete from items where id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

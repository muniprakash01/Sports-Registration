import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const app = express();

const PORT = process.env.PORT || 5000;

const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "sports_registrations",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres"
});

app.use(cors());
app.use(express.json());

/*
 * Health check
 */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected"
    });
  } catch (error) {
    console.error("Health check error:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

/*
 * Get all registrations
 */
app.get("/api/registrations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        age,
        sport,
        created_at
      FROM registrations
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET registrations error:", error);

    res.status(500).json({
      error: "Unable to retrieve registrations"
    });
  }
});

/*
 * Create registration
 */
app.post("/api/registrations", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      sport
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      age === undefined ||
      !sport
    ) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const cleanName = String(name).trim();

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanPhone = String(phone).trim();

    const numericAge = Number(age);

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        error: "Name must contain 2 to 100 characters"
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        error: "Invalid email address"
      });
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        error: "Phone number must contain exactly 10 digits"
      });
    }

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 5 ||
      numericAge > 100
    ) {
      return res.status(400).json({
        error: "Age must be between 5 and 100"
      });
    }

    const result = await pool.query(
      `
        INSERT INTO registrations
          (name, email, phone, age, sport)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          id,
          name,
          email,
          phone,
          age,
          sport,
          created_at
      `,
      [
        cleanName,
        cleanEmail,
        cleanPhone,
        numericAge,
        sport
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("POST registration error:", error);

    res.status(500).json({
      error: "Unable to create registration"
    });
  }
});

/*
 * Delete registration
 */
app.delete("/api/registrations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid registration ID"
      });
    }

    const result = await pool.query(
      `
        DELETE FROM registrations
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Registration not found"
      });
    }

    res.json({
      message: "Registration deleted successfully"
    });

  } catch (error) {
    console.error("DELETE registration error:", error);

    res.status(500).json({
      error: "Unable to delete registration"
    });
  }
});

/*
 * Start server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
});

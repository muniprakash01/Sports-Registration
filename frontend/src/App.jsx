import { useEffect, useState } from "react";

const SPORTS = [
  "Cricket",
  "Football",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Badminton",
  "Athletics",
  "Swimming"
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  sport: ""
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [health, setHealth] = useState("Checking...");

  const loadRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations");

      if (!response.ok) {
        throw new Error("Unable to load registrations");
      }

      const data = await response.json();
      setRegistrations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      setHealth(
        data.database === "connected"
          ? "Application Online"
          : "Database Unavailable"
      );
    } catch {
      setHealth("Application Offline");
    }
  };

  useEffect(() => {
    loadRegistrations();
    checkHealth();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setMessage("Registration completed successfully.");

      setForm(initialForm);

      await loadRegistrations();
      await checkHealth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistration = async (id) => {
    if (!window.confirm("Delete this registration?")) {
      return;
    }

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setMessage("Registration deleted successfully.");

      await loadRegistrations();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">

      <header className="header">
        <div>
          <h1>🏆 Sports Registrations</h1>
          <p>Register for your favorite sport</p>
        </div>

        <div className="health">
          <span className="status-dot"></span>
          {health}
        </div>
      </header>

      <main className="content">

        <section className="card">

          <h2>Register Now</h2>

          {message && (
            <div className="success">
              {message}
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  minLength="2"
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  maxLength="150"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  required
                  pattern="[0-9]{10}"
                  title="Enter a 10 digit phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">
                  Age
                </label>

                <input
                  id="age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Age"
                  min="5"
                  max="100"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="sport">
                  Select Sport
                </label>

                <select
                  id="sport"
                  name="sport"
                  value={form.sport}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select a sport
                  </option>

                  {SPORTS.map((sport) => (
                    <option
                      key={sport}
                      value={sport}
                    >
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

          </form>
        </section>

        <section className="card">

          <div className="section-title">
            <h2>Registered Players</h2>

            <span className="count">
              {registrations.length}
            </span>
          </div>

          {registrations.length === 0 ? (
            <div className="empty">
              No registrations yet.
            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Age</th>
                    <th>Sport</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {registrations.map((registration) => (
                    <tr key={registration.id}>

                      <td>
                        {registration.name}
                      </td>

                      <td>
                        {registration.email}
                      </td>

                      <td>
                        {registration.phone}
                      </td>

                      <td>
                        {registration.age}
                      </td>

                      <td>
                        <span className="sport">
                          {registration.sport}
                        </span>
                      </td>

                      <td>
                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteRegistration(registration.id)
                          }
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default App;

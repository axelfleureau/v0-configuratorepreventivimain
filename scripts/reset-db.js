const fs = require("fs")
const path = require("path")
const https = require("https")
const http = require("http")

// Ensure the SQL directory exists
const sqlDir = path.join(process.cwd(), "sql")
if (!fs.existsSync(sqlDir)) {
  console.log("Creating SQL directory...")
  fs.mkdirSync(sqlDir, { recursive: true })
}

// Function to make HTTP request
async function makeRequest(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http
    const req = client.request(url, { method }, (res) => {
      let data = ""
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ statusCode: res.statusCode, data: jsonData })
        } catch (e) {
          resolve({ statusCode: res.statusCode, data })
        }
      })
    })

    req.on("error", (error) => {
      reject(error)
    })

    req.end()
  })
}

async function resetDatabase() {
  try {
    console.log("Resetting database...")

    // Call the init-db endpoint
    console.log("Initializing database...")
    const initDbResult = await makeRequest("http://localhost:3000/api/init-db", "POST")

    if (initDbResult.statusCode >= 200 && initDbResult.statusCode < 300) {
      console.log("Database initialized successfully!")
      console.log(JSON.stringify(initDbResult.data, null, 2))
    } else {
      console.error("Failed to initialize database:", initDbResult.data)
    }
  } catch (error) {
    console.error("Error resetting database:", error)
    process.exit(1)
  }
}

resetDatabase()

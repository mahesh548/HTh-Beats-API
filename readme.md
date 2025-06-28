<p align="center">
  <img src="https://res.cloudinary.com/dzjflzbxz/image/upload/v1748345555/logo_s03jy9.png" alt="HTh Beats Logo" width="200"/>
</p>

<h1 align="center">HTh Beats — API Server</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22.1.0-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-black?logo=express" />
  <img src="https://img.shields.io/badge/Hosted%20on-Azure%20App%20Services-blue?logo=azure-devops" />
  <img src="https://img.shields.io/badge/Primary%20API-HTh%20Beats-lightgrey" />
    <a href="https://hthbeats.online">
  <img src="https://img.shields.io/badge/CORS-hthbeats.online-important" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>

> ✅ Live URL: [hthbeats-api-bzbgepaqcug2abb4.centralindia-01.azurewebsites.net](hthbeats-api-bzbgepaqcug2abb4.centralindia-01.azurewebsites.net)

<i>This url only allows requests from our frontend (hthbeats.online). please do not use this link in your project.</i>

---

## 📄 Description

This is the **core API server** for the HTh Beats music app.

It acts as a **proxy** to fetch music metadata from **JioSaavn**, and then **caches the data in MongoDB** to ensure fast, efficient, and reliable access across the app.

This server is written in **Express.js**, hosted on **Azure App Services**, and powers key music functionality such as:

- Fetching songs, albums, playlists, and artists
- Serving localized launch screens
- Handling user song queues and related media
- Minimal bot preview support for Open Graph metadata

---

## 🧠 Tech Stack

| Layer        | Tech Used                     |
| ------------ | ----------------------------- |
| Runtime      | Node.js 22.1.0                |
| Framework    | Express.js                    |
| Hosting      | Azure App Services            |
| Caching DB   | MongoDB Atlas (via Mongoose)  |
| Data Source  | JioSaavn (scraped APIs)       |
| Security     | CORS (`hthbeats.online` only) |
| Meta Preview | Minimal via META_SECRET       |
| Auth         | JWT (shared with backend)     |

---

## 🚀 Features

- 🔁 **Proxy**: Pulls live data from JioSaavn for songs, artists, albums, and playlists
- 📥 **Caching**: Stores a copy of requested data in MongoDB for faster subsequent access
- 🔍 Search and explore functionalities
- 🧠 Personalized launch screen based on user’s language
- 🎶 Queue generation for user sessions
- 🔐 Minimal support for bot-based metadata (e.g., Open Graph for social preview)
- CORS protected: accepts only frontend requests from `hthbeats.online`

---

## 🔐 Authentication

- Certain routes require **JWT authentication** for access (e.g., personalized song queues).
- This server uses the **same JWT tokens issued by the backend server**, since both the backend and API share the same MongoDB database.
- Tokens are expected in the `Authorization` header as `Bearer <token>`.
- Invalid or missing tokens will result in a 401 Unauthorized response.

---

## 📦 Installation

```bash
#clone the project
git clone https://github.com/mahesh548/HTh-Beats-API

# go to directory
cd HTh-Beats-API

# install requirements
npm install --force

# boot the API server in dev mode
npm run dev

```

---

## 📦 Environment Variables

Create a .env file in the root directory

```bash
ENVIROMENT = "LOCAL"
# "PROD" for production

SECRATE = <Secret_to_sign_JWT>
# must be same as API secret

LOCAL_DATABASE = "mongodb://localhost:<PORT>/<DATABASE>"
# for local enviroment

PROD_DATABASE = <Atlas_cluster_db_url>
# for production enviroment

FURL = <Frontend_url>
#for CORS

PORT = <Default_PORT_for_express_server>
# only for local enviroment

META_SECRET = <Meta_Secret>
# Secret used by the Vercel Edge Function (from the frontend) to authenticate itself when requesting metadata from this API for generating OG tags
```

---

# 🧠 What I Learned

- How to implement response caching by fetching data from an external API and storing it in MongoDB in a structured way.

- Returning cached responses in the same format as the original API while adding custom features like flags for liked songs and saved playlists.

- Deepened understanding of Express.js by building modular and scalable routes.

- Advanced usage of MongoDB and Mongoose, including complex queries, schema design with static and virtual fields, and population for related data.

- Implemented CRUD operations efficiently with Mongoose.

- Created a custom search system that queries the cache first before making external API calls, optimizing performance.

- Added basic but essential features like pagination and autocomplete for better user experience.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork this repository and submit a pull request.

If you find a bug or want to suggest an improvement, please open an issue.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).  
You're free to use, modify, and distribute this project with proper attribution.

---

> ⚠️ **Disclaimer:**  
> This project, **HTh Beats**, is a personal portfolio project built solely for learning and showcasing frontend and full-stack development skills.  
> It is **not affiliated with JioSaavn**, Spotify, or any other music streaming service.  
> All audio content and media used within the app are **sourced from publicly accessible JioSaavn URLs** and are **not hosted or stored by the developer**.  
> This project is **not intended for commercial use**, distribution, or monetization.

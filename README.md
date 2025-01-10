# URL Shortener Service

## Project Description

This is a URL shortening API that allows users to shorten long URLs, generate unique short links, and manage their expiration time and custom aliases. This project uses **Node.js** with **Express** to handle requests and **SQLite** for data storage.

### Features:
- **URL Shortening** — The service allows creating short links from long URLs.
- **Aliases** — Users can specify custom aliases for short links (optional).
- **Expiration Time** — You can set an expiration time for the short link (it is permanent by default).
- **Link Info** — The service returns information about the created short link, including the number of clicks.
- **Analytics** — The service tracks IP addresses and click counts for each short link.
- **Delete** — The service allows you to delete a created short link.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript (minimalistic interface for testing)




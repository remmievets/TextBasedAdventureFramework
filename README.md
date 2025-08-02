# Text Based Adventure Framework

# Setup Instructions

1. Install git - https://git-scm.com/downloads
2. Install js node - https://nodejs.org/en/download
3. Clone repository to your machine - ```git clone https://github.com/remmievets/TextBasedAdventureFramework.git```
4. Install npm packages that are needed for the server - ```npm install```

# Running Server

Login to Linux from powershell
```
wsl.exe -d Ubuntu
```

from linux start server
```
node server.js
```

Formay a file or group of files
```
npx prettier --write server.js
npx prettier --write "**/*.js"
```

Access from Chrome on Windows using 
```
http://localhost:3000
```

# Using sqlite3
1. To start SQLite, type
```
splite3 database_name.db
```
- Replace ```database_name.db``` with your desired database name. If the file doesn't exist, it will be created.
Framework for a text based adventure website

# Migrate from CMaNGOS-TBC to OregonCore (Talamortis branch)

1. Import Backups
Import your CMaNGOS sql dumps to a database of your choice

    mysql -umangos -p'mangos' cmangos_chars < tbc-prod-chars-20210614.sql
    mysql -umangos -p'mangos' cmangos_logon < tbc-prod-logon-20210614.sql

2. Setup OregonCore
3. Setup the importer

    pacman -Sy npm
    npm install mariadb
    vim index.js
        # configure your database and passwords
        # at the top of the index.js file.

    npm index.js

# cmangos-to-oregon
A low effort attempt that helps migrating from CMaNGOS-TBC to OregonCore (Talamortis branch).
This script is still incomplete, please look into the index.js "TODO" markers for details.
Depending on the activity and size of your server, you might want to add more tables.

## Usage

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

    node index.js

The output will look like this:

    $ node index.js
    Processing: character_homebind
    Processing: character_inventory
    Processing: character_pet
    Processing: character_queststatus
    Processing: character_reputation
    Processing: character_spell
    Processing: characters
    Processing: guild_bank_item
    Processing: guild_member
    Processing: guild_rank
    Processing: item_instance
    Processing: mail
    Processing: mail_items
    Processing: item_text
    Processing: pet_spell
    Processing: guild_bank_right
    Processing: guild_bank_tab
    Processing: character_action
    Processing: character_skills
    Processing: guild_eventlog
    $

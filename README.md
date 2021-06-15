# ccm-util
ccm-util (cross-core-migration) is a low effort attempt, that helps migrating player data between different world of warcraft emulators.
It provides helpful functions and wow specific mappings to ease the task of mapping different sql tables.

## Dependencies
Make sure to have nodejs and npm installed.

    # pacman -Sy nodejs npm
    $ git clone https://github.com/shagu/ccm-util
    $ cd ccm-util
    $ npm install

## Getting Started
Setup both - the source and the destination - databases. The destination tables
will be truncated and filled with the mapped source values.

    $ node ccm.js <script> <source> <destination>

Where <script> is one of the already available migration scripts.
This is the place where you probably have to write your own. Check the
existing ones and their source to understand how this works.

An example usage would be:

    $ node ccm.js cmangos-to-oregon-characters cmangos_chars characters

This example would migrate cmangos-tbc data from the `cmangos_chars` database into
the oregon characters database which is called `characters`.

If everything went fine, the output should look like this:

    $ node ccm.js cmangos-to-oregon-characters cmangos_chars characters
    Processing: character_action
    Processing: character_homebind
    Processing: character_inventory
    Processing: character_pet
    Adding "character_pet.abdata" to finalize queue
    Processing: character_queststatus
    Processing: character_reputation
    Processing: character_skills
    Processing: character_social
    Processing: character_spell
    Adding "character_spell.languages" to finalize queue
    Processing: character_spell_cooldown
    Processing: character_tutorial
    Processing: characters
    Adding "characters.data" to finalize queue
    Processing: guild
    Processing: guild_bank_item
    Processing: guild_bank_right
    Processing: guild_bank_tab
    Processing: guild_eventlog
    Processing: guild_member
    Processing: guild_rank
    Processing: item_instance
    Processing: item_loot
    Processing: item_text
    Processing: mail
    Processing: mail_items
    Processing: pet_aura
    Processing: pet_spell
    Processing: pet_spell_cooldown
    Finalizing: character_pet.abdata
    Finalizing: character_spell.languages
    Finalizing: characters.data
    $

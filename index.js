// config
const mysql_host = "localhost"
const mysql_user = "mangos"
const mysql_pass = "mangos"

const cmangos_realmd = "cmangos_realmd"
const cmangos_characters = "cmangos_chars"

const oregon_realmd = "realmd"
const oregon_characters = "characters"

const characters = {
  // TODO: 'guild_bank_eventlog': { replace: { 'EventType': 'LogEntry'}},
  //    Duplicate entry '3-0' for key 'PRIMARY'
  //    sql: INSERT INTO characters.guild_bank_eventlog (guildid,LogGuid,TabId,LogEntry,PlayerGuid,ItemOrMoney,ItemStackCount,DestTabId,TimeStamp) VALUES (3,0,1,1,21,21885,1,0,1623599399);
  //
  // TODO: 'characters'
  //    Check the ignored values: exploredZones, equipmentCache, ammoId, knownTitles, actionBars
  //    The characters.data table is required by OregonCore but does not exist in CMaNGOS
  //
  // List of all CMaNGOS tables with contents:

  // 'account_data'
  // 'account_instances_entered'
  // 'character_account_data'
  'character_action': true,
  // 'character_aura'
  // 'character_db_version'
  'character_homebind': true,
  'character_inventory': true,
  'character_pet': { ignore: { 'xpForNextLoyalty': true }},
  'character_queststatus': true,
  // 'character_queststatus_monthly'
  'character_reputation': true,
  'character_skills': true,
  'character_social': true,
  'character_spell': true,
  // 'character_spell_cooldown'
  // 'character_tutorial'
  'characters': { ignore: { 'exploredZones': true, 'equipmentCache': true, 'ammoId': true, 'knownTitles': true, 'actionBars': true }, replace: { 'power1': 'powerMana', 'power2': 'powerRage', 'power3': 'powerFocus', 'power4': 'powerEnergy', 'power5': 'powerHappiness' }},
  // 'creature_respawn'
  // 'event_group_chosen'
  // 'game_event_status'
  // 'gameobject_respawn'
  // 'gm_tickets'
  'guild': { fill: { 'createdate': 0 }},
  //'guild_bank_eventlog': { replace: { 'EventType': 'LogEntry'}}, -- see TODO
  'guild_bank_item': true,
  'guild_bank_right': true,
  'guild_bank_tab': true,
  'guild_eventlog': true,
  'guild_member': true,
  'guild_rank': true,
  // 'instance_reset'
  'item_instance': true,
  // 'item_instance_backup_pre_data_field_drop'
  'item_loot': true,
  'item_text': true,
  'mail': true,
  'mail_items': true,
  // 'pet_aura'
  'pet_spell': true,
  // 'pet_spell_cooldown'
  // 'petition_sign'
  // 'saved_variables'
  // 'world'
  // 'world_state'
}

const languagemap = {
  // skill: spell
  98: 668, // Language: Common
  113: 671, // Language: Darnassian
  139: 815, // Language: Demon Tongue
  138: 814, // Language: Draconic
  759: 29932, // Language: Draenei
  111: 672, // Language: Dwarven
  313: 7340, // Language: Gnomish
  673: 17737, // Language: Gutterspeak
  141: 817, // Language: Old Tongue
  109: 669, // Language: Orcish
  115: 670, // Language: Taurahe
  137: 813, // Language: Thalassian
  140: 816, // Language: Titan
  315: 7341, // Language: Troll
}

const mariadb = require('mariadb')

async function fixlang(oregon) {
  console.log("Fixing Languages")
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  let conn;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query("SELECT * from " + oregon + ".character_skills")
    rows.forEach(async function(row) {
      if(languagemap[row.skill]) {
        console.log(`Adding Spell: ${languagemap[row.skill]} to Character: ${row.guid}`)
        let query = "INSERT INTO " + oregon + `.character_spell (guid, spell, active, disabled) VALUES (${row.guid}, ${languagemap[row.skill]}, 1, 0)`
        let res = await conn.query(query)
      }
    });
  } catch (err) {
  	throw err
  } finally {
	  if (conn) conn.release()
    return pool
  }
}

let threadcount = 0
let dbcount = 0
async function convert(cmangos, oregon, table, replaces) {
  console.log("Processing: " + table)
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  let conn;
  try {
    conn = await pool.getConnection();
    let trunc = await conn.query("TRUNCATE " + oregon + ".`" + table + "`;");
    let rows = await conn.query("SELECT * from " + cmangos + "." + table)
    rows.forEach(async function(row) {
      let query = "INSERT INTO " + oregon + "." + table + " ("
      let first = true

      for (const [key, value] of Object.entries(row)) {
        if ((replaces.ignore) && (replaces.ignore[key])) continue
        if(first) {first = false} else {query = query + ","}

        let modkey = key
        if ((replaces.replace) && (replaces.replace[key])) {
          modkey = replaces.replace[key]
        }

        query = query + `${modkey}`
      }

      query = query + ') VALUES ('
      first = true

      for (const [key, value] of Object.entries(row)) {
        if ((replaces.ignore) && (replaces.ignore[key])) continue
        if(first) {first = false} else {query = query + ","}

        let escaped = value
        if(typeof(escaped) === "string") {
          escaped = "'" + escaped.toString().replace(/'/g, "''") + "'"
        }

        if ((replaces.fill) && (typeof(replaces.fill[key]) !== 'undefined')) {
          escaped = replaces.fill[key]
        }

        query = query + `${escaped}`
      }

      query = query + ');'

      threadcount++
      let res = await conn.query(query).then(() => {
        threadcount--

        // Add Language Spells for each matching Skill
        if ((threadcount === 0) && (dbcount >= Object.keys(characters).length)){
          fixlang(oregon_characters).then((pool) => { pool.end() })
        }
      })
    });
  } catch (err) {
  	throw err
  } finally {
	  if (conn) conn.release()
    return pool
  }
}

for (const [key, value] of Object.entries(characters)) {
  convert(cmangos_characters, oregon_characters, key, value).then((pool) => { pool.end(); dbcount++ })
}
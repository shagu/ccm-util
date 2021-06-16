// command line parser
var args = process.argv.slice(2);
const script = args[0]
const sourceDB = args[1]
const destinationDB = args[2]

// config
const mysql_host = "localhost"
const mysql_user = "mangos"
const mysql_pass = "mangos"

const mariadb = require('mariadb')
const mappings = require('./mappings.js')

// try to guess the best `data` values for oregon's characters table
async function oregon_characters_data(source, dest) {
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  let conn;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query("SELECT * from " + dest + ".characters")
    rows.forEach(async function(row) {
      let bitmask = mappings.data_bitmasks[`${row.race} ${row.class} ${row.gender}`]
      let model = mappings.models[`${row.race} ${row.gender}`]
      let estimate = `${row.guid} 0 25 0 1065353216 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${row.health} ${row.powerMana} ${row.powerRage} ${row.powerFocus} ${row.powerEnergy} ${row.powerHappiness} ${row.health} 0 1000 0 100 0 ${row.level} ${row.race} ${bitmask}${"".padStart(115*2," 0")} ${model} ${model}${"".padStart(85*2," 0")} ${row.playerBytes} ${row.playerBytes2}${"".padStart(1351*2," 0")}`
      let query = `UPDATE ${dest}.characters SET data='${estimate}' WHERE guid IN (${row.guid});`
      let res = await conn.query(query)
    });
  } catch (err) {
    throw err
  } finally {
    if (conn) conn.release()
    return pool
  }
}

// add all languages that should be available indicated by skills
async function oregon_character_spell_languages(source, dest) {
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  let conn;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query("SELECT * from " + dest + ".character_skills")
    rows.forEach(async function(row) {
      if(mappings.language[row.skill]) {
        let query = "REPLACE INTO " + dest + `.character_spell (guid, spell, active, disabled) VALUES (${row.guid}, ${mappings.language[row.skill]}, 1, 0)`
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

// add all equipment spells that should be available indicated by skills
async function oregon_character_spell_equipment(source, dest) {
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  let conn;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query("SELECT * from " + dest + ".character_skills")
    rows.forEach(async function(row) {
      if(mappings.equipment[row.skill]) {
        let query = "REPLACE INTO " + dest + `.character_spell (guid, spell, active, disabled) VALUES (${row.guid}, ${mappings.equipment[row.skill]}, 1, 0)`
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

// convert cmangos pet action identifiers to oregon format
async function oregon_character_pet_abdata(source, dest) {
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  let conn;
  try {
    conn = await pool.getConnection();
    // fix character_pet abdata values
    let res = await conn.query(`UPDATE ${dest}.pet_spell SET active=33024 WHERE active IN (193);`)

    // fix character_pet abdata values
    let rows = await conn.query("SELECT id, abdata from " + dest + ".character_pet")
    rows.forEach(async function(row) {
      let abdata = row.abdata
      abdata = abdata.replace(/7 2 7 1 7 0/g, "1792 2 1792 1 1792 0") // attack/follow/stay identifier
      abdata = abdata.replace(/6 2 6 1 6 0/g, "1536 2 1536 1 1536 0") // aggressive/defensive/passive identifier
      abdata = abdata.replace(/ 193 /g, " 33024 ") // actionbar identifier
      let res = await conn.query(`UPDATE ${dest}.character_pet SET abdata='${abdata}' WHERE id IN (${row.id});`)
    });
  } catch (err) {
    throw err
  } finally {
    if (conn) conn.release()
    return pool
  }
}

let migrations = {}
migrations["cmangos-to-oregon-characters"] = {
  // TODO: 'guild_bank_eventlog': { rename: { 'EventType': 'LogEntry'}},
  //    Duplicate entry '3-0' for key 'PRIMARY'
  //    sql: INSERT INTO characters.guild_bank_eventlog (guildid,LogGuid,TabId,LogEntry,PlayerGuid,ItemOrMoney,ItemStackCount,DestTabId,TimeStamp) VALUES (3,0,1,1,21,21885,1,0,1623599399);
  //
  // TODO: 'characters'
  //    Check the ignored values: exploredZones, equipmentCache, ammoId, knownTitles, actionBars
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
  'character_pet': { ignore: { 'xpForNextLoyalty': true }, finalize: { 'abdata': oregon_character_pet_abdata}},
  'character_queststatus': true,
  // 'character_queststatus_monthly'
  'character_reputation': true,
  'character_skills': true,
  'character_social': true,
  'character_spell': { finalize: { 'languages': oregon_character_spell_languages, 'equipment': oregon_character_spell_equipment }},
  'character_spell_cooldown': { rename: { 'SpellId': 'spell', 'ItemId': 'item', 'SpellExpireTime': 'time' }, ignore: { 'Category': true, 'CategoryExpireTime': true } },
  'character_tutorial': true,
  'characters': { ignore: { 'exploredZones': true, 'equipmentCache': true, 'ammoId': true, 'knownTitles': true, 'actionBars': true }, rename: { 'power1': 'powerMana', 'power2': 'powerRage', 'power3': 'powerFocus', 'power4': 'powerEnergy', 'power5': 'powerHappiness' }, finalize: { 'data': oregon_characters_data }},
  // 'creature_respawn'
  // 'event_group_chosen'
  // 'game_event_status'
  // 'gameobject_respawn'
  // 'gm_tickets'
  'guild': { fill: { 'createdate': 0 }},
  //'guild_bank_eventlog': { rename: { 'EventType': 'LogEntry'}}, -- see TODO
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
  'pet_aura': { rename: { 'item_guid': 'item_caster_guid', 'effIndexMask': 'effect_index' }, ignore: { 'basepoints0': true, 'basepoints1': true,  'basepoints2': true, 'periodictime0': true, 'periodictime1': true,  'periodictime2': true, }},
  'pet_spell': true,
  'pet_spell_cooldown': true,
  // 'petition_sign'
  // 'saved_variables'
  // 'world'
  // 'world_state'
}

migrations["cmangos-to-oregon-realmd"] = {
  'account': { fill: { 'locale': 0 }, ignore: { 'gmlevel': true, 'active_realm_id': true }, rename: { 'lockedIp': 'last_ip', 'token': 'token_key' }},
}

let threadcount = 0
let dbcount = 0
let finalize_queue = { }
async function migrate(source, dest, table, modifiers, basetable) {
  console.log("Processing: " + table)
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  if(modifiers.finalize) {
    for (const [name, func] of Object.entries(modifiers.finalize)) {
      console.log(`Adding "${table}.${name}" to finalize queue`)
      finalize_queue[`${table}.${name}`] = func
    }
  }

  let conn;
  try {
    conn = await pool.getConnection();
    let trunc = await conn.query("TRUNCATE " + dest + ".`" + table + "`;");
    let rows = await conn.query("SELECT * from " + source + "." + table)
    rows.forEach(async function(row) {
      let query = "INSERT INTO " + dest + "." + table + " ("
      let first = true

      for (const [key, value] of Object.entries(row)) {
        if ((modifiers.ignore) && (modifiers.ignore[key])) continue
        if(first) {first = false} else {query = query + ","}

        let modkey = key
        if ((modifiers.rename) && (modifiers.rename[key])) {
          modkey = modifiers.rename[key]
        }

        query = query + `${modkey}`
      }

      query = query + ') VALUES ('
      first = true

      for (const [key, value] of Object.entries(row)) {
        if ((modifiers.ignore) && (modifiers.ignore[key])) continue
        if(first) {first = false} else {query = query + ","}

        let escaped = value
        if ((modifiers.fill) && (typeof(modifiers.fill[key]) !== 'undefined')) {
          escaped = modifiers.fill[key]
        }

        if(typeof(escaped) === "string") {
          escaped = "'" + escaped.toString().replace(/'/g, "''") + "'"
        } else if((typeof(escaped) === "object") && (escaped instanceof Date)) {
          escaped = `'${escaped.toISOString().slice(0, 19).replace('T', ' ')}'`
        }

        query = query + `${escaped}`
      }

      query = query + ');'

      if(modifiers.wipe === true){
        query = 'SELECT 1 as val'
      }

      threadcount++
      let res = await conn.query(query).then(() => {
        threadcount--

        // Wait for all write threads to start finalizing
        if ((threadcount === 0) && (dbcount >= Object.keys(basetable).length)){
          for (const [name, func] of Object.entries(finalize_queue)) {
            console.log(`Finalizing: ${name}`)
            func(source, dest).then((pool) => { if(pool) pool.end() })
          }
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

// check for all arguments to exist
if((script === undefined) || (sourceDB === undefined) || (destinationDB === undefined)){
  console.log("USAGE:")
  console.log("  node ccm.js <script> <source> <destination>\n")

  console.log("EXAMPLE:")
  console.log("  node ccm.js cmangos-to-oregon-characters cmangos_chars characters\n")

  console.log(`SCRIPTS:`)
  for (const [key, value] of Object.entries(migrations)) {
    console.log(`  - ${key}`)
  }

  process.exit(1)
} else if (migrations[script] === undefined) {
  console.log(`ERROR: Could not find script: ${script}!\n`)

  console.log(`SCRIPTS:`)
  for (const [key, value] of Object.entries(migrations)) {
    console.log(`  - ${key}`)
  }

  process.exit(1)
} else {
  for (const [key, value] of Object.entries(migrations[script])) {
    migrate(sourceDB, destinationDB, key, value, migrations[script]).then((pool) => { pool.end(); dbcount++ })
  }
}
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
  'character_spell_cooldown': { replace: { 'SpellId': 'spell', 'ItemId': 'item', 'SpellExpireTime': 'time' }, ignore: { 'Category': true, 'CategoryExpireTime': true } },
  'character_tutorial': true,
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
  'pet_aura': { replace: { 'item_guid': 'item_caster_guid', 'effIndexMask': 'effect_index' }, ignore: { 'basepoints0': true, 'basepoints1': true,  'basepoints2': true, 'periodictime0': true, 'periodictime1': true,  'periodictime2': true, }},
  'pet_spell': true,
  'pet_spell_cooldown': true,
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

const modelmap = {
  // 'race gender': model
  '1 0': 49, // human (m)
  '1 1': 50, // human (w)
  '2 0': 51, // orc (m)
  '2 1': 52, // orc (w)
  '3 0': 53, // dwarf (m)
  '3 1': 54, // dwarf (w)
  '4 0': 55, // nelf (m)
  '4 1': 56, // nelf (w)
  '5 0': 57, // undead (m)
  '5 1': 58, // undead (w)
  '6 0': 59, // taure (m)
  '6 1': 60, // taure (w)
  '8 0': 1478, // troll (m)
  '8 1': 1479, // troll (w)
  '7 0': 1563, // gnome (m)
  '7 1': 1564, // gnome (w)
  '10 0': 15476, // belf (m)
  '10 1': 15475, // belf (w)
  '11 0': 16125, // draenei (m)
  '11 1': 16126, // drawnei (w)
}

const bitmasks = {
  // 'race class gender': mask
  '1 1 0': 16777473, '1 1 1': 16843009, '1 2 0': 513, '1 2 1': 66049, '1 4 0': 50332673, '1 4 1': 50398209, '1 5 0': 1281, '1 5 1': 66817, '1 8 0': 2049, '1 8 1': 67585, '1 9 0': 2305, '1 9 1': 67841,
  '2 1 0': 16777474, '2 1 1': 16843010, '2 3 0': 770, '2 3 1': 66306, '2 4 0': 50332674, '2 4 1': 50398210, '2 7 0': 1794, '2 7 1': 67330, '2 9 0': 2306, '2 9 1': 67842,
  '3 1 0': 16777475, '3 1 1': 16843011, '3 2 0': 515, '3 2 1': 66051, '3 3 0': 771, '3 3 1': 66307, '3 4 0': 50332675, '3 4 1': 50398211, '3 5 0': 1283, '3 5 1': 66819,
  '4 1 0': 16777476, '4 1 1': 16843012, '4 3 0': 772, '4 3 1': 66308, '4 4 0': 50332676, '4 4 1': 50398212, '4 5 0': 1284, '4 5 1': 66820, '4 11 0': 2820, '4 11 1': 68356,
  '5 1 0': 16777477, '5 1 1': 16843013, '5 4 0': 50332677, '5 4 1': 50398213, '5 5 0': 1285, '5 5 1': 66821, '5 8 0': 2053, '5 8 1': 67589, '5 9 0': 2309, '5 9 1': 67845,
  '6 1 0': 16777478, '6 1 1': 16843014, '6 3 0': 774, '6 3 1': 66310, '6 7 0': 1798, '6 7 1': 67334, '6 11 0': 2822, '6 11 1': 68358,
  '7 1 0': 16777479, '7 1 1': 16843015, '7 4 0': 50332679, '7 4 1': 50398215, '7 8 0': 2055, '7 8 1': 67591, '7 9 0': 2311, '7 9 1': 67847,
  '8 1 0': 16777480, '8 1 1': 16843016, '8 3 0': 776, '8 3 1': 66312, '8 4 0': 50332680, '8 4 1': 50398216, '8 5 0': 1288, '8 5 1': 66824, '8 7 0': 1800, '8 7 1': 67336, '8 8 0': 2056, '8 8 1': 67592,
  '10 2 0': 522, '10 2 1': 66058, '10 3 0': 778, '10 3 1': 66314, '10 4 0': 50332682, '10 4 1': 50398218, '10 5 0': 1290, '10 5 1': 66826, '10 8 0': 2058, '10 8 1': 67594, '10 9 0': 2314, '10 9 1': 67850,
  '11 1 0': 16777483, '11 1 1': 16843019, '11 2 0': 523, '11 2 1': 66059, '11 3 0': 779, '11 3 1': 66315, '11 5 0': 1291, '11 5 1': 66827, '11 7 0': 1803, '11 7 1': 67339, '11 8 0': 2059, '11 8 1': 67595,
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

async function guessdata(oregon) {
  console.log("Guess character data fields")
  const pool = mariadb.createPool({host: mysql_host, user: mysql_user, password: mysql_pass, connectionLimit: 50});

  let conn;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query("SELECT * from " + oregon + ".characters")
    rows.forEach(async function(row) {
      let bitmask = bitmasks[`${row.race} ${row.class} ${row.gender}`]
      let model = modelmap[`${row.race} ${row.gender}`]
      let estimate = `${row.guid} 0 25 0 1065353216 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${row.health} ${row.powerMana} ${row.powerRage} ${row.powerFocus} ${row.powerEnergy} ${row.powerHappiness} ${row.health} 0 1000 0 100 0 ${row.level} ${row.race} ${bitmask}${"".padStart(115*2," 0")} ${model} ${model}${"".padStart(85*2," 0")} ${row.playerBytes} ${row.playerBytes2}${"".padStart(1351*2," 0")}`
      let query = `UPDATE ${oregon}.characters SET data='${estimate}' WHERE guid IN (${row.guid});`
      let res = await conn.query(query)
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

        // Wait for all write threads to finish
        if ((threadcount === 0) && (dbcount >= Object.keys(characters).length)){
          // Add Language Spells for each matching Skill
          fixlang(oregon_characters).then((pool) => { pool.end() })

          // Add guessed data fields
          guessdata(oregon_characters).then((pool) => { pool.end() })
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
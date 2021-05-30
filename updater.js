const fetch = require("node-fetch")
const jsdom = require("jsdom")
const {promises: {readFile}} = require("fs");

teamsArr = ["GRVA", "GRVB", "HEMP", "CEDR", "FRSS", "MRVN", "STCB", "STCA", "HOLL", "HEND", "CARV", "MRGT", "MHTA", "MHTB"]
PATeams = Object.assign(...teamsArr.map(k => ({
  [k]: "0 - 0"
})));

function getCol(tr, col) {
  return tr.querySelector("td:nth-of-type(" + col + ")").textContent
}

function getTeamCode(tr) {
  return getCol(tr, 1).substring(1, 5)
}

function getRound(tr) {
  return parseInt(getCol(tr, 2), 10)
}

function gameExists(tr) {
  return getCol(tr, 3) != ""
}

function getGameLine(tr) {
  const result = getCol(tr, 10);
  if (result == "W") {
    return `**${getCol(tr, 1)}** (${getCol(tr, 11)}) | ${getCol(tr, 9)} | ${getCol(tr, 7)}`
  } else if (result == "L") {
    return `${getCol(tr, 1)} (${getCol(tr, 11)}) | ${getCol(tr, 9)} | **${getCol(tr, 7)}**`
  }
  return `${getCol(tr, 1)} (${getCol(tr, 11) || PATeams[getTeamCode(tr)]}) | ${getCol(tr, 9)} | ${getCol(tr, 7)} *${getCol(tr, 8)}*`
}

function getRatio(record) {
  const a = record.split(" - ").map(x => +x)
  return a[0] / (a[1] || 0.01)
}

function recordSort(a, b) {
  return getRatio(b[1]) - getRatio(a[1])
}

function report(doc, round) {
  let hasResult = [];
  let noResult = [];
  for (const tr of doc.querySelectorAll("[id='22007228'] tr:nth-of-type(n+5)")) {
    if (!gameExists(tr)) {
      const teamCode = getTeamCode(tr)
      const _round = getRound(tr)
      if (teamCode in PATeams && round == _round) {
        hasResult.push([`${getCol(tr, 1)} (${PATeams[teamCode]}) BYE/UNKNOWN`, PATeams[teamCode]])
      }
      continue;
    }
    const teamCode = getTeamCode(tr)
    const _round = getRound(tr)
    if (teamCode in PATeams && _round <= round) {
      const record = getCol(tr, 11)
      if (record != "") {
        PATeams[teamCode] = record
      }
      if (_round == round) {
        const result = getCol(tr, 10);
        if (result == "W" || result == "L") {
          hasResult.push([getGameLine(tr), PATeams[teamCode]])
        } else {
          noResult.push([getGameLine(tr), PATeams[teamCode]])
        }
      }
    }
  }
  hasResult.sort(recordSort)
  noResult.sort(recordSort)
  console.log(`__**Round ${round} Report**__\n${hasResult.map(s => s[0]).join("\n")}\n\n${noResult.map(s => s[0]).join("\n")}`)
}

// fetch('https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vTG1s39VOnDq6QHtxj-MVTV5nSHJEvMOsASmjjo4r4YKJhLbohCRfKQn_XJoRRCWwn7YLpW2q3D8Kue/pubhtml').then(function (response) {
//   // The API call was successful!
//   return response.text();
// }).then(function (html) {

//   // Convert the HTML string into a document object
//   var doc = new jsdom.JSDOM(html).window.document;

//   // Get the image file
//   console.log(report(doc, 1))

// }).catch(function (err) {
//   // There was an error
//   console.warn('Something went wrong.', err);
// });

readFile('saved.html').then(function (fileBuffer) {
  // Convert the HTML string into a document object
  var doc = new jsdom.JSDOM(fileBuffer.toString()).window.document;

  // Get the image file
  console.log(report(doc, 1))
  console.log(report(doc, 2))
  console.log(report(doc, 3))
  console.log(report(doc, 4))
  console.log(report(doc, 5))
  console.log(report(doc, 6))
  console.log(report(doc, 7))
  console.log(report(doc, 8))
  console.log(report(doc, 9))
  console.log(report(doc, 10))
}).catch(function (err) {
  // There was an error
  console.warn('Something went wrong.', err);
});
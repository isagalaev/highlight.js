/* eslint-disable no-undefined */

const { RegExpParser } = require('regexpp');

/**
 * @typedef {import("regexpp/ast").Pattern} Pattern
 * @typedef {import("regexpp/ast").Flags} Flags
 * @typedef {{ pattern: Pattern, flags: Flags }} LiteralAST
 */

const parser = new RegExpParser({ strict: false, ecmaVersion: 2018 });
// ecmaVersion 2018 is ECMAScript 9

/** @type {Map<string, LiteralAST>} */
const astCache = new Map();

// exclude our common "match anything" matchers
function matchAny(re) {
  return re.source === "\\B|\\b";
}

function regexFor(mode, { context, depth }) {
  if (mode.analyzed) return [];
  mode.analyzed = true;

  let list = [];
  if (mode.beginRe && !matchAny(mode.beginRe)) list.push({ path: `${context}/begin`, re: mode.beginRe });
  if (mode.endRe && !matchAny(mode.endRe)) list.push({ path: `${context}/end`, re: mode.endRe });
  if (mode.illegalRe) list.push({ path: `${context}/illegal`, re: mode.illegalRe });
  if (mode.keywordPatternRe && mode.keywordPatternRe.source !== "\\w+") {
    list.push({ path: `${context}/$keyword_pattern`, re: mode.keywordPatternRe });
  }
  if (mode.contains.length) {
    mode.contains.forEach((mode, i) => {
      const nodeName = `[${i}]${mode.className || ""}`;
      const modes = regexFor(mode, { context: `${context}/${nodeName}`, depth: depth + 1 });
      list = [...list, ...modes];
    });
  }
  if (mode.starts) {
    const nodeName = "$starts";
    const modes = regexFor(mode.starts, { context: `${context}/${nodeName}`, depth: depth + 1 });
    list = [...list, ...modes];
  }
  return list;
}

/**
 * Performs a breadth-first search on the given start element.
 *
 * @param {any} start
 * @param {(path: { key: string, value: any }[]) => void} callback
 */
const BFS = (start, callback) => {
  const visited = new Set();
  /** @type {{ key: string, value: any }[][]} */
  let toVisit = [
    [{ key: null, value: start }]
  ];

  callback(toVisit[0]);

  while (toVisit.length > 0) {
    /** @type {{ key: string, value: any }[][]} */
    const newToVisit = [];

    for (const path of toVisit) {
      const obj = path[path.length - 1].value;
      if (!visited.has(obj)) {
        visited.add(obj);

        for (const key in obj) {
          const value = obj[key];

          path.push({ key, value });
          callback(path);

          if (Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]') {
            newToVisit.push([...path]);
          }

          path.pop();
        }
      }
    }

    toVisit = newToVisit;
  }
};

/**
 * Returns the AST of a given pattern.
 *
 * @param {RegExp} regex
 * @returns {LiteralAST}
 */
const parseRegex = (regex) => {
  const key = regex.toString();
  let literal = astCache.get(key);
  if (literal === undefined) {
    const flags = parser.parseFlags(regex.flags, undefined);
    const pattern = parser.parsePattern(regex.source, undefined, undefined, flags.unicode);
    literal = { pattern, flags };
    astCache.set(key, literal);
  }
  return literal;
};

module.exports = { BFS, regexFor, parseRegex };

/*
Language: YAML
Description: Yet Another Markdown Language
Author: Stefan Wienert <stwienert@gmail.com>
Contributors: Carl Baxter <carl@cbax.tech>
Requires: ruby.js
Website: https://yaml.org
Category: common, config
*/
export default function(hljs) {
  var LITERALS = 'true false yes no null';

  // YAML spec allows non-reserved URI characters in tags.
  var URI_CHARACTERS = '[\\w#;/?:@&=+$,.~*\\\'()[\\]]+'

  // Define keys as starting with a word character
  // ...containing word chars, spaces, colons, forward-slashes, hyphens and periods
  // ...and ending with a colon followed immediately by a space, tab or newline.
  // The YAML spec allows for much more than this, but this covers most use-cases.
  var KEY = {
    className: 'attr',
    variants: [
      { begin: '\\w[\\w :\\/.-]*:(?=[ \t]|$)' },
      { begin: '"\\w[\\w :\\/.-]*":(?=[ \t]|$)' }, //double quoted keys
      { begin: '\'\\w[\\w :\\/.-]*\':(?=[ \t]|$)' } //single quoted keys
    ]
  };

  var TEMPLATE_VARIABLES = {
    className: 'template-variable',
    variants: [
      { begin: '\{\{', end: '\}\}' }, // jinja templates Ansible
      { begin: '%\{', end: '\}' } // Ruby i18n
    ]
  };
  var STRING = {
    className: 'string',
    relevance: 0,
    variants: [
      {begin: /'/, end: /'/},
      {begin: /"/, end: /"/},
      {begin: /\S+/}
    ],
    contains: [
      hljs.BACKSLASH_ESCAPE,
      TEMPLATE_VARIABLES
    ]
  };

  // Strings inside objects can't start with { or } or [ or ] or ,
  // and can't end with } or ] or ,
  var INSIDE_OBJECT_STRING = {
    className: 'string',
    relevance: 0,
    variants: [
      {begin: /'/, end: /'/},
      {begin: /"/, end: /"/},
      {begin: /[^\s,{}[\]](\S*[^\s,\]}])?/}
    ],
    contains: [
      hljs.BACKSLASH_ESCAPE,
      TEMPLATE_VARIABLES
    ]
  };

  var DATE_RE = '[0-9]{4}(-[0-9][0-9]){0,2}';
  var TIME_RE = '([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?';
  var FRACTION_RE = '(\\.[0-9]*)?';
  var ZONE_RE = '([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?';
  var TIMESTAMP = {
    className: 'number',
    begin: '\\b' + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + '\\b',
  }

  var TYPES = [
    KEY,
    {
      className: 'meta',
      begin: '^---\s*$',
      relevance: 10
    },
    { // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: 'string',
      begin: '[\\|>]([0-9]?[+-])?[ ]*\\n( *)[\\S ]+\\n(\\2[\\S ]+\\n?)*',
    },
    { // Ruby/Rails erb
      begin: '<%[%=-]?', end: '[%-]?%>',
      subLanguage: 'ruby',
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0
    },
    { // named tags
      className: 'type',
      begin: '!\\w+!' + URI_CHARACTERS,
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    { // verbatim tags
      className: 'type',
      begin: '!<' + URI_CHARACTERS + ">",
    },
    { // primary tags
      className: 'type',
      begin: '!' + URI_CHARACTERS,
    },
    { // secondary tags
      className: 'type',
      begin: '!!' + URI_CHARACTERS,
    },
    { // fragment id &ref
      className: 'meta',
      begin: '&' + hljs.UNDERSCORE_IDENT_RE + '$',
    },
    { // fragment reference *ref
      className: 'meta',
      begin: '\\*' + hljs.UNDERSCORE_IDENT_RE + '$'
    },
    { // array listing
      className: 'bullet',
    // TODO: remove |$ hack when we have proper look-ahead support
    begin: '\\-(?=[ ]|$)',
      relevance: 0
    },
    hljs.HASH_COMMENT_MODE,
    {
      beginKeywords: LITERALS,
      keywords: {literal: LITERALS}
    },
    TIMESTAMP,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: 'number',
      begin: hljs.C_NUMBER_RE + '\\b'
    },
  ];
  var VALUE_CONTAINER = {
    end: ',', excludeEnd: true,
    contains: TYPES.concat([INSIDE_OBJECT_STRING]),
    keywords: LITERALS,
    relevance: 0
  };
  var OBJECT = {
    begin: '{', end: '}',
    contains: [VALUE_CONTAINER],
    illegal: '\\n',
    relevance: 0
  };
  var ARRAY = {
    begin: '\\[', end: '\\]',
    contains: [VALUE_CONTAINER],
    illegal: '\\n',
    relevance: 0
  };
  TYPES.push(OBJECT, ARRAY);
  return {
    name: 'YAML',
    case_insensitive: true,
    aliases: ['yml', 'YAML'],
    contains: TYPES.concat([STRING]),
  };
}

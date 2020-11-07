/*
Language: JavaScript
Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
Category: common, scripting
Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
*/

import * as ECMAScript from './lib/ecmascript.js';
import * as regex from '../lib/regex.js';

/** @type LanguageFn */
export default function(hljs) {
  /**
   * Takes a string like "<Booger" and checks to see
   * if we can find a matching "</Booger" later in the
   * content.
   * @param {RegExpMatchArray} match
   * @param {{after:number}} param1
   */
  const hasClosingTag = (match, { after }) => {
    const tag = match[0].replace("<", "</");
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };

  const OPERATORS = [
    "++",
    "--",
    "+",
    "-",
    "/",
    "+=",
    "-=",
    "!==",
    "!=",
    "===",
    "==",
    "=",
    "&&",
    "||",
    "&",
    "|",
    "?=",
    ">=",
    // ">",
    "<=",
    // "<",
    "?",
    ":"
  ];
  const IDENT_RE = ECMAScript.IDENT_RE;
  const OPERATOR = {
    className: "operator",
    relevance: 0,
    begin: regex.either(...OPERATORS.map(x => regex.escape(x)))
  };
  const FRAGMENT = {
    begin: '<>',
    end: '</>'
  };
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      // nested type?
      // HTML should not include another raw `<` inside a tag
      // But a type might: `<Array<Array<number>>`, etc.
      if (nextChar === "<") {
        response.ignoreMatch();
        return;
      }
      // <something>
      // This is now either a tag or a type.
      if (nextChar === ">") {
        // if we cannot find a matching closing tag, then we
        // will ignore it
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
    }
  };
  const KEYWORDS = {
    $pattern: ECMAScript.IDENT_RE,
    keyword: ECMAScript.KEYWORDS.join(" "),
    literal: ECMAScript.LITERALS.join(" "),
    built_in: ECMAScript.BUILT_INS.join(" ")
  };

  // https://tc39.es/ecma262/#sec-literals-numeric-literals
  const decimalDigits = '[0-9](_?[0-9])*';
  const frac = `\\.(${decimalDigits})`;
  // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
  // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: 'number',
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
        `[eE][+-]?(${decimalDigits})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" },
    ],
    relevance: 0
  };

  const SUBST = {
    className: 'subst',
    begin: '\\$\\{',
    end: '\\}',
    keywords: KEYWORDS,
    contains: [] // defined later
  };
  const HTML_TEMPLATE = {
    begin: 'html`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'xml'
    }
  };
  const CSS_TEMPLATE = {
    begin: 'css`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'css'
    }
  };
  const TEMPLATE_STRING = {
    className: 'string',
    begin: '`',
    end: '`',
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    '/\\*\\*',
    '\\*/',
    {
      relevance: 0,
      contains: [
        {
          className: 'doctag',
          begin: '@[A-Za-z]+',
          contains: [
            {
              className: 'type',
              begin: '\\{',
              end: '\\}',
              relevance: 0
            },
            {
              className: 'variable',
              begin: IDENT_RE + '(?=\\s*(-)|$)',
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    TEMPLATE_STRING,
    NUMBER,
    hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS
    .concat({
      // we need to pair up {} inside our subst to prevent
      // it from ending too early by matching another }
      begin: /\{/,
      end: /\}/,
      keywords: KEYWORDS,
      contains: [
        "self"
      ].concat(SUBST_INTERNALS)
    });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /\(/,
      end: /\)/,
      keywords: KEYWORDS,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: 'params',
    begin: /\(/,
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS,
    contains: PARAMS_CONTAINS
  };
  // we need to remove the `{` rule so we have our own copy of this vs using the one in MODES
  const RE_STARTERS_RE = '!==|!=|!|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';
  const VALUE_CONTAINS = [
    COMMENT,
    hljs.REGEXP_MODE,
    {
      className: 'function',
      // we have to count the parens to make sure we actually have the
      // correct bounding ( ) before the =>.  There could be any number of
      // sub-expressions inside also surrounded by parens.
      begin: '(\\(' +
            '[^()]*(\\(' +
            '[^()]*(\\(' +
            '[^()]*' +
            '\\))*[^()]*' +
            '\\))*[^()]*' +
            '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>',
      returnBegin: true,
      end: '\\s*=>',
      contains: [
        {
          className: 'params',
          variants: [
            {
              begin: hljs.UNDERSCORE_IDENT_RE
            },
            {
              className: null,
              begin: /\(\s*\)/,
              skip: true
            },
            {
              begin: /\(/,
              end: /\)/,
              excludeBegin: true,
              excludeEnd: true,
              keywords: KEYWORDS,
              contains: PARAMS_CONTAINS
            }
          ]
        }
      ]
    },
    { // could be a comma delimited list of params to a function call
      begin: /,/, relevance: 0
    },
    {
      className: '',
      begin: /\s/,
      end: /\s*/,
      skip: true
    },
    { // JSX
      variants: [
        { begin: FRAGMENT.begin, end: FRAGMENT.end },
        {
          begin: XML_TAG.begin,
          // we carefully check the opening tag to see if it truly
          // is a tag and not a false positive
          'on:begin': XML_TAG.isTrulyOpeningTag,
          end: XML_TAG.end
        }
      ],
      subLanguage: 'xml',
      contains: [
        {
          begin: XML_TAG.begin,
          end: XML_TAG.end,
          skip: true,
          contains: ['self']
        }
      ]
    }
  ];

  return {
    name: 'Javascript',
    aliases: ['js', 'jsx', 'mjs', 'cjs'],
    keywords: KEYWORDS,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS },
    illegal: /#(?![$_A-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      {
        label: "use_strict",
        className: 'meta',
        relevance: 10,
        begin: /^\s*['"]use (strict|asm)['"]/
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      NUMBER,
      { // object attr container
        begin: regex.concat(/[{,\n]\s*/,
          // we need to look ahead to make sure that we actually have an
          // attribute coming up so we don't steal a comma from a potential
          // "value" container
          //
          // NOTE: this might not work how you think.  We don't actually always
          // enter this mode and stay.  Instead it might merely match `,
          // <comments up next>` and then immediately end after the , because it
          // fails to find any actual attrs. But this still does the job because
          // it prevents the value contain rule from grabbing this instead and
          // prevening this rule from firing when we actually DO have keys.
          regex.lookahead(regex.concat(
            // we also need to allow for multiple possible comments inbetween
            // the first key:value pairing
            /(\/\/.*$)*/,
            /(\/\*(.|\n)*\*\/)*/,
            /\s*/,
            IDENT_RE + '\\s*:'))),
        relevance: 0,
        contains: [
          {
            className: 'attr',
            begin: IDENT_RE + regex.lookahead('\\s*:'),
            relevance: 0,
            starts:
              {
                contains: [{begin:'\\s*:',}]
              }
          }
        ]
      },
      {
        begin: /--|\+\+/,
        className: "operator",
        relevance: 0
      },
      { // "value" container
        begin: '(' + RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: {
          $pattern: regex.either("case", "return", "throw", ...OPERATORS.map(x => regex.escape(x))),
          keyword: 'return throw case',
          operator: OPERATORS.map(x => `${x}|0`).join(" ") // 0 relevance
        },
        relevance: 0,
        contains: VALUE_CONTAINS
      },
      {
        className: 'function',
        beginKeywords: 'function',
        end: /[{;]/,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE }),
          PARAMS
        ],
        illegal: /%/
      },
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        className: 'function',
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: hljs.UNDERSCORE_IDENT_RE +
          '\\(' + // first parens
          '[^()]*(\\(' +
            '[^()]*(\\(' +
              '[^()]*' +
            '\\))*[^()]*' +
          '\\))*[^()]*' +
          '\\)\\s*\\{', // end parens
        returnBegin:true,
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE }),
        ]
      },
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        variants: [
          { begin: '\\.' + IDENT_RE },
          { begin: '\\$' + IDENT_RE }
        ],
        relevance: 0
      },
      { // ES6 class
        className: 'class',
        beginKeywords: 'class',
        end: /[{;=]/,
        excludeEnd: true,
        illegal: /[:"[\]]/,
        contains: [
          { beginKeywords: 'extends' },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        begin: /\b(?=constructor)/,
        end: /[{;]/,
        excludeEnd: true,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE }),
          'self',
          PARAMS
        ]
      },
      {
        begin: '(get|set)\\s+(?=' + IDENT_RE + '\\()',
        end: /\{/,
        keywords: "get set",
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE }),
          { begin: /\(\)/ }, // eat to avoid empty params
          PARAMS
        ]
      },
      {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}

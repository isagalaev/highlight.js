/*
Language: ILE RPG IV (total-free)
Author: Kerim Güney <kerim.gueney@taskforce-it.de>
Description: RPG is a modern proprietary high-level programming language (HLL) for business applications, popular on the IBM i operating system on IBM Power Systems hardware. The current version is RPG IV, a.k.a. ILE RPG.
Category: enterprise
*/

export default function (hljs) {
  const TYPES = [
    "zoned",
    "packed",
    "bindec",
    "int",
    "float",
    "char",
    "varchar",
    "graph",
    "vargraph",
  ];
  const RESERVED_WORDS = [
    "dcl-s",
    "dcl-pi",
    "dcl-ds",
    "end-ds",
    "dcl-proc",
    "end-proc",
    "dcl-pr",
    "end-pr",
    "UDATE",
    "*DATE",
    "UMONTH",
    "*MONTH",
    "UYEAR",
    "*YEAR",
    "UDAY",
    "*DAY",
    "PAGE",
    "PAGE1",
    "PAGE2",
    "PAGE3",
    "PAGE4",
    "PAGE5",
    "PAGE6",
    "*END",
    "*START",
    "*IN",
    "*IN01",
    "*IN02",
    "*IN03",
    "*IN04",
    "*IN05",
    "*IN06",
    "*IN07",
    "*IN08",
    "*IN09",
    "*IN10",
    "*IN11",
    "*IN12",
    "*IN13",
    "*IN14",
    "*IN15",
    "*IN16",
    "*IN17",
    "*IN18",
    "*IN19",
    "*IN20",
    "*IN21",
    "*IN22",
    "*IN23",
    "*IN24",
    "*IN25",
    "*IN26",
    "*IN27",
    "*IN28",
    "*IN29",
    "*IN30",
    "*IN31",
    "*IN32",
    "*IN33",
    "*IN34",
    "*IN35",
    "*IN36",
    "*IN37",
    "*IN38",
    "*IN39",
    "*IN40",
    "*IN41",
    "*IN42",
    "*IN43",
    "*IN44",
    "*IN45",
    "*IN46",
    "*IN47",
    "*IN48",
    "*IN49",
    "*IN50",
    "*IN51",
    "*IN52",
    "*IN53",
    "*IN54",
    "*IN55",
    "*IN56",
    "*IN57",
    "*IN58",
    "*IN59",
    "*IN60",
    "*IN61",
    "*IN62",
    "*IN63",
    "*IN64",
    "*IN65",
    "*IN66",
    "*IN67",
    "*IN68",
    "*IN69",
    "*IN70",
    "*IN71",
    "*IN72",
    "*IN73",
    "*IN74",
    "*IN75",
    "*IN76",
    "*IN77",
    "*IN78",
    "*IN79",
    "*IN80",
    "*IN81",
    "*IN82",
    "*IN83",
    "*IN84",
    "*IN85",
    "*IN86",
    "*IN87",
    "*IN88",
    "*IN89",
    "*IN90",
    "*IN91",
    "*IN92",
    "*IN93",
    "*IN94",
    "*IN95",
    "*IN96",
    "*IN97",
    "*IN98",
    "*IN99",
    "*CDMY",
    "*CMDY",
    "*CYMD",
    "*DMY",
    "*EUR",
    "*HMS",
    "*ISO",
    "*JIS",
    "*JOB",
    "*JOBRUN",
    "*JUL",
    "*LONGJUL",
    "*MDY",
    "*SYS",
    "*USA",
    "*YMD",
    "*ALTSEQ",
    "*EQUATE",
    "*FILE",
    "*FTRANS",
    "*PLACE",
    "*ALL",
    "AND",
    "NOT",
    "OR",
    "*NOPASS",
    "*OMIT",
    "*RIGHTADJ",
    "*STRING",
    "*TRIM",
    "*VARSIZE",
    "**FREE",
  ];

  const BUILT_INS = [
    "%ABS",
    "%ADDR",
    "%ALLOC",
    "%BITAND",
    "%BITNOT",
    "%BITOR",
    "%BITXOR",
    "%CHAR",
    "%CHECK",
    "%CHECKR",
    "%DATA",
    "%DATE",
    "%DAYS",
    "%DEC",
    "%DECH",
    "%DECPOS",
    "%DIFF",
    "%DIV",
    "%EDITC",
    "%EDITFLT",
    "%EDITW",
    "%ELEM",
    "%EOF",
    "%EQUAL",
    "%ERROR",
    "%FIELDS",
    "%FLOAT",
    "%FOUND",
    "%GRAPH",
    "%HANDLER",
    "%HOURS",
    "%INT",
    "%INTH",
    "%KDS",
    "%LEN",
    "%LOOKUPxx",
    "%MAX",
    "%MIN",
    "%MINUTES",
    "%MONTHS",
    "%MSECONDS",
    "%NULLIND",
    "%OCCUR",
    "%OPEN",
    "%PADDR",
    "%PARMS",
    "%PARMNUM",
    "%PARSER",
    "%PROC",
    "%REALLOC",
    "%REM",
    "%REPLACE",
    "%SCAN",
    "%SCANR",
    "%SCANRPL",
    "%SECONDS",
    "%SHTDN",
    "%SIZE",
    "%SQRT",
    "%STATUS",
    "%STR",
    "%SUBARR",
    "%SUBDT",
    "%SUBST",
    "%THIS",
    "%TIME",
    "%TIMESTAMP",
    "%TLOOKUPxx",
    "%TRIM",
    "%TRIML",
    "%TRIMR",
    "%UCS2",
    "%UNS",
    "%UNSH",
    "%XFOOT",
    "%XLATE",
    "%XML",
    "%YEARS",
  ];

  const LITERALS = [
    "*BLANK",
    "*BLANKS",
    "*ZERO",
    "*ZEROS",
    "*HIVAL",
    "*LOVAL",
    "*NULL",
    "*ON",
    "*OFF",
    "*ALLX'x1..'",
    "*ALLG'oK1K2i'",
    "*ALL'X..'",
  ];

  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      { begin: hljs.BINARY_NUMBER_RE + "[lLjJ]?" },
      { begin: "\\b(0o[0-7]+)[lLjJ]?" },
      { begin: hljs.C_NUMBER_RE + "[lLjJ]?" },
    ],
  };

  return {
    name: "RPG IV",
    aliases: ["sqlrpgle", "rpgle"],
    case_insensitive: true,
    keywords: {
      $pattern: /(\*\*|\*|dcl-|end-|)\w+/,
      keyword: [...RESERVED_WORDS, ...TYPES].join(" "),
      literal: LITERALS.join(" "),
    },
    contains: [
      hljs.APOS_STRING_MODE,
      hljs.NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "built_in",
        variants: [
          {
            begin: /%\w+/,
          },
        ],
      },
      {
        className: "params",
        variants: [
          {
            begin: /\(/,
            end: /\)/,
          },
        ],
      },

      // {
      //   className: "keyword",
      //   variants: [
      //     {
      //       begin: /[*]+/,
      //       end: /[;$\s]/,
      //     },
      //     {
      //       begin: /%.*/,
      //       end: /[(;\s$]/,
      //     },
      //     {
      //       begin: /dcl-.*/,
      //       end: /\s/,
      //     },
      //   ],
      // },
    ],
    // contains: [
    //   NUMBER,
    //   STRING,
    //   hljs.C_LINE_COMMENT_MODE,
    //   hljs.C_BLOCK_COMMENT_MODE,
    //   {
    //     variants: [{ className: "function", beginKeywords: "dcl-proc" }],
    //     end: /;/,
    //   },
    //   {
    //     className: "meta",
    //     begin: /^[\t ]*@/,
    //     end: /$/,
    //   },
    //   {
    //     begin: /\b(print|exec)\(/, // don’t highlight keywords-turned-functions in Python 3
    //   },
    // ],
  };
}

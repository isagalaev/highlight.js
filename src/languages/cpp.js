/*
Language: C++
Category: common, system
Website: https://isocpp.org
*/

import * as regex from '../lib/regex.js';

/** @type LanguageFn */
export default function(hljs) {
  // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
  // not include such support nor can we be sure all the grammars depending
  // on it would desire this behavior
  const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', {
    contains: [
      {
        begin: /\\\n/
      }
    ]
  });
  const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
  const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
  const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
  const FUNCTION_TYPE_RE = '(?!struct)(' +
    DECLTYPE_AUTO_RE + '|' +
    regex.optional(NAMESPACE_RE) +
    '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE) +
  ')';

  // https://en.cppreference.com/w/cpp/language/escape
  // \\ \x \xFF \u2837 \u00323747 \374
  const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
  const STRINGS = {
    className: 'string',
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: '\\n',
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      {
        begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + '|.)',
        end: '\'',
        illegal: '.'
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  };

  const NUMBERS = {
    className: 'number',
    variants: [
      {
        begin: '\\b(0b[01\']+)'
      },
      {
        begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)'
      },
      {
        begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)'
      }
    ],
    relevance: 0
  };

  const PREPROCESSOR = {
    className: 'meta',
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: {
      keyword:
        'if else elif endif define undef warning error line ' +
        'pragma _Pragma ifdef ifndef include'
    },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, {
        className: 'string'
      }),
      {
        className: 'string',
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  const TITLE_MODE = {
    className: 'title',
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };

  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';

  // https://en.cppreference.com/w/cpp/keyword
  const RESERVED_KEYWORDS = [
    'alignas',
    'alignof',
    'and',
    'and_eq',
    'asm',
    'atomic_cancel',
    'atomic_commit',
    'atomic_noexcept',
    'auto',
    'bitand',
    'bitor',
    'break',
    'case',
    'catch',
    'class',
    'co_await',
    'co_return',
    'co_yield',
    'compl',
    'concept',
    'const',
    'const_cast|10',
    'consteval',
    'constexpr',
    'constinit',
    'continue',
    'decltype',
    'default',
    'delete',
    'do',
    'dynamic_cast|10',
    'else',
    'enum',
    'explicit',
    'export',
    'extern',
    'false',
    'final',
    'for',
    'friend',
    'goto',
    'if',
    'import',
    'inline',
    'module',
    'mutable',
    'namespace',
    'new',
    'noexcept',
    'not',
    'not_eq',
    'nullptr',
    'operator',
    'or',
    'or_eq',
    'override',
    'private',
    'protected',
    'public',
    'reflexpr',
    'register',
    'reinterpret_cast|10',
    'requires',
    'return',
    'signed',
    'sizeof',
    'static',
    'static_assert',
    'static_cast|10',
    'struct',
    'switch',
    'synchronized',
    'template',
    'this',
    'thread_local',
    'throw',
    'transaction_safe',
    'transaction_safe_dynamic',
    'true',
    'try',
    'typedef',
    'typeid',
    'typename',
    'union',
    'unsigned',
    'using',
    'virtual',
    'volatile',
    'while',
    'xor',
    'xor_eq,'
  ];

  // https://en.cppreference.com/w/cpp/keyword
  const RESERVED_TYPES = [
    'bool',
    'char',
    'char16_t',
    'char32_t',
    'char8_t',
    'double',
    'float',
    'int',
    'long',
    'short',
    'void',
    'wchar_t'
  ];

  // Additional (not officially reserved) types, used for highlighting.
  const ADDITIONAL_TYPES = [
    'FILE',
    'atomic_bool',
    'atomic_char',
    'atomic_char16_t',
    'atomic_char32_t',
    'atomic_char8_t',
    'atomic_int',
    'atomic_int16_t',
    'atomic_int32_t',
    'atomic_int64_t',
    'atomic_int8_t',
    'atomic_int_fast16_t',
    'atomic_int_fast32_t',
    'atomic_int_fast64_t',
    'atomic_int_fast8_t',
    'atomic_int_least16_t',
    'atomic_int_least32_t',
    'atomic_int_least64_t',
    'atomic_int_least8_t',
    'atomic_intmax_t',
    'atomic_intptr_t',
    'atomic_llong',
    'atomic_long',
    'atomic_ptrdiff_t',
    'atomic_schar',
    'atomic_short',
    'atomic_size_t',
    'atomic_uchar',
    'atomic_uint',
    'atomic_uint16_t',
    'atomic_uint32_t',
    'atomic_uint64_t',
    'atomic_uint8_t',
    'atomic_uint_fast16_t',
    'atomic_uint_fast32_t',
    'atomic_uint_fast64_t',
    'atomic_uint_fast8_t',
    'atomic_uint_least16_t',
    'atomic_uint_least32_t',
    'atomic_uint_least64_t',
    'atomic_uint_least8_t',
    'atomic_uintmax_t',
    'atomic_uintptr_t',
    'atomic_ullong',
    'atomic_ulong',
    'atomic_ushort',
    'atomic_wchar_t',
    'byte',
    'clock_t',
    'fpos_t',
    'int16_t',
    'int32_t',
    'int64_t',
    'int8_t',
    'int_fast16_t',
    'int_fast32_t',
    'int_fast64_t',
    'int_fast8_t',
    'int_least16_t',
    'int_least32_t',
    'int_least64_t',
    'int_least8_t',
    'intmax_t',
    'intptr_t',
    'jmp_buf',
    'max_align_t',
    'mbstate_t',
    'nullptr_t',
    'ptrdiff_t',
    'sig_atomic_t',
    'size_t',
    'streamoff',
    'streamsize',
    'time_t',
    'uint16_t',
    'uint32_t',
    'uint64_t',
    'uint8_t',
    'uint_fast16_t',
    'uint_fast32_t',
    'uint_fast64_t',
    'uint_fast8_t',
    'uint_least16_t',
    'uint_least32_t',
    'uint_least64_t',
    'uint_least8_t',
    'uintmax_t',
    'uintptr_t',
    'va_list',
    'wctrans_t',
    'wctype_t',
    'wint_t'
  ];

  const TYPE_HINTS = [
    'any',
    'auto_ptr',
    'barrier',
    'binary_semaphore',
    'bitset',
    'complex',
    'condition_variable',
    'condition_variable_any',
    'counting_semaphore',
    'deque',
    'false_type',
    'future',
    'imaginary',
    'initializer_list',
    'istringstream',
    'jthread',
    'latch',
    'lock_guard',
    'multimap',
    'multiset',
    'mutex',
    'optional',
    'ostringstream',
    'packaged_task',
    'pair',
    'promise',
    'priority_queue',
    'queue',
    'recursive_mutex',
    'recursive_timed_mutex',
    'scoped_lock',
    'set',
    'shared_future',
    'shared_lock',
    'shared_mutex',
    'shared_timed_mutex',
    'shared_ptr',
    'stack',
    'string_view',
    'stringstream',
    'timed_mutex',
    'thread',
    'true_type',
    'tuple',
    'unique_lock',
    'unique_ptr',
    'unordered_map',
    'unordered_multimap',
    'unordered_multiset',
    'unordered_set',
    'variant',
    'vector',
    'weak_ptr',
    'wstring',
    'wstring_view'
  ];

  const FUNCTION_HINTS = [
    'abort',
    'abs',
    'acos',
    'apply',
    'as_const',
    'asin',
    'atan',
    'atan2',
    'calloc',
    'ceil',
    'cerr',
    'cin',
    'clog',
    'cos',
    'cosh',
    'cout',
    'declval',
    'endl',
    'exchange',
    'exit',
    'exp',
    'fabs',
    'floor',
    'fmod',
    'forward',
    'fprintf',
    'fputs',
    'free',
    'frexp',
    'fscanf',
    'future',
    'invoke',
    'isalnum',
    'isalpha',
    'iscntrl',
    'isdigit',
    'isgraph',
    'islower',
    'isprint',
    'ispunct',
    'isspace',
    'isupper',
    'isxdigit',
    'labs',
    'launder',
    'ldexp',
    'log',
    'log10',
    'make_pair',
    'make_shared',
    'make_shared_for_overwrite',
    'make_tuple',
    'make_unique',
    'malloc',
    'memchr',
    'memcmp',
    'memcpy',
    'memset',
    'modf',
    'move',
    'pow',
    'printf',
    'putchar',
    'puts',
    'realloc',
    'scanf',
    'sin',
    'sinh',
    'snprintf',
    'sprintf',
    'sqrt',
    'sscanf',
    'std',
    'stderr',
    'stdin',
    'stdout',
    'strcat',
    'strchr',
    'strcmp',
    'strcpy',
    'strcspn',
    'strlen',
    'strncat',
    'strncmp',
    'strncpy',
    'strpbrk',
    'strrchr',
    'strspn',
    'strstr',
    'swap',
    'tan',
    'tanh',
    'terminate',
    'to_underlying',
    'tolower',
    'toupper',
    'vfprintf',
    'visit',
    'vprintf',
    'vsprintf'
  ];

  const LITERALS = [
    'NULL',
    'false',
    'nullopt',
    'nullptr',
    'true'
  ];

  // https://en.cppreference.com/w/cpp/keyword
  const BUILT_IN = [
    '_Pragma'
  ];

  const CPP_KEYWORDS = {
    type: [...RESERVED_TYPES, ...ADDITIONAL_TYPES],
    keyword: RESERVED_KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_IN,
    _type_hints: TYPE_HINTS
  };

  const FUNCTION_DISPATCH = {
    className: 'function.dispatch',
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: FUNCTION_HINTS
    },
    begin: regex.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!while)/,
      hljs.IDENT_RE,
      regex.lookahead(/(<[^<>]+>|)\s*\(/))
  };

  const EXPRESSION_CONTAINS = [
    FUNCTION_DISPATCH,
    PREPROCESSOR,
    C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];

  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: 'new throw return else',
        end: /;/
      }
    ],
    keywords: CPP_KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat([ 'self' ]),
        relevance: 0
      }
    ]),
    relevance: 0
  };

  const FUNCTION_DECLARATION = {
    className: 'function',
    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: CPP_KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      { // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: CPP_KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [ TITLE_MODE ],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: true,
        contains: [
          STRINGS,
          NUMBERS
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: 'params',
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: CPP_KEYWORDS,
            relevance: 0,
            contains: [
              'self',
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS
            ]
          }
        ]
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };

  return {
    name: 'C++',
    aliases: [
      'cc',
      'c++',
      'h++',
      'hpp',
      'hh',
      'hxx',
      'cxx'
    ],
    keywords: CPP_KEYWORDS,
    illegal: '</',
    classNameAliases: {
      'function.dispatch': 'built_in'
    },
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      FUNCTION_DISPATCH,
      EXPRESSION_CONTAINS,
      [
        PREPROCESSOR,
        { // containers: ie, `vector <int> rooms (9);`
          begin: '\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function)\\s*<',
          end: '>',
          keywords: CPP_KEYWORDS,
          contains: [ 'self' ]
        },
        {
          begin: hljs.IDENT_RE + '::',
          keywords: CPP_KEYWORDS
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: 'keyword',
            3: 'title.class'
          }
        }
      ])
  };
}

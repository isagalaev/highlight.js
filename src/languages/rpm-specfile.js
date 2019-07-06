/*
Language: rpm-specfile
Description: RPM Specfile
Author: Ryan Lerch <rlerch@redhat.com>
Contributors: Neal Gompa <ngompa13@gmail.com>
Category: config
Requires: bash.js
Website: https://rpm.org/
*/

function(hljs) {
  return {
    aliases: ['rpm', 'spec', 'rpm-spec', 'specfile'],
    contains: [
        hljs.COMMENT('%dnl'),
        hljs.HASH_COMMENT_MODE,
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE,
        {
            className: "type",
            begin:  /^(Name|BuildRequires|Version|Release|Epoch|Summary|Group|License|Packager|Vendor|Icon|URL|Distribution|Prefix|Patch[0-9]*|Source[0-9]*|Requires\(?[a-z]*\)?|[a-z]+Req|Obsoletes|Recommends|Suggests|Supplements|Enhances|Provides|Conflicts|RemovePathPostfixes|Build[a-z]+|[a-z]+Arch|Auto[a-z]+)(:)/,
        },
        {
            className: "keyword",
            begin: /(%)(?:package|prep|generate_buildrequires|sourcelist|patchlist|build|description|install|verifyscript|clean|changelog|check|pre[a-z]*|post[a-z]*|trigger[a-z]*|files)/,
        },
        {
            className: "link",
            begin: /(%)(if|ifarch|ifnarch|ifos|ifnos|elif|elifarch|elifos|else|endif)/,
        },
        {
            className: "link",
            begin: /%\{_/,
            end: /}/,
        },
        {
            className: "symbol",
            begin: /%\{\?/,
            end: /}/,
        },
        {
            className: "link font-weight-bold",
            begin: /%\{/,
            end: /}/,
        },
        {
            className: "link font-weight-bold",
            begin: /%/,
            end: /[ \t\n]/
        },
        {
            className: "symbol font-weight-bold",
            begin: /^\* (Mon|Tue|Wed|Thu|Fri|Sat|Sun)/,
            end: /$/,
        },
    ]
  };
}

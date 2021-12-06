class PLElement {
	constructor(name, regex) {
		this.name = name;
		this.regex = regex;
	}
}

// ================== LEXEMES ======================
var all_pl_elements = [
	new PLElement("A", /^A$/g),
	new PLElement("ALL", /^ALL$/g),
	new PLElement("AN", /^AN$/g),
	new PLElement("ANY", /^ANY$/g),
	new PLElement("BIGGR", /^BIGGR$/g),
	new PLElement("BOTH", /^BOTH$/g),
	new PLElement("DIFF", /^DIFF$/g),
	new PLElement("DIFFRINT", /^DIFFRINT$/g),
	new PLElement("EITHER", /^EITHER$/g),
	new PLElement("GIMMEH", /^GIMMEH$/g),
	new PLElement("GTFO", /^GTFO$/g),
	new PLElement("HAI", /^HAI$/g),
	new PLElement("HAS", /^HAS$/g),
	new PLElement("HOW", /^HOW$/g),
	new PLElement("I", /^I$/g),
	new PLElement("IM", /^IM$/g),
	new PLElement("IN", /^IN$/g),
	new PLElement("ITZ", /^ITZ$/g),
	new PLElement("IZ", /^IZ$/g),
	new PLElement("IS", /^IS$/g),
	new PLElement("KTHXBYE", /^KTHXBYE$/g),
	new PLElement("MAEK", /^MAEK$/g),
	new PLElement("MKAY", /^MKAY$/g),
	new PLElement("MOD", /^MOD$/g),
	new PLElement("NERFIN", /^NERFIN$/g),
	new PLElement("NO", /^NO$/g),
	new PLElement("NOOB", /^NOOB$/g),
	new PLElement("NOT", /^NOT$/g),
	new PLElement("NOW", /^NOW$/g),
	new PLElement("NUMBR", /^-?[0-9]+$/g),
	new PLElement("NUMBAR", /^-?[0-9]*\.?[0-9]+$/g),
	new PLElement("O", /^O$/g),
	new PLElement("OF", /^OF$/g),
	new PLElement("OIC", /^OIC$/g),
	new PLElement("OMG", /^OMG$/g),
	new PLElement("OMGWTF", /^OMGWTF$/g),
	new PLElement("OUTTA", /^OUTTA$/g),
	new PLElement("PRODUKT", /^PRODUKT$/g),
	new PLElement("RLY", /^RLY$/g),
	new PLElement("RLY?", /^RLY\?$/g),
	new PLElement("SAEM", /^SAEM$/g),
	new PLElement("SMALLR", /^SMALLR$/g),
	new PLElement("SMOOSH", /^SMOOSH$/g),
	new PLElement("SUM", /^SUM$/g),
	new PLElement("QUOSHUNT", /^QUOSHUNT$/g),
	new PLElement("R", /^R$/g),
	new PLElement("UPPIN", /^UPPIN$/g),
	new PLElement("VISIBLE", /^VISIBLE$/g),
	new PLElement("WAI", /^WAI$/g),
	new PLElement("WON", /^WON$/g),
	new PLElement("WTF?", /^WTF\?$/g),
	new PLElement("YA", /^YA$/g),
	new PLElement("YR", /^YR$/g),
	new PLElement("TIL", /^TIL$/g),
	new PLElement("TROOF", /^(WIN|FAIL)/g),
	new PLElement("TYPE", /^(TROOF|NOOB|NUMBR|NUMBAR|YARN|TYPE)$/g),
	new PLElement("WILE", /WILE$/g),
	new PLElement("VARIDENT", /^[a-zA-Z][a-zA-Z0-9_]*$/),
	new PLElement("YARN", /^".*?"$/g),
];


var token_to_classification = {
    "A": "Type Keyword",
	"AN": "Operand Delimitier Keyword",
	"ANY_OF": "OR Delimiter Operation Keyword",
	"ALL_OF": "AND Delimiter Operation Keyword",
	"BTW": "Line Comment Keyword",
	"BTW_COMMENT": "Line Comment",
	"BIGGR OF": "Max Operation Keyword",
	"BOTH_SAEM": "Equal Operation Keyword",
	"BOTH_OF": "AND Operation Keyword",
	"DIFF_OF": "Subtraction Operation Keyword",
	"DIFFRINT": "Not Equal Operation Keyword",
	"EITHER_OF": "OR Operation Keyword",
	"FAIL": "FAIL Literal",
	"GIMMEH": "Input Keyword",
	"GTFO": "Break Keyword",
	"HAI": "Code Delimiter Keyword",
	"IM_IN_YR": "Loop Delimiter Keyword",
	"IM_OUTTA_YR": "Loop Delimiter Keyword",
	"IT": "Identifier",
	"ITZ": "Variable Initialization Keyword",
	"I_HAS_A": "Variable Declaration Keyword",
	"KTHXBYE": "Code Delimiter Keyword",
	"LOOPIDENT": "Loop Identifier",
    "MAEK": "Type Casting Declaration Keyword",
	"MKAY": "Infinite Delimiter Keyword",
	"NUMBR": "NUMBR Literal",
	"NUMBAR": "NUMBAR Literal",
	"NO_WAI": "Else Keyword",
	"NOT": "NOT Operation Keyword",
	"NOOB": "Null Identifier",
	"MOD_OF": "Modulo Operation Keyword",
	"OBTW": "Comment Delimiter Keyword",
	"OBTW_COMMENT": "Multi-line Comment",
	"OIC": "Flow-Control Delimiter Keyword",
	"OMG": "Case Keyword",
	"OMGWTF": "Case-Default Keyword",
	"OIC": "Flow-Control Delimiter Keyword",
	"O_RLY?": "If-Else Delimiter Keyword",
	"PRODUKT_OF": "Multiplaction Operation Keyword",
	"QUOSHUNT_OF": "Division Operation Keyword",
	"R": "Variable Assignment Keyword",
	"SMALLR OF": "Min Operation Keyword",
	"SUM_OF": "Addition Operation Keyword",
	"TLDR": "Comment Delimiter Keyword",
    "TYPE": "TYPE Literal",
    "TROOF": "TROOF Literal",
	"VARIDENT": "Variable Identifier",
    "VISIBLE" : "Output Keyword",
	"YARN": "YARN Literal",
	"WIN": "WIN Literal",
	"WON OF": "XOR Operation Keyword",
	"VISIBL": "Output Keyword",
	"YA_RLY": "If Keyword",
    "!": "No Newline Output",
};

class MultiWord {
	constructor(name, words) {
		this.name = name;
		this.words = words;
	}
}

var multiword_pl_elements = [
	new MultiWord("ANY_OF", ["ANY", "OF"]),
	new MultiWord("ALL_OF", ["ALL", "OF"]),
	new MultiWord("BIGGR_OF", ["BIGGR", "OF"]),
	new MultiWord("BOTH_OF", ["BOTH", "OF"]),
	new MultiWord("BOTH_SAEM", ["BOTH", "SAEM"]),
	new MultiWord("DIFF_OF", ["DIFF", "OF"]),
	new MultiWord("EITHER_OF", ["EITHER", "OF"]),
	new MultiWord("IM_IN_YR", ["IM", "IN", "YR"]),
	new MultiWord("IM_OUTTA_YR", ["IM", "OUTTA", "YR"]),
	new MultiWord("I_HAS_A", ["I", "HAS", "A"]),
	new MultiWord("IS_NOW_A", ["IS", "NOW", "A"]),
	new MultiWord("HOW_IZ_I", ["HOW", "IZ", "I"]),
	new MultiWord("MOD_OF", ["MOD", "OF"]),
	new MultiWord("NOT_OF", ["NOT", "OF"]),
	new MultiWord("NO_WAI", ["NO", "WAI"]),
	new MultiWord("O_RLY?", ["O", "RLY?"]),
	new MultiWord("PRODUKT_OF", ["PRODUKT", "OF"]),
	new MultiWord("QUOSHUNT_OF", ["QUOSHUNT", "OF"]),
	new MultiWord("SUM_OF", ["SUM", "OF"]),
	new MultiWord("SMALLR_OF", ["SMALLR", "OF"]),
	new MultiWord("UPPIN_YR", ["UPPIN", "YR"]),
	new MultiWord("WON_OF", ["WON", "OF"]),
	new MultiWord("YA_RLY", ["YA", "RLY"]),
];

/**
 * List of comment tokens used by the lexer
 */
var comment_tokens = [
	"BTW",
	"BTW_COMMENT",
	"OBTW",
	"OBTW_COMMENT",
	"TLDR"
]

/**
 * List of conditional commands used by the parser
 */
var conditional_tokens = [
	"O_RLY?",
	"YA_RLY",
	"NO_WAI",
	"OIC",
	"WTF?",
	"OMG",
	"OMGWTF",
	"GTFO",
];

/**
 * List of loop control commands used by the parser
 */
var loop_tokens = [
	"IM_IN_YR",
	"IM_OUTTA_YR",
];

/**
 * Object containing LOLCODE's special characters and their JavaScript counterparts
 * 	The bell character (:o) is represented as \x07
 *  Any excess : character is removed, since to write a literal :, :: must be typed
 */
var special_characters = {
	":)": "\n",
	":>": "\t",
	":o": "\x07",
	":\"": "\"",
	"::": ":",
	":": ""
};
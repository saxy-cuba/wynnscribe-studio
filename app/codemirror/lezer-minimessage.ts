import { tags as t } from "@lezer/highlight";
import { LanguageSupport } from "@codemirror/language";
import { StreamLanguage, StringStream } from "@codemirror/language";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { autocompletion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { type Extension } from "@codemirror/state";

interface MiniMessageState {
    inTag: boolean;
    tagNameExpected: boolean;
    inArgument: boolean;
}

const colorNames: string[] = [
    "black", "dark_blue", "dark_green", "dark_aqua", "dark_red",
    "dark_purple", "gold", "gray", "dark_gray", "blue", "green",
    "aqua", "red", "light_purple", "yellow", "white",
    "grey", "dark_grey"
];

// 色タグの正規表現
const colorNameRegex = new RegExp(`^(${colorNames.join("|")})`, "i");

export const miniMessageStreamParser = StreamLanguage.define<MiniMessageState>({
    name: "minimessage",
    token(stream: StringStream, state: MiniMessageState): string | null {
        if (stream.match("\\\\") || stream.match("\\<") || stream.match(/\\[.*+?^${}()|[\]\\]/i)) {
            return "escape";
        }

        if (stream.match("<")) {
            state.inTag = true;
            state.tagNameExpected = true;
            return "bracket";
        }

        if (state.inTag && stream.match(">")) {
            state.inTag = false;
            state.inArgument = false;
            return "bracket";
        }

        if (state.inTag) {
            if (stream.match("/")) {
                return "tagName";
            }

            if (state.tagNameExpected) {
                state.tagNameExpected = false;

                if (stream.match(/^reset\b/i)) {
                    return "tagName";
                }

                if (stream.match(/^!/)) {
                    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
                        return "tagName";
                    }
                }

                if (stream.match(colorNameRegex)) {
                    return "color";
                }

                if (stream.match(/#[0-9a-fA-F]{6}/i) || stream.match(/#[0-9a-fA-F]{8}/i)) {
                    return "color";
                }

                if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
                    return "tagName";
                }
            }

            if (stream.eat(":")) {
                state.inArgument = true;
                return "separator";
            }

            if (state.inArgument && (stream.match(/'([^'\\]|\\.)*'/i) || stream.match(/"([^"\\]|\\.)*"/i))) {
                return "string";
            }

            if (state.inArgument && stream.match(/^[0-9]+(\.[0-9]+)?/)) {
                return "number";
            }

            if (state.inArgument && stream.match(/^[^:<>"'\\]+/)) {
                return "propertyName";
            }

            stream.next();
            return "invalid";
        }

        if (stream.match(/^[^<\\]+/)) {
            return "content";
        }

        stream.next();
        return "content";
    },

    startState(): MiniMessageState {
        return {
            inTag: false,
            tagNameExpected: true,
            inArgument: false
        };
    }
});

export function miniMessage(): LanguageSupport {
    return new LanguageSupport(miniMessageStreamParser);
}

const tagOpacity = "0.4"

const tagColor = "#29beff"

export const miniMessageTagStyles = [
    { tag: t.bracket, color: tagColor, opacity: tagOpacity },
    { tag: t.tagName, color: tagColor, opacity: tagOpacity },

    { tag: t.color, color: tagColor, opacity: tagOpacity },

    { tag: t.propertyName, color: tagColor, opacity: tagOpacity },
    { tag: t.string, color: tagColor, opacity: tagOpacity },
    { tag: t.number, color: tagColor, opacity: tagOpacity },
    { tag: t.separator, color: tagColor, opacity: tagOpacity },

    { tag: t.content, color: "#ffffff" },
    { tag: t.escape, color: "#e47629" },

    { tag: t.invalid, color: "#ef4646", borderBottom: "1px dotted #F44747" }
]

export const miniMessageTheme = HighlightStyle.define(miniMessageTagStyles);

const decorationNames: string[] = [
    "bold", "b", "italic", "em", "i", "underlined", "u",
    "strikethrough", "st", "obfuscated", "obf"
];

const tagNames: string[] = [
    "reset", "click", "hover", "key", "lang", "tr", "translate",
    "insertion", "rainbow", "gradient", "transition", "font", "newline",
    "selector", "sel", "score", "nbt", "data", "pride",
    "shadow", "color", "colour", "c"
];

const allTags: string[] = [...colorNames, ...decorationNames, ...tagNames];

function completeMiniMessageTags(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/<([a-zA-Z_][a-zA-Z0-9_]*)?$/);
    if (!word) return null;

    if (word.text === "<") {
        return {
            from: word.from + 1,
            options: allTags.map(tag => ({
                label: tag,
                type: "keyword"
            }))
        };
    }

    const tagPrefix = word.text.slice(1);
    if (tagPrefix) {
        return {
            from: word.from + 1,
            options: allTags
                .filter(tag => tag.startsWith(tagPrefix))
                .map(tag => ({
                    label: tag,
                    type: "keyword"
                }))
        };
    }

    return null;
}

export const miniMessageCompletion = autocompletion({
    override: [completeMiniMessageTags]
});

export function miniMessageExtension(): Extension[] {
    return [
        miniMessage(),
        syntaxHighlighting(miniMessageTheme),
        miniMessageCompletion
    ];
}
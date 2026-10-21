"""Small KeyValues (VDF) parser mirroring core/vdf.js: comments, bare tokens,
escapes and repeated keys (which become lists)."""


def _tokenize(text):
    index = 1 if text.startswith("﻿") else 0
    length = len(text)
    while index < length:
        char = text[index]
        if char in " \t\r\n":
            index += 1
        elif char == "/" and text.startswith("//", index):
            end = text.find("\n", index)
            index = length if end == -1 else end
        elif char in "{}":
            yield char, char
            index += 1
        elif char == "[":
            end = text.find("]", index)
            index = length if end == -1 else end + 1
        elif char == '"':
            index += 1
            value = []
            while index < length and text[index] != '"':
                if text[index] == "\\" and index + 1 < length:
                    escaped = text[index + 1]
                    value.append({"n": "\n", "t": "\t"}.get(escaped, escaped))
                    index += 2
                else:
                    value.append(text[index])
                    index += 1
            index += 1
            yield "string", "".join(value)
        else:
            start = index
            while index < length and text[index] not in ' \t\r\n{}"':
                index += 1
            yield "string", text[start:index]


def parse_vdf(text):
    tokens = list(_tokenize(text))
    position = 0

    def parse_object():
        nonlocal position
        result = {}
        while position < len(tokens):
            kind, value = tokens[position]
            if kind == "}":
                position += 1
                break
            if kind != "string":
                position += 1
                if kind == "{":
                    parse_object()
                continue
            key = value
            position += 1
            if position >= len(tokens):
                break
            next_kind, next_value = tokens[position]
            if next_kind == "{":
                position += 1
                item = parse_object()
            elif next_kind == "string":
                position += 1
                item = next_value
            else:
                continue
            if key in result:
                existing = result[key]
                result[key] = existing + [item] if isinstance(existing, list) else [existing, item]
            else:
                result[key] = item
        return result

    return parse_object()

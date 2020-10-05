const keywords = [
  'abstract',
  'as',
  'async',
  'await',
  'base',
  'bool',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'checked',
  'class',
  'const',
  'continue',
  'decimal',
  'default',
  'delegate',
  'do',
  'double',
  'else',
  'enum',
  'event',
  'explicit',
  'extern',
  'false',
  'finally',
  'fixed',
  'float',
  'for',
  'foreach',
  'goto',
  'if',
  'implicit',
  'in',
  'int',
  'interface',
  'internal',
  'is',
  'lock',
  'long',
  'namespace',
  'new',
  'null',
  'object',
  'operator',
  'out',
  'override',
  'params',
  'private',
  'protected',
  'public',
  'readonly',
  'ref',
  'return',
  'sbyte',
  'sealed',
  'short',
  'sizeof',
  'stackalloc',
  'static',
  'string',
  'struct',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'unit',
  'ulong',
  'unchecked',
  'unsafe',
  'ushort',
  'using',
  'virtual',
  'void',
  'volatile',
  'while',
];

const pStart = ['(', '{', '<', '['];
const pEnd = [')', '}', '>', ']'];

type OpenTag = '(' | '{' | '<' | '[';
type CloseTag = ')' | '}' | '>' | ']';

interface Parenthesis {
  begin: number;
  end: number;
  open: OpenTag;
  close: CloseTag;
}

const tokenize = (part, isMethod = false, isParameter = false) => {
  if (keywords.indexOf(part) >= 0) {
    return `**<color blue>${part}**`;
  }
  let firstChar = part.substr(0, 1);
  if (firstChar == firstChar.toUpperCase() && !isMethod) {
    return `**<color darkgreen>${part}**`;
  } else {
    return `${part}`;
  }
};

const isOpenTag = (s: string): s is OpenTag => {
  return pStart.indexOf(s) >= 0;
};

const parseSegment = (str: string, parenthesis: Parenthesis) => {
  if (!parenthesis) {
    return tokenize(str);
  }
  const tokens = [];
  let sub = str.substr(0, parenthesis.begin);

  if (sub.length > 0) {
    return (
      tokenize(sub, parenthesis.open == '(') +
      parenthesis.open +
      parse(str.substr(parenthesis.begin + 1, str.length - parenthesis.begin - 2)) +
      parenthesis.close
    );
  } else {
    return `${parenthesis.open} ${parse(
      str.substr(parenthesis.begin + 1, str.length - parenthesis.begin - 2),
    )} ${parenthesis.close}`;
  }
};

const getClosing = (str: string, index: number, tag: OpenTag) => {
  let pos = index + 1;
  let desiredClosingTag = pEnd[pStart.indexOf(tag)];
  while (pos < str.length) {
    const char = str[pos];
    if (isOpenTag(char)) {
      pos = getClosing(str, pos, char);
      continue;
    } else if (str[pos] === desiredClosingTag) {
      return pos + 1;
    }
    pos++;
  }
  return undefined;
};

const findParenthesis = (str: string, start: number, stop: number) => {
  const found = pStart.filter((x) => str.indexOf(x, start) >= 0).map((x) => x as OpenTag);
  if (found.length < 1) {
    return null;
  }
  let x: Parenthesis = null;
  found.forEach((tag) => {
    const pOpen = str.indexOf(tag);
    if (pOpen > stop) return;
    const tmp = {
      begin: pOpen,
      end: getClosing(str, pOpen, tag),
      open: tag,
      close: pEnd[pStart.indexOf(tag)] as CloseTag,
    };

    if (!x || x.begin > tmp.begin) {
      x = tmp;
    }
  });
  return x;
};

const parse = (str: string) => {
  let output = '';
  while (str.length > 0) {
    let separator = ' ';
    let space = str.indexOf(separator);
    if (str[space - 1] == ',') {
      separator = ', ';
      space--;
    }
    if (space < 0) {
      separator = ',';
      space = str.indexOf(separator);
      if (space < 0) {
        separator = '';
        space = str.length;
      }
    }

    const parenthesis = findParenthesis(str, 0, space);
    if ((parenthesis?.end ?? 0) > space) {
      space = parenthesis.end;
      separator = ' ';
    }
    let current = str.substr(0, space).trim();

    str = str.substr(space + separator.length);
    if (str.length > 0) {
      if (separator == ',') separator = ', ';
      output += parseSegment(current, parenthesis) + separator;
    } else {
      output += parseSegment(current, parenthesis);
    }
  }

  return output;
};

console.log(
  parse(
    'public override async ValueTuple<TKey<int,float>,TValue<int,Double>> MethodName(Dictionary<string, int> x, Double y)',
  ),
);

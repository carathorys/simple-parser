const openTags = ['(', '{', '<', '['];
const closeTags = [')', '}', '>', ']'];

const getClosing = (str: string, index: number, tag: string[1]) => {
  let pos = index + 1;
  let desiredClosingTag = closeTags[openTags.indexOf(tag)];
  while (pos < str.length) {
    if (openTags.indexOf(str[pos]) >= 0) {
      pos = getClosing(str, pos, str[pos]);
      continue;
    } else if (str[pos] === desiredClosingTag) {
      return pos + 1;
    }
    pos++;
  }
  return undefined;
};

const chkParenthesis = (str: string, start: number, stop: number) => {
  const found = openTags.filter((x) => str.indexOf(x, start) >= 0);
  if (found.length > 0) {
    let x = undefined;
    found.forEach((y) => {
      const tagStart = str.indexOf(y, start);
      if (tagStart > stop) return;
      const tmp = {
        start: tagStart,
        end: getClosing(str, tagStart, y),
      };
      if (!x || x.start > tmp.start) {
        x = tmp;
      }
    });
    if ((x?.end ?? 0) > stop) {
      return x.end;
    }

    return stop;
  }

  return stop;
};

const parse = (str) => {
  const tokens = [];
  while (str.length > 0) {
    let space = str.indexOf(' ');
    if (space < 0) space = str.length;

    space = chkParenthesis(str, 0, space);
    let current = str.substring(0, space);

    str = str.substring(space + 1);
    tokens.push(current);
  }

  return tokens.join(' ');
};

console.log(
  parse(
    'public static async Task<ValueTuple<int, string>> GetData(Dictionary<double, Object> params)',
  ),
);

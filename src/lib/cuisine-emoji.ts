const MAP: [RegExp, string][] = [
  [/biryani|hyderabadi/i, "🍛"],
  [/north indian|punjabi|mughlai/i, "🍛"],
  [/south indian|dosa|idli/i, "🥞"],
  [/chinese|noodle/i, "🍜"],
  [/pizza/i, "🍕"],
  [/italian|pasta/i, "🍝"],
  [/burger|american/i, "🍔"],
  [/dessert|sweet|cake|ice cream/i, "🍰"],
  [/healthy|salad/i, "🥗"],
  [/street|chaat/i, "🥙"],
  [/mumbai|pav/i, "🍲"],
  [/momo|tibetan/i, "🥟"],
  [/kebab|tandoor/i, "🍢"],
  [/gujarati|thali/i, "🍱"],
  [/cafe|coffee|tea/i, "☕"],
  [/beverage|juice|drink|shake/i, "🥤"],
  [/japanese|sushi/i, "🍣"],
];

/** A friendly emoji for a cuisine name, used on filter pills and empty states. */
export function cuisineEmoji(name: string): string {
  return MAP.find(([re]) => re.test(name))?.[1] ?? "🍽️";
}

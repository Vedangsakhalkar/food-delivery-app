/**
 * Real food photos for `npm run db:seed`. Each dish maps to a Wikipedia article whose lead image is a
 * freely licensed photo (Wikimedia Commons). The photo is downloaded (800px wide) and uploaded to our
 * own Storage bucket, so the app never hot-links Wikipedia. Owners can replace any image later.
 */

/** dish name -> Wikipedia article title */
export const DISH_PHOTO: Record<string, string> = {
  "Chicken Dum Biryani": "Biryani",
  "Veg Biryani": "Pilaf",
  "Paneer Tikka Biryani": "Paneer tikka",
  "Mutton Biryani": "Sindhi biryani",
  "Butter Naan": "Naan",
  "Garlic Naan": "Naan",
  "Tandoori Roti": "Roti",
  "Butter Chicken": "Butter chicken",
  "Dal Makhani": "Dal makhani",
  "Paneer Butter Masala": "Paneer",
  "Masala Dosa": "Masala dosa",
  "Mysore Masala Dosa": "Masala dosa",
  "Cheese Dosa": "Uttapam",
  "Paper Dosa": "Paper dosa",
  "Idli Sambar (2 pc)": "Idli",
  "Medu Vada (2 pc)": "Medu vada",
  "Filter Coffee": "Filter coffee",
  "Veg Hakka Noodles": "Hakka noodles",
  "Chicken Fried Rice": "Fried rice",
  "Schezwan Noodles": "Chow mein",
  "Veg Manchurian": "Gobi Manchurian",
  "Chilli Chicken": "Chilli chicken",
  "Spring Rolls (4 pc)": "Spring roll",
  "Chicken Momos (6 pc)": "Momo (food)",
  Margherita: "Pizza Margherita",
  Farmhouse: "Pizza",
  Pepperoni: "Pepperoni",
  "Cheese Burst": "Cheese pizza",
  "Penne Arrabbiata": "Penne",
  "Chicken Alfredo": "Fettuccine Alfredo",
  "Garlic Bread": "Garlic bread",
  "Classic Chicken Burger": "Chicken sandwich",
  "Aloo Tikki Burger": "Veggie burger",
  "Double Cheese Burger": "Cheeseburger",
  "French Fries": "French fries",
  "Peri Peri Fries": "Chips and dip",
  "Cola (300 ml)": "Cola",
  "Chocolate Truffle Slice": "Chocolate cake",
  "Red Velvet Slice": "Red velvet cake",
  "Blueberry Cheesecake": "Cheesecake",
  "Brownie Sundae": "Chocolate brownie",
  "Kulfi Falooda": "Falooda",
  "Gulab Jamun (2 pc)": "Gulab jamun",
  "Pani Puri (6 pc)": "Pani puri",
  "Sev Puri": "Sev puri",
  "Dahi Papdi Chaat": "Papri chaat",
  "Paneer Kathi Roll": "Kati roll",
  "Egg Kathi Roll": "Egg roll",
  "Masala Chai": "Masala chai",
  "Quinoa Power Bowl": "Quinoa",
  "Grilled Chicken Bowl": "Grilled chicken",
  "Avocado Toast": "Avocado toast",
  "Fresh Orange Juice": "Orange juice",
  "Green Detox Smoothie": "Smoothie",
  "Mango Lassi": "Lassi",
  "Hyderabadi Chicken Biryani": "Hyderabadi biryani",
  "Hyderabadi Veg Biryani": "Biryani",
  "Egg Biryani": "Egg curry",
  "Mutton Dum Biryani": "Hyderabadi biryani",
  "Chicken 65": "Chicken 65",
  "Mirchi Ka Salan": "Mirchi ka salan",
  "Double Ka Meetha": "Double ka meetha",
  "Barn Classic Beef Burger": "Hamburger",
  "Crispy Veg Burger": "Veggie burger",
  "Paneer Zinger Burger": "Chicken sandwich",
  "Loaded Cheesy Fries": "Chili cheese fries",
  "Hot Dog": "Hot dog",
  "Chocolate Shake": "Milkshake",
  "Chicken Tikka": "Chicken tikka",
  "Paneer Tikka": "Paneer tikka",
  "Seekh Kebab": "Seekh kebab",
  "Tandoori Chicken (Half)": "Tandoori chicken",
  "Kadai Paneer": "Karahi",
  "Chicken Tikka Masala": "Chicken tikka masala",
  "Laccha Paratha": "Paratha",
  "Veg Steamed Momos (8 pc)": "Momo (food)",
  "Chicken Steamed Momos (8 pc)": "Jiaozi",
  "Paneer Fried Momos (8 pc)": "Potsticker",
  "Chicken Kurkure Momos (6 pc)": "Gyoza",
  Thukpa: "Thukpa",
  "Hot & Sour Soup": "Hot and sour soup",
  "Chicken Thukpa": "Thukpa",
  "Gujarati Thali": "Thali",
  "Mini Thali": "Thali",
  "Special Deluxe Thali": "Gujarati cuisine",
  "Dhokla (6 pc)": "Dhokla",
  "Thepla with Pickle (4 pc)": "Thepla",
  Shrikhand: "Shrikhand",
  Cappuccino: "Cappuccino",
  "Cold Coffee": "Iced coffee",
  "Masala Chai Latte": "Chai latte",
  "Butter Croissant": "Croissant",
  "Chicken Club Sandwich": "Club sandwich",
  "Chocolate Chip Cookie": "Chocolate chip cookie",
  "California Roll (8 pc)": "California roll",
  "Veg Maki Roll (8 pc)": "Makizushi",
  "Salmon Nigiri (4 pc)": "Nigiri",
  "Chicken Teriyaki Bowl": "Teriyaki",
  "Prawn Tempura (5 pc)": "Tempura",
  "Miso Soup": "Miso soup",
  "Classic Pav Bhaji": "Pav bhaji",
  "Cheese Pav Bhaji": "Pav bhaji",
  "Jain Pav Bhaji": "Pav bhaji",
  "Vada Pav (2 pc)": "Vada pav",
  "Misal Pav": "Misal pav",
  "Sugarcane Juice": "Sugarcane juice",
};

/** restaurant slug -> Wikipedia article for its cover photo */
export const COVER_PHOTO: Record<string, string> = {
  "spice-route": "Biryani",
  "dosa-corner": "Masala dosa",
  "wok-and-roll": "Hakka noodles",
  "slice-house": "Pizza Margherita",
  "midnight-bites": "Hamburger",
  "sweet-tooth": "Chocolate cake",
  "chaat-street": "Pani puri",
  "green-bowl": "Salad",
  "hyderabad-biryani-house": "Hyderabadi biryani",
  "burger-barn": "Cheeseburger",
  "tandoor-tales": "Tandoori chicken",
  "momo-junction": "Momo (food)",
  "thali-ghar": "Thali",
  "brew-and-co": "Cappuccino",
  "sakura-sushi": "Sushi",
  "pav-bhaji-point": "Pav bhaji",
};

const cache = new Map<string, Promise<Buffer | null>>();
const UA = "FoodzieSeed/1.0 (demo data seeding)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET with a polite delay and retries on rate limiting (429/503). */
async function politeFetch(url: string): Promise<Response> {
  let res: Response = await fetch(url, { headers: { "User-Agent": UA } });
  for (let attempt = 1; attempt <= 5 && (res.status === 429 || res.status === 503); attempt++) {
    await sleep(attempt * 2000);
    res = await fetch(url, { headers: { "User-Agent": UA } });
  }
  await sleep(250);
  return res;
}

async function download(title: string): Promise<Buffer | null> {
  const api =
    "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages" +
    `&piprop=thumbnail&pithumbsize=800&titles=${encodeURIComponent(title)}`;
  const meta = await politeFetch(api);
  if (!meta.ok) return null;
  const json = (await meta.json()) as {
    query?: { pages?: Record<string, { thumbnail?: { source: string } }> };
  };
  const src = Object.values(json.query?.pages ?? {})[0]?.thumbnail?.source;
  if (!src) return null;
  const img = await politeFetch(src);
  if (!img.ok) return null;
  return Buffer.from(await img.arrayBuffer());
}

/** Photo bytes for a Wikipedia article title (cached), or null if unavailable. */
export function fetchPhoto(title: string): Promise<Buffer | null> {
  let hit = cache.get(title);
  if (!hit) {
    hit = download(title).catch(() => null);
    cache.set(title, hit);
  }
  return hit;
}

/** Demo restaurants for `npm run db:seed`. Prices are in rupees; the seed converts to paise. */
export interface SeedItem {
  name: string;
  description: string;
  price: number;
  veg: boolean;
  /** shown on the generated dish image */
  emoji: string;
  available: boolean;
}
export interface SeedCategory {
  name: string;
  items: SeedItem[];
}
export interface SeedRestaurant {
  slug: string;
  name: string;
  cuisine: string;
  address: string;
  opensAt: string;
  closesAt: string;
  deliveryTimeMin: number;
  /** colour hue (0-360) used for the generated images */
  hue: number;
  coverEmojis: [string, string, string];
  categories: SeedCategory[];
}

export const DEMO_PASSWORD = "Demo@12345";

/** Shorthand: item(name, description, price, veg, emoji, available?) */
const item = (
  name: string,
  description: string,
  price: number,
  veg: boolean,
  emoji: string,
  available = true,
): SeedItem => ({ name, description, price, veg, emoji, available });

// Demo restaurants are open all day so a customer can always place a test order,
// except Midnight Bites, which keeps overnight hours to show the "Closed" state.
const ALL_DAY = { opensAt: "00:00", closesAt: "23:59" } as const;

export const RESTAURANTS: SeedRestaurant[] = [
  {
    slug: "spice-route",
    name: "Spice Route",
    cuisine: "North Indian, Biryani",
    address: "MG Road, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 30,
    hue: 14,
    coverEmojis: ["🍛", "🍗", "🫓"],
    categories: [
      {
        name: "Biryani",
        items: [
          item("Chicken Dum Biryani", "Slow-cooked basmati with spiced chicken.", 320, false, "🍛"),
          item("Veg Biryani", "Seasonal vegetables and saffron rice.", 240, true, "🍚"),
          item("Paneer Tikka Biryani", "Smoky paneer layered with rice.", 280, true, "🥘"),
          item("Mutton Biryani", "Tender mutton, whole spices, long-grain rice.", 380, false, "🍛"),
        ],
      },
      {
        name: "Breads",
        items: [
          item("Butter Naan", "Soft tandoor naan brushed with butter.", 50, true, "🫓", false),
          item("Garlic Naan", "Naan topped with garlic and coriander.", 60, true, "🫓"),
          item("Tandoori Roti", "Whole wheat roti from the tandoor.", 30, true, "🫓"),
        ],
      },
      {
        name: "Curries",
        items: [
          item("Butter Chicken", "Creamy tomato gravy with tandoori chicken.", 340, false, "🍗"),
          item("Dal Makhani", "Black lentils simmered overnight.", 220, true, "🍲"),
          item("Paneer Butter Masala", "Cottage cheese in a rich tomato gravy.", 260, true, "🧀"),
        ],
      },
    ],
  },
  {
    slug: "dosa-corner",
    name: "Dosa Corner",
    cuisine: "South Indian",
    address: "FC Road, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 20,
    hue: 42,
    coverEmojis: ["🥞", "🍚", "🥥"],
    categories: [
      {
        name: "Dosas",
        items: [
          item("Masala Dosa", "Crisp dosa with spiced potato filling.", 120, true, "🥞"),
          item("Mysore Masala Dosa", "Red chutney spread, potato masala.", 140, true, "🌯"),
          item("Cheese Dosa", "Dosa loaded with melted cheese.", 150, true, "🧀"),
          item("Paper Dosa", "Large, paper-thin and extra crisp.", 110, true, "🥞"),
        ],
      },
      {
        name: "Idli & Vada",
        items: [
          item("Idli Sambar (2 pc)", "Steamed rice cakes with sambar.", 70, true, "🍚"),
          item("Medu Vada (2 pc)", "Crunchy lentil doughnuts.", 80, true, "🍩"),
          item("Filter Coffee", "Strong South Indian filter coffee.", 40, true, "☕"),
        ],
      },
    ],
  },
  {
    slug: "wok-and-roll",
    name: "Wok & Roll",
    cuisine: "Chinese",
    address: "Koregaon Park, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 35,
    hue: 120,
    coverEmojis: ["🍜", "🥟", "🍤"],
    categories: [
      {
        name: "Noodles & Rice",
        items: [
          item("Veg Hakka Noodles", "Wok-tossed noodles with vegetables.", 180, true, "🍜"),
          item("Chicken Fried Rice", "Egg and chicken fried rice.", 210, false, "🍚"),
          item("Schezwan Noodles", "Fiery noodles in schezwan sauce.", 200, true, "🍜"),
        ],
      },
      {
        name: "Starters",
        items: [
          item("Veg Manchurian", "Crispy balls in spicy Manchurian sauce.", 170, true, "🥟"),
          item("Chilli Chicken", "Indo-Chinese dry chilli chicken.", 240, false, "🍗"),
          item("Spring Rolls (4 pc)", "Crunchy vegetable rolls.", 130, true, "🌯"),
          item("Chicken Momos (6 pc)", "Steamed dumplings with red chutney.", 150, false, "🥟"),
        ],
      },
    ],
  },
  {
    slug: "slice-house",
    name: "Slice House",
    cuisine: "Pizza, Italian",
    address: "Baner, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 30,
    hue: 2,
    coverEmojis: ["🍕", "🍝", "🧀"],
    categories: [
      {
        name: "Pizzas",
        items: [
          item("Margherita", "Tomato, mozzarella and basil.", 249, true, "🍕"),
          item("Farmhouse", "Capsicum, onion, mushroom and olives.", 349, true, "🍕"),
          item("Pepperoni", "Classic pepperoni and cheese.", 399, false, "🍕"),
          item("Cheese Burst", "Molten cheese in the crust.", 429, true, "🧀"),
        ],
      },
      {
        name: "Pasta",
        items: [
          item("Penne Arrabbiata", "Spicy tomato sauce.", 229, true, "🍝"),
          item("Chicken Alfredo", "Creamy white sauce pasta.", 289, false, "🍝"),
          item("Garlic Bread", "Toasted with garlic butter.", 119, true, "🥖"),
        ],
      },
    ],
  },
  {
    slug: "midnight-bites",
    name: "Midnight Bites",
    cuisine: "Burgers",
    address: "Viman Nagar, Pune",
    opensAt: "18:00",
    closesAt: "02:00",
    deliveryTimeMin: 25,
    hue: 228,
    coverEmojis: ["🍔", "🍟", "🥤"],
    categories: [
      {
        name: "Burgers",
        items: [
          item("Classic Chicken Burger", "Crispy chicken, lettuce, mayo.", 190, false, "🍔"),
          item("Aloo Tikki Burger", "Spiced potato patty.", 140, true, "🍔"),
          item("Double Cheese Burger", "Two patties, double cheese.", 260, false, "🍔"),
        ],
      },
      {
        name: "Sides",
        items: [
          item("French Fries", "Salted and crispy.", 90, true, "🍟"),
          item("Peri Peri Fries", "Tossed in peri peri masala.", 110, true, "🍟"),
          item("Cola (300 ml)", "Chilled soft drink.", 50, true, "🥤"),
        ],
      },
    ],
  },
  {
    slug: "sweet-tooth",
    name: "Sweet Tooth",
    cuisine: "Desserts",
    address: "Kalyani Nagar, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 25,
    hue: 330,
    coverEmojis: ["🍰", "🍨", "🍩"],
    categories: [
      {
        name: "Cakes",
        items: [
          item("Chocolate Truffle Slice", "Rich dark chocolate cake.", 130, true, "🍰"),
          item("Red Velvet Slice", "Cream cheese frosting.", 140, true, "🧁"),
          item("Blueberry Cheesecake", "Baked cheesecake, blueberry compote.", 170, true, "🍰"),
        ],
      },
      {
        name: "Ice Cream",
        items: [
          item("Brownie Sundae", "Warm brownie, vanilla ice cream, fudge.", 180, true, "🍨"),
          item("Kulfi Falooda", "Pistachio kulfi with falooda.", 150, true, "🍧"),
          item("Gulab Jamun (2 pc)", "Warm syrupy dumplings.", 90, true, "🍮"),
        ],
      },
    ],
  },
  {
    slug: "chaat-street",
    name: "Chaat Street",
    cuisine: "Street Food, North Indian",
    address: "Camp, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 20,
    hue: 36,
    coverEmojis: ["🥙", "🧆", "🌯"],
    categories: [
      {
        name: "Chaat",
        items: [
          item("Pani Puri (6 pc)", "Crisp puris with spicy mint water.", 60, true, "🧆"),
          item("Sev Puri", "Crisp puris with chutneys and sev.", 70, true, "🥙"),
          item("Dahi Papdi Chaat", "Papdi with yoghurt and tamarind.", 90, true, "🥗"),
        ],
      },
      {
        name: "Rolls",
        items: [
          item("Paneer Kathi Roll", "Spiced paneer wrapped in paratha.", 130, true, "🌯"),
          item("Egg Kathi Roll", "Egg-coated paratha roll.", 110, false, "🌯"),
          item("Masala Chai", "Kadak ginger-cardamom tea.", 30, true, "🍵"),
        ],
      },
    ],
  },
  {
    slug: "green-bowl",
    name: "Green Bowl",
    cuisine: "Healthy, Salads",
    address: "Aundh, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 30,
    hue: 140,
    coverEmojis: ["🥗", "🥑", "🍊"],
    categories: [
      {
        name: "Bowls",
        items: [
          item("Quinoa Power Bowl", "Quinoa, roasted veggies, hummus.", 270, true, "🥗"),
          item("Grilled Chicken Bowl", "Brown rice, grilled chicken, greens.", 310, false, "🍱"),
          item("Avocado Toast", "Sourdough, smashed avocado, seeds.", 220, true, "🥑"),
        ],
      },
      {
        name: "Drinks",
        items: [
          item("Fresh Orange Juice", "Cold-pressed, no sugar.", 110, true, "🍊"),
          item("Green Detox Smoothie", "Spinach, apple, cucumber.", 150, true, "🥤"),
          item("Mango Lassi", "Thick yoghurt and Alphonso mango.", 120, true, "🥭"),
        ],
      },
    ],
  },
  {
    slug: "hyderabad-biryani-house",
    name: "Hyderabad Biryani House",
    cuisine: "Biryani, Hyderabadi",
    address: "Kondhwa, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 40,
    hue: 22,
    coverEmojis: ["🍛", "🥚", "🍗"],
    categories: [
      {
        name: "Dum Biryani",
        items: [
          item("Hyderabadi Chicken Biryani", "Layered dum biryani with raita.", 299, false, "🍛"),
          item("Hyderabadi Veg Biryani", "Vegetables, mint and saffron.", 229, true, "🍚"),
          item("Egg Biryani", "Boiled eggs on fragrant rice.", 199, false, "🥚"),
          item("Mutton Dum Biryani", "Slow-cooked mutton biryani.", 399, false, "🍛"),
        ],
      },
      {
        name: "Starters & Sides",
        items: [
          item("Chicken 65", "Spicy deep-fried chicken bites.", 220, false, "🍗"),
          item("Mirchi Ka Salan", "Peanut-sesame chilli curry.", 90, true, "🌶️"),
          item("Double Ka Meetha", "Hyderabadi bread pudding.", 110, true, "🍮"),
        ],
      },
    ],
  },
  {
    slug: "burger-barn",
    name: "Burger Barn",
    cuisine: "Burgers, American",
    address: "Kothrud, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 25,
    hue: 30,
    coverEmojis: ["🍔", "🌭", "🍟"],
    categories: [
      {
        name: "Burgers",
        items: [
          item("Barn Classic Beef Burger", "Beef patty, cheddar, pickles.", 280, false, "🍔"),
          item("Crispy Veg Burger", "Crunchy veg patty, slaw, sauce.", 160, true, "🍔"),
          item(
            "Smoky BBQ Chicken Burger",
            "Grilled chicken, BBQ sauce, onion rings.",
            240,
            false,
            "🍔",
          ),
          item("Paneer Zinger Burger", "Crispy paneer, jalapeno mayo.", 190, true, "🍔"),
        ],
      },
      {
        name: "Sides & Shakes",
        items: [
          item("Loaded Cheesy Fries", "Fries, cheese sauce, jalapenos.", 150, true, "🍟"),
          item("Hot Dog", "Grilled sausage, mustard, onions.", 170, false, "🌭"),
          item("Chocolate Shake", "Thick chocolate milkshake.", 160, true, "🥛"),
        ],
      },
    ],
  },
  {
    slug: "tandoor-tales",
    name: "Tandoor Tales",
    cuisine: "Kebabs, North Indian",
    address: "Deccan, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 35,
    hue: 8,
    coverEmojis: ["🍢", "🍗", "🫓"],
    categories: [
      {
        name: "Kebabs & Tikkas",
        items: [
          item("Chicken Tikka", "Smoky chicken tikka from the tandoor.", 290, false, "🍢"),
          item("Paneer Tikka", "Marinated paneer, peppers and onion.", 260, true, "🍢"),
          item("Seekh Kebab", "Minced lamb skewers with spices.", 320, false, "🍢"),
          item("Tandoori Chicken (Half)", "Classic charred tandoori chicken.", 340, false, "🍗"),
        ],
      },
      {
        name: "Mains & Breads",
        items: [
          item("Kadai Paneer", "Paneer in a spicy kadai masala.", 250, true, "🍲"),
          item("Chicken Tikka Masala", "Tikka in a creamy masala gravy.", 330, false, "🍛"),
          item("Laccha Paratha", "Flaky layered paratha.", 55, true, "🫓"),
        ],
      },
    ],
  },
  {
    slug: "momo-junction",
    name: "Momo Junction",
    cuisine: "Momos, Tibetan",
    address: "Shivajinagar, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 25,
    hue: 8,
    coverEmojis: ["🥟", "🍜", "🌶️"],
    categories: [
      {
        name: "Momos",
        items: [
          item("Veg Steamed Momos (8 pc)", "Cabbage and carrot dumplings.", 110, true, "🥟"),
          item("Chicken Steamed Momos (8 pc)", "Juicy chicken dumplings.", 140, false, "🥟"),
          item("Paneer Fried Momos (8 pc)", "Crispy fried paneer dumplings.", 150, true, "🥟"),
          item("Chicken Kurkure Momos (6 pc)", "Crunchy-coated chicken momos.", 170, false, "🥟"),
        ],
      },
      {
        name: "Soups & Noodles",
        items: [
          item("Thukpa", "Tibetan noodle soup with vegetables.", 160, true, "🍜"),
          item("Hot & Sour Soup", "Tangy peppery soup.", 120, true, "🍲"),
          item("Chicken Thukpa", "Hearty noodle soup with chicken.", 190, false, "🍜"),
        ],
      },
    ],
  },
  {
    slug: "thali-ghar",
    name: "Thali Ghar",
    cuisine: "Gujarati, Thali",
    address: "Sadashiv Peth, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 30,
    hue: 48,
    coverEmojis: ["🍱", "🫓", "🥘"],
    categories: [
      {
        name: "Thalis",
        items: [
          item("Gujarati Thali", "Dal, kadhi, 2 sabzis, rotli, rice, sweet.", 260, true, "🍱"),
          item("Mini Thali", "Dal, 1 sabzi, 2 rotli, rice.", 160, true, "🍱"),
          item("Special Deluxe Thali", "Everything plus farsan and shrikhand.", 340, true, "🍱"),
        ],
      },
      {
        name: "Snacks & Sweets",
        items: [
          item("Dhokla (6 pc)", "Soft steamed gram-flour cake.", 90, true, "🧆"),
          item("Thepla with Pickle (4 pc)", "Fenugreek flatbreads.", 100, true, "🫓"),
          item("Shrikhand", "Sweet saffron yoghurt dessert.", 90, true, "🍮"),
        ],
      },
    ],
  },
  {
    slug: "brew-and-co",
    name: "Brew & Co",
    cuisine: "Cafe, Beverages",
    address: "Koregaon Park, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 20,
    hue: 24,
    coverEmojis: ["☕", "🥐", "🍰"],
    categories: [
      {
        name: "Coffee & Tea",
        items: [
          item("Cappuccino", "Espresso with silky steamed milk.", 150, true, "☕"),
          item("Cold Coffee", "Chilled blended coffee with ice cream.", 170, true, "🥤"),
          item("Masala Chai Latte", "Spiced tea with frothed milk.", 130, true, "🍵"),
        ],
      },
      {
        name: "Bakes & Bites",
        items: [
          item("Butter Croissant", "Flaky, freshly baked.", 110, true, "🥐"),
          item("Chicken Club Sandwich", "Toasted triple-decker sandwich.", 230, false, "🥪"),
          item("Chocolate Chip Cookie", "Warm and gooey.", 80, true, "🍪"),
        ],
      },
    ],
  },
  {
    slug: "sakura-sushi",
    name: "Sakura Sushi",
    cuisine: "Japanese, Sushi",
    address: "Balewadi, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 45,
    hue: 345,
    coverEmojis: ["🍣", "🍱", "🍤"],
    categories: [
      {
        name: "Sushi & Rolls",
        items: [
          item("California Roll (8 pc)", "Crab, avocado, cucumber.", 380, false, "🍣"),
          item("Veg Maki Roll (8 pc)", "Cucumber, avocado, carrot.", 320, true, "🍙"),
          item("Salmon Nigiri (4 pc)", "Fresh salmon over seasoned rice.", 460, false, "🍣"),
        ],
      },
      {
        name: "Bowls & Sides",
        items: [
          item("Chicken Teriyaki Bowl", "Grilled chicken, rice, teriyaki glaze.", 340, false, "🍱"),
          item("Prawn Tempura (5 pc)", "Light and crispy.", 360, false, "🍤"),
          item("Miso Soup", "Tofu, seaweed and spring onion.", 140, true, "🍲"),
        ],
      },
    ],
  },
  {
    slug: "pav-bhaji-point",
    name: "Pav Bhaji Point",
    cuisine: "Street Food, Mumbai",
    address: "Pimpri, Pune",
    ...ALL_DAY,
    deliveryTimeMin: 20,
    hue: 16,
    coverEmojis: ["🍲", "🍞", "🧈"],
    categories: [
      {
        name: "Pav Bhaji",
        items: [
          item("Classic Pav Bhaji", "Buttery mashed vegetables with 2 pav.", 140, true, "🍲"),
          item("Cheese Pav Bhaji", "Topped with grated cheese.", 180, true, "🧀"),
          item("Jain Pav Bhaji", "Made without onion or garlic.", 150, true, "🍲"),
        ],
      },
      {
        name: "Snacks",
        items: [
          item("Vada Pav (2 pc)", "Mumbai's favourite potato fritter burger.", 60, true, "🍔"),
          item("Misal Pav", "Spicy sprouts curry with pav.", 120, true, "🍛"),
          item("Sugarcane Juice", "Fresh-pressed with ginger and lemon.", 50, true, "🥤"),
        ],
      },
    ],
  },
];

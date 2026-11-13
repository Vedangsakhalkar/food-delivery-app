/** Demo restaurants for `npm run db:seed`. Prices are in rupees; the seed converts to paise. */
export interface SeedItem {
  name: string;
  description: string;
  price: number;
  veg: boolean;
  available?: boolean;
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
  /** [r, g, b] cover colour for the generated PNG */
  colour: [number, number, number];
  categories: SeedCategory[];
}

export const DEMO_PASSWORD = "Demo@12345";

export const RESTAURANTS: SeedRestaurant[] = [
  {
    slug: "spice-route",
    name: "Spice Route",
    cuisine: "North Indian, Biryani",
    address: "MG Road, Pune",
    opensAt: "11:00",
    closesAt: "23:00",
    deliveryTimeMin: 30,
    colour: [226, 120, 80],
    categories: [
      {
        name: "Biryani",
        items: [
          {
            name: "Chicken Dum Biryani",
            description: "Slow-cooked basmati with spiced chicken.",
            price: 320,
            veg: false,
          },
          {
            name: "Veg Biryani",
            description: "Seasonal vegetables and saffron rice.",
            price: 240,
            veg: true,
          },
          {
            name: "Paneer Tikka Biryani",
            description: "Smoky paneer layered with rice.",
            price: 280,
            veg: true,
          },
        ],
      },
      {
        name: "Breads",
        items: [
          {
            name: "Butter Naan",
            description: "Soft tandoor naan brushed with butter.",
            price: 50,
            veg: true,
            available: false,
          },
          {
            name: "Garlic Naan",
            description: "Naan topped with garlic and coriander.",
            price: 60,
            veg: true,
          },
        ],
      },
      {
        name: "Curries",
        items: [
          {
            name: "Butter Chicken",
            description: "Creamy tomato gravy with tandoori chicken.",
            price: 340,
            veg: false,
          },
          {
            name: "Dal Makhani",
            description: "Black lentils simmered overnight.",
            price: 220,
            veg: true,
          },
        ],
      },
    ],
  },
  {
    slug: "dosa-corner",
    name: "Dosa Corner",
    cuisine: "South Indian",
    address: "FC Road, Pune",
    opensAt: "07:00",
    closesAt: "22:00",
    deliveryTimeMin: 20,
    colour: [240, 190, 90],
    categories: [
      {
        name: "Dosas",
        items: [
          {
            name: "Masala Dosa",
            description: "Crisp dosa with spiced potato filling.",
            price: 120,
            veg: true,
          },
          {
            name: "Mysore Masala Dosa",
            description: "Red chutney spread, potato masala.",
            price: 140,
            veg: true,
          },
          {
            name: "Cheese Dosa",
            description: "Dosa loaded with melted cheese.",
            price: 150,
            veg: true,
          },
        ],
      },
      {
        name: "Idli & Vada",
        items: [
          {
            name: "Idli Sambar (2 pc)",
            description: "Steamed rice cakes with sambar.",
            price: 70,
            veg: true,
          },
          {
            name: "Medu Vada (2 pc)",
            description: "Crunchy lentil doughnuts.",
            price: 80,
            veg: true,
          },
        ],
      },
    ],
  },
  {
    slug: "wok-and-roll",
    name: "Wok & Roll",
    cuisine: "Chinese",
    address: "Koregaon Park, Pune",
    opensAt: "12:00",
    closesAt: "23:30",
    deliveryTimeMin: 35,
    colour: [120, 170, 110],
    categories: [
      {
        name: "Noodles & Rice",
        items: [
          {
            name: "Veg Hakka Noodles",
            description: "Wok-tossed noodles with vegetables.",
            price: 180,
            veg: true,
          },
          {
            name: "Chicken Fried Rice",
            description: "Egg and chicken fried rice.",
            price: 210,
            veg: false,
          },
        ],
      },
      {
        name: "Starters",
        items: [
          {
            name: "Veg Manchurian",
            description: "Crispy balls in spicy Manchurian sauce.",
            price: 170,
            veg: true,
          },
          {
            name: "Chilli Chicken",
            description: "Indo-Chinese dry chilli chicken.",
            price: 240,
            veg: false,
          },
          {
            name: "Spring Rolls (4 pc)",
            description: "Crunchy vegetable rolls.",
            price: 130,
            veg: true,
          },
        ],
      },
    ],
  },
  {
    slug: "slice-house",
    name: "Slice House",
    cuisine: "Pizza, Italian",
    address: "Baner, Pune",
    opensAt: "11:30",
    closesAt: "23:00",
    deliveryTimeMin: 30,
    colour: [200, 80, 80],
    categories: [
      {
        name: "Pizzas",
        items: [
          {
            name: "Margherita",
            description: "Tomato, mozzarella and basil.",
            price: 249,
            veg: true,
          },
          {
            name: "Farmhouse",
            description: "Capsicum, onion, mushroom and olives.",
            price: 349,
            veg: true,
          },
          {
            name: "Pepperoni",
            description: "Classic pepperoni and cheese.",
            price: 399,
            veg: false,
          },
        ],
      },
      {
        name: "Pasta",
        items: [
          { name: "Penne Arrabbiata", description: "Spicy tomato sauce.", price: 229, veg: true },
          {
            name: "Chicken Alfredo",
            description: "Creamy white sauce pasta.",
            price: 289,
            veg: false,
          },
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
    colour: [70, 70, 90],
    categories: [
      {
        name: "Burgers",
        items: [
          {
            name: "Classic Chicken Burger",
            description: "Crispy chicken, lettuce, mayo.",
            price: 190,
            veg: false,
          },
          { name: "Aloo Tikki Burger", description: "Spiced potato patty.", price: 140, veg: true },
          {
            name: "Double Cheese Burger",
            description: "Two patties, double cheese.",
            price: 260,
            veg: false,
          },
        ],
      },
      {
        name: "Sides",
        items: [
          { name: "French Fries", description: "Salted and crispy.", price: 90, veg: true },
          {
            name: "Peri Peri Fries",
            description: "Tossed in peri peri masala.",
            price: 110,
            veg: true,
          },
        ],
      },
    ],
  },
  {
    slug: "sweet-tooth",
    name: "Sweet Tooth",
    cuisine: "Desserts",
    address: "Kalyani Nagar, Pune",
    opensAt: "10:00",
    closesAt: "23:30",
    deliveryTimeMin: 25,
    colour: [235, 150, 190],
    categories: [
      {
        name: "Cakes",
        items: [
          {
            name: "Chocolate Truffle Slice",
            description: "Rich dark chocolate cake.",
            price: 130,
            veg: true,
          },
          {
            name: "Red Velvet Slice",
            description: "Cream cheese frosting.",
            price: 140,
            veg: true,
          },
        ],
      },
      {
        name: "Ice Cream",
        items: [
          {
            name: "Brownie Sundae",
            description: "Warm brownie, vanilla ice cream, fudge.",
            price: 180,
            veg: true,
          },
          {
            name: "Kulfi Falooda",
            description: "Pistachio kulfi with falooda.",
            price: 150,
            veg: true,
          },
        ],
      },
    ],
  },
  {
    slug: "chaat-street",
    name: "Chaat Street",
    cuisine: "Street Food, North Indian",
    address: "Camp, Pune",
    opensAt: "10:00",
    closesAt: "22:30",
    deliveryTimeMin: 20,
    colour: [210, 160, 60],
    categories: [
      {
        name: "Chaat",
        items: [
          {
            name: "Pani Puri (6 pc)",
            description: "Crisp puris with spicy mint water.",
            price: 60,
            veg: true,
          },
          {
            name: "Sev Puri",
            description: "Crisp puris with chutneys and sev.",
            price: 70,
            veg: true,
          },
          {
            name: "Dahi Papdi Chaat",
            description: "Papdi with yoghurt and tamarind.",
            price: 90,
            veg: true,
          },
        ],
      },
      {
        name: "Rolls",
        items: [
          {
            name: "Paneer Kathi Roll",
            description: "Spiced paneer wrapped in paratha.",
            price: 130,
            veg: true,
          },
          {
            name: "Egg Kathi Roll",
            description: "Egg-coated paratha roll.",
            price: 110,
            veg: false,
          },
        ],
      },
    ],
  },
  {
    slug: "green-bowl",
    name: "Green Bowl",
    cuisine: "Healthy, Salads",
    address: "Aundh, Pune",
    opensAt: "09:00",
    closesAt: "21:30",
    deliveryTimeMin: 30,
    colour: [100, 170, 100],
    categories: [
      {
        name: "Bowls",
        items: [
          {
            name: "Quinoa Power Bowl",
            description: "Quinoa, roasted veggies, hummus.",
            price: 270,
            veg: true,
          },
          {
            name: "Grilled Chicken Bowl",
            description: "Brown rice, grilled chicken, greens.",
            price: 310,
            veg: false,
          },
        ],
      },
      {
        name: "Drinks",
        items: [
          {
            name: "Fresh Orange Juice",
            description: "Cold-pressed, no sugar.",
            price: 110,
            veg: true,
          },
          {
            name: "Green Detox Smoothie",
            description: "Spinach, apple, cucumber.",
            price: 150,
            veg: true,
          },
        ],
      },
    ],
  },
];

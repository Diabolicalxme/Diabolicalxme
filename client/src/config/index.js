export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "password",
    type: "password",
  },
  {
    name: "age",
    label: "Age",
    placeholder: "Enter your age",
    componentType: "input",
    type: "number",
  },
  {
    name: "height",
    label: "Height (cm)",
    placeholder: "Enter your height in centimeters",
    componentType: "input",
    type: "number",
  },
  {
    name: "chestSize",
    label: "Chest Size (inches)",
    placeholder: "Enter your chest size in inches",
    componentType: "input",
    type: "number",
  },
  {
    name: "bodyLength",
    label: "Body Length (cm)",
    placeholder: "Enter your body length in centimeters",
    componentType: "input",
    type: "number",
  },
  {
    name: "shoulderLength",
    label: "Shoulder Length (cm)",
    placeholder: "Enter your shoulder length in centimeters",
    componentType: "input",
    type: "number",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "password",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
    required: true,
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
    required: true,
    maxLength: 1000,
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "kids", label: "Kids" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
    ],
    required: true,
  },
  {
    label: "Is New Arrival",
    name: "isNewArrival",
    componentType: "toggle",
    required: false,
  },
  {
    label: "Is Featured",
    name: "isFeatured",
    componentType: "toggle",
    required: false,
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
    required: true,
    min: 1,
    max: 100000,
  },
  /* {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
    required: false,
  }, */
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
    required: true,
    min: 1,
    max: 10000,
  },
];


export const addCategoryFormElements = [
  {
    label: "Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter category Name",
    required: true,
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter category description",
    required: true,
  },
];

export const addBannerFormElements = [
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter banner description",
    required: true,
  },

]

export const addInstafeedFormElements = [
  {
    label: "Instagram Url",
    name: "postUrl",
    componentType: "textarea",
    placeholder: "Enter instagram url",
    required: true,
  },
]

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "collections",
    label: "Collections",
    path: "/shop/collections",
  },
  {
    id: "new-arrivals",
    label: "New Arrivals",
    path: "/shop/new-arrivals",
  },
  {
    id: "contact",
    label: "Contact",
    path: "/shop/contact",
  },
];

export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
  footwear: "Footwear",
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
};

export const filterOptions = {
  category: [
    { id: "kanjivaram", label: "Kanjivaram" },
    { id: "Satin", label: "Satin" },
    { id: "gadwal", label: "Gadwal" },
    { id: "jamdani", label: "Jamdani" },
    { id: "kora", label: "Kora" },
    { id: "silk", label: "Silk" },
  ],
  price: [
    { id: "0-1000", label: "0 - 1000" },
    { id: "1000-2000", label: "1000 - 2000" },
    { id: "2000-3000", label: "2000 - 3000" },
    { id: "3000-4000", label: "3000 - 4000" },
    { id: "4000-5000", label: "4000 - 5000" },
    { id: "5000-6000", label: "5000 - 6000" },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter your full name",
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50
    }
  },
 {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
    validation: {
      required: true,
      minLength: 10,
      maxLength: 200
    }
  },
  {
    label: "State",
    name: "state",
    componentType: "select",
    placeholder: "Select your state",
    validation: {
      required: true
    }
  },
  {
    label: "City",
    name: "city",
    componentType: "select",
    placeholder: "Select your city",
    validation: {
      required: true
    }
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
    validation: {
      required: true,
      pattern: /^[1-9][0-9]{5}$/,
      patternMessage: "Please enter a valid 6-digit pincode"
    }
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "tel",
    placeholder: "Enter your phone number",
    validation: {
      required: true,
      pattern: /^[6-9]\d{9}$/,
      patternMessage: "Please enter a valid 10-digit mobile number"
    }
  },
  {
    label: "Landmark",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional landmarks (optional)",
    validation: {
      required: false,
      maxLength: 500
    }
  },
];

export const categoryMapping = [
  {
    id: "67a4cedeb03c04a4eaa7d75d",
    slug: "tussar-sarees",
    name: "Tussars",
    description: "Luxurious and lightweight, our Tussar sarees showcase rich texture and natural sheen. Perfect for festive and elegant occasions, they bring timeless charm to your wardrobe."
  },
  {
    id: "67a702e745c9ad11e043ca74",
    slug: "cotton-sarees",
    name: "Banaras",
    description: "Handwoven with intricate zari work, our Banaras sarees reflect royal heritage and tradition. These exquisite drapes are perfect for weddings and grand celebrations."
  },
  {
    id: "67a4e2b19baa2e6f977087a3",
    slug: "banaras-sarees",
    name: "Cotton",
    description: "Soft, breathable, and effortlessly stylish, our Cotton sarees blend comfort with elegance. Ideal for daily wear and formal occasions, they keep you cool and graceful all day."
  },
  {
    id: "67ae15fcee205890c3cd5f98",
    slug: "organza-sarees",
    name: "Organza",
    description: "Delicate and dreamy, our Organza sarees exude sheer elegance with their lightweight flow. A perfect choice for modern women who love a blend of sophistication and charm."
  },
  // Kora category removed as requested
  // {
  //   id: "67ae17d5ee205890c3cd5faf",
  //   slug: "kora-sarees",
  //   name: "Kora",
  //   description: "Flowy, stylish, and easy to drape, our Kora sarees are designed for all-day elegance. Whether for casual outings or grand events, they add a touch of effortless beauty."
  // },
  {
    id: "67ae17d5ee205890c3cd5faf", // Using the same ID that was previously for Kora
    slug: "georgette-sarees",
    name: "Georgette",
    description: "Flowy, stylish, and easy to drape, our Georgette sarees are designed for all-day elegance. Whether for casual outings or grand events, they add a touch of effortless beauty."
  },
  {
    id: "67ae2128ee205890c3cd6251",
    slug: "celebrity-collection",
    name: "Celebrity Collection",
    description: "Inspired by Bollywood glamour, our Celebrity Collection brings you sarees seen on your favorite icons. Drape yourself in star-studded elegance and steal the spotlight."
  }
];


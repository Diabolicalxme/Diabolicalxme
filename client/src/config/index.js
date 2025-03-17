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
    componentType: "input",
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
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
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
  },
  {
    label: "Is New Arrival",
    name: "isNewArrival",
    componentType: "toggle",
  },
  {
    label: "Is Featured",
    name: "isFeatured",
    componentType: "toggle",
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
];


export const addCategoryFormElements = [
  {
    label: "Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter category Name",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter category description",
  },
];

export const addBannerFormElements = [
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter banner description",
  },

]

export const addInstafeedFormElements = [
  {
    label: "Instagram Url",
    name: "postUrl",
    componentType: "textarea",
    placeholder: "Enter instagram url",
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
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];

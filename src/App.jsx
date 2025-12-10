import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore'; 
import { ShoppingCart, Shirt, Home, Tally3, Package, Lock, Loader, Mail, List, ChevronUp, Trash2, Check, Truck, X, User, Minus, Plus, SortAsc, SortDesc, DollarSign, MapPin, Phone, MessageSquare } from 'lucide-react'; 

// --- 1. CONFIGURATION CONSTANTS ---
const LOCAL_APP_ID = 'ecom-pk-v1';
const LOCAL_AUTH_TOKEN = null;
const LOCAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-cGXCzAKytCZO4MLvAkEVWOtGH7PIm6s",
  authDomain: "ecompk-store.firebaseapp.com",
  projectId: "ecompk-store",
  storageBucket: "ecompk-store.firebasestorage.app",
  messagingSenderId: "74764903826",
  appId: "1:74764903826:web:54bd33b58389a2cfeccd4b",
  measurementId: "G-F2CBHJ1CYR"
};
const PAGES = {
  HOME: 'home', 
  PRODUCTS: 'products',
  CLOTHING: 'clothing',
  TRACK_ORDER: 'track_order',
  ADMIN: 'admin',
  CONTACT_US: 'contact_us',
  CHECKOUT_SUCCESS: 'checkout_success',
};

const CLOTHING_CATEGORIES = {
  MENS: 'mens',
  WOMENS: 'womens',
  KIDS: 'kids',
};

const SORT_OPTIONS = {
  DEFAULT: 'default',
  CHEAP: 'cheap',
  EXPENSIVE: 'expensive',
};

// --- 2. MOCK PRODUCTS (EXPANDED TO 80 ITEMS) ---
// 20 General Products, 20 Men's, 20 Women's, 20 Kids'
const MOCK_PRODUCTS = [
  // --- GENERAL PRODUCTS ---
  { id: 501, name: "Noise Cancelling Headphones", price: 12500, image: "data:image/jpeg;base64,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", category: PAGES.PRODUCTS, description: "50-hour battery life, immersive sound.", sizeOptions: [] },
  { id: 502, name: "Stainless Steel Water Bottle", price: 1100, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQRRVcvSBVODaHGOjTkb2Lr1bLWmkT4AtV7A&s", category: PAGES.PRODUCTS, description: "Keeps drinks cold for 24 hours.", sizeOptions: [] },
  { id: 503, name: "Smartwatch Pro (Black)", price: 5000, image: "https://ecart.com.pk/cdn/shop/products/Untitleddesign_4_275fea62-2c0b-47dd-a3e0-fa3c2e41e597_2048x.png?v=1675676753", category: PAGES.PRODUCTS, description: "Heart rate monitor, GPS, AMOLED screen.", sizeOptions: [] },
  { id: 504, name: "USB-C Charging Cable", price: 399, image: "https://alhamdtech.pk/cdn/shop/files/google-usb-31-to-type-c-cable-1m-white-795244.jpg?v=1722252372", category: PAGES.PRODUCTS, description: "Fast charging, 1-meter length.", sizeOptions: [] },
  { id: 505, name: "Office Mouse", price: 2500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvU7QWlJRwlSUKupXc9iVSiw_OtXJ3YH_O5Q&s", category: PAGES.PRODUCTS, description: "Silent click, adjustable DPI.", sizeOptions: [] },
  { id: 506, name: "Portable Bluetooth Speaker", price: 5800, image: "https://images.priceoye.pk/hifuture-ripple-30w-portable-bluetooth-speaker-pakistan-priceoye-07ubb-500x500.webp", category: PAGES.PRODUCTS, description: "Waterproof, 12-hour playtime.", sizeOptions: [] },
  { id: 507, name: "High-Speed Power Bank 10K mAh", price: 4200, image: "https://m.media-amazon.com/images/I/71JJLJnwREL._AC_SL1500_.jpg", category: PAGES.PRODUCTS, description: "Quick charge 3.0 compatible.", sizeOptions: [] },
  { id: 508, name: "Mini Desk Fan", price: 1500, image: "https://i5.walmartimages.com/seo/Topboutique-4-inch-mini-metal-fan-USB-Desk-Fan-Small-Personal-Air-Circulator-Fan-Portable-Electric-Table-Desktop-Fan-Rechargeable-Travel-Fans-Camping_ecf92626-22d9-480d-b48d-1e7d9fe0b842.823192eb5ce545f92fb870010b6d7a8e.jpeg", category: PAGES.PRODUCTS, description: "USB powered, whisper quiet.", sizeOptions: [] },
  { id: 509, name: "Travel Adapter Set", price: 1950, image: "data:image/jpeg;base64,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", category: PAGES.PRODUCTS, description: "Universal compatibility.", sizeOptions: [] },
  { id: 510, name: "Gaming Keyboard (Mechanical)", price: 11500, image: "https://basitcomputers.com/wp-content/uploads/2025/01/COOLERPLUS-RGB-MECHANICAL-GAMiNG-KEYBOARd-WiTH-87-BLUE-KEYs-102.jpg", category: PAGES.PRODUCTS, description: "RGB lighting, tactile switches.", sizeOptions: [] },
  { id: 511, name: "Premium Leather Wallet", price: 3200, image: "https://eligoleather.com/cdn/shop/files/Premium_Leather_Bifold_Wallet.webp?v=1745395006", category: PAGES.PRODUCTS, description: "Genuine leather, slim design.", sizeOptions: [] },
  { id: 512, name: "Drone with HD Camera", price: 29999, image: "https://static-01.daraz.pk/p/7670d5e49a1e47d2ae1c18311438ac9e.jpg", category: PAGES.PRODUCTS, description: "GPS positioning, 4K video.", sizeOptions: [] },
  { id: 513, name: "Yoga Mat (Non-slip)", price: 2200, image: "https://img.drz.lazcdn.com/collect/my/p/32eb5a30423fdf6ac2bc4733bf7a27ed.jpg_960x960q80.jpg_.webp", category: PAGES.PRODUCTS, description: "Thick and comfortable TPE material.", sizeOptions: [] },
  { id: 514, name: "Digital Kitchen Scale", price: 1850, image: "https://discountstore.pk/cdn/shop/files/5_88d9312d-b8b6-490f-aa01-f49e136b9e76.webp?v=1751973356", category: PAGES.PRODUCTS, description: "High precision measurement.", sizeOptions: [] },
  { id: 515, name: "External SSD 1TB", price: 16000, image: "https://camerahouse.pk/cdn/shop/files/Sandisk_Portable_SSD_1TB_1024x1024.jpg?v=1726998263", category: PAGES.PRODUCTS, description: "Ultra-fast data transfer.", sizeOptions: [] },
  { id: 516, name: "Electric Toothbrush", price: 4999, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4TET87j4jhrgoFjjJLjv2pyKGDQSIjhzWCg&s", category: PAGES.PRODUCTS, description: "Multiple cleaning modes.", sizeOptions: [] },
  { id: 517, name: "Set of 3 Scented Candles", price: 1450, image: "https://m.media-amazon.com/images/I/91hLxspHyWL._AC_UF894,1000_QL80_.jpg", category: PAGES.PRODUCTS, description: "Long-lasting, natural wax.", sizeOptions: [] },
  { id: 518, name: "Adjustable Laptop Stand", price: 2900, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpRG035Q-gLeeptnH2_4okbAC_y6nqvkS1eA&s", category: PAGES.PRODUCTS, description: "Ergonomic aluminum design.", sizeOptions: [] },
  { id: 519, name: "Premium Coffee Maker", price: 7500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIhcRB70zx_s4abwG1bPtNy3I1cssV7xMGJw&s", category: PAGES.PRODUCTS, description: "Programmable timer, 12-cup capacity.", sizeOptions: [] },
  { id: 520, name: "Wall Art Poster (Abstract)", price: 950, image: "https://img.drz.lazcdn.com/static/pk/p/15a4d530162f700c99e8cde6cba28c80.jpg_720x720q80.jpg", category: PAGES.PRODUCTS, description: "Modern design, A3 size.", sizeOptions: [] },
  { id: 521, name: "USB-C Multiport Adaptor ", price: 1100, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWu89Ss59SAwgDC6BIu7c1vJUFGZqjDnUSXg&s", category: PAGES.PRODUCTS, description: "Charge, connect, display instantly.", sizeOptions: [] },
  { id: 522, name: "Adjustable RGB LED Smart Light Bulb", price: 2000, image: "https://img4.dhresource.com/webp/m/0x0/f3/albu/jc/m/26/fa3ffa6f-f3d8-4862-8346-efc50ae2778d.jpg", category: PAGES.PRODUCTS, description: "Smart light, infinite possibilities.", sizeOptions: [] },
  { id: 523, name: "Computer Monitor", price: 10100, image: "https://i.ebayimg.com/thumbs/images/g/JlYAAeSwcw5pA06e/s-l1200.webp", category: PAGES.PRODUCTS, description: "See more, work better.", sizeOptions: [] },
  { id: 524, name: "Adjustabe Swing Arm Desk Lamp", price: 4000, image: "https://m.media-amazon.com/images/I/51x63Mod98L._AC_SL1000_.jpg", category: PAGES.PRODUCTS, description: "Precision lighting, adjustable reach..", sizeOptions: [] },

  // --- CLOTHING - MENS  ---
  { id: 1, name: "Luxury Denim Jacket", price: 6500, image: "https://image.made-in-china.com/365f3j00yDpkqHnPSjcO/Wholesale-High-Quality-Outdoor-Work-Denim-Men-s-Designer-Jacket-Men-Plus-Size-Jean-Brand-Luxury-Denim-Jacket-for-Men.webp", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Premium quality denim, stone-washed finish.", sizeOptions: ["S", "M", "L", "XL"] },
  { id: 2, name: "Essential White T-Shirt", price: 1800, image: "https://handsandhead.myshopify.com/cdn/shop/files/WhatsAppImage2024-05-15at8.21.55PM_1024x.jpg?v=1715787007", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "100% breathable cotton for daily wear.", sizeOptions: ["XS", "S", "M", "L", "XL"] },
  { id: 9, name: "Formal Dress Shirt (Black)", price: 2500, image: "https://m.media-amazon.com/images/I/61owdlDd7wL._AC_SL1500_.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Non-iron fabric, tailored fit.", sizeOptions: ["15", "15.5", "16", "16.5"] },
  { id: 10, name: "Basic Cotton Vest (White + Black)", price: 799, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKtbFumWE5dzt7pdayk3H7XNCcCx1WwcOvpQ&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Lightweight summer comfort.", sizeOptions: ["S", "M", "L"] },
  { id: 105, name: "Slim Fit Chinos (Navy)", price: 3990, image: "https://mendeez.com/cdn/shop/files/6-2_2606141b-2e0f-4d5c-a564-a460f3f2647b.jpg?v=1756380848&width=720", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Stretchable fabric, perfect for office.", sizeOptions: ["30", "32", "34", "36"] },
  { id: 106, name: "Hooded Sweatshirt (Grey)", price: 4500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeIr7g6HuJXgrj6koQhd-jKLwCMY64K-n4gQ&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Fleece lining for maximum warmth.", sizeOptions: ["S", "M", "L", "XL"] },
  { id: 107, name: "Running Shorts (Black)", price: 2100, image: "https://cdn.shopify.com/s/files/1/0630/2226/8505/files/CHATUJN_CHBLKBLK_1.jpg?v=1761015551", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Quick-dry mesh material.", sizeOptions: ["M", "L", "XL"] },
  { id: 108, name: "Classic Polo Shirt (Green)", price: 2800, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEf9agYJvkb2JfGjTqNe6Ys2mqOtBzssTPCQ&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Pique knit cotton, anti-shrink.", sizeOptions: ["S", "M", "L", "XL"] },
  { id: 109, name: "Winter Coat (Wool Blend)", price: 12000, image: "https://www.thejacketmaker.pk/cdn/shop/files/Men_s_Petrillo_Black_Wool_Single_Breasted_Coat_2_b27c4df7-9730-4c04-8ae0-4e47f562f288_2048x.webp?v=1760635161", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Heavy duty, tailored fit.", sizeOptions: ["M", "L", "XL"] },
  { id: 110, name: "Leather Belt", price: 4500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDDyLvnTzNAJXFifoQvXkQ46DMM4MIrgAvbg&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Full grain leather, silver buckle.", sizeOptions: ["32", "34", "36", "38"] },
  { id: 111, name: "Heather Grey + Red Color Sweatshirt ", price: 1950, image: "https://uniworthdress.com/uploads/product/TSS2412.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Modern abstract design.", sizeOptions: ["S", "M", "L"] },
  { id: 112, name: "Cargo Pants (Olive)", price: 4800, image: "https://999.com.pk/cdn/shop/files/JAZ03566copy.jpg?v=1728982650", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Six pockets, durable cotton.", sizeOptions: ["30", "32", "34", "36"] },
  { id: 113, name: "Hoodie (Dark Green) ", price: 3999, image: "https://iciw.centracdn.net/client/dynamic/images/12878_a29730a1d9-13515-103-1-1350x0.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Soft cashmere blend, vibrant stripe.", sizeOptions: ["M", "L", "XL"] },
  { id: 114, name: "V-Neck Undershirt 2-Pack (White)", price: 1250, image: "https://m.media-amazon.com/images/I/511ZmvxnCDL._AC_UY1000_.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Modal fabric, extra soft.", sizeOptions: ["S", "M", "L", "XL"] },
  { id: 115, name: "Swim Trunks (Ocean Blue)", price: 2400, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYpXFmX1pybFzt6KLq2A8Rw0Vpd_Rymj7agA&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Quick-dry liner, elastic waist.", sizeOptions: ["M", "L", "XL"] },
  { id: 116, name: "Flannel Shirt (Plaid)", price: 3100, image: "https://www.alnasser.pk/cdn/shop/products/99_1634981278.jpg?v=1649065830", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Heavy cotton, button-down collar.", sizeOptions: ["S", "M", "L", "XL"] },
  { id: 117, name: "Thermal Long Sleeve Tops 2 Pack (Blue + Navy)", price: 2999, image: "https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/Q55697s.jpg?im=Resize,width=750", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Insulating base layer.", sizeOptions: ["M", "L"] },
  { id: 118, name: "Denim Jeans (Regular Fit)", price: 4100, image: "https://lh4.googleusercontent.com/proxy/q-VJgdY0M_ETTMTsXGEpFXH5lzlSJpH25M0-GIEqntLYfd0VWjBXR26KCZs9NqyGlvm2hah--FLOa0RQAy0c5NQnbCVkaGBgLZRVgQM8APdCNO9EJFanwy0DsDCmnSuf1GwgcBqmQlZjwkQ", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Dark wash, durable stitching.", sizeOptions: ["30", "32", "34", "36"] },
  { id: 119, name: "Running Jacket Windproof (Green)", price: 5000, image: "https://static.cimalp.fr/40715-large_default/ultrashell-rainproof-and-windproof-trail-running-jacket.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Lightweight and reflective details.", sizeOptions: ["M", "L", "XL"] },
  { id: 120, name: " Black Socks (Pack of 5)", price: 1890, image: "https://bigfishclothing.co.uk/cdn/shop/files/sk1059.jpg?v=1708530717", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.MENS, description: "Stretch fit, soft waistband.", sizeOptions: ["S", "M", "L", "XL"] },

  // --- CLOTHING - WOMENS  ---
  { id: 4, name: "Women's Summer Floral Dress", price: 3800, image: "https://www.panacheapparels.com/cdn/shop/files/DSC06599.jpg?v=1740573069&width=1080", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Flowy rayon, mid-calf length.", sizeOptions: ["S", "M", "L"] },
  { id: 11, name: "Black Socks (Pack of 5)", price: 1890, image: "https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/M91942s.jpg?im=Resize,width=750", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Stretch fit for yoga and everyday wear.", sizeOptions: ["S", "M", "L"] },
  { id: 12, name: "Women's Chiffon Scarf", price: 599, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4pEh_ei9V5yQitl_vEpwMH6l26Skx-L3e3A&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Elegant sheer chiffon.", sizeOptions: [] },
  { id: 204, name: "Classic Trench Coat", price: 11999, image: "https://media.johnlewiscontent.com/i/JohnLewis/002571666?fmt=auto&$background-off-white$", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Water-resistant, timeless design.", sizeOptions: ["XS", "S", "M", "L"] },
  { id: 205, name: "Silk Blouse (Cream)", price: 4200, image: "https://di2ponv0v5otw.cloudfront.net/posts/2022/11/18/637746843676a1915fb38f2a/m_637748f8a0e6c6f5cdcfd014.jpeg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Luxurious feel, formal wear.", sizeOptions: ["S", "M", "L"] },
  { id: 206, name: "Pencil Skirt (Black)", price: 2990, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsHJg9ROj54JJ1ip_t_jOR1QnXg7i9I2szVQ&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Knee length, tailored fit.", sizeOptions: ["6", "8", "10", "12"] },
  { id: 207, name: "Knitted Cardigan (Dusty Pink)", price: 3550, image: "https://noellafashion.com/cdn/shop/files/5714694717063_Blue_001-11.jpg?v=1749714042", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Soft wool blend, open front.", sizeOptions: ["S", "M", "L"] },
  { id: 208, name: "Hoodie (Brown)", price: 1800, image: "https://echolope.com/cdn/shop/files/womens-premium-oversize-dark-brown-hoodie-171923.jpg?v=1745549187", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "High support, breathable fabric.", sizeOptions: ["S", "M", "L"] },
  { id: 209, name: "White Linen Trousers", price: 4900, image: "https://www.aspiga.com/cdn/shop/files/widelegblue1_1_800x.png?v=1744387811", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Relaxed fit, perfect for summer.", sizeOptions: ["XS", "S", "M", "L"] },
  { id: 210, name: "Sweatshirts Pack of 2 (White + Black)", price: 2700, image: "https://img01.ztat.net/article/spp-media-p1/f552740a691c4ef187e8ab7fe2296bab/82a6d66fa02a47a5be5cdd8658f85b9e.jpg?imwidth=762&filter=packshot", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Raw hem details, comfortable stretch.", sizeOptions: ["26", "28", "30", "32"] },
  { id: 211, name: "Plaid Blazer (Oversized)", price: 6800, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxX8yZIiSn83FU1NVZj2_90egp_PJI8tiuZw&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Structured shoulder pads, stylish print.", sizeOptions: ["S", "M", "L"] },
  { id: 212, name: "Basic Turtle Neck Top (Skin)", price: 1950, image: "https://outfit90s.com/cdn/shop/files/SkinTurtleNeckPakistan_97fad098-7a65-4029-83ee-fc4904be79b5.jpg?v=1757868162&width=1024", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Soft cotton blend, winter essential.", sizeOptions: ["XS", "S", "M"] },
  { id: 213, name: "Headband (Blue)", price: 1200, image: "https://zamani.pk/wp-content/uploads/2021/03/sylish-fabric-headband-600x750.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Zipper closure, comfortable lining.", sizeOptions: ["6", "8", "10"] },
  { id: 214, name: "Winter Hat (Grey)", price: 1100, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpA0rR_Eohtina90YbOJSiVaa4CfZJ1axqCQ&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Snap button closure, seamless fit.", sizeOptions: ["S", "M"] },
  { id: 215, name: "Ankle Socks 5-Pack (Grey)", price: 750, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtIcrzfgpSCibm5J-2SeZvBd40Xj3uRype2w&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Breathable cotton, neutral colours.", sizeOptions: ["One Size"] },
  { id: 216, name: "Leather Jacket", price: 14500, image: "https://static-01.daraz.pk/p/ad3012640d082ae409fcde4cda14d5da.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Vegan leather, silver hardware.", sizeOptions: ["XS", "S", "M", "L"] },
  { id: 217, name: "Maxi Skirt (Pleated)", price: 4500, image: "https://i5.walmartimages.com/asr/fb21cc3c-3647-4244-958c-7619fd164cdd.01b92bcffd1e7f62396a651bf2b6bde2.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Elastic waist, flowing chiffon.", sizeOptions: ["One Size"] },
  { id: 218, name: "Cropped T-Shirt (Loose Fit)", price: 1100, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkg77BiPmcsxdofHpV--F5nWtdKON1x8uhRA&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Soft jersey cotton.", sizeOptions: ["S", "M", "L"] },
  { id: 219, name: "High-Waist Wide Leg Jeans", price: 4600, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFQ2wf89_UBflfuDPlagZuKPAJ3HQfbF3tTA&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Light blue wash, retro style.", sizeOptions: ["26", "28", "30", "32"] },
  { id: 220, name: "Cashmere Jumper (Khaki Green)", price: 8990, image: "https://www.caramel-shop.co.uk/cdn/shop/files/POAWOMENJUMPEROLIVE-0.jpg?v=1748008411&width=2048", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.WOMENS, description: "Pure cashmere, luxury softness.", sizeOptions: ["S", "M", "L"] },

  // --- CLOTHING - KIDS  ---
  { id: 301, name: "Dinosaur T-Shirt", price: 1150, image: "https://bachaaparty.com/cdn/shop/files/z1246390670_2_b14b989a-6546-4301-ba54-ed112f422f0c.jpg?v=1737635900&width=1080", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Fun graphic print, soft fabric.", sizeOptions: ["5Y", "7Y", "9Y"] },
  { id: 302, name: "Kids' Plain Socks 3-Pack", price: 350, image: "https://thecutprice.com/cdn/shop/files/2_120d3907-f51e-4560-85c7-6e168329912a.jpg?v=1699591999&width=1445", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Comfortable and durable.", sizeOptions: ["Small", "Medium"] },
  { id: 303, name: "Unicorn Hoodie (Pink)", price: 2990, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdK8Uf3EV6LSfhcjiqy2S_Usr0l-LE0-yLtA&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Glitter details, warm fleece.", sizeOptions: ["4Y", "6Y", "8Y"] },
  { id: 304, name: "Boys Denim Jeans (Adjustable)", price: 2500, image: "https://m.media-amazon.com/images/I/811aTeyeizL._AC_UY1000_.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Elastic waistband, sturdy denim.", sizeOptions: ["5Y", "7Y", "10Y"] },
  { id: 305, name: "Girls Ruffled Skirt (Floral)", price: 1850, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTznozLCrX9ayBCWNiIvpWkVtYcn2cvpFci9A&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Light cotton, knee length.", sizeOptions: ["3Y", "5Y", "7Y"] },
  { id: 306, name: "Boys Waterproof Rain Jacket", price: 3800, image: "https://m.media-amazon.com/images/I/61ZuUTKjI1L._AC_UY1000_.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Hooded, bright yellow colour.", sizeOptions: ["6Y", "8Y", "10Y"] },
  { id: 307, name: "Pajama Set (Space Theme)", price: 1999, image: "https://i5.walmartimages.com/seo/ANINEO-Toddler-Boys-Children-Cute-Long-Sleeve-Pajamas-Print-Shirt-Tops-And-Pants-2PCS-Child-Kids-Sleepwear-Sets_5f144125-3cfc-4c1d-a5bf-fe16413e4154.963ee426ddab40fc85ff2b471a70ed48.jpeg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Soft cotton, glow-in-the-dark print.", sizeOptions: ["2T", "4T", "6Y"] },
  { id: 308, name: "Girls Cargo Pants (Beige)", price: 2200, image: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/b2ae2d9ba5792116aa33d41405769ceb.jpg?imageMogr2/auto-orient%7CimageView2/2/w/800/q/70/format/webp", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "UV protection, quick dry.", sizeOptions: ["4Y", "6Y", "8Y"] },
  { id: 309, name: "Boys Cargo Pants", price: 1600, image: "https://img.kwcdn.com/product/fancy/7fa785c1-8af2-40d3-a80d-d6e807aa3903.jpg?imageMogr2/auto-orient%7CimageView2/2/w/800/q/70/format/webp", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Durable cotton twill.", sizeOptions: ["5Y", "7Y", "9Y"] },
  { id: 310, name: "Toddler Sneakers (Boys)", price: 3200, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFNBrVxYFdYL6ncK2XiHSjY7Ocy1V2mlUDuw&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Velcro closure, supportive sole.", sizeOptions: ["5Y", "7Y", "9Y"] },
  { id: 311, name: "Girls Fleece Mittens & Hat Set", price: 950, image: "https://m.media-amazon.com/images/I/61bz3MJg2YL._AC_UY1000_.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Extra warm for winter.", sizeOptions: ["Small", "Medium"] },
  { id: 312, name: "Boys Long Sleeve Polo (Green)", price: 1750, image: "https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/151783s.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Smart casual look.", sizeOptions: ["6Y", "8Y", "10Y"] },
  { id: 313, name: "Girls Cinderella Blanket", price: 2400, image: "https://i.etsystatic.com/52930181/r/il/9c15b0/6534265694/il_340x270.6534265694_pxk5.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Stretchable material, spaghetti straps.", sizeOptions: ["XS", "S", "M"] },
  { id: 314, name: "Superhero Cape & Mask Set", price: 1100, image: "https://i.pinimg.com/736x/53/e4/d8/53e4d8c15ef02eacaf5500184f3c70dc.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Fun roleplay costume.", sizeOptions: ["Small", "Medium"] },
  { id: 315, name: "Cotton Vest 5-Pack (Baby)", price: 1400, image: "https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/585931s6.jpg?im=Resize,width=750", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Soft for sensitive skin.", sizeOptions: ["0-6M", "6-12M"] },
  { id: 316, name: "Boys Sports Track Suit (Blue)", price: 3999, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC7wdb05z_K1NX2QReeyV2izSOdC0uD9qUEQ&s", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Polyester material, comfortable fit.", sizeOptions: ["7Y", "9Y", "11Y"] },
  { id: 317, name: "Set of 2 Hats", price: 1800, image: "https://s.alicdn.com/@sc04/kf/H3471e96c5d264d3fae7d96933344e2cap/2pc-Casual-Mama-Mini-Baseball-Cap-Hat-Sets-Mother-Daughter-Adult-Child-Toddler-Girls-Adjustable.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Large capacity, padded straps.", sizeOptions: ["One Size"] },
  { id: 318, name: "Winter Beanie Hat", price: 550, image: "https://m.media-amazon.com/images/I/71HKoHce4XL._AC_SX466_.jpg", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Acrylic knit, pom-pom detail.", sizeOptions: ["Small", "Medium"] },
  { id: 319, name: "Set of 4 Hair Clips (Girls)", price: 450, image: "https://www.pakstyle.pk/cdn/shop/files/p16476-4-hair-clips-for-girls.jpg?v=1759484987", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Decorative bows and clips.", sizeOptions: ["One Size"] },
  { id: 320, name: "Boys Formal Dress Shoes (Black)", price: 4200, image: "https://i.ebayimg.com/images/g/zagAAOSwmOhfv~2p/s-l400.png", category: PAGES.CLOTHING, subCategory: CLOTHING_CATEGORIES.KIDS, description: "Lace-up, patent finish.", sizeOptions: ["J1", "J2", "J3"] },
];
// --- 3. HELPER COMPONENTS (Unchanged) ---
// ... (NavButton, ProductCard, OrderStatusUpdater are unchanged)
const NavButton = ({ icon: Icon, text, onClick, isActive }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-200
      ${isActive 
        ? 'bg-emerald-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-gray-100'}`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="hidden sm:inline">{text}</span>
  </button>
);

const ProductCard = ({ product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizeOptions.length > 0 ? product.sizeOptions[0] : null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (product.sizeOptions.length > 0 && !selectedSize) {
      console.error("Please select a size before adding to cart.");
      return;
    }

    setIsAdding(true);
    setTimeout(() => { // Simulate network delay for effect
      addToCart(product, quantity, selectedSize);
      setIsAdding(false);
      setQuantity(1); // Reset quantity
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:scale-[1.02] transition duration-300 border border-gray-200">
      
      {/* Product Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x500/d1fae5/065f46?text=Image+Error"; }}
        />
        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          Rs. {product.price.toLocaleString()}
        </span>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col grow">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 grow mb-3">{product.description}</p>
        
        {/* Size Selector (Clothing only) */}
        {product.sizeOptions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Select Size:</p>
            <div className="flex flex-wrap gap-2">
              {product.sizeOptions.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors 
                    ${selectedSize === size 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between bg-gray-100 rounded-xl p-2">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1 bg-white rounded-full hover:bg-gray-200 transition"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4 text-gray-700" />
            </button>
            <span className="font-bold text-gray-800 w-10 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="p-1 bg-white rounded-full hover:bg-gray-200 transition"
            >
              <Plus className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || (product.sizeOptions.length > 0 && !selectedSize)}
            className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors duration-300 shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {isAdding ? (
              <Loader className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <ShoppingCart className="w-5 h-5 mr-2" />
            )}
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderStatusUpdater = ({ order, db, appId }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const STATUSES = [
    { value: 'Pending', icon: List, color: 'text-yellow-600 bg-yellow-100' },
    { value: 'Processing', icon: Loader, color: 'text-blue-600 bg-blue-100' },
    { value: 'Shipped', icon: Truck, color: 'text-indigo-600 bg-indigo-100' },
    { value: 'Delivered', icon: Check, color: 'text-green-600 bg-green-100' },
    { value: 'Cancelled', icon: X, color: 'text-red-600 bg-red-100' },
  ];

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      const orderDocRef = doc(db, `artifacts/${appId}/public/data/orders`, order.id);
      await updateDoc(orderDocRef, { status: newStatus });
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const status = STATUSES.find(s => s.value === currentStatus) || STATUSES[0];
  const Icon = status.icon;

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        disabled={isUpdating}
        className={`appearance-none block w-full pl-8 pr-10 py-1 text-sm rounded-full font-medium cursor-pointer transition-colors ${status.color} border-0 focus:ring-2 focus:ring-offset-2 focus:ring-current disabled:opacity-75`}
        style={{ paddingRight: '2.5rem' }}
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.value}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
        {isUpdating ? <Loader className="w-4 h-4 animate-spin text-gray-500" /> : <Icon className={`w-4 h-4 ${status.color.split(' ')[0]}`} />}
      </div>
    </div>
  );
};

// --- 4. PAGE COMPONENTS ---

const HomePage = ({ navigate }) => (
  <div className="p-8 bg-white rounded-xl shadow-2xl text-center">
    <Shirt className="w-16 h-16 mx-auto text-emerald-600 mb-6" />
    <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Welcome to EcomPK: Your Online Retail Hub</h2>
    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
      Discover the best of Pakistani retail with EcomPK. We offer a curated selection of high-quality clothing for men, women, and kids, alongside essential general products. Whether you're looking for the latest fashion trends or everyday electronics, we provide competitive prices and fast, reliable nationwide delivery.
    </p>
    
    <div className="flex flex-col sm:flex-row justify-center gap-6">
      <button 
        onClick={() => navigate(PAGES.CLOTHING)}
        className="px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-transform transform hover:scale-105 shadow-xl"
      >
        Explore Fashion <Shirt className="w-5 h-5 ml-2 inline" />
      </button>
      <button 
        onClick={() => navigate(PAGES.PRODUCTS)}
        className="px-8 py-4 bg-gray-200 text-gray-800 text-lg font-bold rounded-xl hover:bg-gray-300 transition-transform transform hover:scale-105 shadow-xl"
      >
        Shop General Products <Tally3 className="w-5 h-5 ml-2 inline" />
      </button>
    </div>
  </div>
);

// --- UPDATED ProductsPage with Sorting ---
const ProductsPage = ({ addToCart }) => {
  const [sortOrder, setSortOrder] = useState(SORT_OPTIONS.DEFAULT);
  
  const generalProducts = MOCK_PRODUCTS.filter(p => p.category === PAGES.PRODUCTS);

  const sortedProducts = useMemo(() => {
    let sorted = [...generalProducts];

    if (sortOrder === SORT_OPTIONS.CHEAP) {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOrder === SORT_OPTIONS.EXPENSIVE) {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  }, [generalProducts, sortOrder]);

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-extrabold text-emerald-700 border-b pb-2 mb-4">General Products & Accessories</h2>
        
      {/* Sorting Bar for General Products */}
      <div className="flex justify-end items-center gap-4 p-4 bg-gray-100 rounded-xl shadow-inner">
        <label htmlFor="product-sort" className="text-sm font-semibold text-gray-700 hidden sm:block">Sort By:</label>
        <div className="relative w-full sm:w-64">
          <select
            id="product-sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none block w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-10 text-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value={SORT_OPTIONS.DEFAULT}>Default Sort</option>
            <option value={SORT_OPTIONS.CHEAP}>Price: Low to High</option>
            <option value={SORT_OPTIONS.EXPENSIVE}>Price: High to Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            {sortOrder === SORT_OPTIONS.CHEAP ? <SortAsc className="w-4 h-4" /> : 
             sortOrder === SORT_OPTIONS.EXPENSIVE ? <SortDesc className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map(product => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

const ClothingPage = ({ addToCart }) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState(CLOTHING_CATEGORIES.MENS);
  const [sortOrder, setSortOrder] = useState(SORT_OPTIONS.DEFAULT);

  const availableProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => 
      p.category === PAGES.CLOTHING && p.subCategory === selectedSubCategory
    );
  }, [selectedSubCategory]);

  const sortedAndFilteredProducts = useMemo(() => {
    let sorted = [...availableProducts];

    if (sortOrder === SORT_OPTIONS.CHEAP) {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOrder === SORT_OPTIONS.EXPENSIVE) {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  }, [availableProducts, sortOrder]);

  const categoryButtons = [
    { key: CLOTHING_CATEGORIES.MENS, label: `Men's Wear` },
    { key: CLOTHING_CATEGORIES.WOMENS, label: `Women's Wear` },
    { key: CLOTHING_CATEGORIES.KIDS, label: `Kid's Corner` },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-extrabold text-emerald-700 border-b pb-2 mb-4">Clothing Collection</h2>
      
      {/* Filters and Sorting Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-100 rounded-xl shadow-inner">
        
        {/* Sub-Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categoryButtons.map(cat => (
            <button
              key={cat.key}
              onClick={() => { setSelectedSubCategory(cat.key); setSortOrder(SORT_OPTIONS.DEFAULT); }}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors 
                ${selectedSubCategory === cat.key 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-emerald-50'}`
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        {/* Sorting Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none block w-full bg-white border border-gray-300 rounded-xl py-2 pl-3 pr-10 text-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value={SORT_OPTIONS.DEFAULT}>Default Sort</option>
            <option value={SORT_OPTIONS.CHEAP}>Price: Low to High</option>
            <option value={SORT_OPTIONS.EXPENSIVE}>Price: High to Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            {sortOrder === SORT_OPTIONS.CHEAP ? <SortAsc className="w-4 h-4" /> : 
             sortOrder === SORT_OPTIONS.EXPENSIVE ? <SortDesc className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedAndFilteredProducts.length > 0 ? (
          sortedAndFilteredProducts.map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))
        ) : (
          <p className="col-span-full text-center py-12 text-gray-500">No products found in this category.</p>
        )}
      </div>
    </div>
  );
};

const TrackOrderPage = ({ db, userId, appId, isAuthReady }) => {
  const [orderId, setOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch a single order (now triggered only on submission)
  const handleTrack = async (e) => {
    e.preventDefault();
    if (!db || !isAuthReady) {
      setError("Service not ready. Please wait or check connection.");
      return;
    }
    
    const trimmedId = orderId.trim();
    if (!trimmedId) {
      setError("Please enter a valid Order ID.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackedOrder(null);
    
    try {
        // Correct use of doc and getDoc functions
        const orderDocRef = doc(db, `artifacts/${appId}/public/data/orders`, trimmedId);
        const docSnap = await getDoc(orderDocRef);

        if (docSnap.exists()) {
            const orderData = { id: docSnap.id, ...docSnap.data() };
            // Basic security check (only show if it belongs to the current user or is a public order)
            if (orderData.userId === userId || !orderData.userId) { 
               setTrackedOrder(orderData);
            } else {
               setError(`Order ID "${trimmedId}" found, but it does not match your current user session.`);
            }
        } else {
            setError(`Order ID "${trimmedId}" not found.`);
        }
    } catch (err) {
      console.error("Error tracking order:", err);
      setError("An error occurred while fetching the order details.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'Processing': return 'bg-blue-500';
      case 'Shipped': return 'bg-indigo-500';
      case 'Delivered': return 'bg-green-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold text-emerald-700 mb-6 flex items-center">
        <Package className="w-7 h-7 mr-3" /> Track Your Order
      </h2>
      <p className="text-gray-600 mb-6">Enter your unique Order ID to check its current status.</p>

      <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Enter Order ID (e.g., d1G3bC2fWkY)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="grow p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
          required
        />
        <button 
          type="submit"
          disabled={isLoading || !isAuthReady}
          className="sm:w-auto w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Track Order'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-6 flex items-center">
          <X className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {trackedOrder && (
        <div className="p-6 border border-emerald-300 rounded-xl bg-emerald-50 shadow-inner">
          <h3 className="text-xl font-bold text-emerald-800 mb-4">Order Status for ID: {trackedOrder.id}</h3>
          
          <div className="space-y-3">
            <p className="flex justify-between">
              <span className="font-semibold text-gray-700">Customer:</span>
              <span className="text-gray-900">{trackedOrder.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-semibold text-gray-700">Delivery To:</span>
              <span className="text-gray-900 truncate max-w-xs" title={trackedOrder.addresses}>{trackedOrder.addresses}, {trackedOrder.city}, {trackedOrder.country}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-semibold text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-emerald-600">Rs. {trackedOrder.total.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-semibold text-gray-700">Current Status:</span>
              <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${getStatusColor(trackedOrder.status)}`}>
                {trackedOrder.status}
              </span>
            </p>
          </div>
          
          <h4 className="font-bold text-gray-800 mt-4 mb-2 border-t pt-3">Items ({trackedOrder.items.length}):</h4>
          <ul className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto">
            {trackedOrder.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                <span className="font-medium">{item.name} (x{item.quantity})</span>
                <span className="text-xs">Size: {item.size || 'N/A'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


const OrderSuccessPage = ({ orderId, navigate }) => (
  <div className="p-8 bg-white rounded-xl shadow-2xl max-w-lg mx-auto text-center border-t-4 border-emerald-500">
      <Check className="w-16 h-16 mx-auto text-emerald-600 mb-6 bg-emerald-100 p-2 rounded-full" />
      <h2 className="text-3xl font-extrabold text-gray-800 mb-3">Order Placed Successfully!</h2>
      <p className="text-gray-600 mb-6">Thank you for shopping with EcomPK. Your order is being processed.</p>
      
      <div className="p-4 bg-emerald-50 rounded-xl mb-8">
          <p className="font-semibold text-gray-700">Your Unique Order ID for tracking:</p>
          <p className="text-2xl font-mono font-bold text-emerald-700 break-all mt-1">{orderId}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
              onClick={() => { navigate(PAGES.TRACK_ORDER); }}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center"
          >
              <Truck className="w-5 h-5 mr-2" /> Track Order
          </button>
          <button 
              onClick={() => navigate(PAGES.CLOTHING)}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors shadow-md"
          >
              Continue Shopping
          </button>
          <button 
              onClick={() => navigate(PAGES.HOME)}
              className="w-full sm:w-auto px-6 py-3 border border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-md"
          >
              Go to Home
          </button>
      </div>
  </div>
);


const CartSidebar = ({ cart, setCart, toggleCart, navigate, db, userId, appId, isAuthReady }) => {
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    // Checkout fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [addresses, setAddresses] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Pakistan'); // Default country

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

    const updateQuantity = useCallback((uniqueId, delta) => {
        setCart(prevCart => {
            const newCart = prevCart.map(item => 
                item.uniqueId === uniqueId 
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
                    : item
            ).filter(item => item.quantity > 0);
            return newCart;
        });
    }, [setCart]);

    const removeItem = useCallback((uniqueId) => {
        setCart(prevCart => prevCart.filter(item => item.uniqueId !== uniqueId));
    }, [setCart]);

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            console.error("Cart is empty.");
            return;
        }

        if (!db || !userId || !isAuthReady) {
            console.error("Database connection not ready. Please wait or check connection.");
            return;
        }

        setIsCheckingOut(true);

        const orderData = {
            userId: userId,
            name: name,
            phone: phone,
            email: email,
            addresses: addresses,
            city: city,
            country: country,
            total: cartTotal,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size || 'N/A',
                image: item.image,
            })),
            status: 'Pending', // Initial status
            timestamp: Date.now(),
        };

        try {
            // Save the order to the public orders collection
            const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
            const docRef = await addDoc(ordersRef, orderData);
            
            setCart([]); // Clear cart on success
            toggleCart(); // Close cart
            navigate(PAGES.CHECKOUT_SUCCESS, docRef.id); // Navigate to success page with Order ID
        } catch (error) {
            console.error("Error during checkout:", error);
            // Show custom modal/message for error (instead of alert)
        } finally {
            setIsCheckingOut(false);
        }
    };

    const isCartEmpty = cart.length === 0;

    return (
        <div className="fixed inset-0 overflow-hidden z-50">
            <div className="absolute inset-0 overflow-hidden">
                {/* Overlay */}
                <div 
                    className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
                    onClick={toggleCart}
                ></div>

                {/* Sidebar Panel */}
                <section className="absolute inset-y-0 right-0 max-w-full flex">
                    <div className="w-screen max-w-md">
                        <div className="h-full flex flex-col bg-white shadow-xl">
                            
                            {/* Header */}
                            <div className="p-6 bg-emerald-600 text-white flex items-center justify-between rounded-bl-xl">
                                <h2 className="text-2xl font-bold flex items-center">
                                    <ShoppingCart className="w-6 h-6 mr-3" /> Shopping Cart
                                </h2>
                                <button onClick={toggleCart} className="text-white hover:text-gray-100 transition-colors p-1">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                {isCartEmpty ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <ShoppingCart className="w-10 h-10 mx-auto mb-3" />
                                        <p className="font-semibold">Your cart is empty.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 space-y-4">
                                        {cart.map((item) => (
                                            <li key={item.uniqueId} className="flex py-4">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="h-20 w-20 shrink-0 rounded-xl object-cover border border-gray-200"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e5e7eb/4b5563?text=P"; }}
                                                />

                                                <div className="ml-4 flex flex-1 flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                            <h3>{item.name}</h3>
                                                            <p className="ml-4 font-bold text-emerald-600">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">Size: {item.size || 'N/A'}</p>
                                                    </div>
                                                    <div className="flex flex-1 items-end justify-between text-sm mt-2">
                                                        <div className="flex items-center space-x-2">
                                                            <button onClick={() => updateQuantity(item.uniqueId, -1)} className="p-1 border rounded-full hover:bg-gray-100 transition">
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-semibold">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.uniqueId, 1)} className="p-1 border rounded-full hover:bg-gray-100 transition">
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <button 
                                                            onClick={() => removeItem(item.uniqueId)} 
                                                            type="button" 
                                                            className="font-medium text-red-600 hover:text-red-500"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                
                                {/* Checkout Form */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between text-xl font-bold text-gray-900 mb-4">
                                        <p>Total:</p>
                                        <p>Rs. {cartTotal.toLocaleString()}</p>
                                    </div>
                                    
                                    <form onSubmit={handleCheckout} className="space-y-3">
                                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-1 flex items-center"><User className="w-4 h-4 mr-2"/> Delivery & Contact Details</h4>
                                        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />
                                        <input type="email" placeholder="Email Address (e.g., user@example.com)" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />
                                        <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />

                                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-1 pt-3 flex items-center"><MapPin className="w-4 h-4 mr-2"/> Shipping Address</h4>
                                        <input type="text" placeholder="Street Address / House No." value={addresses} onChange={(e) => setAddresses(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />
                                        
                                        <div className="flex gap-3">
                                          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="w-1/2 p-2 border border-gray-300 rounded-lg" />
                                          <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required className="w-1/2 p-2 border border-gray-300 rounded-lg" />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isCheckingOut || isCartEmpty || !name || !phone || !addresses || !city || !country || !email}
                                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {isCheckingOut ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                            {isCheckingOut ? 'Processing...' : `Place Order (Rs. ${cartTotal.toLocaleString()})`}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const OrderRow = ({ order, db, appId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleDelete = async () => {
        // Custom message box logic (replacing confirm())
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete Order ID: ${order.id}?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const orderDocRef = doc(db, `artifacts/${appId}/public/data/orders`, order.id);
            await deleteDoc(orderDocRef);
            console.log(`Order ${order.id} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting order:", error);
            setIsDeleting(false); 
        }
    };

    return (
        <>
            <tr className="hover:bg-red-50 transition-colors cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-gray-900 break-all">
                    {order.id}
                </td>
                <td className="px-3 py-4 text-sm text-gray-700">
                    <p className="font-semibold">{order.name}</p>
                    <p className="text-xs text-gray-500 truncate" title={order.userId}>User ID: {order.userId.substring(0, 8)}...</p>
                </td>
                <td className="px-3 py-4 text-xs text-gray-500 max-w-xs">
                    <p className="font-medium text-gray-800">{order.phone}</p>
                    <p className="truncate" title={order.addresses}>{order.addresses}, {order.city}</p>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">Rs. {order.total.toLocaleString()}</td>
                <td className="px-3 py-4 whitespace-nowrap">
                    <OrderStatusUpdater order={order} db={db} appId={appId} />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-200 transition"
                            title={isExpanded ? "Collapse Details" : "View Details"}
                        >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <List className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-200 transition disabled:opacity-50"
                            title="Delete Order"
                        >
                            {isDeleting ? <Loader className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-red-100/50">
                    <td colSpan="6" className="p-4 border-t border-red-200">
                        <h4 className="font-bold text-red-800 mb-2">Ordered Items:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                            {order.items.map((item, index) => (
                                <li key={index} className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-8 h-8 object-cover rounded"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/32x32/64748b/ffffff?text=P"; }}
                                    />
                                    <div className="grow">
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity} | Size: {item.size || 'N/A'}</p>
                                    </div>
                                    <span className="font-bold text-emerald-600 whitespace-nowrap">
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </td>
                </tr>
            )}
        </>
    );
};


const AdminPanel = ({ db, appId, isAuthReady }) => {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const MOCK_PASSWORD = 'admin123';
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === MOCK_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      console.error("Admin Login Failed: Incorrect Password"); 
    }
  };
  
  useEffect(() => {
    if (!isLoggedIn || !db || !isAuthReady) {
      setOrders([]);
      setIsLoadingOrders(false);
      return;
    }

    setIsLoadingOrders(true);
    const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
    
    // Sort orders by timestamp descending
    const ordersQuery = query(ordersRef, orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setOrders(fetchedOrders);
      setIsLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching orders in Admin Panel:", error);
      setIsLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [isLoggedIn, db, appId, isAuthReady]); 

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  if (!isLoggedIn) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-2xl max-w-sm mx-auto text-center">
        <Lock className="w-10 h-10 mx-auto text-red-600 mb-4" />
        <h2 className="text-2xl font-extrabold text-red-700 mb-4">Admin Login</h2>
        <p className="text-gray-500 mb-6">Enter password to access dashboard. (Hint: admin123)</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            required
          />
          <button 
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // Logged In View
  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-red-700 flex items-center">
          <Lock className="w-7 h-7 mr-3" /> Admin Dashboard (PKR)
        </h2>
        <button 
          onClick={() => setIsLoggedIn(false)}
          className="px-4 py-2 bg-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-300 transition"
        >
          Logout
        </button>
      </div>
      
      <p className="text-lg text-gray-600 mb-8">Management view for EcomPK operations and sales metrics (Real-time data).</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
          <p className="text-4xl font-bold text-red-600">{MOCK_PRODUCTS.length}</p>
          <p className="text-gray-700 mt-1">Total Mock SKUs</p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
          <p className="text-4xl font-bold text-red-600">{totalOrders}</p>
          <p className="text-gray-700 mt-1">Total Orders Placed</p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
          <p className="text-4xl font-bold text-red-600">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-gray-700 mt-1">Total Revenue</p>
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <ShoppingCart className="w-6 h-6 mr-2" /> Recent Orders
        {isLoadingOrders && <Loader className="w-5 h-5 ml-3 animate-spin text-gray-400" />}
      </h3>
      
      <div className="overflow-x-auto bg-gray-50 rounded-xl shadow-inner">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address/Contact</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 && !isLoadingOrders ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 italic">No orders found in the database.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <OrderRow key={order.id} order={order} db={db} appId={appId} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ContactUsPage = () => (
  <div className="p-8 bg-white rounded-xl shadow-2xl max-w-lg mx-auto">
    <h2 className="text-3xl font-extrabold text-emerald-700 mb-6 flex items-center justify-center">
      <Mail className="w-7 h-7 mr-3" /> Get In Touch
    </h2>
    <p className="text-gray-600 mb-6 text-center">We'd love to hear from you. We respond within 24 hours.</p>

    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input type="text" id="name" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" id="email" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea id="message" rows="4" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"></textarea>
      </div>
      <button 
        type="submit"
        onClick={(e) => { e.preventDefault(); console.log("Contact form submitted."); }}
        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center"
      >
        <MessageSquare className="w-5 h-5 mr-2" /> Send Message
      </button>
    </form>
  </div>
);


// --- Main App Component ---

const App = () => {
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);

  // --- Firebase State ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // App ID from global variable or local fallback
  const appId = typeof __app_id !== 'undefined' ? __app_id : LOCAL_APP_ID;

  // 1. Initialize Firebase and Auth
  useEffect(() => {
    try {
      const configSource = typeof __firebase_config !== 'undefined' ? __firebase_config : JSON.stringify(LOCAL_FIREBASE_CONFIG);
      const firebaseConfig = JSON.parse(configSource);
      
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authService = getAuth(app);

      setDb(firestore);
      setAuth(authService);

      const initialAuth = async (authService) => {
        const authToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : LOCAL_AUTH_TOKEN;

        try {
          if (authToken) {
            await signInWithCustomToken(authService, authToken);
          } else {
            await signInAnonymously(authService);
          }
        } catch (error) {
          console.error("Firebase Auth Error: Failed to sign in. Attempting anonymous sign-in.", error);
          await signInAnonymously(authService);
        }
      };
      
      initialAuth(authService);

      const unsubscribe = onAuthStateChanged(authService, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(crypto.randomUUID()); 
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
      
    } catch (error) {
      console.error("Firebase Initialization Failed (CRITICAL ERROR): Check your config object structure!", error);
      setIsAuthReady(true); 
    }
  }, []);


  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Updated navigate to handle the order ID for the success page
  const navigate = (page, orderId = null) => {
    setCurrentPage(page);
    setLastOrderId(orderId);
    if (isCartOpen) setIsCartOpen(false); 
  };

  const addToCart = (product, quantity, size) => {
    const uniqueId = `${product.id}-${size || 'NA'}`;

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.uniqueId === uniqueId);

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { 
          ...product, 
          uniqueId: uniqueId, 
          quantity: quantity, 
          size: size 
        }];
      }
    });
  };

  const renderPage = () => {
    const firebaseProps = { db, userId, appId, isAuthReady };

    switch (currentPage) {
      case PAGES.HOME:
        return <HomePage navigate={navigate} />;
      case PAGES.PRODUCTS:
        return <ProductsPage addToCart={addToCart} />;
      case PAGES.CLOTHING:
        return <ClothingPage addToCart={addToCart} />;
      case PAGES.TRACK_ORDER:
        return <TrackOrderPage {...firebaseProps} />;
      case PAGES.ADMIN:
        return <AdminPanel {...firebaseProps} />;
      case PAGES.CONTACT_US:
        return <ContactUsPage />;
      case PAGES.CHECKOUT_SUCCESS:
        return lastOrderId ? <OrderSuccessPage orderId={lastOrderId} navigate={navigate} /> : <HomePage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 font-sans">
      
      {/* --- Sticky Header & Navigation (Rounded) --- */}
      <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl py-3 px-4 flex justify-between items-center transition-all duration-300">
          
          {/* LEFT SIDE: Logo and ALL Navigation Links */}
          <div className="flex items-center space-x-6">
            <h1 onClick={() => navigate(PAGES.HOME)} className="text-3xl font-extrabold text-emerald-700 flex items-center cursor-pointer">
              <Shirt className="w-8 h-8 mr-2" /> EcomPK
            </h1>

            {/* Main Navigation Links (Desktop) */}
            <div className="hidden lg:flex space-x-1">
                <NavButton icon={Home} text="Home" onClick={() => navigate(PAGES.HOME)} isActive={currentPage === PAGES.HOME} />
                <NavButton icon={Tally3} text="General Products" onClick={() => navigate(PAGES.PRODUCTS)} isActive={currentPage === PAGES.PRODUCTS} />
                <NavButton icon={Shirt} text="Clothing" onClick={() => navigate(PAGES.CLOTHING)} isActive={currentPage === PAGES.CLOTHING} />
                <NavButton icon={Package} text="Track Order" onClick={() => navigate(PAGES.TRACK_ORDER)} isActive={currentPage === PAGES.TRACK_ORDER || currentPage === PAGES.CHECKOUT_SUCCESS} />
                <NavButton icon={Mail} text="Contact Us" onClick={() => navigate(PAGES.CONTACT_US)} isActive={currentPage === PAGES.CONTACT_US} />
                <NavButton icon={Lock} text="Admin Panel" onClick={() => navigate(PAGES.ADMIN)} isActive={currentPage === PAGES.ADMIN} />
            </div>
          </div>
          
          {/* RIGHT SIDE: Only the Cart Button */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 text-xs font-bold rounded-full border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Links (Simplified for small screens) */}
        <div className="lg:hidden flex justify-around py-2 border-t border-gray-100 mt-2 px-2 rounded-2xl bg-white shadow-lg overflow-x-auto">
            <NavButton icon={Home} text="Home" onClick={() => navigate(PAGES.HOME)} isActive={currentPage === PAGES.HOME} />
            <NavButton icon={Tally3} text="Products" onClick={() => navigate(PAGES.PRODUCTS)} isActive={currentPage === PAGES.PRODUCTS} />
            <NavButton icon={Shirt} text="Clothing" onClick={() => navigate(PAGES.CLOTHING)} isActive={currentPage === PAGES.CLOTHING} />
            <NavButton icon={Package} text="Track" onClick={() => navigate(PAGES.TRACK_ORDER)} isActive={currentPage === PAGES.TRACK_ORDER} />
            <NavButton icon={Lock} text="Admin" onClick={() => navigate(PAGES.ADMIN)} isActive={currentPage === PAGES.ADMIN} />
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4"> 
        {renderPage()}
      </div>

      {/* --- Cart Sidebar Modal --- */}
      {isCartOpen && (
        <CartSidebar 
          cart={cart} 
          setCart={setCart} 
          toggleCart={() => setIsCartOpen(false)} 
          navigate={navigate}
          db={db}
          userId={userId}
          appId={appId}
          isAuthReady={isAuthReady}
        />
      )}
      
      {/* Loading Indicator for Auth */}
      {!isAuthReady && (
        <div className="fixed top-0 left-0 w-full bg-yellow-100 text-yellow-800 text-sm p-2 text-center flex items-center justify-center z-50">
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          Connecting to secure services...
        </div>
      )}
      {/* Display user ID (mandatory for multi-user apps) */}
      {isAuthReady && userId && (
        <div className="fixed bottom-0 right-0 p-2 text-xs bg-gray-900 text-gray-400 rounded-tl-xl shadow-lg z-50">
          User ID: <span className="font-mono text-white">{userId}</span>
        </div>
      )}
    </div>
  );
};
export default App;
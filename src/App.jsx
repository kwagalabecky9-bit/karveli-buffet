import { useState, useMemo, useCallback, memo, useEffect } from "react";
import { supabase } from "./supabase";

// ─── CONSTANTS (outside component, computed once) ─────────────────────────────
const B = { maroon:"#6B1A1A", dark:"#3D0E0E", gold:"#C4922A", cream:"#F5E6C8", bg:"#FBF7F0", white:"#FDFAF5", border:"#E8D9C0", text:"#2A1A0E", muted:"#8B6B4A", mid:"#5C3A1E", green:"#4A7C59", blue:"#2C5F8A" };
const fmtN = (n, dp=2) => (isNaN(n)||n==null) ? "0" : Number(n).toFixed(dp);
const fmt = (n) => "UGX " + Math.round(n||0).toLocaleString();
const uid = () => Math.random().toString(36).slice(2,9);
const todayStr = () => new Date().toLocaleDateString("en-UG",{year:"numeric",month:"long",day:"numeric"});
const DISH_CATS = ["Starches","Proteins","Sauces","Sides","Salads","Desserts","Breakfast","Eggs & Omelettes","Pastries & Breads","Beverages","Accompaniments","Other"];
const DIET_TAGS = ["veg","vegan","gluten-free","dairy-free","contains-nuts","halal"];
const BRANCHES  = ["Lumumba Avenue","Munyonyo","Bukoto To Go","Gaba Road","All Branches"];
const TABS = [{id:"items",label:"📦 Prices"},{id:"recipes",label:"🧑‍🍳 Recipes"},{id:"packages",label:"📋 Packages"},{id:"menu",label:"🍽️ Menu Builder"},{id:"saved",label:"💾 Saved"},{id:"issue",label:"🧾 Issue Sheet"},{id:"records",label:"📜 Records"}];

// ─── SEED DATA (computed once at module level) ────────────────────────────────
const SEED_ITEMS = [
  {name:"Avocado",unit:"Each",price:2333.33},{name:"Baby Marrow",unit:"Kilogram",price:4495.72},{name:"Baby Spinach",unit:"Kilogram",price:4500},{name:"Baking Powder",unit:"Packet 100g",price:588.51},{name:"Balsamic Vinegar",unit:"Liter",price:56000},{name:"Banana leaves",unit:"Kilogram",price:1000},{name:"Basil Leaves",unit:"Kilogram",price:15000},{name:"BBQ Sauce",unit:"Portion",price:3357.03},{name:"Bay Leaves (Whole)",unit:"Kilogram",price:5000},
  {name:"Beef Bacon",unit:"Packet 1Kg",price:40000},{name:"Beef Fillet",unit:"Kilogram",price:30944.85},{name:"Beef Liver",unit:"Kilogram",price:22000},{name:"Beef Masala",unit:"Tin 100g",price:3929.69},{name:"Beef On Bone",unit:"Kilogram",price:18285.71},{name:"Beef Sausage",unit:"Packet 1Kg",price:23072.03},{name:"Beef Shin",unit:"Kilogram",price:20000},{name:"Beetroot",unit:"Kilogram",price:5000},{name:"Biryani Masala",unit:"Packet 60g",price:4830.51},
  {name:"Black Olives",unit:"Bottle 340g",price:9865.01},{name:"Black Pepper Powder",unit:"Tin 100g",price:8728.81},{name:"Broccoli",unit:"Kilogram",price:7017.54},{name:"Brown Sugar",unit:"Packet 1Kg",price:10169.98},{name:"Butternut",unit:"Each",price:10000},{name:"Cabbage",unit:"Each",price:4000},{name:"Cake Flour",unit:"Kilogram",price:3060},{name:"Capers",unit:"Tin 100g",price:6779.66},
  {name:"Cardamom Seeds",unit:"Packet 1Kg",price:161016.95},{name:"Cardamon Powder",unit:"Tin 100g",price:13983.05},{name:"Carrots",unit:"Kilogram",price:2491.39},{name:"Cashew Nuts",unit:"Packet 1Kg",price:40677.97},{name:"Cassava",unit:"Kilogram",price:1379.31},{name:"Caster Sugar",unit:"Packet 500g",price:4699.84},{name:"Cauliflower",unit:"Kilogram",price:9561.56},{name:"Cayenne Pepper",unit:"Tin 100g",price:5338.98},
  {name:"Celery",unit:"Kilogram",price:22222.22},{name:"Cherry Tomatoes",unit:"Packet 500g",price:6666.67},{name:"Chicken Fillet",unit:"Kilogram",price:19000},{name:"Chicken Gizzards",unit:"Kilogram",price:17880},{name:"Chicken Liver",unit:"Kilogram",price:13000},{name:"Chicken Masala",unit:"Tin 100g",price:3983.05},{name:"Chicken Sausages",unit:"Packet 1Kg",price:23192.53},{name:"Chicken Thighs",unit:"Kilogram",price:11500},{name:"Chicken Wings",unit:"Kilogram",price:14002.31},
  {name:"Chocolate Chips",unit:"Packet 1Kg",price:40000},{name:"Cinnamon",unit:"Tin 100g",price:7203.39},{name:"Cinnamon Sticks",unit:"Packet 200g",price:11440.68},{name:"Cloves",unit:"Tin 100g",price:5084.75},{name:"Cocktail Juice",unit:"Glass",price:3674},{name:"Cocoa Powder",unit:"Bag 25kg",price:508474.58},{name:"Coconut Cream",unit:"Tin 400ml",price:9322.03},{name:"Coconut Milk",unit:"Tin 400ml",price:6567.8},
  {name:"Coke",unit:"Bottle",price:670.66},{name:"Concasse",unit:"Portion",price:560},{name:"Cooking Cream",unit:"Bottle 1lt",price:17000},{name:"Cooking Oil",unit:"Bottle 20litres",price:138553},{name:"Cooking Salt",unit:"Packet 500g",price:622.62},{name:"Coriander",unit:"Kilogram",price:8555.77},{name:"Cornflour",unit:"Packet 400g",price:2471.75},{name:"Cream Cheese",unit:"Packet 200g",price:21186.44},
  {name:"Cucumber",unit:"Kilogram",price:3790.7},{name:"Cumin Powder",unit:"Tin 100g",price:8050.85},{name:"Cumin Seeds",unit:"Packet 500g",price:25423.73},{name:"Dates",unit:"Packet 500g",price:6000},{name:"Desiccated Coconut",unit:"Packet 500g",price:11016.95},{name:"Doodo",unit:"Kilogram",price:1437.13},{name:"Dry Beans",unit:"Kilogram",price:6000},{name:"Egg Plant",unit:"Kilogram",price:4000},
  {name:"Eggs",unit:"Tray 30pc",price:13000},{name:"Farfale",unit:"Packet 500g",price:8050.85},{name:"Fanta 350ml Plastic",unit:"Bottle",price:847.46},{name:"Fennel Seeds",unit:"Kilogram",price:50000},{name:"Feta Cheese",unit:"Packet 500g",price:19389.83},{name:"Fish Masala",unit:"Tin 100g",price:3983.05},{name:"French Beans",unit:"Kilogram",price:5666.67},{name:"Fresh Milk",unit:"Liter",price:2711.86},
  {name:"Fresh Peas",unit:"Kilogram",price:13000},{name:"Fresh beans",unit:"Kilogram",price:8000},{name:"Fruit Salad",unit:"Portion",price:5269},{name:"Fusili",unit:"Packet 400g",price:3593.22},{name:"Garam Masala",unit:"Tin 100g",price:8227.12},{name:"Garlic",unit:"Kilogram",price:16000},{name:"Garlic Powder",unit:"Packet 100g",price:4745.76},{name:"Gelatine",unit:"Packet 500g",price:20000},
  {name:"Ghee",unit:"Tin 1kg",price:28813.56},{name:"Ginger",unit:"Kilogram",price:5000},{name:"Ginger Powder",unit:"Tin 100g",price:6594.89},{name:"Goat Meat",unit:"Kilogram",price:31000},{name:"Gouda Cheese",unit:"Packet 500g",price:31779.66},{name:"Grapes",unit:"Packet 500g",price:12833.33},{name:"Greek Yoghurt",unit:"Kilogram",price:16000},{name:"Green Bell Pepper",unit:"Kilogram",price:5500},
  {name:"Green Chillies",unit:"Kilogram",price:7000},{name:"Green Peas",unit:"Tin 400g",price:2824.86},{name:"Ground Coffee",unit:"Packet 250g",price:13120},{name:"Ground Nut Paste",unit:"Packet 1Kg",price:8000},{name:"Ground Nuts",unit:"Kilogram",price:6779.66},{name:"Honey",unit:"Kilogram",price:24999.59},{name:"Icing Sugar",unit:"Packet 500g",price:3389.83},{name:"Iodized Salt",unit:"Kilogram",price:10430.25},
  {name:"Irish Potatoes",unit:"Kilogram",price:3200},{name:"Jam",unit:"Tin 1kg",price:10471.63},{name:"Kale Leaves",unit:"Kilogram",price:12000},{name:"Lamb Chops",unit:"Kilogram",price:22000},{name:"Leeks",unit:"Kilogram",price:6000},{name:"Lemon (Fresh)",unit:"Kilogram",price:2504.13},{name:"Lemon Grass",unit:"Kilogram",price:10000},{name:"Lettuce",unit:"Each",price:3000},
  {name:"Lime",unit:"Kilogram",price:6000},{name:"Local Chicken Whole",unit:"Kilogram",price:30000},{name:"Maize Flour",unit:"Kilogram",price:2288.14},{name:"Mango fruit",unit:"Kilogram",price:4039.32},{name:"Marinade for Grill",unit:"Portion",price:118},{name:"Mascarpone Cheese",unit:"Kilogram",price:50000},{name:"Matooke Banana",unit:"Each",price:45000},{name:"Mayo 1kg",unit:"Portion",price:8858},
  {name:"Meat Tenderiser",unit:"Tin 100g",price:3050.85},{name:"Minced Beef",unit:"Packet 1Kg",price:19045.45},{name:"Mini Chicken Pie",unit:"Piece",price:875.27},{name:"Mini Danish",unit:"Piece",price:497.17},{name:"Mint Leaves Fresh",unit:"Kilogram",price:3631.71},{name:"Mixed Herbs",unit:"Tin 20g",price:2796.61},{name:"Mixed Spices",unit:"Tin 100g",price:6610.17},{name:"Mozzarella Cheese",unit:"Kilogram",price:22000},
  {name:"Mushrooms",unit:"Tin 400g",price:5033.84},{name:"Mushrooms Fresh",unit:"Kilogram",price:7000},{name:"Mustard",unit:"Kilogram",price:38423.77},{name:"Nakati",unit:"Kilogram",price:6250},{name:"Nescafe Instant Coffee",unit:"Tin 200g",price:29627.38},{name:"Nile Perch Fillets",unit:"Kilogram",price:21000},{name:"Nutmeg",unit:"Tin 100g",price:12535.31},{name:"Oats",unit:"Packet 500g",price:10010.15},
  {name:"Olive Oil",unit:"Bottle 1lt",price:20211.25},{name:"Onions",unit:"Kilogram",price:3381},{name:"Oranges Imported",unit:"Kilogram",price:9107.26},{name:"Oregano",unit:"Tin 20g",price:1491.53},{name:"Oyster Sauce",unit:"Bottle 510ml",price:9021.26},{name:"Paprika",unit:"Tin 100g",price:6610.17},{name:"Parmesan Cheese",unit:"Kilogram",price:126349.56},{name:"Parsley Fresh",unit:"Kilogram",price:21611.11},
  {name:"Passion Fruits",unit:"Kilogram",price:9000},{name:"Passion Syrup",unit:"Bottle 1lt",price:46610.17},{name:"Pawpaw",unit:"Each",price:5000},{name:"Peanut Butter Sauce",unit:"Tin 510g",price:11977.22},{name:"Penne",unit:"Packet 400g",price:3109.8},{name:"Pilau Masala",unit:"Tin 100g",price:8598.87},{name:"Pineapple Fruit",unit:"Each",price:4957.64},{name:"Pork Chops",unit:"Kilogram",price:25727.49},
  {name:"Pork Sausages",unit:"Packet 1Kg",price:21636.65},{name:"Pork Spare Ribs",unit:"Kilogram",price:21209.89},{name:"Pumpkin",unit:"Each",price:7000},{name:"Raisins",unit:"Box 12.5 kg",price:237288.14},{name:"Red Bell Pepper",unit:"Kilogram",price:7500},{name:"Red Bull",unit:"Each",price:5070.48},{name:"Rice",unit:"Kilogram",price:7667.36},{name:"Rice Local",unit:"Kilogram",price:5200},
  {name:"Ricotta Cheese",unit:"Kilogram",price:22000},{name:"Roasted Coffee Beans",unit:"Packet 1Kg",price:40000},{name:"Rocket Leaves",unit:"Kilogram",price:30000},{name:"Rosemary Fresh",unit:"Kilogram",price:17000},{name:"Royco",unit:"Tin 2kg",price:30482.75},{name:"Salmon",unit:"Kilogram",price:118484.53},{name:"Seasoning",unit:"Portion",price:74},{name:"Sesame Oil",unit:"Liter",price:44067.8},
  {name:"Sesame Seeds",unit:"Packet 500g",price:11440.68},{name:"Soda Water",unit:"Crate Of 24 Btl",price:15677.97},{name:"Soy Sauce Dark",unit:"Bottle 500ml",price:7623.03},{name:"Soy Sauce Light",unit:"Bottle 500ml",price:7623.03},{name:"Spaghetti",unit:"Packet 400g",price:2966.1},{name:"Spanish Omelette",unit:"Portion",price:1327},{name:"Spinach",unit:"Kilogram",price:2500},{name:"Spring Onions",unit:"Kilogram",price:8333.33},
  {name:"Star Anise",unit:"Kilogram",price:21186.44},{name:"Strawberry Fruit",unit:"Packet 200g",price:8000},{name:"Streaky Bacon",unit:"Packet 1Kg",price:47665.44},{name:"Sugar Granulated",unit:"50kg Sack",price:138983.01},{name:"Sweet Chilli Sauce",unit:"Botle 810gm",price:11905.95},{name:"Sweet Corn",unit:"Tin 400g",price:3815.23},{name:"Sweet Potatoes",unit:"Kilogram",price:1500},{name:"Tabasco",unit:"Bottle 60ml",price:8474.58},
  {name:"Tahina",unit:"Kilogram",price:41313.56},{name:"Tea Bags",unit:"Box 100",price:16949.15},{name:"Thyme",unit:"Tin 20g",price:2966.1},{name:"Tilapia Fillet",unit:"Kilogram",price:30000},{name:"Toast",unit:"Piece",price:143.21},{name:"Tomato Ketchup",unit:"Tin 5 kg",price:98870.06},{name:"Tomato Paste",unit:"Tin 400g",price:4230.04},{name:"Tomatoes",unit:"Kilogram",price:2599.33},
  {name:"Turmeric",unit:"Tin 100g",price:5508.47},{name:"Unsalted Butter",unit:"Box 5 kg",price:142265.79},{name:"Vanilla Syrup",unit:"Bottle 1lt",price:46610.17},{name:"Vinegar",unit:"Bottle 5Ltr",price:12290.85},{name:"Water Melon",unit:"Each",price:7985.53},{name:"Whipping Cream",unit:"Bottle 1lt",price:16000},{name:"White Flour",unit:"50kg Sack",price:120338.98},{name:"White Onions",unit:"Kilogram",price:4000},
  {name:"White Pepper Powder",unit:"Tin 100g",price:12711.86},{name:"White Sugar",unit:"Kilogram",price:15980},{name:"Whole Chicken",unit:"Kilogram",price:11500},{name:"Whole Fish",unit:"Each",price:17000},{name:"Worcestershire Sauce",unit:"Bottle 295ml",price:10169.49},{name:"Yams",unit:"Kilogram",price:3500},{name:"Yellow Bell Pepper",unit:"Kilogram",price:14859.36},{name:"Yellow Dhal",unit:"Kilogram",price:10000},
  {name:"Yoghurt Plain",unit:"Bottle 500ml",price:2457.63},{name:"African Coffee",unit:"Cup",price:2525.64},{name:"Ajinomoto",unit:"Packet 454g",price:11166.75},{name:"Apples",unit:"Kilogram",price:9459.62},{name:"Aquelle Sparkling Water 330ml",unit:"Each",price:1024.01},{name:"Sprite",unit:"Crate Of 24 Btl",price:16101.69},{name:"Coke Plastic",unit:"Bottle",price:847.46},
  // ── Per-unit versions of bulk items (derived from purchase unit prices) ──────
  // These allow recipes to reference weight/volume in grams/ml cleanly
  {name:"White Flour",unit:"Kilogram",price:2406.78},        // 120338.98 ÷ 50kg sack
  {name:"Cooking Oil",unit:"Liter",price:6927.65},           // 138553 ÷ 20L bottle
  {name:"Eggs",unit:"Piece",price:433.33},                   // 13000 ÷ tray of 30
  {name:"Royco",unit:"Kilogram",price:15241.38},             // 30482.75 ÷ 2kg tin
  {name:"Unsalted Butter",unit:"Kilogram",price:142265.79},  // same as box price — recipe sheet stores as per-kg
  {name:"Sugar Granulated",unit:"Kilogram",price:2779.66},   // 138983.01 ÷ 50kg sack
  {name:"Raisins",unit:"Kilogram",price:18983.05},           // 237288.14 ÷ 12.5kg box
].map((s,i)=>({...s, id:`item_${i}`, updatedAt:null}));

const SEED_RECIPES = [
  {id:"r1", name:"Vegetable Rice", category:"Starches", basePax:10, servingG:null, tags:["veg"],
   lines:[
     {item:"Rice",               qty:1000, qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
     {item:"Fresh Peas",         qty:400,  qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
     {item:"Coriander",          qty:50,   qtyUnit:"g",       qtyMode:"AP", yieldPct:85},
     {item:"Baby Marrow",        qty:200,  qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Carrots",            qty:300,  qtyUnit:"g",       qtyMode:"AP", yieldPct:85},
     {item:"Garlic",             qty:50,   qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Yellow Bell Pepper", qty:100,  qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Unsalted Butter",    qty:50,   qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r2", name:"Plain Pilau Rice", category:"Starches", basePax:10, servingG:447, tags:[],
   lines:[
     {item:"Rice",           qty:1000, qtyUnit:"g",        qtyMode:"AP", yieldPct:100},
     {item:"Onions",         qty:300,  qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"Ginger",         qty:5,    qtyUnit:"g",        qtyMode:"AP", yieldPct:100},
     {item:"Garlic",         qty:200,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Concasse",       qty:1,    qtyUnit:"Portion",  qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",      qty:1,    qtyUnit:"Portion",  qtyMode:"AP", yieldPct:100},
     {item:"Pilau Masala",   qty:0.4,  qtyUnit:"Tin 100g", qtyMode:"AP", yieldPct:100},
     {item:"Soy Sauce Dark", qty:60,   qtyUnit:"ml",       qtyMode:"AP", yieldPct:100},
     {item:"Irish Potatoes", qty:200,  qtyUnit:"g",        qtyMode:"AP", yieldPct:80},
     {item:"Cooking Oil",    qty:300,  qtyUnit:"ml",       qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r3", name:"Mexican Potatoes", category:"Starches", basePax:10, servingG:1705, tags:[],
   lines:[
     {item:"Irish Potatoes",      qty:5000, qtyUnit:"g",        qtyMode:"AP", yieldPct:80},
     {item:"Onions",              qty:300,  qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"Coriander",           qty:250,  qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"Cumin Powder",        qty:0.2,  qtyUnit:"Tin 100g", qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",           qty:2,    qtyUnit:"Portion",  qtyMode:"AP", yieldPct:100},
     {item:"Garlic",              qty:100,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Yellow Bell Pepper",  qty:900,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Tomatoes",            qty:300,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
   ]},
  {id:"r4", name:"Grilled Chicken Thigh", category:"Proteins", basePax:10, servingG:333, tags:["gluten-free"],
   lines:[
     {item:"Chicken Thighs",      qty:1667, qtyUnit:"g",       qtyMode:"AP", yieldPct:85},
     {item:"Marinade for Grill",  qty:1.667,qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r5", name:"Grilled Tilapia", category:"Proteins", basePax:10, servingG:275, tags:["gluten-free"],
   lines:[
     {item:"Tilapia Fillet",      qty:1250, qtyUnit:"g",       qtyMode:"AP", yieldPct:80},
     {item:"Marinade for Grill",  qty:1.25, qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Lemon (Fresh)",       qty:250,  qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r6", name:"Beef Stew", category:"Proteins", basePax:10, servingG:616, tags:[],
   lines:[
     {item:"Beef On Bone",    qty:1205, qtyUnit:"g",        qtyMode:"AP", yieldPct:75},
     {item:"Tomatoes",        qty:361,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Garlic",          qty:72,   qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Onions",          qty:181,  qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"Yellow Bell Pepper", qty:301,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Carrots",         qty:60,   qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"Royco",           qty:72,    qtyUnit:"g",        qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",       qty:3.614,qtyUnit:"Portion",  qtyMode:"AP", yieldPct:100},
     {item:"Soy Sauce Dark",  qty:72,   qtyUnit:"ml",       qtyMode:"AP", yieldPct:100},
     {item:"Cumin Powder",    qty:0.12, qtyUnit:"Tin 100g", qtyMode:"AP", yieldPct:100},
     {item:"Coriander",       qty:60,   qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"White Flour",     qty:72,   qtyUnit:"g",        qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r7", name:"Goat Stew", category:"Proteins", basePax:10, servingG:616, tags:[],
   lines:[
     {item:"Goat Meat",       qty:1205, qtyUnit:"g",        qtyMode:"AP", yieldPct:75},
     {item:"Tomatoes",        qty:361,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Garlic",          qty:72,   qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Onions",          qty:181,  qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"Yellow Bell Pepper", qty:301,  qtyUnit:"g",        qtyMode:"AP", yieldPct:90},
     {item:"Carrots",         qty:60,   qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"Royco",           qty:72,    qtyUnit:"g",        qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",       qty:3.614,qtyUnit:"Portion",  qtyMode:"AP", yieldPct:100},
     {item:"Soy Sauce Dark",  qty:72,   qtyUnit:"ml",       qtyMode:"AP", yieldPct:100},
     {item:"Cumin Powder",    qty:0.12, qtyUnit:"Tin 100g", qtyMode:"AP", yieldPct:100},
     {item:"Coriander",       qty:60,   qtyUnit:"g",        qtyMode:"AP", yieldPct:85},
     {item:"White Flour",     qty:72,   qtyUnit:"g",        qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r8", name:"Honey Glazed Goat Ribs", category:"Proteins", basePax:10, servingG:270, tags:[],
   lines:[
     {item:"Goat Meat",       qty:1667, qtyUnit:"g",       qtyMode:"AP", yieldPct:75},
     {item:"Honey",           qty:150,  qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
     {item:"Mustard",         qty:100,  qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
     {item:"Garlic",          qty:33,   qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Onions",          qty:83,   qtyUnit:"g",       qtyMode:"AP", yieldPct:85},
     {item:"Soy Sauce Light", qty:67,   qtyUnit:"ml",      qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",       qty:1.667,qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"BBQ Sauce",       qty:0.833,qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Coriander",       qty:17,   qtyUnit:"g",       qtyMode:"AP", yieldPct:85},
   ]},
  {id:"r9", name:"Steamed Vegetables", category:"Sides", basePax:10, servingG:62, tags:["veg","gluten-free"],
   lines:[
     {item:"Carrots",      qty:192, qtyUnit:"g", qtyMode:"AP", yieldPct:85},
     {item:"Baby Marrow",  qty:192, qtyUnit:"g", qtyMode:"AP", yieldPct:90},
     {item:"French Beans", qty:192, qtyUnit:"g", qtyMode:"AP", yieldPct:90},
     {item:"Onions",       qty:38,  qtyUnit:"g", qtyMode:"AP", yieldPct:85},
     {item:"Coriander",    qty:8,   qtyUnit:"g", qtyMode:"AP", yieldPct:85},
   ]},
  {id:"r10", name:"Fresh Garden Salad", category:"Salads", basePax:10, servingG:288, tags:["veg","gluten-free"],
   lines:[
     {item:"Carrots",           qty:75,   qtyUnit:"g",          qtyMode:"AP", yieldPct:85},
     {item:"Onions",            qty:75,   qtyUnit:"g",          qtyMode:"AP", yieldPct:85},
     {item:"Yellow Bell Pepper",qty:150,  qtyUnit:"g",          qtyMode:"AP", yieldPct:90},
     {item:"Lettuce",           qty:1.25, qtyUnit:"Each",       qtyMode:"AP", yieldPct:80},
     {item:"Sweet Corn",        qty:0.313,qtyUnit:"Tin 400g",   qtyMode:"AP", yieldPct:100},
     {item:"Black Olives",      qty:0.313,qtyUnit:"Bottle 340g",qtyMode:"AP", yieldPct:100},
     {item:"Cherry Tomatoes",   qty:100,  qtyUnit:"g",          qtyMode:"AP", yieldPct:95},
     {item:"Avocado",           qty:0.625,qtyUnit:"Each",       qtyMode:"AP", yieldPct:70},
     {item:"Cucumber",          qty:175,  qtyUnit:"g",          qtyMode:"AP", yieldPct:90},
     {item:"Mozzarella Cheese", qty:100,  qtyUnit:"g",          qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r11", name:"Chapatti", category:"Starches", basePax:10, servingG:206, tags:["veg"],
   lines:[
     {item:"White Flour",  qty:1077, qtyUnit:"g",          qtyMode:"AP", yieldPct:100},
     {item:"Carrots",      qty:54,   qtyUnit:"g",          qtyMode:"AP", yieldPct:100},
     {item:"Onions",       qty:38,   qtyUnit:"g",          qtyMode:"AP", yieldPct:100},
     {item:"Cooking Salt", qty:0.015,qtyUnit:"Packet 500g",qtyMode:"AP", yieldPct:100},
     {item:"Cooking Oil",  qty:31,   qtyUnit:"ml",         qtyMode:"AP", yieldPct:100},
     {item:"Eggs",         qty:1.077,qtyUnit:"Piece",      qtyMode:"AP", yieldPct:100},
     {item:"Water",        qty:538,  qtyUnit:"ml",         qtyMode:"AP", yieldPct:100},
     {item:"Cooking Oil",  qty:400,  qtyUnit:"ml",         qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r12", name:"Matooke", category:"Starches", basePax:10, servingG:67, tags:["veg","gluten-free"],
   lines:[
     {item:"Matooke Banana", qty:0.167, qtyUnit:"Bunch",    qtyMode:"AP", yieldPct:65},
     {item:"Banana leaves",  qty:0.5,   qtyUnit:"Kilogram", qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r13", name:"Ground Nut Sauce", category:"Sauces", basePax:10, servingG:148, tags:["veg","gluten-free"],
   lines:[
     {item:"Ground Nut Paste", qty:0.4,  qtyUnit:"Packet 1Kg", qtyMode:"AP", yieldPct:100},
     {item:"Tomatoes",          qty:200,  qtyUnit:"g",          qtyMode:"AP", yieldPct:90},
     {item:"Onions",            qty:80,   qtyUnit:"g",          qtyMode:"AP", yieldPct:85},
     {item:"Seasoning",         qty:0.8,  qtyUnit:"Portion",    qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r14", name:"Coleslaw Salad", category:"Salads", basePax:10, servingG:44, tags:["veg"],
   lines:[
     {item:"Cabbage",           qty:0.167, qtyUnit:"Each",    qtyMode:"AP", yieldPct:80},
     {item:"Onions",            qty:42,    qtyUnit:"g",       qtyMode:"AP", yieldPct:85},
     {item:"Carrots",           qty:83,    qtyUnit:"g",       qtyMode:"AP", yieldPct:85},
     {item:"Green Bell Pepper", qty:42,    qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Mayo 1kg",          qty:0.08,  qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Raisins",           qty:25,    qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r15", name:"Avocado Salad", category:"Salads", basePax:10, servingG:50, tags:["veg","gluten-free"],
   lines:[
     {item:"Avocado",           qty:0.8,  qtyUnit:"Each",       qtyMode:"AP", yieldPct:70},
     {item:"Cherry Tomatoes",   qty:120,  qtyUnit:"g",          qtyMode:"AP", yieldPct:95},
     {item:"Onions",            qty:40,   qtyUnit:"g",          qtyMode:"AP", yieldPct:85},
     {item:"Lettuce",           qty:0.4,  qtyUnit:"Each",       qtyMode:"AP", yieldPct:80},
     {item:"Red Bell Pepper",   qty:100,  qtyUnit:"g",          qtyMode:"AP", yieldPct:90},
   ]},
  {id:"r16", name:"Pasta Salad", category:"Salads", basePax:10, servingG:940, tags:[],
   lines:[
     {item:"Penne",             qty:0.033, qtyUnit:"Packet 400g",  qtyMode:"AP", yieldPct:100},
     {item:"Fusili",            qty:0.033, qtyUnit:"Packet 400g",  qtyMode:"AP", yieldPct:100},
     {item:"Farfale",           qty:0.033, qtyUnit:"Packet 400g",  qtyMode:"AP", yieldPct:100},
     {item:"Cherry Tomatoes",   qty:83,    qtyUnit:"g",            qtyMode:"AP", yieldPct:95},
     {item:"Mozzarella Cheese", qty:83,    qtyUnit:"g",            qtyMode:"AP", yieldPct:100},
     {item:"Black Olives",      qty:0.333, qtyUnit:"Bottle 340g",  qtyMode:"AP", yieldPct:100},
     {item:"Olive Oil",         qty:2,     qtyUnit:"ml",           qtyMode:"AP", yieldPct:100},
     {item:"Oregano",           qty:0.002, qtyUnit:"Tin 20g",      qtyMode:"AP", yieldPct:100},
     {item:"Carrots",           qty:83,    qtyUnit:"g",            qtyMode:"AP", yieldPct:85},
     {item:"Broccoli",          qty:83,    qtyUnit:"g",            qtyMode:"AP", yieldPct:90},
     {item:"Cauliflower",       qty:83,    qtyUnit:"g",            qtyMode:"AP", yieldPct:90},
     {item:"Seasoning",         qty:0.5,   qtyUnit:"Portion",      qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r17", name:"Sweet Potato", category:"Starches", basePax:10, servingG:100, tags:["veg","gluten-free"],
   lines:[
     {item:"Sweet Potatoes", qty:1000, qtyUnit:"g", qtyMode:"AP", yieldPct:85},
   ]},
  {id:"r18", name:"Yam", category:"Starches", basePax:10, servingG:100, tags:["veg","gluten-free"],
   lines:[
     {item:"Yams", qty:1000, qtyUnit:"g", qtyMode:"AP", yieldPct:85},
   ]},
  {id:"r19", name:"Pan Fried Tilapia", category:"Proteins", basePax:10, servingG:430, tags:["gluten-free"],
   lines:[
     {item:"Tilapia Fillet",     qty:1000, qtyUnit:"g",       qtyMode:"AP", yieldPct:80},
     {item:"White Flour",        qty:100,  qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
     {item:"Marinade for Grill", qty:3,    qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Lemon (Fresh)",      qty:100,  qtyUnit:"g",       qtyMode:"AP", yieldPct:100},
     {item:"Cooking Oil",        qty:100,  qtyUnit:"ml",      qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r20", name:"Grilled Beef Fillet", category:"Proteins", basePax:10, servingG:250, tags:["gluten-free"],
   lines:[
     {item:"Beef Fillet",        qty:833,  qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Marinade for Grill", qty:0.833,qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",          qty:0.833,qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r21", name:"Buffet Chicken Skewers", category:"Proteins", basePax:10, servingG:240, tags:["gluten-free"],
   lines:[
     {item:"Chicken Fillet",     qty:800,  qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Marinade for Grill", qty:0.8,  qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",          qty:0.8,  qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r22", name:"Buffet Beef Skewers", category:"Proteins", basePax:10, servingG:375, tags:[],
   lines:[
     {item:"Beef Fillet",        qty:1250, qtyUnit:"g",       qtyMode:"AP", yieldPct:90},
     {item:"Marinade for Grill", qty:1.25, qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Seasoning",          qty:1.25, qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r23", name:"Buffet Potato Wedges", category:"Starches", basePax:10, servingG:600, tags:["veg","gluten-free"],
   lines:[
     {item:"Irish Potatoes", qty:2000, qtyUnit:"g",       qtyMode:"AP", yieldPct:80},
     {item:"Seasoning",      qty:2,    qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
     {item:"Concasse",       qty:2,    qtyUnit:"Portion", qtyMode:"AP", yieldPct:100},
   ]},
  {id:"r24", name:"Fruit Salad", category:"Desserts", basePax:10, servingG:null, tags:["veg","gluten-free"],
   lines:[
     {item:"Water Melon",    qty:1,   qtyUnit:"Each",       qtyMode:"AP", yieldPct:60},
     {item:"Pineapple Fruit",qty:2,   qtyUnit:"Each",       qtyMode:"AP", yieldPct:65},
     {item:"Grapes",         qty:500, qtyUnit:"g",          qtyMode:"AP", yieldPct:95},
     {item:"Strawberry Fruit",qty:400,qtyUnit:"g",          qtyMode:"AP", yieldPct:90},
     {item:"Mango fruit",    qty:500, qtyUnit:"g",          qtyMode:"AP", yieldPct:70},
   ]},
];

// ─── COSTING ENGINE ───────────────────────────────────────────────────────────
// Each ingredient line has:
//   qty      — amount entered by the user
//   qtyMode  — "AP" (As Purchased, straight from stores) or "EP" (Edible Portion, usable after prep)
//   yieldPct — % of AP that is usable (100 = no loss)
//   qtyUnit  — "g" | "ml" | "pc" | "portion" | "each" | custom
//
// When qtyMode === "EP":
//   AP qty (what to pull from stores) = qty / (yieldPct / 100)
//   Cost is calculated on AP qty because that's what you actually buy
//
// When qtyMode === "AP":
//   EP qty (usable) = qty × (yieldPct / 100)
//   Cost is calculated directly on qty
//
// Price in itemMap is per purchase unit (e.g. per Kilogram).
// If qtyUnit is "g", we divide by 1000 to get the fraction of the purchase unit.
// If qtyUnit is "ml", we divide by 1000 (assuming price is per litre/kg).
// If qtyUnit is "pc" / "each" / "portion" / other, we treat qty as a whole-unit count.

const GRAM_UNITS  = ["g","gm","gram","grams"];
const ML_UNITS    = ["ml","Ml","millilitre","millilitres","milliliter","milliliters"];
const PIECE_UNITS = ["pc","pcs","piece","pieces","each","portion","portions","tray","tin","packet","bottle","box","bunch","bundle","bag","crate"];

function qtyToUnitFraction(qty, qtyUnit) {
  const u = (qtyUnit || "").toLowerCase().trim();
  if (GRAM_UNITS.some(x => u === x))  return qty / 1000;
  if (ML_UNITS.some(x => u === x))    return qty / 1000;
  return qty; // piece-based or custom — treat as direct unit count
}

function fmtQty(qty, qtyUnit) {
  const u = (qtyUnit || "").toLowerCase().trim();
  if (GRAM_UNITS.some(x => u === x) || ML_UNITS.some(x => u === x)) {
    return qty >= 1000
      ? `${(qty / 1000).toFixed(3).replace(/\.?0+$/, "")} ${ML_UNITS.some(x=>u===x)?"L":"kg"}`
      : `${Math.round(qty)}${u}`;
  }
  if (u === "kilogram" || u === "kg") return `${qty % 1 === 0 ? qty : qty.toFixed(3).replace(/\.?0+$/,"")} kg`;
  if (u === "liter" || u === "litre" || u === "l") return `${qty % 1 === 0 ? qty : qty.toFixed(3).replace(/\.?0+$/,"")} L`;
  return `${qty} ${qtyUnit||""}`.trim();
}

function costRecipe(recipe, itemMap) {
  if (!recipe?.lines) return { costPerPax:0, batchCost:0, lines:[] };

  // Normalise a qty_unit to its purchase-unit equivalent for price lookup
  function normUnit(u) {
    const l = (u||"").toLowerCase().trim();
    if (["ml","millilitre","millilitres","milliliter","milliliters"].some(x=>l===x)) return "Liter";
    if (["g","gram","grams","gm"].some(x=>l===x)) return "Kilogram";
    return u; // keep as-is
  }

  const lines = recipe.lines.map(line => {
    const qtyUnit = line.qtyUnit || line.uom || "";
    const normalisedUnit = normUnit(qtyUnit);
    // Look up by name+normalised unit first, then name+original unit, then name only
    const price = itemMap[`${line.item}||${normalisedUnit}`]
               ?? itemMap[`${line.item}||${qtyUnit}`]
               ?? itemMap[line.item]
               ?? 0;
    const yield_   = (line.yieldPct || 100) / 100;
    const mode     = line.qtyMode || "AP";
    const qty      = line.qty || 0;

    // Quantities in actual purchase-unit fractions (for pricing)
    let apFraction, epFraction;
    if (mode === "EP") {
      // User entered the usable amount they need
      epFraction = qtyToUnitFraction(qty, qtyUnit);
      apFraction = epFraction / yield_; // need more from stores to achieve this EP
    } else {
      // User entered the AP amount to pull
      apFraction = qtyToUnitFraction(qty, qtyUnit);
      epFraction = apFraction * yield_;
    }

    // Raw qty values for display (in user's chosen unit)
    const apQty = mode === "EP" ? qty / yield_ : qty;
    const epQty = mode === "EP" ? qty : qty * yield_;

    const lineCost = apFraction * price;

    return { ...line, price, apQty, epQty, apFraction, epFraction, lineCost, qtyUnit };
  });
  const batchCost = lines.reduce((s,l) => s + l.lineCost, 0);
  return { batchCost, costPerPax: recipe.basePax > 0 ? batchCost / recipe.basePax : 0, lines };
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const IS = { padding:"7px 10px", borderRadius:7, border:`1.5px solid ${B.gold}`, fontSize:13, fontFamily:"inherit", background:"#FFFBF5", outline:"none", boxSizing:"border-box", color:B.text, width:"100%" };
const LS = { fontSize:10, color:B.muted, fontWeight:700, display:"block", marginBottom:4, letterSpacing:0.5, textTransform:"uppercase" };
const BtnPrimary = ({ children, onClick, style={} }) => (
  <button onClick={onClick} style={{padding:"8px 16px",background:B.maroon,color:B.cream,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",...style}}>{children}</button>
);

// ─── SUPABASE DATA HELPERS ────────────────────────────────────────────────────

// Convert a DB recipe row + its lines into the app's recipe shape
function dbToRecipe(row, lines) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    basePax: row.base_pax,
    servingG: row.serving_g,
    tags: row.tags || [],
    lines: (lines || [])
      .sort((a,b) => a.sort_order - b.sort_order)
      .map(l => ({
        item: l.item,
        qty: parseFloat(l.qty),
        qtyUnit: l.qty_unit,
        qtyMode: l.qty_mode,
        yieldPct: parseFloat(l.yield_pct),
      })),
  };
}

// Convert a DB menu row into the app's menu shape
function dbToMenu(row) {
  return {
    id: row.id,
    name: row.name,
    clientName: row.client_name,
    eventDate: row.event_date,
    branch: row.branch,
    pax: row.pax,
    fcPct: parseFloat(row.fc_pct),
    vatPct: parseFloat(row.vat_pct),
    customPP: row.custom_pp ? String(row.custom_pp) : "",
    recipeIds: row.recipe_ids || [],
    createdAt: row.created_at,
  };
}

// Convert a DB issue record into the app's record shape
function dbToRecord(row) {
  return {
    id: row.id,
    menuName: row.menu_name,
    clientName: row.client_name,
    branch: row.branch,
    eventDate: row.event_date,
    pax: row.pax,
    note: row.note,
    dishes: row.dishes || [],
    totalExpenditure: parseFloat(row.total_expenditure),
    sellingPrice: parseFloat(row.selling_price),
    issueList: row.issue_list || [],
    issuedAt: row.issued_at,
  };
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function KarveliApp() {
  const [tab, setTab]               = useState("items");
  const [items, setItems]           = useState(SEED_ITEMS);
  const [recipes, setRecipes]       = useState(SEED_RECIPES);
  const [dbReady, setDbReady]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState(null);     // logged-in user
  const [authLoading, setAuthLoading] = useState(true);  // checking session
  const [authEmail, setAuthEmail]   = useState("");
  const [authSent, setAuthSent]     = useState(false);
  const [authError, setAuthError]   = useState("");
  const [selIds, setSelIds]         = useState(new Set());
  const [uptake, setUptake]         = useState({});
  const [pax, setPax]               = useState(50);
  const [fcPct, setFcPct]           = useState(35);
  const [vatPct, setVatPct]         = useState(18);
  const [customPP, setCustomPP]     = useState("");
  const [menuName, setMenuName]     = useState("");
  const [clientName, setClientName] = useState("");
  const [eventDate, setEventDate]   = useState("");
  const [branch, setBranch]         = useState(BRANCHES[0]);
  const [savedMenus, setSavedMenus] = useState([]);
  const [packages, setPackages]     = useState([]);
  const [issueRecs, setIssueRecs]   = useState([]);
  const [issueNote, setIssueNote]   = useState("");
  const [modal, setModal]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [auditLog, setAuditLog]     = useState([]);

  // ── Auth: listen for session changes ─────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Audit logger ──────────────────────────────────────────────────────────
  const logAudit = useCallback(async (action, tableName, recordId, oldVal, newVal) => {
    if (!user) return;
    const entry = {
      user_email: user.email,
      user_name: user.user_metadata?.name || user.email.split("@")[0],
      action,
      table_name: tableName,
      record_id: String(recordId||""),
      old_value: oldVal ? JSON.stringify(oldVal) : null,
      new_value: newVal ? JSON.stringify(newVal) : null,
    };
    await supabase.from("audit_log").insert(entry);
    setAuditLog(prev => [{ ...entry, created_at: new Date().toISOString(), id: uid() }, ...prev.slice(0,99)]);
  }, [user]);

  // ── Send magic link ───────────────────────────────────────────────────────
  const sendMagicLink = async () => {
    setAuthError("");
    if (!authEmail.trim() || !authEmail.includes("@")) { setAuthError("Please enter a valid email address"); return; }
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: "https://karveli-buffet.vercel.app" }
    });
    if (error) { setAuthError(error.message); return; }
    setAuthSent(true);
  };

  // ── Load all data from Supabase on mount ──────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        // Load items
        const { data: itemRows, error: itemErr } = await supabase
          .from("items").select("*").order("name");
        if (itemErr) throw itemErr;
        if (itemRows?.length) {
          setItems(itemRows.map(r => ({ id:r.id, name:r.name, unit:r.unit, price:parseFloat(r.price) })));
        }

        // Load recipes + all their lines in one query
        const { data: recipeRows, error: recipeErr } = await supabase
          .from("recipes").select("*").order("name");
        if (recipeErr) throw recipeErr;

        if (recipeRows?.length) {
          const { data: lineRows, error: lineErr } = await supabase
            .from("recipe_lines").select("*");
          if (lineErr) throw lineErr;
          const linesByRecipe = {};
          (lineRows || []).forEach(l => {
            if (!linesByRecipe[l.recipe_id]) linesByRecipe[l.recipe_id] = [];
            linesByRecipe[l.recipe_id].push(l);
          });
          setRecipes(recipeRows.map(r => dbToRecipe(r, linesByRecipe[r.id] || [])));
        }

        // Load saved menus
        const { data: menuRows, error: menuErr } = await supabase
          .from("menus").select("*").order("created_at", { ascending: false });
        if (menuErr) throw menuErr;
        if (menuRows?.length) setSavedMenus(menuRows.map(dbToMenu));

        // Load packages
        const { data: pkgRows } = await supabase
          .from("packages").select("*").order("created_at", { ascending: false });
        if (pkgRows?.length) setPackages(pkgRows);

        // Load issue records
        const { data: recordRows, error: recordErr } = await supabase
          .from("issue_records").select("*").order("issued_at", { ascending: false });
        if (recordErr) throw recordErr;
        if (recordRows?.length) setIssueRecs(recordRows.map(dbToRecord));

        // Load recent audit log (last 100 entries)
        const { data: auditRows } = await supabase
          .from("audit_log").select("*").order("created_at", { ascending: false }).limit(100);
        if (auditRows?.length) setAuditLog(auditRows);

        setDbReady(true);
      } catch(e) {
        console.error("Supabase load error:", e);
        // Fall back to seed data — app still works offline
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // ── Item lookup map — O(1) price lookups ──
  const itemMap = useMemo(() => {
    const m = {};
    items.forEach(i => {
      // Store by name+unit for exact match
      m[`${i.name}||${i.unit}`] = i.price;
      // Also store by name alone — but only if not already set
      // This lets recipes that don't specify a unit still get a price
      if (!(i.name in m)) m[i.name] = i.price;
    });
    return m;
  }, [items]);

  // ── All recipes costed — computed once when items or recipes change ──
  const allCosted = useMemo(() => {
    const m = {};
    recipes.forEach(r => { m[r.id] = costRecipe(r, itemMap); });
    return m;
  }, [recipes, itemMap]);

  // ── Selected dishes ──
  const selRecipes = useMemo(() => recipes.filter(r => selIds.has(r.id)), [recipes, selIds]);

  // ── Menu pricing ──
  const pricing = useMemo(() => {
    const rawCPP = selRecipes.reduce((s,r) => s + (allCosted[r.id]?.costPerPax||0), 0);
    const prodCPP = rawCPP * 0.10;
    const totalCPP = rawCPP + prodCPP;
    const suggestedPP = fcPct > 0 ? totalCPP / (fcPct / 100) : 0;
    const finalPP = customPP && parseFloat(customPP) > 0 ? parseFloat(customPP) : suggestedPP;
    const totalCostAll = totalCPP * pax;
    const sellingExVat = finalPP * pax;
    const vatAmt = sellingExVat * (vatPct / 100);
    const sellingIncVat = sellingExVat + vatAmt;
    const actualFcPct = finalPP > 0 ? (totalCPP / finalPP) * 100 : 0;
    const margin = (finalPP - totalCPP) * pax;
    return { rawCPP, prodCPP, totalCPP, suggestedPP, finalPP, totalCostAll, sellingExVat, vatAmt, sellingIncVat, actualFcPct, margin };
  }, [selRecipes, allCosted, pax, fcPct, vatPct, customPP]);

  // ── Issue list — applies uptake % to scale quantities ──
  const issueList = useMemo(() => {
    const map = {};
    selRecipes.forEach(r => {
      const c = allCosted[r.id];
      if (!c) return;
      const uptakePct = (uptake[r.id] ?? 100) / 100;
      const scale = (pax / r.basePax) * uptakePct;
      c.lines.forEach(line => {
        const unit = line.qtyUnit || line.uom || "";
        const key  = `${line.item}||${unit}`;
        if (!map[key]) map[key] = { name:line.item, qtyUnit:unit, epQty:0, apQty:0, lineCost:0, dishes:[] };
        map[key].epQty    += (line.epQty  || 0) * scale;
        map[key].apQty    += (line.apQty  || 0) * scale;
        map[key].lineCost += line.lineCost       * scale;
        map[key].dishes.push({ name:r.name, apQty:(line.apQty||0) * scale });
      });
    });
    return Object.values(map).sort((a,b) => a.name.localeCompare(b.name));
  }, [selRecipes, allCosted, pax, uptake]);

  const showToast = useCallback((msg, type="ok") => {
    setToast({msg,type}); setTimeout(()=>setToast(null), 3000);
  }, []);

  const toggleSel = useCallback((id) => {
    setSelIds(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }, []);

  const saveMenu = useCallback(async () => {
    if (!menuName.trim()) { showToast("Enter a menu name","err"); return; }
    const payload = {
      name: menuName, client_name: clientName, event_date: eventDate||null,
      branch, pax, fc_pct: fcPct, vat_pct: vatPct,
      custom_pp: customPP ? parseFloat(customPP) : null,
      recipe_ids: [...selIds],
    };
    if (dbReady) {
      const { data, error } = await supabase.from("menus").insert(payload).select().single();
      if (error) { showToast("Save failed","err"); console.error(error); return; }
      setSavedMenus(prev => [dbToMenu(data), ...prev]);
    } else {
      setSavedMenus(prev => [{ id:uid(), ...payload, recipeIds:[...selIds], createdAt:new Date().toISOString() }, ...prev]);
    }
    setModal(null); showToast(`"${menuName}" saved!`);
    logAudit("Saved menu", "menus", menuName, null, { menuName, pax, branch, dishes: [...selIds].length });
  }, [menuName,clientName,eventDate,branch,pax,fcPct,vatPct,customPP,selIds,dbReady,showToast,logAudit]);

  const deleteMenu = useCallback(async (id) => {
    if (dbReady) {
      const { error } = await supabase.from("menus").delete().eq("id", id);
      if (error) { showToast("Delete failed","err"); return; }
    }
    setSavedMenus(prev => prev.filter(m => m.id !== id));
    showToast("Menu deleted");
  }, [dbReady, showToast]);

  const savePackage = useCallback(async ({ name, description, type, recipeIds, targetPP }) => {
    const payload = { name, description, type, recipe_ids: recipeIds, target_pp: targetPP||null };
    if (dbReady) {
      const { data, error } = await supabase.from("packages").insert(payload).select().single();
      if (error) { showToast("Save failed","err"); console.error(error); return; }
      setPackages(prev => [data, ...prev]);
    } else {
      setPackages(prev => [{ id:uid(), ...payload, created_at: new Date().toISOString() }, ...prev]);
    }
    showToast(`Package "${name}" saved!`);
  }, [dbReady, showToast]);

  const deletePackage = useCallback(async (id) => {
    if (dbReady) {
      await supabase.from("packages").delete().eq("id", id);
    }
    setPackages(prev => prev.filter(p => p.id !== id));
    showToast("Package deleted");
  }, [dbReady, showToast]);

  const updatePackage = useCallback(async (id, { name, description, type, recipeIds, targetPP }) => {
    const payload = { name, description, type, recipe_ids: recipeIds, target_pp: targetPP||null };
    if (dbReady) {
      const { error } = await supabase.from("packages").update(payload).eq("id", id);
      if (error) { showToast("Update failed","err"); return; }
    }
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));
    showToast(`"${name}" updated!`);
  }, [dbReady, showToast]);

  const logIssue = useCallback(async () => {
    if (!selIds.size) { showToast("No dishes selected","err"); return; }
    const list = issueList.map(i=>({name:i.name,qtyUnit:i.qtyUnit,epQty:+fmtN(i.epQty,1),apQty:+fmtN(i.apQty,1),cost:Math.round(i.lineCost)}));
    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Unknown";
    const payload = {
      menu_name: menuName||"Untitled", client_name: clientName,
      event_date: eventDate||null, branch, pax,
      dishes: selRecipes.map(r=>r.name),
      total_expenditure: pricing.totalCostAll,
      selling_price: pricing.sellingIncVat,
      note: issueNote, issue_list: list,
      issued_by: userName,
    };
    if (dbReady) {
      const { data, error } = await supabase.from("issue_records").insert(payload).select().single();
      if (error) { showToast("Log failed","err"); console.error(error); return; }
      setIssueRecs(prev => [dbToRecord(data), ...prev]);
    } else {
      setIssueRecs(prev => [{ id:uid(), ...payload, menuName:payload.menu_name, clientName:payload.client_name,
        eventDate:payload.event_date, totalExpenditure:payload.total_expenditure,
        sellingPrice:payload.selling_price, issueList:list, issuedAt:new Date().toISOString() }, ...prev]);
    }
    setIssueNote("");
    showToast("Issue logged!");
    logAudit("Logged issue sheet", "issue_records", menuName||"Untitled", null, { pax, branch, dishes: selRecipes.map(r=>r.name) });
  }, [selIds,menuName,clientName,eventDate,branch,pax,selRecipes,pricing,issueNote,issueList,dbReady,showToast,logAudit,user]);

  const generateQuote = useCallback((mode) => {
    setModal(null);
    const isClient = mode === "client";
    const fmtUGX = (n) => "UGX " + Math.round(n||0).toLocaleString();
    const byCategory = {};
    selRecipes.forEach(r => {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Karveli ${isClient?"Client Quote":"Internal Sheet"}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; color: #2A1A0E; background: white; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { background: #6B1A1A; color: #F5E6C8; padding: 28px 32px; margin-bottom: 28px; }
  .header h1 { font-size: 24px; letter-spacing: 2px; margin-bottom: 4px; }
  .header .sub { font-size: 11px; letter-spacing: 3px; color: #C4922A; text-transform: uppercase; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .meta-box { background: #FBF7F0; border: 1px solid #E8D9C0; padding: 14px 18px; border-radius: 8px; }
  .meta-box label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8B6B4A; display: block; margin-bottom: 3px; }
  .meta-box span { font-size: 15px; font-weight: bold; color: #3D0E0E; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B6B4A; margin: 22px 0 8px; border-bottom: 1px solid #E8D9C0; padding-bottom: 5px; }
  .dish-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dotted #E8D9C0; font-size: 13px; }
  .dish-name { color: #3D0E0E; }
  .dish-serving { color: #8B6B4A; font-size: 11px; margin-left: 8px; }
  .pricing-box { background: linear-gradient(135deg, #6B1A1A, #3D0E0E); color: #F5E6C8; padding: 22px 28px; border-radius: 10px; margin: 24px 0; }
  .pricing-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #D4B080; }
  .pricing-row.total { border-top: 1px solid #C4922A; margin-top: 10px; padding-top: 10px; }
  .pricing-row.total span:first-child { color: #F5E6C8; font-size: 14px; }
  .pricing-row.total span:last-child { color: #C4922A; font-size: 22px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
  th { background: #6B1A1A; color: #F5E6C8; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 7px 10px; border-bottom: 1px solid #F0E8D8; }
  tr:nth-child(even) td { background: #FBF7F0; }
  .sig { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .sig-line { border-top: 1px solid #2A1A0E; padding-top: 6px; font-size: 11px; color: #8B6B4A; }
  .footer { text-align: center; margin-top: 32px; font-size: 10px; color: #8B6B4A; letter-spacing: 1px; }
  .tag { display: inline-block; padding: 1px 6px; border-radius: 8px; font-size: 9px; background: #E8F5E9; color: #4A7C59; margin-left: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body><div class="page">
<div class="header">
  <div class="sub">Karveli Restaurant Group · Uganda</div>
  <h1>${isClient ? "BUFFET QUOTATION" : "INTERNAL COSTING SHEET"}</h1>
  <div style="margin-top:8px;font-size:12px;color:#D4B080">${menuName||"Buffet Menu"} ${clientName ? `· ${clientName}` : ""}</div>
</div>
<div class="meta">
  <div class="meta-box"><label>Event Date</label><span>${eventDate||"TBC"}</span></div>
  <div class="meta-box"><label>Branch</label><span>${branch}</span></div>
  <div class="meta-box"><label>Number of Guests</label><span>${pax} people</span></div>
  <div class="meta-box"><label>Generated</label><span>${todayStr()}</span></div>
</div>

<div class="section-title">Menu Selection — ${selRecipes.length} dishes</div>
${Object.entries(byCategory).map(([cat, dishes]) => `
  <div style="margin-bottom:14px">
    <div style="font-size:10px;font-weight:bold;color:#8B6B4A;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${cat}</div>
    ${dishes.map(r => {
      const cpp = allCosted[r.id]?.costPerPax||0;
      return `<div class="dish-row">
        <div><span class="dish-name">${r.name}</span>${r.servingG?`<span class="dish-serving">${r.servingG}g/person</span>`:""}${(r.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        ${isClient ? "" : `<div style="color:#6B1A1A;font-weight:bold">${fmtUGX(cpp)}/pax</div>`}
      </div>`;
    }).join("")}
  </div>
`).join("")}

<div class="pricing-box">
  ${isClient ? `
    <div class="pricing-row"><span>Price per person (inc. 10% production)</span><span>${fmtUGX(pricing.finalPP)}</span></div>
    <div class="pricing-row"><span>VAT (${vatPct}%)</span><span>${fmtUGX(pricing.vatAmt/pax)}/pax</span></div>
    <div class="pricing-row total"><span>TOTAL FOR ${pax} GUESTS</span><span>${fmtUGX(pricing.sellingIncVat)}</span></div>
  ` : `
    <div class="pricing-row"><span>Raw food cost/person</span><span>${fmtUGX(pricing.rawCPP)}</span></div>
    <div class="pricing-row"><span>+ 10% production</span><span>${fmtUGX(pricing.prodCPP)}</span></div>
    <div class="pricing-row"><span>Total cost/person</span><span>${fmtUGX(pricing.totalCPP)}</span></div>
    <div class="pricing-row"><span>Selling price/person</span><span>${fmtUGX(pricing.finalPP)}</span></div>
    <div class="pricing-row total"><span>TOTAL SELLING (${pax} guests + VAT)</span><span>${fmtUGX(pricing.sellingIncVat)}</span></div>
    <div class="pricing-row" style="margin-top:6px"><span>Gross Margin</span><span style="color:#7BC67E">${fmtUGX(pricing.margin)}</span></div>
    <div class="pricing-row"><span>Food Cost %</span><span style="color:${pricing.actualFcPct<=35?"#7BC67E":"#FF8A80"}">${pricing.actualFcPct.toFixed(1)}%</span></div>
  `}
</div>

${!isClient ? `
<div class="section-title">Ingredient Issue List — ${pax} guests</div>
<table>
  <thead><tr><th>#</th><th>Ingredient</th><th>Unit</th><th>EP (usable)</th><th>AP (to issue)</th><th>Est. Cost</th></tr></thead>
  <tbody>
    ${issueList.map((ing,i) => `<tr>
      <td>${i+1}</td>
      <td>${ing.name}</td>
      <td>${ing.qtyUnit}</td>
      <td style="color:#4A7C59">${fmtN(ing.epQty,2)} ${ing.qtyUnit}</td>
      <td style="font-weight:bold;color:#5C3A1E">${fmtN(ing.apQty,2)} ${ing.qtyUnit}</td>
      <td>${fmtUGX(ing.lineCost)}</td>
    </tr>`).join("")}
    <tr style="background:#FFF5E6"><td colspan="5" style="font-weight:bold;color:#6B1A1A">TOTAL EXPENDITURE</td><td style="font-weight:bold;color:#6B1A1A">${fmtUGX(pricing.totalCostAll)}</td></tr>
  </tbody>
</table>
<div class="sig">
  <div><div class="sig-line">Prepared by: ___________________________</div></div>
  <div><div class="sig-line">Approved by: ___________________________</div></div>
</div>
` : `
<div class="footer">Thank you for choosing Karveli · info@karvelifood.com</div>
`}
</div><script>window.onload=()=>setTimeout(()=>window.print(),500)</script>
</body></html>`;

    const w = window.open("","_blank");
    if (w) { w.document.write(html); w.document.close(); }
    else showToast("Allow popups for this site to open quotes","err");
  }, [menuName,clientName,eventDate,branch,pax,selRecipes,allCosted,pricing,vatPct,issueList,showToast]);

  // ── Show login screen if not authenticated ────────────────────────────────
  if (authLoading) {
    return (
      <div style={{minHeight:"100vh",background:"#3D0E0E",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"#F5E6C8",fontSize:14}}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{minHeight:"100vh",background:`linear-gradient(135deg,#3D0E0E,#6B1A1A)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
        <div style={{background:"#FBF7F0",borderRadius:16,padding:"40px 44px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:32,marginBottom:8}}>🍽️</div>
            <div style={{fontSize:20,fontWeight:700,color:"#6B1A1A",letterSpacing:1}}>KARVELI BUFFET SYSTEM</div>
            <div style={{fontSize:11,color:"#8B6B4A",letterSpacing:3,textTransform:"uppercase",marginTop:4}}>Staff Access</div>
          </div>
          {!authSent ? (
            <>
              <div style={{fontSize:13,color:"#5C3A1E",marginBottom:16,textAlign:"center"}}>Enter your work email to receive a login link</div>
              <label style={{fontSize:11,fontWeight:600,color:"#8B6B4A",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:5}}>Email Address</label>
              <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendMagicLink()}
                placeholder="e.g. emma@karvelifood.com"
                style={{width:"100%",padding:"11px 14px",borderRadius:8,border:"1.5px solid #E8D9C0",fontSize:14,fontFamily:"inherit",marginBottom:10,outline:"none",boxSizing:"border-box"}}/>
              {authError && <div style={{color:"#C0392B",fontSize:12,marginBottom:8}}>{authError}</div>}
              <button onClick={sendMagicLink}
                style={{width:"100%",padding:"12px",background:"#6B1A1A",color:"#F5E6C8",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Send Login Link →
              </button>
              <div style={{fontSize:11,color:"#8B6B4A",textAlign:"center",marginTop:12}}>A secure link will be sent to your email. No password needed.</div>
            </>
          ) : (
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>📧</div>
              <div style={{fontSize:15,fontWeight:700,color:"#6B1A1A",marginBottom:8}}>Check your email!</div>
              <div style={{fontSize:13,color:"#5C3A1E",lineHeight:1.6}}>We sent a login link to<br/><strong>{authEmail}</strong><br/><br/>Click the link in the email to sign in.</div>
              <button onClick={()=>setAuthSent(false)} style={{marginTop:16,background:"none",border:"none",color:"#8B6B4A",cursor:"pointer",fontSize:12,fontFamily:"inherit",textDecoration:"underline"}}>Use a different email</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const userName = user.user_metadata?.name || user.email.split("@")[0];

  return (
    <div style={{fontFamily:"'Georgia','Times New Roman',serif",minHeight:"100vh",background:B.bg,color:B.text}}>
      {/* Loading overlay */}
      {loading && (
        <div style={{position:"fixed",inset:0,background:"rgba(61,14,14,0.85)",zIndex:99999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
          <div style={{fontSize:28}}>🍽️</div>
          <div style={{color:"#F5E6C8",fontSize:15,fontWeight:600,letterSpacing:1}}>Loading Karveli data...</div>
          <div style={{width:180,height:4,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:"60%",height:"100%",background:"#C4922A",borderRadius:2,animation:"none"}}/>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{position:"fixed",top:14,right:14,zIndex:9999,padding:"10px 16px",borderRadius:9,fontWeight:600,fontSize:13,background:toast.type==="err"?"#C0392B":B.green,color:"white",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${B.maroon},${B.dark})`,padding:"14px 22px 0",borderBottom:`3px solid ${B.gold}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🍽️</span>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:B.cream,letterSpacing:1}}>KARVELI BUFFET SYSTEM</div>
              <div style={{fontSize:9,color:B.gold,letterSpacing:3,textTransform:"uppercase"}}>Prices · Recipes · Menus · Issuing · Records</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {dbReady && <span style={{fontSize:9,padding:"2px 7px",borderRadius:8,background:"rgba(74,124,89,0.3)",color:"#A8D5A2",letterSpacing:1}}>● LIVE</span>}
            <span style={{fontSize:11,color:B.gold}}>👤 {userName}</span>
            <button onClick={()=>supabase.auth.signOut()} style={{padding:"4px 10px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(245,230,200,0.3)",color:B.cream,borderRadius:6,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Sign out</button>
            {tab==="menu" && selIds.size>0 && (
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setModal("save")} style={{padding:"6px 13px",background:"rgba(196,146,42,0.2)",border:`1px solid ${B.gold}`,color:B.cream,borderRadius:7,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>💾 Save</button>
                <button onClick={()=>setModal("quote")} style={{padding:"6px 13px",background:B.gold,border:"none",color:B.dark,borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>📄 Quote</button>
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",gap:2,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",borderRadius:"7px 7px 0 0",whiteSpace:"nowrap",
              background:tab===t.id?B.bg:"rgba(255,255,255,0.08)",color:tab===t.id?B.maroon:B.cream}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab==="items"    && <ItemsTab   items={items} setItems={setItems} showToast={showToast} dbReady={dbReady} logAudit={logAudit} />}
      {tab==="recipes"  && <RecipesTab recipes={recipes} setRecipes={setRecipes} items={items} itemMap={itemMap} allCosted={allCosted} showToast={showToast} dbReady={dbReady} logAudit={logAudit} />}
      {tab==="packages" && <PackagesTab packages={packages} recipes={recipes} allCosted={allCosted} onSave={savePackage} onDelete={deletePackage} onUpdate={updatePackage} onLoad={(pkg) => {
          setSelIds(new Set(pkg.recipe_ids||[]));
          setMenuName(pkg.name); setTab("menu");
          showToast(`"${pkg.name}" loaded into Menu Builder!`);
        }} />}
      {tab==="menu"    && <MenuTab    recipes={recipes} allCosted={allCosted} selIds={selIds} toggleSel={toggleSel} uptake={uptake} setUptake={setUptake} pax={pax} setPax={setPax} fcPct={fcPct} setFcPct={setFcPct} vatPct={vatPct} setVatPct={setVatPct} customPP={customPP} setCustomPP={setCustomPP} clientName={clientName} setClientName={setClientName} eventDate={eventDate} setEventDate={setEventDate} branch={branch} setBranch={setBranch} pricing={pricing} selRecipes={selRecipes} />}
      {tab==="saved"   && <SavedTab   savedMenus={savedMenus} onDelete={deleteMenu} onLoad={(m)=>{
          const ids = m.recipeIds || m.selectedIds || [];
          setSelIds(new Set(ids));
          setPax(m.pax); setFcPct(m.fcPct); setVatPct(m.vatPct);
          setCustomPP(m.customPP||""); setMenuName(m.name);
          setClientName(m.clientName||""); setEventDate(m.eventDate||"");
          setBranch(m.branch||BRANCHES[0]); setTab("menu");
          showToast(`"${m.name}" loaded!`);
        }} />}
      {tab==="issue"   && <IssueTab   selIds={selIds} selRecipes={selRecipes} allCosted={allCosted} pax={pax} issueList={issueList} pricing={pricing} clientName={clientName} eventDate={eventDate} issueNote={issueNote} setIssueNote={setIssueNote} onLog={logIssue} onPrint={()=>{
          const fmtUGX = (n) => "UGX " + Math.round(n||0).toLocaleString();
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Karveli Issue Sheet</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#2A1A0E;padding:32px}
h1{font-size:20px;color:#6B1A1A;letter-spacing:1px;margin-bottom:4px}
.sub{font-size:11px;color:#8B6B4A;margin-bottom:20px}
.meta{display:flex;gap:32px;margin-bottom:18px;font-size:12px}
.meta span{color:#8B6B4A}.meta strong{color:#2A1A0E}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:#6B1A1A;color:#F5E6C8;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:7px 10px;border-bottom:1px solid #F0E8D8}
tr:nth-child(even) td{background:#FBF7F0}
.ep{color:#4A7C59;font-weight:600}.ap{color:#5C3A1E;font-weight:700}
.total-row td{background:#FFF5E6;font-weight:700;color:#6B1A1A}
.sig{margin-top:36px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px}
.sig-line{border-top:1px solid #2A1A0E;padding-top:6px;font-size:11px;color:#8B6B4A}
.legend{background:#FFF5E6;padding:8px 12px;border-radius:6px;font-size:11px;color:#5C3A1E;margin-bottom:14px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<h1>KARVELI — INGREDIENT ISSUE SHEET</h1>
<div class="sub">Kitchen & Procurement Copy · Confidential</div>
<div class="meta">
  <div><span>Event / Menu: </span><strong>${menuName||"Untitled"}</strong></div>
  <div><span>Client: </span><strong>${clientName||"—"}</strong></div>
  <div><span>Date: </span><strong>${eventDate||todayStr()}</strong></div>
  <div><span>Branch: </span><strong>${branch}</strong></div>
  <div><span>Guests: </span><strong>${pax}</strong></div>
</div>
<div class="meta" style="margin-bottom:14px">
  <div><span>Dishes: </span><strong>${selRecipes.map(r=>r.name).join(", ")}</strong></div>
</div>
<div class="legend"><strong>EP</strong> = Edible Portion (usable after prep) &nbsp;·&nbsp; <strong>AP</strong> = As Purchased (pull from stores · weigh this amount)</div>
<table>
<thead><tr><th>#</th><th>Ingredient</th><th>Unit</th><th>EP (usable)</th><th>AP — pull from stores</th><th>Est. Cost</th><th>Issued ✓</th></tr></thead>
<tbody>
${issueList.map((ing,i)=>`<tr>
  <td>${i+1}</td><td>${ing.name}</td><td>${ing.qtyUnit}</td>
  <td class="ep">${fmtN(ing.epQty,2)} ${ing.qtyUnit}</td>
  <td class="ap">${fmtN(ing.apQty,2)} ${ing.qtyUnit}</td>
  <td>${fmtUGX(ing.lineCost)}</td>
  <td style="text-align:center">□</td>
</tr>`).join("")}
<tr class="total-row"><td colspan="5">TOTAL ESTIMATED EXPENDITURE</td><td>${fmtUGX(pricing.totalCostAll)}</td><td></td></tr>
</tbody></table>
<div class="sig">
  <div><div class="sig-line">Issued by: ___________________________</div></div>
  <div><div class="sig-line">Received by (Chef): ___________________</div></div>
  <div><div class="sig-line">Approved by: _________________________</div></div>
</div>
<p style="margin-top:20px;font-size:10px;color:#8B6B4A">Generated: ${todayStr()} · Karveli Restaurant Group</p>
</body><script>window.onload=()=>setTimeout(()=>window.print(),400)</script></html>`;
          const w = window.open("","_blank");
          if(w){w.document.write(html);w.document.close();}
          else showToast("Allow popups to print issue sheet","err");
        }} />}
      {tab==="records" && <RecordsTab issueRecs={issueRecs} auditLog={auditLog} />}

      {/* Modals */}
      {modal==="save" && (
        <Modal title="Save Menu" onClose={()=>setModal(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><label style={LS}>Menu Name *</label><input value={menuName} onChange={e=>setMenuName(e.target.value)} placeholder="e.g. Easter Sunday Buffet 2026" style={IS}/></div>
            <div><label style={LS}>Client / Event</label><input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="e.g. Acacia Weddings" style={IS}/></div>
            <div><label style={LS}>Event Date</label><input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} style={IS}/></div>
            <div style={{background:"#FFF5E6",borderRadius:8,padding:"9px 13px",fontSize:12,color:B.mid}}>
              {selIds.size} dishes · {pax} guests · {branch} · Selling: {fmt(pricing.finalPP)}/pax
            </div>
            <BtnPrimary onClick={saveMenu}>Save Menu</BtnPrimary>
          </div>
        </Modal>
      )}
      {modal==="quote" && (
        <Modal title="Generate Quote / Document" onClose={()=>setModal(null)}>
          <p style={{fontSize:13,color:B.mid,marginBottom:14,lineHeight:1.7}}>Choose the document type. <strong>Client version</strong> shows only the menu and final price — no costs or margins. <strong>Internal version</strong> shows full costing, food cost %, yield-adjusted quantities and expenditure.</p>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <button onClick={()=>generateQuote("client")} style={{padding:"13px",background:B.maroon,color:B.cream,border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",textAlign:"left"}}>
              👥 Client Quote — menu + price only
              <div style={{fontSize:11,fontWeight:400,marginTop:2,opacity:0.8}}>{pax} guests · {fmt(pricing.finalPP)}/pax · Total {fmt(pricing.sellingIncVat)} inc. VAT</div>
            </button>
            <button onClick={()=>generateQuote("internal")} style={{padding:"13px",background:B.blue,color:"white",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",textAlign:"left"}}>
              🔒 Internal Sheet — full costing + issue list
              <div style={{fontSize:11,fontWeight:400,marginTop:2,opacity:0.8}}>FC {pricing.actualFcPct.toFixed(1)}% · Expenditure {fmt(pricing.totalCostAll)} · Margin {fmt(pricing.margin)}</div>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ITEMS TAB ────────────────────────────────────────────────────────────────
const ItemsTab = memo(function ItemsTab({ items, setItems, showToast, dbReady, logAudit }) {
  const [search, setSearch]   = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]       = useState({name:"",unit:"Kilogram",price:""});

  const filtered = useMemo(() =>
    items.filter(i=>i.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b)=>a.name.localeCompare(b.name)).slice(0,200),
    [items, search]
  );

  const openEdit = (item) => { setForm({name:item.name,unit:item.unit,price:item.price}); setEditItem(item); setShowAdd(true); };
  const openAdd  = () => { setForm({name:"",unit:"Kilogram",price:""}); setEditItem(null); setShowAdd(true); };

  const handleSave = async () => {
    if (!form.name.trim()||!form.price) { showToast("Name and price required","err"); return; }
    const price = parseFloat(form.price);
    if (isNaN(price)||price<=0) { showToast("Enter a valid price","err"); return; }
    if (editItem) {
      if (dbReady && editItem.id) {
        const { error } = await supabase.from("items").update({ name:form.name.trim(), unit:form.unit, price }).eq("id", editItem.id);
        if (error) { showToast("Update failed","err"); return; }
      }
      setItems(prev=>prev.map(i=>i.id===editItem.id?{...i,name:form.name.trim(),unit:form.unit,price}:i));
      showToast(`"${form.name}" updated!`);
      logAudit?.("Updated price", "items", form.name, { price: editItem.price }, { price });
    } else {
      let newId = uid();
      if (dbReady) {
        const { data, error } = await supabase.from("items").insert({ name:form.name.trim(), unit:form.unit, price }).select().single();
        if (error) { showToast("Add failed","err"); return; }
        newId = data.id;
      }
      setItems(prev=>[...prev,{name:form.name.trim(),unit:form.unit,price,id:newId}]);
      showToast(`"${form.name}" added!`);
      logAudit?.("Added item", "items", form.name, null, { name:form.name, unit:form.unit, price });
    }
    setShowAdd(false); setEditItem(null);
  };

  return (
    <div style={{padding:"18px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:"#3D1A00"}}>Item Price List</div>
          <div style={{fontSize:12,color:B.muted,marginTop:2}}>{items.length} items · Edit any price to update all recipes instantly</div>
        </div>
        <BtnPrimary onClick={openAdd}>+ Add Item</BtnPrimary>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items..." style={{...IS,marginBottom:12}}/>
      {showAdd && (
        <div style={{background:"white",borderRadius:11,border:`2px solid ${B.gold}`,padding:"15px 17px",marginBottom:16,boxShadow:"0 4px 14px rgba(196,146,42,0.12)"}}>
          <div style={{fontSize:14,fontWeight:700,color:B.maroon,marginBottom:12}}>{editItem?"Edit Item":"Add New Item"}</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:9,alignItems:"end"}}>
            <div><label style={LS}>Item Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Chicken Thighs" style={IS}/></div>
            <div><label style={LS}>Unit</label><input value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} placeholder="Kilogram" style={IS}/></div>
            <div><label style={LS}>Price (UGX) *</label><input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="e.g. 11500" style={IS}/></div>
            <div style={{display:"flex",gap:6}}>
              <BtnPrimary onClick={handleSave} style={{padding:"7px 14px"}}>{editItem?"Update":"Add"}</BtnPrimary>
              <button onClick={()=>{setShowAdd(false);setEditItem(null);}} style={{padding:"7px 10px",background:"transparent",border:`1.5px solid #C8B09A`,color:B.mid,borderRadius:7,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
            </div>
          </div>
        </div>
      )}
      <div style={{background:"white",borderRadius:10,border:`1.5px solid ${B.border}`,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:B.bg}}>
            {["Item Name","Unit","Price (UGX)","Last Updated",""].map(h=>(
              <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,color:B.muted,fontWeight:700,letterSpacing:0.5,borderBottom:`1px solid ${B.border}`}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((item,i)=>(
              <tr key={item.id} style={{background:i%2===0?"white":B.white,borderBottom:`1px solid ${B.border}22`}}>
                <td style={{padding:"8px 12px",fontWeight:600,color:"#3D1A00"}}>{item.name}</td>
                <td style={{padding:"8px 12px",color:B.mid,fontSize:12}}>{item.unit}</td>
                <td style={{padding:"8px 12px",fontWeight:700,color:B.maroon}}>{item.price.toLocaleString()}</td>
                <td style={{padding:"8px 12px",color:B.muted,fontSize:11}}>{item.updatedAt?new Date(item.updatedAt).toLocaleDateString():"Seed data"}</td>
                <td style={{padding:"8px 12px"}}>
                  <button onClick={()=>openEdit(item)} style={{padding:"3px 10px",background:"transparent",border:`1px solid ${B.gold}`,color:B.maroon,borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())).length>200 && (
          <div style={{padding:"9px 12px",fontSize:12,color:B.muted,textAlign:"center"}}>Showing first 200 — type to filter</div>
        )}
      </div>
    </div>
  );
});

// ─── RECIPES TAB ─────────────────────────────────────────────────────────────
const RecipesTab = memo(function RecipesTab({ recipes, setRecipes, items, itemMap, allCosted, showToast, dbReady, logAudit }) {
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(null);
  const [ingSearch, setIngSearch] = useState("");
  const [dropOpen, setDropOpen]   = useState(false);
  const [deleteId, setDeleteId]   = useState(null);

  const filtered = useMemo(() =>
    recipes.filter(r=>(filterCat==="All"||r.category===filterCat)&&r.name.toLowerCase().includes(search.toLowerCase())),
    [recipes, filterCat, search]
  );

  const openNew  = () => { setForm({id:uid(),name:"",category:"Proteins",basePax:10,yieldPct:100,tags:[],lines:[]}); setEditing(null); setShowForm(true); window.scrollTo({top:0,behavior:"smooth"}); };
  const openEdit = (r) => { setForm(JSON.parse(JSON.stringify(r))); setEditing(r); setShowForm(true); window.scrollTo({top:0,behavior:"smooth"}); };

  const formCost = useMemo(() => {
    if (!form) return { batchCost:0, costPerPax:0, lines:[], epTotalG:0, autoServingG:0 };
    const costed = costRecipe(form, itemMap);
    // Sum EP quantities — only for kg/g/L/ml units (weight/volume)
    const WEIGHT_UNITS = ["kilogram","kg","g","gram","grams","liter","litre","l","ml","millilitre","milliliter"];
    let epTotalG = 0;
    costed.lines.forEach(line => {
      const u = (line.qtyUnit||"").toLowerCase().trim();
      const isWeight = WEIGHT_UNITS.some(x => u === x);
      if (!isWeight) return;
      const epQty = line.epQty || 0;
      // Convert to grams
      if (u === "kilogram" || u === "kg") epTotalG += epQty * 1000;
      else if (u === "liter" || u === "litre" || u === "l") epTotalG += epQty * 1000;
      else epTotalG += epQty; // already in g or ml
    });
    const autoServingG = form.basePax > 0 && epTotalG > 0 ? Math.round(epTotalG / form.basePax) : 0;
    return { ...costed, epTotalG: Math.round(epTotalG), autoServingG };
  }, [form, itemMap]);

  const matchItems = useMemo(() =>
    ingSearch.length>1 ? items.filter(i=>i.name.toLowerCase().includes(ingSearch.toLowerCase())).slice(0,8) : [],
    [items, ingSearch]
  );

  const addLine = (item) => {
    // Guess a sensible default unit based on purchase unit
    const pu = (item.unit||"").toLowerCase();
    let defaultUnit = "Kilogram";
    if (pu.includes("ml") || pu.includes("litre") || pu.includes("liter")) defaultUnit = "Liter";
    else if (pu.includes("each") || pu.includes("piece") || pu.includes("bunch") || pu.includes("bundle")) defaultUnit = "Each";
    else if (pu.includes("portion")) defaultUnit = "Portion";
    else if (pu.includes("tray")) defaultUnit = "Tray 30pc";
    else if (pu.includes("tin") && pu.includes("100")) defaultUnit = "Tin 100g";
    else if (pu.includes("tin") && pu.includes("2kg")) defaultUnit = "Tin 2kg";
    else if (pu.includes("packet") && pu.includes("500")) defaultUnit = "Packet 500g";
    else if (pu.includes("packet") && pu.includes("400")) defaultUnit = "Packet 400g";
    else if (pu.includes("packet") && pu.includes("1kg")) defaultUnit = "Packet 1Kg";
    else if (pu.includes("bottle")) defaultUnit = "Bottle 500ml";
    setForm(f=>({...f,lines:[...f.lines,{item:item.name,qty:1,qtyUnit:defaultUnit,qtyMode:"AP",yieldPct:95}]}));
    setIngSearch(""); setDropOpen(false);
  };
  const updateLine = (idx, field, val) => setForm(f=>({...f,lines:f.lines.map((l,i)=>i===idx?{...l,[field]:val}:l)}));
  const removeLine = (idx) => setForm(f=>({...f,lines:f.lines.filter((_,i)=>i!==idx)}));

  const handleSave = async () => {
    if (!form.name.trim()||!form.lines.length) { showToast("Name and at least 1 ingredient required","err"); return; }
    if (dbReady) {
      const recipePayload = {
        name: form.name.trim(), category: form.category,
        base_pax: form.basePax, serving_g: form.servingG || formCost.autoServingG || null,
        tags: form.tags || [],
      };
      if (editing) {
        // Update recipe row
        await supabase.from("recipes").update(recipePayload).eq("id", editing.id);
        // Replace all lines: delete existing, reinsert
        await supabase.from("recipe_lines").delete().eq("recipe_id", editing.id);
        const linePayload = form.lines.map((l,i) => ({
          recipe_id: editing.id, item: l.item, qty: l.qty,
          qty_unit: l.qtyUnit, qty_mode: l.qtyMode, yield_pct: l.yieldPct, sort_order: i,
        }));
        await supabase.from("recipe_lines").insert(linePayload);
        setRecipes(prev => prev.map(r => r.id === editing.id ? { ...form, id: editing.id } : r));
        showToast(`"${form.name}" updated!`);
        logAudit?.("Updated recipe", "recipes", form.name, null, { name:form.name, ingredients:form.lines.length });
      } else {
        // Insert new recipe
        const { data: newRecipe, error } = await supabase.from("recipes").insert(recipePayload).select().single();
        if (error) { showToast("Save failed","err"); return; }
        const linePayload = form.lines.map((l,i) => ({
          recipe_id: newRecipe.id, item: l.item, qty: l.qty,
          qty_unit: l.qtyUnit, qty_mode: l.qtyMode, yield_pct: l.yieldPct, sort_order: i,
        }));
        await supabase.from("recipe_lines").insert(linePayload);
        setRecipes(prev => [...prev, { ...form, id: newRecipe.id }]);
        showToast(`"${form.name}" created!`);
        logAudit?.("Created recipe", "recipes", form.name, null, { name:form.name, category:form.category });
      }
    } else {
      if (editing) { setRecipes(prev=>prev.map(r=>r.id===editing.id?form:r)); showToast(`"${form.name}" updated!`); }
      else { setRecipes(prev=>[...prev,form]); showToast(`"${form.name}" created!`); }
    }
    setShowForm(false); setEditing(null);
  };

  const confirmDelete = (id) => setDeleteId(id);
  const doDelete = async () => {
    if (dbReady) {
      // recipe_lines cascade delete via FK, so just delete the recipe
      const { error } = await supabase.from("recipes").delete().eq("id", deleteId);
      if (error) { showToast("Delete failed","err"); setDeleteId(null); return; }
    }
    setRecipes(prev=>prev.filter(r=>r.id!==deleteId));
    setDeleteId(null); showToast("Recipe deleted");
  };

  return (
    <div style={{padding:"18px 22px"}}>
      {deleteId && (
        <Modal title="Delete Recipe?" onClose={()=>setDeleteId(null)}>
          <p style={{fontSize:13,color:B.mid,marginBottom:16}}>This will permanently remove the recipe. You cannot undo this.</p>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
            <button onClick={()=>setDeleteId(null)} style={{padding:"7px 18px",background:"transparent",border:`1.5px solid #C8B09A`,color:B.mid,borderRadius:7,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={doDelete} style={{padding:"7px 18px",background:"#C0392B",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>Delete</button>
          </div>
        </Modal>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:"#3D1A00"}}>Recipe Library</div>
          <div style={{fontSize:12,color:B.muted,marginTop:2}}>{recipes.length} recipes · Costs pull live from item prices</div>
        </div>
        <BtnPrimary onClick={openNew}>+ New Recipe</BtnPrimary>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:9,flexWrap:"wrap"}}>
        {["All",...DISH_CATS].map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{padding:"4px 10px",borderRadius:20,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",
            background:filterCat===c?B.maroon:"transparent",borderColor:filterCat===c?B.maroon:B.gold,color:filterCat===c?B.cream:B.maroon}}>{c}</button>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search recipes..." style={{...IS,marginBottom:12}}/>

      {showForm && form && (
        <div style={{background:"white",borderRadius:12,border:`2px solid ${B.gold}`,padding:"17px 19px",marginBottom:18,boxShadow:"0 4px 18px rgba(196,146,42,0.12)"}}>
          <div style={{fontSize:15,fontWeight:700,color:B.maroon,marginBottom:13}}>{editing?"Edit Recipe":"New Recipe"}</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:9,marginBottom:11}}>
            <div><label style={LS}>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Spicy Beef Stew" style={IS}/></div>
            <div><label style={LS}>Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={IS}>{DISH_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={LS}>Base Portions</label><input type="number" value={form.basePax} onChange={e=>setForm(f=>({...f,basePax:parseInt(e.target.value)||10}))} style={{...IS,textAlign:"center",fontWeight:700}}/></div>
            <div>
              <label style={LS}>Serving Size (g/person)</label>
              <input type="number"
                value={form.servingG || formCost.autoServingG || ""}
                onChange={e=>setForm(f=>({...f,servingG:e.target.value?parseInt(e.target.value):null}))}
                placeholder={formCost.autoServingG ? `Auto: ${formCost.autoServingG}g` : "e.g. 300"}
                style={{...IS,textAlign:"center",fontWeight:700,
                  background: !form.servingG && formCost.autoServingG ? "#FFF5E6" : "white",
                  borderColor: !form.servingG && formCost.autoServingG ? B.gold : undefined}}/>
              {!form.servingG && formCost.autoServingG>0 && (
                <div style={{fontSize:9,color:B.gold,marginTop:2,textAlign:"center"}}>Auto-calculated from EP</div>
              )}
            </div>
            <div><label style={LS}>Overall Yield %</label><input type="number" value={form.yieldPct} onChange={e=>setForm(f=>({...f,yieldPct:parseFloat(e.target.value)||100}))} style={{...IS,textAlign:"center",fontWeight:700}}/></div>
          </div>
          <div style={{marginBottom:11}}>
            <label style={LS}>Dietary Tags</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {DIET_TAGS.map(tag=>(
                <label key={tag} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12}}>
                  <input type="checkbox" checked={form.tags?.includes(tag)||false} onChange={e=>setForm(f=>({...f,tags:e.target.checked?[...(f.tags||[]),tag]:(f.tags||[]).filter(t=>t!==tag)}))}/> {tag}
                </label>
              ))}
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:B.maroon,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Ingredients</div>
          {/* AP/EP explainer */}
          <div style={{background:"#FFF5E6",borderRadius:7,padding:"8px 12px",marginBottom:10,fontSize:11,color:B.mid,lineHeight:1.6}}>
            <strong>AP</strong> = As Purchased (what you pull from stores, before any prep) &nbsp;·&nbsp;
            <strong>EP</strong> = Edible Portion (what goes into the dish after trimming/boning/peeling). Enter grams (g) or ml for weight/volume ingredients. Use pieces/portions for everything else.
          </div>
          {formCost.lines.length>0 && (
            <div style={{overflowX:"auto",marginBottom:10}}>
              <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                <thead><tr style={{background:B.bg}}>
                  {["Ingredient","Qty","Unit","Mode","Yield %","EP (usable)","AP (to issue)","Price/purchase unit","Line cost",""].map(h=>(
                    <th key={h} style={{padding:"5px 7px",textAlign:"left",fontSize:9,color:B.muted,fontWeight:700,borderBottom:`1px solid ${B.border}`}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {formCost.lines.map((line,i)=>{
                    const isGrams = GRAM_UNITS.some(x=>(line.qtyUnit||"").toLowerCase()===x);
                    const isMl    = ML_UNITS.some(x=>(line.qtyUnit||"").toLowerCase()===x);
                    const isWeight = isGrams || isMl;
                    return (
                    <tr key={i} style={{borderBottom:`1px solid ${B.border}22`}}>
                      <td style={{padding:"5px 7px",fontWeight:600,minWidth:120}}>{line.item}</td>
                      <td style={{padding:"5px 7px"}}>
                        <input type="number" value={line.qty} step={isWeight?"1":"0.01"} min={0}
                          onChange={e=>updateLine(i,"qty",parseFloat(e.target.value)||0)}
                          style={{width:72,padding:"3px 5px",border:`1px solid ${B.gold}`,borderRadius:5,fontSize:12,fontFamily:"inherit"}}/>
                      </td>
                      <td style={{padding:"5px 7px"}}>
                        <select value={line.qtyUnit||line.uom||"g"}
                          onChange={e=>updateLine(i,"qtyUnit",e.target.value)}
                          style={{padding:"3px 5px",border:`1px solid ${B.gold}`,borderRadius:5,fontSize:11,fontFamily:"inherit",background:"#FFFBF5"}}>
                          <option value="Kilogram">Kilogram</option>
                          <option value="Liter">Liter</option>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="Each">Each</option>
                          <option value="Portion">Portion</option>
                          <option value="Piece">Piece</option>
                          <option value="Bunch">Bunch</option>
                          <option value="Bundle">Bundle</option>
                          <option value="Tray 30pc">Tray 30pc</option>
                          <option value="Tin 100g">Tin 100g</option>
                          <option value="Tin 2kg">Tin 2kg</option>
                          <option value="Tin 20g">Tin 20g</option>
                          <option value="Packet 500g">Pkt 500g</option>
                          <option value="Packet 400g">Pkt 400g</option>
                          <option value="Packet 1Kg">Pkt 1Kg</option>
                          <option value="Bottle 500ml">Btl 500ml</option>
                          <option value="Bottle 340g">Btl 340g</option>
                        </select>
                      </td>
                      <td style={{padding:"5px 7px"}}>
                        <div style={{display:"flex",borderRadius:5,overflow:"hidden",border:`1px solid ${B.gold}`}}>
                          {["AP","EP"].map(m=>(
                            <button key={m} onClick={()=>updateLine(i,"qtyMode",m)}
                              style={{padding:"3px 7px",border:"none",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,
                                background:(line.qtyMode||"AP")===m?B.maroon:"#FFFBF5",
                                color:(line.qtyMode||"AP")===m?B.cream:B.muted}}>{m}</button>
                          ))}
                        </div>
                      </td>
                      <td style={{padding:"5px 7px"}}>
                        <input type="number" value={line.yieldPct} min={1} max={100}
                          onChange={e=>updateLine(i,"yieldPct",parseFloat(e.target.value)||100)}
                          style={{width:50,padding:"3px 5px",border:`1px solid ${B.gold}`,borderRadius:5,fontSize:12,fontFamily:"inherit"}}/>%
                      </td>
                      <td style={{padding:"5px 7px",fontWeight:600,color:B.green,whiteSpace:"nowrap"}}>
                        {fmtQty(line.epQty, line.qtyUnit||line.uom||"")}
                      </td>
                      <td style={{padding:"5px 7px",fontWeight:700,color:"#8B5E3C",whiteSpace:"nowrap"}}>
                        {fmtQty(line.apQty, line.qtyUnit||line.uom||"")}
                      </td>
                      <td style={{padding:"5px 7px",color:B.mid,fontSize:11}}>{line.price>0?line.price.toLocaleString():<span style={{color:"#C0392B",fontSize:10}}>⚠ not in price list</span>}</td>
                      <td style={{padding:"5px 7px",fontWeight:700,color:B.maroon}}>{line.lineCost>0?Math.round(line.lineCost).toLocaleString():"—"}</td>
                      <td style={{padding:"5px 7px"}}><button onClick={()=>removeLine(i)} style={{background:"none",border:"none",color:"#C0392B",cursor:"pointer",fontSize:14,padding:0}}>✕</button></td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{position:"relative",marginBottom:10}}>
            <label style={LS}>Search & Add Ingredient</label>
            <input value={ingSearch} onChange={e=>{setIngSearch(e.target.value);setDropOpen(true);}} onFocus={()=>setDropOpen(true)} onBlur={()=>setTimeout(()=>setDropOpen(false),150)}
              placeholder="Type ingredient name to search price list..." style={IS}/>
            {dropOpen && matchItems.length>0 && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:`1.5px solid ${B.gold}`,borderRadius:8,zIndex:100,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",maxHeight:220,overflowY:"auto"}}>
                {matchItems.map(item=>(
                  <div key={item.id} onMouseDown={()=>addLine(item)} style={{padding:"8px 12px",cursor:"pointer",borderBottom:`1px solid ${B.border}`,fontSize:13,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontWeight:600}}>{item.name}</span>
                    <span style={{fontSize:11,color:B.muted}}>{item.unit} · {item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {formCost.batchCost>0 && (
            <div style={{background:"linear-gradient(135deg,#FFF5E6,#FDF0D8)",borderRadius:9,padding:"10px 13px",marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:formCost.epTotalG>0?6:0}}>
                <span style={{fontSize:13,color:B.mid}}>Batch cost ({form.basePax} portions)</span>
                <span style={{fontSize:18,fontWeight:700,color:B.maroon}}>UGX {Math.round(formCost.batchCost).toLocaleString()}
                  <span style={{fontSize:12,fontWeight:400,color:B.muted,marginLeft:8}}>= UGX {Math.round(formCost.costPerPax).toLocaleString()}/person</span>
                </span>
              </div>
              {formCost.epTotalG>0 && (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:6,borderTop:`1px dotted ${B.border}`}}>
                  <span style={{fontSize:12,color:B.mid}}>Total EP (edible weight for batch)</span>
                  <span style={{fontSize:13,fontWeight:700,color:B.green}}>
                    {formCost.epTotalG >= 1000
                      ? `${(formCost.epTotalG/1000).toFixed(2)}kg`
                      : `${formCost.epTotalG}g`}
                    <span style={{fontSize:11,fontWeight:400,color:B.muted,marginLeft:8}}>
                      = {formCost.autoServingG}g/person
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{padding:"7px 16px",background:"transparent",border:`1.5px solid #C8B09A`,color:B.mid,borderRadius:7,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <BtnPrimary onClick={handleSave} style={{padding:"7px 20px"}}>{editing?"Save Changes":"Create Recipe"}</BtnPrimary>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:11}}>
        {filtered.map(r=>{
          const c = allCosted[r.id] || {costPerPax:0,batchCost:0};
          return (
            <div key={r.id} style={{background:"white",borderRadius:10,border:`1.5px solid ${B.border}`,padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#3D1A00"}}>{r.name}</div>
                  <div style={{fontSize:10,color:B.muted,marginTop:2}}>{r.category} · Base {r.basePax} portions{r.servingG ? ` · ${r.servingG}g/person` : ""}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:700,color:B.maroon}}>UGX {Math.round(c.costPerPax).toLocaleString()}</div>
                  <div style={{fontSize:10,color:B.muted}}>per person</div>
                </div>
              </div>
              {r.tags?.length>0 && <div style={{display:"flex",gap:4,marginBottom:5}}>
                {r.tags.map(t=><span key={t} style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:t==="veg"?"#E8F5E9":t==="gluten-free"?"#FFF3E0":"#E3F2FD",color:t==="veg"?"#4A7C59":t==="gluten-free"?"#E65100":"#1565C0"}}>{t}</span>)}
              </div>}
              <div style={{fontSize:11,color:B.muted,marginBottom:7}}>{r.lines?.length||0} ingredients · Batch: UGX {Math.round(c.batchCost).toLocaleString()}</div>
              <details style={{fontSize:11,marginBottom:8}}>
                <summary style={{cursor:"pointer",color:B.muted,fontWeight:600}}>View ingredients</summary>
                <table style={{width:"100%",marginTop:5}}>
                  <thead><tr>
                    <th style={{textAlign:"left",color:B.muted,fontSize:9,fontWeight:700,paddingBottom:2}}>Ingredient</th>
                    <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:700}}>Mode</th>
                    <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:700,paddingLeft:5}}>EP (usable)</th>
                    <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:700,paddingLeft:5}}>AP (issue)</th>
                    <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:700,paddingLeft:5}}>Yield</th>
                    <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:700,paddingLeft:5}}>Cost</th>
                  </tr></thead>
                  <tbody>
                    {(c.lines||[]).map((l,i)=>(
                      <tr key={i} style={{borderTop:`1px dotted ${B.border}`}}>
                        <td style={{padding:"2px 0",color:"#3D1A00"}}>{l.item}</td>
                        <td style={{padding:"2px 0",textAlign:"right"}}><span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:l.qtyMode==="EP"?"#E3F2FD":"#FFF5E6",color:l.qtyMode==="EP"?B.blue:B.maroon,fontWeight:700}}>{l.qtyMode||"AP"}</span></td>
                        <td style={{padding:"2px 0",textAlign:"right",color:B.green,paddingLeft:5}}>{fmtQty(l.epQty,l.qtyUnit||l.uom||"")}</td>
                        <td style={{padding:"2px 0",textAlign:"right",fontWeight:700,color:"#8B5E3C",paddingLeft:5}}>{fmtQty(l.apQty,l.qtyUnit||l.uom||"")}</td>
                        <td style={{padding:"2px 0",textAlign:"right",color:B.muted,paddingLeft:5}}>{l.yieldPct}%</td>
                        <td style={{padding:"2px 0",textAlign:"right",color:B.maroon,fontWeight:600,paddingLeft:5}}>{l.lineCost>0?Math.round(l.lineCost).toLocaleString():"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openEdit(r)} style={{flex:1,padding:"5px 10px",background:"transparent",border:`1px solid ${B.gold}`,color:B.maroon,borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Edit</button>
                <button onClick={()=>{
                  const c = allCosted[r.id]||{};
                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${r.name} — Recipe</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#2A1A0E;padding:32px;max-width:700px}
h1{font-size:22px;color:#6B1A1A;margin-bottom:4px}
.sub{font-size:11px;color:#8B6B4A;letter-spacing:1px;text-transform:uppercase;margin-bottom:18px}
.meta{display:flex;gap:24px;margin-bottom:18px;font-size:12px;background:#FBF7F0;padding:12px 16px;border-radius:8px}
.meta div{display:flex;flex-direction:column}.meta span{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#8B6B4A}
.meta strong{font-size:15px;color:#6B1A1A}
.tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;background:#E8F5E9;color:#4A7C59;margin-right:4px;margin-bottom:8px}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}
th{background:#6B1A1A;color:#F5E6C8;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:7px 10px;border-bottom:1px solid #F0E8D8}
tr:nth-child(even) td{background:#FBF7F0}
.ep{color:#4A7C59}.ap{color:#5C3A1E;font-weight:700}.cost{color:#6B1A1A;font-weight:700}
.total-row td{background:#FFF5E6;font-weight:700;color:#6B1A1A}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="sub">Karveli Restaurant Group · Recipe Card</div>
<h1>${r.name}</h1>
<div style="margin-bottom:14px">${(r.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
<div class="meta">
  <div><span>Category</span><strong>${r.category}</strong></div>
  <div><span>Base batch</span><strong>${r.basePax} portions</strong></div>
  ${r.servingG?`<div><span>Serving size</span><strong>${r.servingG}g/person</strong></div>`:""}
  <div><span>Cost/person</span><strong>UGX ${Math.round(c.costPerPax||0).toLocaleString()}</strong></div>
  <div><span>Batch cost</span><strong>UGX ${Math.round(c.batchCost||0).toLocaleString()}</strong></div>
</div>
<table>
<thead><tr><th>Ingredient</th><th>Qty</th><th>Unit</th><th>Mode</th><th>Yield</th><th>EP (usable)</th><th>AP (to pull)</th><th>Line Cost</th></tr></thead>
<tbody>
${(c.lines||[]).map(l=>`<tr>
  <td>${l.item}</td>
  <td>${l.qty}</td><td>${l.qtyUnit||""}</td>
  <td style="font-size:10px;color:#8B6B4A">${l.qtyMode||"AP"}</td>
  <td>${l.yieldPct}%</td>
  <td class="ep">${fmtN(l.epQty,3)} ${l.qtyUnit||""}</td>
  <td class="ap">${fmtN(l.apQty,3)} ${l.qtyUnit||""}</td>
  <td class="cost">${l.lineCost>0?"UGX "+Math.round(l.lineCost).toLocaleString():"—"}</td>
</tr>`).join("")}
<tr class="total-row"><td colspan="7">BATCH TOTAL (${r.basePax} portions)</td><td>UGX ${Math.round(c.batchCost||0).toLocaleString()}</td></tr>
</tbody></table>
<p style="margin-top:20px;font-size:10px;color:#8B6B4A">Printed: ${todayStr()} · Karveli Restaurant Group · Confidential</p>
</body><script>window.onload=()=>setTimeout(()=>window.print(),400)</script></html>`;
                  const w=window.open("","_blank");
                  if(w){w.document.write(html);w.document.close();}
                }} style={{padding:"5px 10px",background:"transparent",border:`1px solid #2C5F8A`,color:"#2C5F8A",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Print</button>
                <button onClick={()=>confirmDelete(r.id)} style={{padding:"5px 10px",background:"transparent",border:"1px solid #C0392B",color:"#C0392B",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── MENU TAB ─────────────────────────────────────────────────────────────────
const MenuTab = memo(function MenuTab({ recipes, allCosted, selIds, toggleSel, uptake, setUptake, pax, setPax, fcPct, setFcPct, vatPct, setVatPct, customPP, setCustomPP, clientName, setClientName, eventDate, setEventDate, branch, setBranch, pricing, selRecipes }) {
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch]       = useState("");

  const filteredRecipes = useMemo(() =>
    recipes.filter(r=>(filterCat==="All"||r.category===filterCat)&&r.name.toLowerCase().includes(search.toLowerCase())),
    [recipes, filterCat, search]
  );

  return (
    <div style={{display:"flex",minHeight:"calc(100vh - 100px)"}}>
      {/* Left */}
      <div style={{flex:"0 0 52%",borderRight:`2px solid ${B.border}`,padding:"15px 13px",overflowY:"auto"}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
          {["All",...DISH_CATS].map(c=>(
            <button key={c} onClick={()=>setFilterCat(c)} style={{padding:"4px 10px",borderRadius:20,border:"1.5px solid",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",
              background:filterCat===c?B.maroon:"transparent",borderColor:filterCat===c?B.maroon:B.gold,color:filterCat===c?B.cream:B.maroon}}>{c}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search dishes..." style={{...IS,marginBottom:9}}/>
        <div style={{fontSize:11,color:B.muted,marginBottom:9}}>{selIds.size} dishes selected</div>
        {DISH_CATS.filter(c=>filterCat==="All"||c===filterCat).map(cat=>{
          const catR = filteredRecipes.filter(r=>r.category===cat);
          if (!catR.length) return null;
          return (
            <div key={cat} style={{marginBottom:13}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:B.muted,textTransform:"uppercase",marginBottom:5,paddingBottom:3,borderBottom:`1px solid ${B.border}`}}>{cat}</div>
              {catR.map(r=>{
                const isSel = selIds.has(r.id);
                const cpp = allCosted[r.id]?.costPerPax || 0;
                return (
                  <div key={r.id} onClick={()=>toggleSel(r.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:7,cursor:"pointer",marginBottom:3,
                    background:isSel?"#FFF5E6":B.white,border:`1.5px solid ${isSel?B.gold:B.border}`,boxShadow:isSel?"0 1px 4px rgba(196,146,42,0.1)":"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:15,height:15,borderRadius:3,border:`2px solid ${isSel?B.gold:"#C8B09A"}`,background:isSel?B.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {isSel&&<span style={{color:"white",fontSize:9}}>✓</span>}
                      </div>
                      <span style={{fontSize:13,fontWeight:isSel?600:400}}>{r.name}</span>
                      {r.tags?.map(t=><span key={t} style={{fontSize:9,padding:"1px 5px",borderRadius:8,background:t==="veg"?"#E8F5E9":"#FFF3E0",color:t==="veg"?"#4A7C59":"#E65100"}}>{t}</span>)}
                      {r.servingG && <span style={{fontSize:9,padding:"1px 5px",borderRadius:8,background:"#F3F0FF",color:"#534AB7"}}>{r.servingG}g/pax</span>}
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:B.mid,whiteSpace:"nowrap"}}>{fmt(cpp)}<span style={{fontWeight:400,fontSize:10,color:B.muted}}>/pax</span></span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {/* Right */}
      <div style={{flex:"0 0 48%",padding:"15px 17px",overflowY:"auto",background:"#FDF9F4"}}>
        <div style={{background:"white",borderRadius:10,border:`1.5px solid ${B.border}`,padding:"13px 15px",marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:B.muted,marginBottom:9,textTransform:"uppercase"}}>Event Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div><label style={LS}>Client / Event</label><input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Acacia Weddings" style={IS}/></div>
            <div><label style={LS}>Event Date</label><input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} style={IS}/></div>
          </div>
          <div><label style={LS}>Branch</label><select value={branch} onChange={e=>setBranch(e.target.value)} style={IS}>{BRANCHES.map(b=><option key={b}>{b}</option>)}</select></div>
        </div>
        <div style={{background:"white",borderRadius:10,border:`1.5px solid ${B.border}`,padding:"13px 15px",marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:B.muted,marginBottom:9,textTransform:"uppercase"}}>Pricing Parameters</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            {[{l:"Guests",v:pax,s:setPax,mn:1,mx:1000,st:5},{l:"Food Cost %",v:fcPct,s:setFcPct,mn:10,mx:80,st:5},{l:"VAT %",v:vatPct,s:setVatPct,mn:0,mx:30,st:1}].map(f=>(
              <div key={f.l}><label style={LS}>{f.l}</label><input type="number" value={f.v} min={f.mn} max={f.mx} step={f.st} onChange={e=>f.s(Number(e.target.value))} style={{...IS,fontSize:15,fontWeight:700,textAlign:"center"}}/></div>
            ))}
          </div>
          <input type="range" min={1} max={500} step={5} value={pax} onChange={e=>setPax(Number(e.target.value))} style={{width:"100%",accentColor:B.maroon,marginBottom:4}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:B.muted}}><span>1</span><span>500 guests</span></div>
        </div>
        {selIds.size>0 ? (
          <>
            <div style={{background:"white",borderRadius:10,border:`1.5px solid ${B.border}`,padding:"13px 15px",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:B.muted,marginBottom:7,textTransform:"uppercase"}}>Menu Selection — Uptake %</div>
              <div style={{fontSize:10,color:B.muted,marginBottom:8,fontStyle:"italic"}}>Slide to set what % of guests will take each dish. Affects issue quantities, not cost/person.</div>
              {selRecipes.map(r=>{
                const u = uptake[r.id] ?? 100;
                return (
                  <div key={r.id} style={{marginBottom:8,borderBottom:`1px dotted ${B.border}`,paddingBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:600}}>{r.name}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:11,color:u<80?"#C0392B":B.green,fontWeight:700}}>{u}%</span>
                        <span style={{fontSize:11,color:B.muted}}>{fmt(allCosted[r.id]?.costPerPax||0)}/pax</span>
                      </div>
                    </div>
                    <input type="range" min={10} max={100} step={5} value={u}
                      onChange={e=>setUptake(prev=>({...prev,[r.id]:Number(e.target.value)}))}
                      style={{width:"100%",accentColor:u<80?"#C0392B":B.maroon}}/>
                  </div>
                );
              })}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:7,marginTop:4}}>
                <span style={{fontWeight:700,color:B.maroon,fontSize:13}}>Raw Food Cost</span>
                <span style={{fontWeight:700,fontSize:14,color:B.maroon}}>{fmt(pricing.rawCPP)}/pax</span>
              </div>
            </div>
            <div style={{background:"linear-gradient(135deg,#FFF5E6,#FDF0D8)",borderRadius:10,border:`2px solid ${B.gold}`,padding:"13px 15px",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:B.muted,marginBottom:7,textTransform:"uppercase"}}>Per Person Costing</div>
              {[{l:"Raw food cost",v:pricing.rawCPP},{l:"+ 10% production",v:pricing.prodCPP},{l:"Total cost / person",v:pricing.totalCPP,bold:true}].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:r.bold?"6px 0":"3px 0",borderTop:r.bold?`1.5px solid #E8C87A`:"none"}}>
                  <span style={{fontSize:12,fontWeight:r.bold?700:400,color:r.bold?B.text:B.mid}}>{r.l}</span>
                  <span style={{fontSize:r.bold?14:12,fontWeight:r.bold?700:400}}>{fmt(r.v)}</span>
                </div>
              ))}
              <div style={{marginTop:10,padding:"10px",background:"rgba(196,146,42,0.1)",borderRadius:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,alignItems:"center"}}>
                  <span style={{fontSize:12,color:B.muted}}>Suggested ({fcPct}% FC)</span>
                  <span style={{fontSize:14,fontWeight:700,color:B.mid}}>{fmt(pricing.suggestedPP)}</span>
                </div>
                <label style={LS}>Your selling price / person (leave blank for suggested)</label>
                <input type="number" value={customPP} onChange={e=>setCustomPP(e.target.value)} placeholder={`${Math.round(pricing.suggestedPP)} (suggested)`}
                  style={{...IS,fontSize:16,fontWeight:700,textAlign:"center",border:`2px solid ${B.maroon}`,background:"white"}}/>
                {customPP && <div style={{marginTop:4,fontSize:11,fontWeight:600,color:pricing.actualFcPct<=35?"#4A7C59":"#C0392B"}}>
                  Food cost at this price: {pricing.actualFcPct.toFixed(1)}% {pricing.actualFcPct<=35?"✓ Healthy":"⚠ Over target"}
                </div>}
              </div>
            </div>
            <div style={{background:`linear-gradient(135deg,${B.dark},${B.maroon})`,borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:B.gold,marginBottom:9,textTransform:"uppercase"}}>Full Group — {pax} Guests</div>
              {[{l:"Total food cost",v:pricing.totalCostAll},{l:"Selling ex-VAT",v:pricing.sellingExVat},{l:`VAT (${vatPct}%)`,v:pricing.vatAmt},{l:"TOTAL SELLING PRICE",v:pricing.sellingIncVat,hero:true},{l:"Gross Margin",v:pricing.margin,grn:true}].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:r.hero?"8px 0 0":"4px 0",borderTop:r.hero?`1px solid ${B.gold}55`:r.grn?`1px dashed ${B.gold}33`:"none",marginTop:r.hero||r.grn?5:0}}>
                  <span style={{fontSize:r.hero?12:11,color:r.hero?B.cream:r.grn?"#A8D5A2":"#D4B080",fontWeight:r.hero?700:400,letterSpacing:r.hero?1:0}}>{r.l}</span>
                  <span style={{fontSize:r.hero?20:14,fontWeight:700,color:r.hero?B.gold:r.grn?"#7BC67E":B.cream}}>{fmt(r.v)}</span>
                </div>
              ))}
              <div style={{marginTop:8,padding:"6px 10px",background:"rgba(196,146,42,0.15)",borderRadius:7,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:"#D4B080"}}>Food cost %</span>
                <span style={{fontSize:14,fontWeight:700,color:pricing.actualFcPct<=35?"#7BC67E":"#FF8A80"}}>{pricing.actualFcPct.toFixed(1)}%</span>
              </div>
            </div>
            <div style={{background:"white",borderRadius:9,border:`1px solid ${B.border}`,padding:"10px 12px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:B.muted,marginBottom:6,textTransform:"uppercase"}}>Scenarios ({pax} pax)</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
                {[25,30,35,40].map(pct=>{
                  const sp=(pricing.totalCPP/(pct/100))*pax;
                  const isA=pct===fcPct&&!customPP;
                  return (
                    <div key={pct} onClick={()=>{setFcPct(pct);setCustomPP("");}} style={{textAlign:"center",padding:"8px 4px",borderRadius:7,cursor:"pointer",background:isA?B.maroon:B.bg,border:`1.5px solid ${isA?B.maroon:B.border}`}}>
                      <div style={{fontSize:12,fontWeight:700,color:isA?B.gold:B.maroon}}>{pct}%</div>
                      <div style={{fontSize:10,color:isA?B.cream:B.muted,marginTop:1}}>{Math.round(sp/1000)}K</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div style={{background:"white",borderRadius:10,border:`2px dashed ${B.border}`,padding:"40px 20px",textAlign:"center"}}>
            <div style={{fontSize:26,marginBottom:7}}>🍽️</div>
            <div style={{fontSize:14,fontWeight:600,color:B.mid,marginBottom:5}}>Select dishes to build your menu</div>
            <div style={{fontSize:12,color:B.muted}}>Costs calculate live from your item prices with yield adjustments applied.</div>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── PACKAGES TAB ─────────────────────────────────────────────────────────────
const PKG_TYPES = ["Breakfast","Lunch Buffet","Dinner Buffet","Cocktail","Conference","Custom"];

const PackagesTab = memo(function PackagesTab({ packages, recipes, allCosted, onSave, onDelete, onLoad, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); // package being edited
  const [form, setForm] = useState({ name:"", description:"", type:"Lunch Buffet", recipeIds:[], targetPP:"" });
  const [search, setSearch] = useState("");

  const recipeMap = useMemo(() => {
    const m = {}; recipes.forEach(r => { m[r.id] = r; }); return m;
  }, [recipes]);

  const toggleRecipe = (id) => setForm(f => ({
    ...f,
    recipeIds: f.recipeIds.includes(id) ? f.recipeIds.filter(x=>x!==id) : [...f.recipeIds, id]
  }));

  const openNew = () => {
    setEditing(null);
    setForm({ name:"", description:"", type:"Lunch Buffet", recipeIds:[], targetPP:"" });
    setShowForm(true);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description||"",
      type: pkg.type||"Custom",
      recipeIds: pkg.recipe_ids||[],
      targetPP: pkg.target_pp ? String(pkg.target_pp) : "",
    });
    setShowForm(true);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.recipeIds.length) return;
    const payload = { name:form.name, description:form.description, type:form.type,
      recipeIds:form.recipeIds, targetPP:form.targetPP?parseFloat(form.targetPP):null };
    if (editing) {
      onUpdate(editing.id, payload);
    } else {
      onSave(payload);
    }
    setForm({ name:"", description:"", type:"Lunch Buffet", recipeIds:[], targetPP:"" });
    setEditing(null);
    setShowForm(false);
  };

  const pkgCost = (recipeIds) => {
    const ids = recipeIds || [];
    return ids.reduce((s, id) => s + (allCosted[id]?.costPerPax||0), 0);
  };

  const filtered = useMemo(() => recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  ), [recipes, search]);

  return (
    <div style={{padding:"20px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:"#3D1A00"}}>Menu Packages</div>
          <div style={{fontSize:12,color:B.muted,marginTop:2}}>Pre-built menus for different occasions — load any package straight into the Menu Builder</div>
        </div>
        <BtnPrimary onClick={openNew}>+ New Package</BtnPrimary>
      </div>

      {showForm && (
        <div style={{background:"white",borderRadius:12,border:`2px solid ${B.gold}`,padding:"18px 20px",marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:B.maroon,marginBottom:12}}>{editing ? "Edit Package" : "Build a Package"}</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={LS}>Package Name *</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Executive Lunch Buffet" style={IS}/></div>
            <div><label style={LS}>Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={IS}>
                {PKG_TYPES.map(t=><option key={t}>{t}</option>)}
              </select></div>
            <div><label style={LS}>Target Price/pax (UGX)</label>
              <input type="number" value={form.targetPP} onChange={e=>setForm(f=>({...f,targetPP:e.target.value}))} placeholder="e.g. 35000" style={IS}/></div>
          </div>
          <div style={{marginBottom:10}}>
            <label style={LS}>Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              placeholder="e.g. Our most popular corporate lunch package — 3 proteins, 2 starches, 2 salads and a sauce"
              style={{...IS,height:56,resize:"vertical"}}/>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:B.maroon,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>
            Select Dishes ({form.recipeIds.length} selected)
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search dishes..." style={{...IS,marginBottom:8}}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:6,maxHeight:260,overflowY:"auto",marginBottom:12}}>
            {filtered.map(r => {
              const sel = form.recipeIds.includes(r.id);
              const cpp = allCosted[r.id]?.costPerPax||0;
              return (
                <div key={r.id} onClick={()=>toggleRecipe(r.id)}
                  style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",borderRadius:7,cursor:"pointer",
                    background:sel?"#FFF5E6":B.white,border:`1.5px solid ${sel?B.gold:B.border}`}}>
                  <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${sel?B.gold:"#C8B09A"}`,
                    background:sel?B.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {sel&&<span style={{color:"white",fontSize:9}}>✓</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:sel?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                    <div style={{fontSize:10,color:B.muted}}>{r.category} · {fmt(cpp)}/pax</div>
                  </div>
                </div>
              );
            })}
          </div>
          {form.recipeIds.length > 0 && (
            <div style={{background:"#FFF5E6",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:B.mid}}>
              Raw food cost: <strong>{fmt(pkgCost(form.recipeIds))}/pax</strong>
              {form.targetPP && <span style={{marginLeft:12}}>
                Target margin: <strong style={{color:pkgCost(form.recipeIds)<parseFloat(form.targetPP)?B.green:"#C0392B"}}>
                  {fmt(parseFloat(form.targetPP) - pkgCost(form.recipeIds))}/pax
                </strong>
              </span>}
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{padding:"7px 16px",background:"transparent",border:`1.5px solid #C8B09A`,color:B.mid,borderRadius:7,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <BtnPrimary onClick={handleSave} style={{padding:"7px 20px"}}>{editing?"Save Changes":"Save Package"}</BtnPrimary>
          </div>
        </div>
      )}

      {packages.length===0 ? (
        <div style={{background:"white",borderRadius:10,border:`2px dashed ${B.border}`,padding:"50px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>📋</div>
          <div style={{fontSize:14,fontWeight:600,color:B.mid}}>No packages yet</div>
          <div style={{fontSize:12,color:B.muted,marginTop:4}}>Create your first package — a Breakfast, Lunch Buffet, or Cocktail menu — and load it instantly when quoting clients.</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
          {packages.map(pkg => {
            const ids = pkg.recipe_ids||[];
            const cost = pkgCost(ids);
            const margin = pkg.target_pp ? pkg.target_pp - cost : null;
            return (
              <div key={pkg.id} style={{background:"white",borderRadius:12,border:`1.5px solid ${B.border}`,overflow:"hidden"}}>
                <div style={{background:`linear-gradient(135deg,${B.maroon},#8B2222)`,padding:"12px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:B.cream}}>{pkg.name}</div>
                      <div style={{fontSize:10,color:B.gold,marginTop:2,letterSpacing:1}}>{pkg.type}</div>
                    </div>
                    <button onClick={()=>onDelete(pkg.id)} style={{background:"none",border:"none",color:"rgba(245,230,200,0.5)",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
                  </div>
                </div>
                <div style={{padding:"12px 16px"}}>
                  {pkg.description && <div style={{fontSize:12,color:B.mid,marginBottom:10,fontStyle:"italic",lineHeight:1.5}}>{pkg.description}</div>}
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                    {ids.slice(0,6).map(id => (
                      <span key={id} style={{fontSize:10,padding:"2px 7px",background:"#FFF5E6",color:B.maroon,borderRadius:10,border:`1px solid ${B.gold}33`}}>
                        {recipeMap[id]?.name||"?"}
                      </span>
                    ))}
                    {ids.length>6 && <span style={{fontSize:10,color:B.muted}}>+{ids.length-6} more</span>}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${B.border}`}}>
                    <div>
                      <div style={{fontSize:10,color:B.muted}}>Food cost/pax (inc. 10% production)</div>
                      <div style={{fontSize:15,fontWeight:700,color:B.maroon}}>{fmt(cost * 1.1)}</div>
                      {margin !== null && <div style={{fontSize:11,color:(pkg.target_pp - cost*1.1)>=0?B.green:"#C0392B",fontWeight:600}}>
                        {(pkg.target_pp-cost*1.1)>=0?"↑":"↓"} {fmt(Math.abs(pkg.target_pp - cost*1.1))} margin @ {fmt(pkg.target_pp)} target
                      </div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                      <button onClick={()=>openEdit(pkg)} style={{padding:"5px 12px",background:"transparent",border:`1px solid ${B.gold}`,color:B.maroon,borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Edit</button>
                      <BtnPrimary onClick={()=>onLoad(pkg)} style={{padding:"6px 12px",fontSize:11}}>Load →</BtnPrimary>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// ─── SAVED TAB ────────────────────────────────────────────────────────────────
const SavedTab = memo(function SavedTab({ savedMenus, onLoad, onDelete }) {
  return (
    <div style={{padding:"20px 24px"}}>
      <div style={{fontSize:17,fontWeight:700,color:"#3D1A00",marginBottom:3}}>Saved Menus</div>
      <div style={{fontSize:12,color:B.muted,marginBottom:16}}>{savedMenus.length} saved</div>
      {savedMenus.length===0 ? (
        <div style={{background:"white",borderRadius:10,border:`2px dashed ${B.border}`,padding:"50px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:7}}>💾</div>
          <div style={{fontSize:14,fontWeight:600,color:B.mid}}>No saved menus</div>
          <div style={{fontSize:12,color:B.muted,marginTop:3}}>Build a menu and click Save to store it here.</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:13}}>
          {savedMenus.map(m=>(
            <div key={m.id} style={{background:"white",borderRadius:12,border:`1.5px solid ${B.border}`,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{fontSize:15,fontWeight:700,color:"#3D1A00"}}>{m.name}</div>
                <button onClick={()=>onDelete(m.id)} style={{background:"none",border:"none",color:"#C0392B",cursor:"pointer",fontSize:16,padding:0}}>✕</button>
              </div>
              {m.clientName&&<div style={{fontSize:12,color:B.muted,marginBottom:2}}>👥 {m.clientName}</div>}
              {m.eventDate&&<div style={{fontSize:12,color:B.muted,marginBottom:2}}>📅 {m.eventDate}</div>}
              <div style={{fontSize:11,color:B.muted,marginBottom:2}}>🏢 {m.branch||"—"}</div>
              <div style={{fontSize:11,color:B.muted,marginBottom:7}}>👤 {m.pax} guests · Saved {new Date(m.createdAt||m.savedAt).toLocaleDateString()}</div>
              <div style={{fontSize:11,color:B.muted,marginBottom:7}}>{(m.recipeIds||m.selectedIds||[]).length} dishes selected</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:7,borderTop:`1px solid ${B.border}`}}>
                <div>
                  <div style={{fontSize:10,color:B.muted}}>Guests</div>
                  <div style={{fontSize:16,fontWeight:700,color:B.maroon}}>{m.pax}<span style={{fontSize:10,fontWeight:400}}> people</span></div>
                </div>
                <BtnPrimary onClick={()=>onLoad(m)} style={{padding:"7px 14px",fontSize:12}}>Load →</BtnPrimary>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── ISSUE TAB ────────────────────────────────────────────────────────────────
const IssueTab = memo(function IssueTab({ selIds, selRecipes, allCosted, pax, issueList, pricing, clientName, eventDate, issueNote, setIssueNote, onLog, onPrint }) {
  return (
    <div style={{padding:"19px 23px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:"#3D1A00"}}>Chef Ingredient Issue Sheet</div>
          <div style={{fontSize:12,color:B.muted,marginTop:2}}>{selIds.size} dishes · {pax} guests</div>
        </div>
        {selIds.size>0 && (
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            <input value={issueNote} onChange={e=>setIssueNote(e.target.value)} placeholder="Issue note (optional)..." style={{...IS,width:200,fontSize:12}}/>
            <button onClick={onLog} style={{padding:"7px 13px",background:B.green,color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"}}>Log Issue →</button>
            <button onClick={onPrint} style={{padding:"7px 13px",background:B.maroon,color:B.cream,border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"}}>🖨 Print Sheet</button>
          </div>
        )}
      </div>
      {selIds.size>0 && issueList.length>0 ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:14}}>
            {[{l:"Dishes",v:selIds.size},{l:"Guests",v:pax},{l:"Ingredient Lines",v:issueList.length},{l:"Total Expenditure",v:fmt(pricing.totalCostAll)}].map(s=>(
              <div key={s.l} style={{background:"white",borderRadius:9,border:`1.5px solid ${B.border}`,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:17,fontWeight:700,color:B.maroon}}>{s.v}</div>
                <div style={{fontSize:10,color:B.muted,marginTop:2,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{background:"white",borderRadius:9,border:`1.5px solid ${B.border}`,padding:"10px 14px",marginBottom:13}}>
            <div style={{fontSize:10,fontWeight:700,color:B.muted,marginBottom:6,letterSpacing:2,textTransform:"uppercase"}}>Menu · {clientName||"Event"} · {eventDate||todayStr()}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {selRecipes.map(r=><span key={r.id} style={{fontSize:11,padding:"3px 9px",background:"#FFF5E6",color:B.maroon,borderRadius:12,border:`1px solid ${B.gold}44`,fontWeight:600}}>{r.name}</span>)}
            </div>
          </div>
          <div style={{background:"white",borderRadius:10,border:`1.5px solid ${B.border}`,overflow:"hidden",marginBottom:16}}>
            {/* Legend */}
            <div style={{padding:"8px 14px",background:"#FFF5E6",display:"flex",gap:20,fontSize:11,color:B.mid,borderBottom:`1px solid ${B.border}`}}>
              <span><strong style={{color:B.green}}>EP</strong> = Edible Portion — what the recipe uses after prep</span>
              <span><strong style={{color:"#8B5E3C"}}>AP</strong> = As Purchased — what to weigh out from stores</span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:B.maroon}}>
                {["#","Ingredient","Unit","EP (usable)","AP — pull from stores","Est. Cost","Used in","✓"].map((h,i)=>(
                  <th key={h} style={{padding:"9px 10px",textAlign:i>1?"center":"left",fontSize:10,color:B.cream,fontWeight:700}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {issueList.map((ing,idx)=>(
                  <tr key={idx} style={{background:idx%2===0?"white":B.white,borderBottom:`1px solid ${B.border}22`}}>
                    <td style={{padding:"8px 10px",color:B.muted,fontWeight:600,fontSize:11}}>{idx+1}</td>
                    <td style={{padding:"8px 10px",fontWeight:600,color:"#3D1A00"}}>{ing.name}</td>
                    <td style={{padding:"8px 10px",color:B.mid,textAlign:"center",fontSize:11}}>{ing.qtyUnit}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,color:B.green,fontWeight:600}}>
                      {fmtQty(ing.epQty, ing.qtyUnit)}
                    </td>
                    <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700,fontSize:15,color:"#8B5E3C"}}>
                      {fmtQty(ing.apQty, ing.qtyUnit)}
                    </td>
                    <td style={{padding:"8px 10px",textAlign:"center",fontSize:12,color:B.maroon,fontWeight:600}}>{fmt(ing.lineCost)}</td>
                    <td style={{padding:"8px 10px",fontSize:10,color:B.muted,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {ing.dishes.map(d=>`${d.name} (${fmtQty(d.apQty, ing.qtyUnit)})`).join(", ")}
                    </td>
                    <td style={{padding:"8px 10px",textAlign:"center"}}><div style={{width:17,height:17,border:`2px solid ${B.gold}`,borderRadius:4,margin:"0 auto"}}/></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{background:"#FFF5E6"}}>
                <td colSpan={5} style={{padding:"9px 10px",fontWeight:700,color:B.maroon,fontSize:13}}>TOTAL ESTIMATED EXPENDITURE</td>
                <td style={{padding:"9px 10px",textAlign:"center",fontWeight:700,fontSize:14,color:B.maroon}}>{fmt(pricing.totalCostAll)}</td>
                <td colSpan={2}/>
              </tr></tfoot>
            </table>
          </div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:B.muted,textTransform:"uppercase",marginBottom:9}}>Breakdown by Dish</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
            {selRecipes.filter(r=>r.lines?.length).map(r=>{
              const c = allCosted[r.id];
              const scale = pax / r.basePax;
              return (
                <div key={r.id} style={{background:"white",borderRadius:9,border:`1.5px solid ${B.border}`,padding:"11px 13px"}}>
                  <div style={{fontWeight:700,color:B.maroon,marginBottom:5,fontSize:13,display:"flex",justifyContent:"space-between"}}>
                    <span>{r.name}</span>
                    <span style={{fontSize:10,color:B.muted,fontWeight:400}}>×{fmtN(scale,2)} batch · {pax} pax</span>
                  </div>
                  <table style={{width:"100%",fontSize:11}}>
                    <thead><tr>
                      <th style={{textAlign:"left",color:B.muted,fontSize:9,fontWeight:600,paddingBottom:3}}>Ingredient</th>
                      <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:600}}>EP (usable)</th>
                      <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:600,paddingLeft:5}}>AP (pull)</th>
                      <th style={{textAlign:"right",color:B.muted,fontSize:9,fontWeight:600,paddingLeft:5}}>Cost</th>
                    </tr></thead>
                    <tbody>
                      {(c?.lines||[]).map((l,i)=>{
                        const unit = l.qtyUnit || l.uom || "";
                        return (
                          <tr key={i} style={{borderTop:`1px dotted ${B.border}`}}>
                            <td style={{padding:"3px 0",color:"#3D1A00"}}>{l.item}</td>
                            <td style={{padding:"3px 0",textAlign:"right",color:B.green}}>{fmtQty((l.epQty||0)*scale, unit)}</td>
                            <td style={{padding:"3px 0",textAlign:"right",fontWeight:700,color:"#8B5E3C",paddingLeft:5}}>{fmtQty((l.apQty||0)*scale, unit)}</td>
                            <td style={{padding:"3px 0",textAlign:"right",color:B.maroon,paddingLeft:5}}>{fmt(l.lineCost*scale)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot><tr style={{borderTop:`1.5px solid ${B.border}`}}>
                      <td colSpan={3} style={{padding:"3px 0",fontWeight:700,color:B.maroon,fontSize:12}}>Dish Total</td>
                      <td style={{padding:"3px 0",textAlign:"right",fontWeight:700,color:B.maroon}}>{fmt((c?.batchCost||0)*scale)}</td>
                    </tr></tfoot>
                  </table>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{background:"white",borderRadius:10,border:`2px dashed ${B.border}`,padding:"50px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:7}}>📋</div>
          <div style={{fontSize:14,fontWeight:600,color:B.mid}}>No menu selected</div>
          <div style={{fontSize:12,color:B.muted,marginTop:3}}>Select dishes in Menu Builder, then come here to generate the issue sheet.</div>
        </div>
      )}
    </div>
  );
});

// ─── RECORDS TAB ─────────────────────────────────────────────────────────────
const RecordsTab = memo(function RecordsTab({ issueRecs, auditLog }) {
  const [activeSection, setActiveSection] = useState("issues");
  return (
    <div style={{padding:"20px 24px"}}>
      <div style={{fontSize:17,fontWeight:700,color:"#3D1A00",marginBottom:12}}>Records & Audit Trail</div>
      <div style={{display:"flex",gap:6,marginBottom:18}}>
        {[{id:"issues",label:`📋 Issue Records (${issueRecs.length})`},{id:"audit",label:`🔍 Audit Trail (${auditLog.length})`}].map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)}
            style={{padding:"7px 16px",borderRadius:20,border:"1.5px solid",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",
              background:activeSection===s.id?B.maroon:"transparent",borderColor:activeSection===s.id?B.maroon:B.gold,
              color:activeSection===s.id?B.cream:B.maroon}}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection==="issues" && (
        issueRecs.length===0 ? (
          <div style={{background:"white",borderRadius:10,border:`2px dashed ${B.border}`,padding:"50px",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:7}}>📜</div>
            <div style={{fontSize:14,fontWeight:600,color:B.mid}}>No records yet</div>
            <div style={{fontSize:12,color:B.muted,marginTop:3}}>Log an issue from the Issue Sheet to start your records.</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {issueRecs.map(r=>(
              <div key={r.id} style={{background:"white",borderRadius:12,border:`1.5px solid ${B.border}`,overflow:"hidden"}}>
                <div style={{background:`linear-gradient(90deg,${B.maroon},#8B2222)`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,color:B.cream,fontSize:14}}>{r.menuName}</div>
                    <div style={{fontSize:11,color:"rgba(245,230,200,0.7)",marginTop:1}}>
                      {r.clientName&&`${r.clientName} · `}{r.branch&&`${r.branch} · `}
                      {new Date(r.issuedAt).toLocaleString()} · {r.pax} guests
                      {r.issuedBy&&<span style={{color:B.gold}}> · {r.issuedBy}</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:B.gold}}>Expenditure</div>
                    <div style={{fontSize:17,fontWeight:700,color:B.gold}}>{fmt(r.totalExpenditure)}</div>
                  </div>
                </div>
                <div style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:7}}>
                    {r.dishes.map(n=><span key={n} style={{fontSize:10,padding:"2px 7px",background:"#FFF5E6",color:B.maroon,borderRadius:10,border:`1px solid ${B.gold}33`}}>{n}</span>)}
                  </div>
                  {r.note&&<div style={{fontSize:12,color:B.mid,marginBottom:6,fontStyle:"italic"}}>📝 {r.note}</div>}
                  <details style={{fontSize:12}}>
                    <summary style={{cursor:"pointer",color:B.muted,fontWeight:600,marginBottom:4}}>View {r.issueList.length} ingredients issued</summary>
                    <table style={{width:"100%",borderCollapse:"collapse",marginTop:6}}>
                      <thead><tr style={{background:B.bg}}>
                        {["Ingredient","Unit","EP (usable)","AP (issued)","Est. Cost"].map(h=>(
                          <th key={h} style={{padding:"5px 7px",textAlign:"left",fontSize:9,color:B.muted,fontWeight:700}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {r.issueList.map((ing,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${B.border}33`}}>
                            <td style={{padding:"4px 7px",color:"#3D1A00"}}>{ing.name}</td>
                            <td style={{padding:"4px 7px",color:B.muted}}>{ing.qtyUnit||ing.uom}</td>
                            <td style={{padding:"4px 7px",color:B.green,fontWeight:600}}>{fmtQty(ing.epQty||ing.qty, ing.qtyUnit||ing.uom||"")}</td>
                            <td style={{padding:"4px 7px",fontWeight:700,color:"#8B5E3C"}}>{fmtQty(ing.apQty||ing.effQty, ing.qtyUnit||ing.uom||"")}</td>
                            <td style={{padding:"4px 7px",color:B.maroon,fontWeight:600}}>{fmt(ing.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:6,borderTop:`1px solid ${B.border}`}}>
                    <span style={{fontSize:12,color:B.muted}}>Selling price: <strong>{fmt(r.sellingPrice)}</strong></span>
                    <span style={{fontSize:12,color:B.green,fontWeight:600}}>Margin: {fmt(r.sellingPrice-r.totalExpenditure)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeSection==="audit" && (
        auditLog.length===0 ? (
          <div style={{background:"white",borderRadius:10,border:`2px dashed ${B.border}`,padding:"50px",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:7}}>🔍</div>
            <div style={{fontSize:14,fontWeight:600,color:B.mid}}>No activity yet</div>
            <div style={{fontSize:12,color:B.muted,marginTop:3}}>Changes made by your team will appear here.</div>
          </div>
        ) : (
          <div style={{background:"white",borderRadius:12,border:`1.5px solid ${B.border}`,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:B.maroon}}>
                  {["When","Who","Action","Details"].map(h=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:"left",color:B.cream,fontSize:10,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry,i)=>(
                  <tr key={entry.id||i} style={{borderBottom:`1px solid ${B.border}`,background:i%2===0?"white":"#FBF7F0"}}>
                    <td style={{padding:"8px 12px",color:B.muted,whiteSpace:"nowrap"}}>
                      {new Date(entry.created_at).toLocaleString("en-UG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                    </td>
                    <td style={{padding:"8px 12px",fontWeight:600,color:B.maroon}}>{entry.user_name||entry.user_email}</td>
                    <td style={{padding:"8px 12px",color:B.text}}>{entry.action}</td>
                    <td style={{padding:"8px 12px",color:B.muted,fontSize:11}}>
                      {entry.table_name && <span style={{background:"#FFF5E6",padding:"1px 6px",borderRadius:8,marginRight:6,color:B.mid}}>{entry.table_name}</span>}
                      {entry.record_id && <span>{entry.record_id}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
});

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"white",borderRadius:13,padding:"19px 21px",width:"100%",maxWidth:500,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15}}>
          <div style={{fontSize:15,fontWeight:700,color:"#3D1A00"}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:B.muted,padding:0}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

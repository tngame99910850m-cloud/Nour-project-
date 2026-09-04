import { PrismaClient, Role, CategoryGroup, OrderStatus, MovementType, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

async function main() {
  console.log("🌱 Seeding database...");

  // ---- Users -------------------------------------------------------------
  const ownerEmail = (process.env.SEED_OWNER_EMAIL || "owner@nourboutique.com").toLowerCase();
  const ownerPass = process.env.SEED_OWNER_PASSWORD || "ChangeMe123!";
  const devEmail = (process.env.SEED_DEVELOPER_EMAIL || "developer@nourboutique.com").toLowerCase();
  const devPass = process.env.SEED_DEVELOPER_PASSWORD || "ChangeMe123!";

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: "Business Owner",
      passwordHash: await bcrypt.hash(ownerPass, 12),
      role: Role.OWNER,
    },
  });

  await prisma.user.upsert({
    where: { email: devEmail },
    update: {},
    create: {
      email: devEmail,
      name: "Lead Developer",
      passwordHash: await bcrypt.hash(devPass, 12),
      role: Role.DEVELOPER,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@nourboutique.com" },
    update: {},
    create: {
      email: "admin@nourboutique.com",
      name: "Store Manager",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@nourboutique.com" },
    update: {},
    create: {
      email: "staff@nourboutique.com",
      name: "Shop Staff",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: Role.STAFF,
    },
  });

  console.log("✓ Users created");

  // ---- Categories --------------------------------------------------------
  const categoryDefs: {
    name: string;
    group: CategoryGroup;
    image: string;
    children: string[];
  }[] = [
    {
      name: "Wedding",
      group: CategoryGroup.WEDDING,
      image: img("1519225421980-715cb0215aed"),
      children: [
        "Wedding Decorations",
        "Wedding Accessories",
        "Gifts",
        "Table Accessories",
        "Event Accessories",
        "Personalized Products",
      ],
    },
    {
      name: "Home",
      group: CategoryGroup.HOME,
      image: img("1586023492125-27b2c045efd7"),
      children: [
        "Home Accessories",
        "Decoration",
        "Kitchen",
        "Living Room",
        "Bedroom",
        "Home Gifts",
      ],
    },
  ];

  const categoryMap: Record<string, string> = {};
  let catOrder = 0;
  for (const def of categoryDefs) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(def.name) },
      update: {},
      create: {
        name: def.name,
        slug: slugify(def.name),
        group: def.group,
        image: def.image,
        sortOrder: catOrder++,
        description: `Explore our ${def.name.toLowerCase()} collection.`,
      },
    });
    categoryMap[def.name] = parent.id;
    let subOrder = 0;
    for (const child of def.children) {
      const sub = await prisma.category.upsert({
        where: { slug: slugify(child) },
        update: {},
        create: {
          name: child,
          slug: slugify(child),
          group: def.group,
          parentId: parent.id,
          sortOrder: subOrder++,
        },
      });
      categoryMap[child] = sub.id;
    }
  }
  console.log("✓ Categories created");

  // ---- Products ----------------------------------------------------------
  const productDefs = [
    {
      name: "Ivory Rose Centerpiece",
      category: "Wedding Decorations",
      price: 249, salePrice: 199, stock: 24,
      images: [img("1519225421980-715cb0215aed"), img("1522673607200-164d1b6ce486")],
      desc: "A luxurious ivory rose centerpiece that brings timeless romance to any wedding table. Handcrafted with premium silk florals.",
      featured: true, bestSeller: true, isNew: false,
      tags: ["roses", "centerpiece", "ivory"],
    },
    {
      name: "Crystal Candle Holders (Set of 3)",
      category: "Table Accessories",
      price: 179, salePrice: null, stock: 40,
      images: [img("1602874801007-bd458bb1b8b6"), img("1513694203232-719a280e022f")],
      desc: "Elegant crystal candle holders that catch the light beautifully. Perfect for creating an intimate ambiance.",
      featured: true, bestSeller: false, isNew: true,
      tags: ["crystal", "candles", "set"],
    },
    {
      name: "Personalized Wedding Guest Book",
      category: "Personalized Products",
      price: 129, salePrice: 99, stock: 15,
      images: [img("1544716278-ca5e3f4abd8c")],
      desc: "A beautifully bound guest book, personalized with the couple's names and wedding date. A keepsake to treasure forever.",
      featured: false, bestSeller: true, isNew: false,
      tags: ["personalized", "keepsake"],
    },
    {
      name: "Gold Charger Plates (Set of 6)",
      category: "Table Accessories",
      price: 299, salePrice: 259, stock: 30,
      images: [img("1600891964092-4316c288032e")],
      desc: "Add opulence to your reception with these gleaming gold charger plates. Sold as a set of six.",
      featured: true, bestSeller: true, isNew: false,
      tags: ["gold", "plates", "reception"],
    },
    {
      name: "Silk Table Runner — Blush",
      category: "Wedding Decorations",
      price: 89, salePrice: null, stock: 50,
      images: [img("1478146896981-b80fe463b330")],
      desc: "Flowing blush silk table runner that drapes elegantly across banquet tables.",
      featured: false, bestSeller: false, isNew: true,
      tags: ["silk", "blush", "runner"],
    },
    {
      name: "Bridal Party Gift Boxes",
      category: "Gifts",
      price: 149, salePrice: 119, stock: 20,
      images: [img("1549465220-1a8b9238cd48")],
      desc: "Curated gift boxes for your bridesmaids, filled with elegant keepsakes and treats.",
      featured: true, bestSeller: false, isNew: true,
      tags: ["gift", "bridal"],
    },
    {
      name: "Scented Soy Candle — Oud & Amber",
      category: "Home Accessories",
      price: 79, salePrice: null, stock: 60,
      images: [img("1602874801007-bd458bb1b8b6")],
      desc: "A warm, sophisticated soy candle blending oud and amber. Burns clean for up to 45 hours.",
      featured: true, bestSeller: true, isNew: false,
      tags: ["candle", "oud", "home"],
    },
    {
      name: "Marble & Gold Serving Tray",
      category: "Kitchen",
      price: 199, salePrice: 169, stock: 25,
      images: [img("1578662996442-48f60103fc96")],
      desc: "A genuine marble serving tray with gold-finished handles. Functional elegance for your home.",
      featured: true, bestSeller: false, isNew: true,
      tags: ["marble", "gold", "tray"],
    },
    {
      name: "Velvet Cushion Cover — Emerald",
      category: "Living Room",
      price: 69, salePrice: 55, stock: 45,
      images: [img("1586023492125-27b2c045efd7")],
      desc: "Sumptuous emerald velvet cushion cover that adds a jewel-toned accent to any sofa.",
      featured: false, bestSeller: true, isNew: false,
      tags: ["velvet", "cushion"],
    },
    {
      name: "Ceramic Vase Trio",
      category: "Decoration",
      price: 139, salePrice: null, stock: 35,
      images: [img("1485955900006-10f4d324d411")],
      desc: "A trio of handmade ceramic vases in complementary neutral tones.",
      featured: true, bestSeller: false, isNew: true,
      tags: ["ceramic", "vase"],
    },
    {
      name: "Linen Bedding Set — Sand",
      category: "Bedroom",
      price: 349, salePrice: 299, stock: 18,
      images: [img("1522771739844-6a9f6d5f14af")],
      desc: "Premium stonewashed linen bedding set in a warm sand tone. Breathable and beautifully soft.",
      featured: true, bestSeller: true, isNew: false,
      tags: ["linen", "bedding"],
    },
    {
      name: "Home Fragrance Gift Set",
      category: "Home Gifts",
      price: 189, salePrice: 159, stock: 22,
      images: [img("1549465220-1a8b9238cd48")],
      desc: "A luxurious home fragrance gift set with a reed diffuser, candle, and room mist.",
      featured: false, bestSeller: false, isNew: true,
      tags: ["fragrance", "gift"],
    },
  ];

  const createdProducts: { id: string; price: number; name: string }[] = [];
  let skuCounter = 1000;
  for (const p of productDefs) {
    const product = await prisma.product.upsert({
      where: { slug: slugify(p.name) },
      update: {},
      create: {
        name: p.name,
        slug: slugify(p.name),
        sku: `NB-${skuCounter++}`,
        description: p.desc,
        shortDesc: p.desc.slice(0, 90),
        price: p.price,
        salePrice: p.salePrice ?? null,
        images: p.images,
        stock: p.stock,
        categoryId: categoryMap[p.category],
        isFeatured: p.featured,
        isBestSeller: p.bestSeller,
        isNew: p.isNew,
        tags: p.tags,
        views: Math.floor(Math.random() * 400),
      },
    });
    createdProducts.push({ id: product.id, price: p.price, name: p.name });

    // Add a couple of variants to the first two products
    if (["Ivory Rose Centerpiece", "Silk Table Runner — Blush"].includes(p.name)) {
      for (const [name, value] of [["Color", "Ivory"], ["Color", "Blush"], ["Size", "Large"]]) {
        await prisma.productVariant.create({
          data: { productId: product.id, name, value, stock: 10 },
        });
      }
    }

    // Initial stock movement
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        quantity: p.stock,
        type: MovementType.RECEIVED,
        reason: "Initial stock",
        userId: owner.id,
      },
    });
  }
  console.log("✓ Products created");

  // ---- Delivery zones & partners ----------------------------------------
  const zones = [
    { name: "Dubai — City", fee: 20, freeThreshold: 300, estimatedTime: "Same day" },
    { name: "Dubai — Outer", fee: 35, freeThreshold: 400, estimatedTime: "1-2 days" },
    { name: "Sharjah", fee: 40, freeThreshold: 500, estimatedTime: "1-2 days" },
    { name: "Abu Dhabi", fee: 60, freeThreshold: 600, estimatedTime: "2-3 days" },
  ];
  const createdZones: string[] = [];
  let zOrder = 0;
  for (const z of zones) {
    const zone = await prisma.deliveryZone.create({
      data: { ...z, sortOrder: zOrder++ },
    });
    createdZones.push(zone.id);
  }

  const partner = await prisma.deliveryPartner.create({
    data: {
      companyName: "Swift Local Couriers",
      contactPerson: "Ahmed K.",
      phone: "+971 55 111 2222",
      whatsapp: "971551112222",
      email: "dispatch@swiftlocal.example",
      pricing: "AED 20-60 per delivery based on zone",
      serviceAreas: "Dubai, Sharjah, Abu Dhabi",
      notes: "Reliable same-day within Dubai city.",
    },
  });
  console.log("✓ Delivery zones & partners created");

  // ---- Customers & Orders ------------------------------------------------
  const customerDefs = [
    { name: "Layla Hassan", phone: "+971501234567", email: "layla@example.com", city: "Dubai" },
    { name: "Omar Saeed", phone: "+971509876543", email: "omar@example.com", city: "Sharjah" },
    { name: "Fatima Ali", phone: "+971502223333", email: "fatima@example.com", city: "Dubai" },
  ];
  const customers = [];
  for (const c of customerDefs) {
    const cust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c,
    });
    customers.push(cust);
  }

  const statuses: OrderStatus[] = [
    OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.CONFIRMED, OrderStatus.PENDING, OrderStatus.PREPARING,
    OrderStatus.DELIVERED, OrderStatus.CANCELLED,
  ];

  let orderSeq = 1;
  const year = new Date().getFullYear();
  for (let i = 0; i < statuses.length; i++) {
    const cust = customers[i % customers.length];
    const itemCount = 1 + (i % 3);
    const chosen = createdProducts.slice(i % 6, (i % 6) + itemCount);
    if (chosen.length === 0) chosen.push(createdProducts[0]);

    let subtotal = 0;
    const items = chosen.map((p) => {
      const qty = 1 + (i % 2);
      const line = p.price * qty;
      subtotal += line;
      return { productId: p.id, productName: p.name, price: p.price, quantity: qty, lineTotal: line };
    });
    const zoneIdx = i % createdZones.length;
    const deliveryFee = subtotal >= zones[zoneIdx].freeThreshold! ? 0 : zones[zoneIdx].fee;
    const total = subtotal + deliveryFee;

    const daysAgo = statuses.length - i;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo * 3);

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${year}-${String(orderSeq++).padStart(5, "0")}`,
        status: statuses[i],
        paymentStatus: statuses[i] === OrderStatus.DELIVERED ? "PAID" : "UNPAID",
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerEmail: cust.email,
        addressCity: cust.city,
        addressArea: "Jumeirah",
        addressStreet: "Al Wasl Road",
        addressBuilding: `Villa ${10 + i}`,
        deliveryZoneId: createdZones[zoneIdx],
        deliveryPartnerId: statuses[i] === OrderStatus.OUT_FOR_DELIVERY ? partner.id : null,
        subtotal, deliveryFee, discount: 0, total,
        createdAt,
        items: { create: items },
      },
    });
  }
  console.log("✓ Orders created");

  // ---- Discounts ---------------------------------------------------------
  await prisma.discount.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: DiscountType.PERCENTAGE, value: 10, minOrder: 100, isActive: true },
  });
  await prisma.discount.upsert({
    where: { code: "WEDDING50" },
    update: {},
    create: { code: "WEDDING50", type: DiscountType.FIXED, value: 50, minOrder: 400, maxUses: 100, isActive: true },
  });
  console.log("✓ Discounts created");

  // ---- Banners & testimonials -------------------------------------------
  await prisma.banner.createMany({
    data: [
      { title: "The Wedding Edit", subtitle: "Everything for your perfect day", ctaText: "Shop Wedding", ctaLink: "/collections/wedding", sortOrder: 0 },
      { title: "New Home Arrivals", subtitle: "Refresh your space this season", ctaText: "Shop Home", ctaLink: "/collections/home", sortOrder: 1 },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      { name: "Mariam & Yousef", text: "The centerpieces made our wedding absolutely magical. Delivery was on time and the quality exceeded our expectations!", rating: 5, sortOrder: 0 },
      { name: "Noura A.", text: "Beautiful home accessories and such elegant packaging. My go-to for gifts now.", rating: 5, sortOrder: 1 },
      { name: "Hind M.", text: "Ordered via WhatsApp and everything was so smooth. Highly recommend!", rating: 5, sortOrder: 2 },
    ],
  });
  console.log("✓ Marketing content created");

  console.log("\n✅ Seed complete!");
  console.log(`   Owner login:     ${ownerEmail} / ${ownerPass}`);
  console.log(`   Developer login: ${devEmail} / ${devPass}`);
  console.log(`   Admin login:     admin@nourboutique.com / ChangeMe123!`);
  console.log(`   Staff login:     staff@nourboutique.com / ChangeMe123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

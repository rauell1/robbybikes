import { readFileSync } from "node:fs";
import path from "node:path";
import { loadEnv } from "./load-env";

loadEnv();

type SampleImage = { url: string; alt: string };

type SampleListing = {
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  engineCc: number | null;
  priceKes: number;
  condition: "excellent" | "very_good" | "good" | "fair" | "needs_repair";
  odometerKm: number | null;
  transmission: string | null;
  fuelType: string | null;
  colour: string | null;
  usage: string | null;
  registration: string | null;
  description: string;
  inspectionNotes: string | null;
  serviceHistory: string | null;
  status: "available" | "reserved" | "pending_sale" | "sold";
  isPublished: boolean;
  isFeatured: boolean;
  images: SampleImage[];
};

type SampleEnquiry = {
  customerName: string;
  phoneNumber: string;
  email: string | null;
  motorcycleSlug: string | null;
  preferredContactMethod: string;
  message: string;
  status: "new" | "contacted" | "in_progress" | "closed";
};

type SampleData = { listings: SampleListing[]; enquiries: SampleEnquiry[] };

async function main() {
  const { getDb } = await import("../lib/db");
  const { runMigrations } = await import("../lib/migrations");
  const { enquiries, motorcycleImages, motorcycles, adminUsers } = await import("../lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { hashPassword } = await import("../lib/password");

  await runMigrations();
  const db = await getDb();

  const file = path.resolve(process.cwd(), "data/sample-inventory.json");
  const sample = JSON.parse(readFileSync(file, "utf8")) as SampleData;

  let addedListings = 0;
  let addedImages = 0;

  for (const listing of sample.listings) {
    const [existing] = await db
      .select({ id: motorcycles.id })
      .from(motorcycles)
      .where(eq(motorcycles.slug, listing.slug))
      .limit(1);

    let bikeId = existing?.id;

    if (!bikeId) {
      const [created] = await db
        .insert(motorcycles)
        .values({
          slug: listing.slug,
          brand: listing.brand,
          model: listing.model,
          year: listing.year,
          engineCc: listing.engineCc,
          priceKes: listing.priceKes,
          condition: listing.condition,
          odometerKm: listing.odometerKm,
          transmission: listing.transmission,
          fuelType: listing.fuelType,
          colour: listing.colour,
          usage: listing.usage,
          registration: listing.registration,
          description: listing.description,
          inspectionNotes: listing.inspectionNotes,
          serviceHistory: listing.serviceHistory,
          status: listing.status,
          isPublished: listing.isPublished,
          isFeatured: listing.isFeatured,
          isSample: true,
        })
        .returning({ id: motorcycles.id });

      bikeId = created?.id;
      addedListings += 1;
    }

    if (!bikeId) continue;

    const existingImages = await db
      .select({ id: motorcycleImages.id })
      .from(motorcycleImages)
      .where(eq(motorcycleImages.motorcycleId, bikeId))
      .limit(1);

    if (existingImages.length === 0) {
      await db.insert(motorcycleImages).values(
        listing.images.map((image, index) => ({
          motorcycleId: bikeId,
          imageUrl: image.url,
          altText: image.alt,
          sortOrder: index,
        })),
      );
      addedImages += listing.images.length;
    }
  }

  let addedEnquiries = 0;
  const existingSampleEnquiries = await db
    .select({ id: enquiries.id })
    .from(enquiries)
    .where(eq(enquiries.source, "seed-sample"))
    .limit(1);

  if (existingSampleEnquiries.length === 0) {
    for (const enquiry of sample.enquiries) {
      let motorcycleId: string | null = null;
      if (enquiry.motorcycleSlug) {
        const [bike] = await db
          .select({ id: motorcycles.id })
          .from(motorcycles)
          .where(eq(motorcycles.slug, enquiry.motorcycleSlug))
          .limit(1);
        motorcycleId = bike?.id ?? null;
      }

      await db.insert(enquiries).values({
        customerName: enquiry.customerName,
        phoneNumber: enquiry.phoneNumber,
        email: enquiry.email,
        motorcycleId,
        preferredContactMethod: enquiry.preferredContactMethod,
        message: enquiry.message,
        status: enquiry.status,
        source: "seed-sample",
      });
      addedEnquiries += 1;
    }
  }

  let adminCreated = false;
  const demoEmail = process.env.DEMO_ADMIN_EMAIL?.trim().toLowerCase();
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD;

  if (process.env.DEMO_MODE === "1" && demoEmail && demoPassword) {
    const [existingAdmin] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, demoEmail))
      .limit(1);

    if (!existingAdmin) {
      await db.insert(adminUsers).values({
        email: demoEmail,
        name: "Demo administrator",
        role: "admin",
        passwordHash: await hashPassword(demoPassword),
      });
      adminCreated = true;
    }
  }

  console.log("");
  console.log("✔ Seed complete.");
  console.log(`  Listings added:   ${addedListings} (${sample.listings.length} sample records in file)`);
  console.log(`  Images added:     ${addedImages}`);
  console.log(`  Enquiries added:  ${addedEnquiries}`);
  if (process.env.DEMO_MODE === "1") {
    console.log(`  Demo admin:       ${adminCreated ? "created" : "already present"}`);
  }
  console.log("");
  console.log("  Remove demo inventory and demo enquiries with: npm run db:sample:clear");
  console.log("");
  process.exit(0);
}

main().catch((error) => {
  console.error("✖ Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});

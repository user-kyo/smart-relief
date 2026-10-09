import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning and seeding database with official accounts and operational data...");

  // Safely clean existing user-related data
  await prisma.responderIncident.deleteMany({});
  await prisma.requestStatusHistory.deleteMany({});
  await prisma.assistanceRequest.deleteMany({});
  await prisma.incidentTimeline.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.responder.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.resourceItem.deleteMany({});
  await prisma.evacuationCenter.deleteMany({});

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. SUPER ADMIN (1)
  const superAdmin = await prisma.user.create({
    data: {
      name: "Roberto Mendoza",
      email: "roberto.mendoza@gmail.com",
      role: "SUPER_ADMIN",
      password: defaultPassword,
      phone: "+63 917 123 4567",
      status: "ACTIVE",
      lguName: "Rizal DRRM Operations Center",
      barangay: "Pauli 2",
    },
  });
  console.log(`Created Super Admin: ${superAdmin.name} (${superAdmin.email})`);

  // 2. ADMIN (1)
  const admin = await prisma.user.create({
    data: {
      name: "Elena Santos",
      email: "elena.santos@gmail.com",
      role: "ADMIN",
      password: defaultPassword,
      phone: "+63 918 234 5678",
      status: "ACTIVE",
      lguName: "Rizal DRRM Operations Center",
      barangay: "Pauli 2",
    },
  });
  console.log(`Created Admin: ${admin.name} (${admin.email})`);

  // 3. RESPONDERS (2)
  const responder1 = await prisma.user.create({
    data: {
      name: "Marcus Villareal",
      email: "marcus.villareal@gmail.com",
      role: "RESPONDER",
      password: defaultPassword,
      phone: "+63 919 345 6789",
      status: "ACTIVE",
      lguName: "Rizal DRRM",
      barangay: "Pauli 2",
    },
  });

  const respProfile1 = await prisma.responder.create({
    data: {
      userId: responder1.id,
      codeName: "ALPHA-1",
      roleType: "DISASTER_RESPONSE_TEAM",
      status: "ON_SCENE",
      lguName: "Rizal DRRM",
      locationName: "Sector 4 Riverview Post",
      lat: 14.1132,
      lng: 121.3935,
      phone: "+63 919 345 6789",
      teamSize: 6,
      skills: JSON.stringify(["Water Rescue", "First Aid", "Swift Water Rescue"]),
      equipment: JSON.stringify(["Rubber Boat", "Life Vests (15)", "Medical Trauma Kit"]),
    },
  });
  console.log(`Created Responder 1: ${responder1.name} (${responder1.email})`);

  const responder2 = await prisma.user.create({
    data: {
      name: "Theresa Ramos",
      email: "theresa.ramos@gmail.com",
      role: "RESPONDER",
      password: defaultPassword,
      phone: "+63 920 456 7890",
      status: "AVAILABLE",
      lguName: "Rizal DRRM",
      barangay: "Antipolo Central",
    },
  });

  const respProfile2 = await prisma.responder.create({
    data: {
      userId: responder2.id,
      codeName: "MEDIC-1",
      roleType: "PARAMEDIC",
      status: "AVAILABLE",
      lguName: "Rizal DRRM",
      locationName: "Antipolo Medical Outpost",
      lat: 14.1200,
      lng: 121.4050,
      phone: "+63 920 456 7890",
      teamSize: 4,
      skills: JSON.stringify(["Triage", "Emergency Medicine", "Advanced Trauma Care"]),
      equipment: JSON.stringify(["Ambulance", "Defibrillator", "Oxygen Resuscitator"]),
    },
  });
  console.log(`Created Responder 2: ${responder2.name} (${responder2.email})`);

  // 4. CITIZENS (3)
  const citizen1 = await prisma.user.create({
    data: {
      name: "Carlos Dalisay",
      email: "carlos.dalisay@gmail.com",
      role: "CITIZEN",
      password: defaultPassword,
      phone: "+63 921 567 8901",
      status: "ACTIVE",
      lguName: "Rizal",
      barangay: "Pauli 1",
    },
  });
  console.log(`Created Citizen 1: ${citizen1.name} (${citizen1.email})`);

  const citizen2 = await prisma.user.create({
    data: {
      name: "Grace Bautista",
      email: "grace.bautista@gmail.com",
      role: "CITIZEN",
      password: defaultPassword,
      phone: "+63 922 678 9012",
      status: "ACTIVE",
      lguName: "Rizal",
      barangay: "Pauli 2",
    },
  });
  console.log(`Created Citizen 2: ${citizen2.name} (${citizen2.email})`);

  const citizen3 = await prisma.user.create({
    data: {
      name: "Arnel Reyes",
      email: "arnel.reyes@gmail.com",
      role: "CITIZEN",
      password: defaultPassword,
      phone: "+63 923 789 0123",
      status: "ACTIVE",
      lguName: "Rizal",
      barangay: "Poblacion",
    },
  });
  console.log(`Created Citizen 3: ${citizen3.name} (${citizen3.email})`);

  // 5. OPERATIONAL INCIDENTS (DATABASE)
  const inc1 = await prisma.incident.create({
    data: {
      title: "Severe Flooding along Riverview Sector",
      description: "Submerged access roads with flood water reaching 1.8 meters. 45 residents awaiting boat evacuation.",
      type: "FLOOD",
      severity: "CRITICAL",
      status: "VERIFIED",
      locationName: "Riverview Subdivision, Sector 4",
      barangay: "Pauli 2",
      lguName: "Rizal",
      lat: 14.1134,
      lng: 121.3938,
      affectedCount: 45,
      reportedBy: citizen1.id,
    }
  });

  await prisma.responderIncident.create({
    data: {
      incidentId: inc1.id,
      responderId: respProfile1.id
    }
  });

  const inc2 = await prisma.incident.create({
    data: {
      title: "Hillside Slope Debris Spill",
      description: "Heavy rain runoff caused earth and rock slide blocking major evacuation route along highway.",
      type: "LANDSLIDE",
      severity: "HIGH",
      status: "ASSIGNED",
      locationName: "Kilometer 14 Mountain Road",
      barangay: "Antipolo Central",
      lguName: "Rizal",
      lat: 14.1190,
      lng: 121.4020,
      affectedCount: 20,
      reportedBy: citizen2.id,
    }
  });

  const inc3 = await prisma.incident.create({
    data: {
      title: "Electrical Transformer Arc & Smoke",
      description: "Downed power lines sparking near residential cluster following wind gusts. Area isolated.",
      type: "FIRE",
      severity: "MEDIUM",
      status: "REPORTED",
      locationName: "Corner San Isidro St.",
      barangay: "Pauli 1",
      lguName: "Rizal",
      lat: 14.1110,
      lng: 121.3910,
      affectedCount: 8,
      reportedBy: citizen3.id,
    }
  });
  console.log("Created operational incidents in database.");

  // 6. OPERATIONAL ASSISTANCE REQUESTS (DATABASE)
  await prisma.assistanceRequest.create({
    data: {
      citizenId: citizen1.id,
      incidentId: inc1.id,
      responderId: respProfile1.id,
      requestType: "RESCUE",
      severity: "CRITICAL",
      status: "ASSIGNED",
      locationName: "Block 7 Lot 12 Riverview",
      barangay: "Pauli 2",
      lat: 14.1136,
      lng: 121.3940,
      peopleCount: 4,
      specialNeeds: "1 elderly with wheelchair, 1 infant",
      description: "Water level is waist-high inside the house. Need boat extraction to Pauli 2 evacuation center."
    }
  });

  await prisma.assistanceRequest.create({
    data: {
      citizenId: citizen2.id,
      incidentId: inc1.id,
      responderId: respProfile2.id,
      requestType: "MEDICAL",
      severity: "HIGH",
      status: "VERIFIED",
      locationName: "Pauli 2 Medical Outpost",
      barangay: "Pauli 2",
      lat: 14.1142,
      lng: 121.3948,
      peopleCount: 2,
      specialNeeds: "Diabetic patient needing refrigerated insulin",
      description: "Power cut off. Patient experiencing heat exhaustion and requires emergency glucose and cold chain supply."
    }
  });

  await prisma.assistanceRequest.create({
    data: {
      citizenId: citizen3.id,
      requestType: "FOOD_WATER",
      severity: "MEDIUM",
      status: "SUBMITTED",
      locationName: "Poblacion Barangay Hall Annex",
      barangay: "Poblacion",
      lat: 14.1105,
      lng: 121.3890,
      peopleCount: 6,
      specialNeeds: "Clean drinking water needed",
      description: "Tap water contaminated by runoff. 6 family members need drinking water containers and relief goods."
    }
  });
  console.log("Created assistance requests in database.");

  // 7. OPERATIONAL INVENTORY & RESOURCES (DATABASE)
  await prisma.resourceItem.createMany({
    data: [
      {
        name: "Standard Family Food Packs",
        category: "FOOD_WATER",
        quantity: 1200,
        availableQuantity: 950,
        reservedQuantity: 150,
        distributedQuantity: 100,
        unit: "boxes",
        location: "Central Warehouse Depot",
        lguName: "Rizal DRRM Operations Center",
        minThreshold: 200,
        stockStatus: "NORMAL"
      },
      {
        name: "Purified Drinking Water (5-Gallon)",
        category: "FOOD_WATER",
        quantity: 300,
        availableQuantity: 45,
        reservedQuantity: 155,
        distributedQuantity: 100,
        unit: "containers",
        location: "Pauli 2 Central Depot",
        lguName: "Rizal DRRM Operations Center",
        minThreshold: 100,
        stockStatus: "LOW_STOCK"
      },
      {
        name: "Emergency Trauma & First Aid Kit",
        category: "MEDICAL_SUPPLIES",
        quantity: 150,
        availableQuantity: 120,
        reservedQuantity: 20,
        distributedQuantity: 10,
        unit: "kits",
        location: "Antipolo Medical Hub",
        lguName: "Rizal DRRM Operations Center",
        minThreshold: 30,
        stockStatus: "NORMAL"
      },
      {
        name: "Heavy-Duty Inflatable Raft (8-Person)",
        category: "RESCUE_GEAR",
        quantity: 12,
        availableQuantity: 3,
        reservedQuantity: 5,
        distributedQuantity: 4,
        unit: "crafts",
        location: "Riverview Staging Area",
        lguName: "Rizal DRRM Operations Center",
        minThreshold: 5,
        stockStatus: "LOW_STOCK"
      },
      {
        name: "Certified Life Vests (Adult & Child)",
        category: "RESCUE_GEAR",
        quantity: 250,
        availableQuantity: 190,
        reservedQuantity: 40,
        distributedQuantity: 20,
        unit: "vests",
        location: "Sector 4 Staging Depot",
        lguName: "Rizal DRRM Operations Center",
        minThreshold: 50,
        stockStatus: "NORMAL"
      },
      {
        name: "Portable Diesel Generator 5.5kW",
        category: "POWER_COMM",
        quantity: 8,
        availableQuantity: 2,
        reservedQuantity: 3,
        distributedQuantity: 3,
        unit: "units",
        location: "Central Warehouse Depot",
        lguName: "Rizal DRRM Operations Center",
        minThreshold: 4,
        stockStatus: "CRITICAL"
      }
    ]
  });
  console.log("Created inventory resources in database.");

  // 8. EVACUATION SHELTERS (DATABASE)
  await prisma.evacuationCenter.createMany({
    data: [
      {
        name: "Pauli 2 Central Covered Gymnasium",
        address: "Pauli 2 Barangay Complex",
        barangay: "Pauli 2",
        lguName: "Rizal",
        lat: 14.1150,
        lng: 121.3950,
        capacity: 500,
        currentOccupants: 380,
        powerGenerator: true,
        medicalStation: true,
        sanitation: true,
        wifiComm: true,
        communityKitchen: true,
        waterPurifier: true,
        status: "OPEN",
        contactPerson: "Elena Santos",
        contactPhone: "+63 918 234 5678"
      },
      {
        name: "Rizal Municipal Multi-Purpose Center",
        address: "Town Plaza, Poblacion",
        barangay: "Poblacion",
        lguName: "Rizal",
        lat: 14.1102,
        lng: 121.3885,
        capacity: 400,
        currentOccupants: 385,
        powerGenerator: true,
        medicalStation: true,
        sanitation: true,
        wifiComm: false,
        communityKitchen: true,
        waterPurifier: true,
        status: "FULL",
        contactPerson: "Marcus Villareal",
        contactPhone: "+63 919 345 6789"
      },
      {
        name: "Antipolo East Elementary School Hub",
        address: "School Road, Antipolo Central",
        barangay: "Antipolo Central",
        lguName: "Rizal",
        lat: 14.1210,
        lng: 121.4060,
        capacity: 350,
        currentOccupants: 110,
        powerGenerator: false,
        medicalStation: true,
        sanitation: true,
        wifiComm: false,
        communityKitchen: false,
        waterPurifier: true,
        status: "OPEN",
        contactPerson: "Theresa Ramos",
        contactPhone: "+63 920 456 7890"
      },
      {
        name: "San Isidro Civic Auditorium (Standby)",
        address: "San Isidro Memorial Park Road",
        barangay: "Pauli 1",
        lguName: "Rizal",
        lat: 14.1080,
        lng: 121.3920,
        capacity: 300,
        currentOccupants: 0,
        powerGenerator: true,
        medicalStation: false,
        sanitation: true,
        wifiComm: false,
        communityKitchen: false,
        waterPurifier: false,
        status: "STANDBY",
        contactPerson: "Carlos Dalisay",
        contactPhone: "+63 921 567 8901"
      }
    ]
  });
  console.log("Created evacuation shelters in database.");

  console.log("\n==========================================");
  console.log("Database seeded successfully with all official accounts & visualization data!");
  console.log("Total Users: 7 (1 Super Admin, 1 Admin, 2 Responders, 3 Citizens)");
  console.log("Default Password: password123");
  console.log("==========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

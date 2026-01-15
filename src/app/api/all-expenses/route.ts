import KhorochModel, { Khoroch } from "@/models/Khoroch";
import PolapainModel from "@/models/Polapain";
import { NextRequest } from "next/server"; // Kept NextRequest
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Notification from "@/models/Notification";
import { sendPushNotification } from "@/lib/push";
import dbConnect from "@/lib/dbConnect";
import { FilterQuery, SortOrder } from "mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();
  const url = new URL(req.url);
  const sortParam = url.searchParams.get("sort");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search") || "";
  const type = url.searchParams.get("type") || "all";
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  const participant = url.searchParams.get("participant");
  const excludeType = url.searchParams.get("excludeType");

  const query: FilterQuery<Khoroch> = {};

  // Search filter
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Type filter
  if (type !== "all") {
    query.type = type;
  }
  
  // Exclude Type filter
  if (excludeType) {
    query.type = { $ne: excludeType };
  }
  
  // Participant filter
  if (participant) {
    query.$or = [
      { dise: { $elemMatch: { id: participant, amount: { $gt: 0 } } } },
      { dibo: { $elemMatch: { id: participant, amount: { $gt: 0 } } } }
    ];
  }

  // Date range filter
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  // Sorting
  let sort: { [key: string]: SortOrder } = { date: -1, _id: -1 };
  if (sortParam === "date") {
    sort = { date: -1 };
  } else if (sortParam === "_id") {
    sort = { _id: -1 };
  }

  try {
    const skipStats = url.searchParams.get("skipStats") === "true";

    if (skipStats) {
        const [expenses, total] = await Promise.all([
            KhorochModel.find(query)
                .sort(sort as any)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            KhorochModel.countDocuments(query)
        ]);

        return Response.json({
            expenses,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: { totalAmount: 0 },
        });
    }

    const pipeline: any[] = [
      { $match: query },
    ];

    // Sorting stage
    pipeline.push({ $sort: sort as any });



    const facetStage: any = {
      expenses: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalCount: [
        { $count: "count" },
      ],
    };

    if (!skipStats) {
      facetStage.stats = [
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ];
    }

    pipeline.push({ $facet: facetStage });

    const result = await KhorochModel.aggregate(pipeline);
    const data = result[0];

    const expenses = data.expenses || [];
    const total = data.totalCount[0]?.count || 0;
    
    let stats = {
      totalAmount: 0,
    };

    if (!skipStats && data.stats && data.stats.length > 0) {
      stats = data.stats[0];
    }

    return Response.json({
      expenses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return Response.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}



export async function POST(req: Request) {
  await dbConnect();
  const khoroch = await req.json();
  khoroch.amount = Number(khoroch.amount);

  for (let i = 0; i < khoroch.dise.length; i++) {
    khoroch.dise[i].amount = Number(khoroch.dise[i].amount);
    khoroch.dibo[i].amount = Number(khoroch.dibo[i].amount);
  }

  const newKhoroch = await KhorochModel.create(khoroch);

  // Update Balances
  const balancePromises = [
      ...khoroch.dise.map((dise: { id: string; amount: number }) => 
        PolapainModel.findByIdAndUpdate(dise.id, { $inc: { balance: dise.amount } })
      ),
      ...khoroch.dibo.map((dibo: { id: string; amount: number }) => 
        PolapainModel.findByIdAndUpdate(dibo.id, { $inc: { balance: -dibo.amount } })
      )
  ];
  await Promise.all(balancePromises);


  // --- Notifications ---
  try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      let currentUserId = "";
      
      if (token) {
          const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id?: string, _id?: string };
          currentUserId = decoded.id || decoded._id || "";
      }

      // Collect unique recipients
      const recipients = new Set<string>();
      
      khoroch.dise.forEach((p: { id: string }) => recipients.add(p.id));
      khoroch.dibo.forEach((p: { id: string }) => recipients.add(p.id));
      
      // Remove current user (sender)
      if (currentUserId) recipients.delete(currentUserId);

      // Create notifications
      const notifications = Array.from(recipients).map(recipientId => ({
          recipient: recipientId,
          sender: currentUserId, // Might be empty if no token, implies system
          message: `New expense added: ${khoroch.title} (${khoroch.amount}৳)`,
          link: `/all-expenses?highlight=${newKhoroch._id}`, // simplified link
          type: "expense",
          createdAt: new Date()
      }));

      if (notifications.length > 0 && currentUserId) {
           await Notification.insertMany(notifications);
           
           // --- Web Push Notifications ---
           const pushPromises = notifications.map(n => 
             sendPushNotification(n.recipient, {
               title: "New Expense",
               body: n.message,
               url: `${process.env.NEXT_PUBLIC_APP_URL || ''}${n.link}`
             })
           );
           await Promise.all(pushPromises);
      }
      
  } catch (error) {
      console.error("Notification trigger failed", error);
      // Don't fail the request just because notifications failed
  }
  // ---------------------

  return Response.json(newKhoroch);
}

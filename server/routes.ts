import type { Express } from "express";
import { createServer, type Server } from "http";
import { MongoStorage } from "./mongodb-storage";

const storage = new MongoStorage();
import {
  insertUserSchema,
  insertCampaignSchema,
  insertRewardSchema,
  insertContributionSchema,
  insertCampaignUpdateSchema,
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string,
        featured: req.query.featured === "true" ? true : undefined,
        creatorId: req.query.creatorId ? parseInt(req.query.creatorId as string) : undefined,
      };
      const campaigns = await storage.getCampaigns(filters);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCampaignSchema.partial().parse(req.body);
      
      const campaign = await storage.updateCampaign(id, updates);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Reward routes
  app.get("/api/campaigns/:id/rewards", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const rewards = await storage.getRewardsByCampaign(campaignId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/campaigns/:id/rewards", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const rewardData = insertRewardSchema.parse({
        ...req.body,
        campaignId,
      });
      const reward = await storage.createReward(rewardData);
      res.status(201).json(reward);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Contribution routes
  app.get("/api/campaigns/:id/contributions", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const contributions = await storage.getContributionsByCampaign(campaignId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/campaigns/:id/contributions", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const contributionData = insertContributionSchema.parse({
        ...req.body,
        campaignId,
      });
      const contribution = await storage.createContribution(contributionData);
      res.status(201).json(contribution);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/users/:id/contributions", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const contributions = await storage.getContributionsByUser(userId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Campaign Updates routes
  app.get("/api/campaigns/:id/updates", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const updates = await storage.getUpdatesByCampaign(campaignId);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/campaigns/:id/updates", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const updateData = insertCampaignUpdateSchema.parse({
        ...req.body,
        campaignId,
      });
      const update = await storage.createCampaignUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await (storage as any).getAllUsers(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/campaigns", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await (storage as any).getAllCampaigns(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      const user = await (storage as any).toggleUserStatus(id, isActive);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/campaigns/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approved, notes } = req.body;
      const campaign = await (storage as any).approveCampaign(id, approved, notes);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/campaigns/:id/feature", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { featured } = req.body;
      const campaign = await (storage as any).featureCampaign(id, featured);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

    // 🔽🔽🔽 ADDED SECTION: FRONTEND SERVING MECHANISM 🔽🔽🔽
  // =====================================================================
  
  // 1. Serve static files in production environment
  if (process.env.NODE_ENV === "production") {
    // Determine the correct path to your frontend build directory
    const frontendPath = path.join(
      process.cwd(), // Root of your project on Render
      "client",     // Adjust to your frontend directory name
      "public"        // Adjust to your build output directory
    );

    console.log("[SERVER] Serving frontend from:", frontendPath);

    // Verify the build directory exists
    if (!fs.existsSync(frontendPath)) {
      console.error("[SERVER] ERROR: Frontend build directory not found!");
      console.error("[SERVER] Expected path:", frontendPath);
      console.error("[SERVER] Verify your build process and directory structure");
    } else {
      console.log("[SERVER] Found build files:", fs.readdirSync(frontendPath));
    }

    // Serve static files (HTML, JS, CSS, images)
    app.use(express.static(frontendPath));

    // 2. Handle client-side routing - return index.html for all non-API routes
    app.get("*", (req, res) => {
      // First check if it's an API route
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API endpoint not found" });
      }
      
      // Serve index.html for all other routes
      res.sendFile(path.join(frontendPath, "index.html"), (err) => {
        if (err) {
          console.error("[SERVER] Error serving index.html:", err);
          res.status(500).send("Frontend loading error");
        }
      });
    });
  } else {
    // Development mode message
    console.log("[SERVER] Running in development mode - frontend not served");
  }

  // =====================================================================
  // 🔼🔼🔼 END OF ADDED SECTION 🔼🔼🔼

  const httpServer = createServer(app);
  return httpServer;
}

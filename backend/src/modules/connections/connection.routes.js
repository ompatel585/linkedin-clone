import { Router } from "express";
import { protectRoute } from "../../middleware/auth.js";
import {
    acceptConnectionRequest,
    getConnectionRequests,
    getConnectionStatus,
    getSentConnectionRequests,
    getUserConnections,
    rejectConnectionRequest,
    removeConnection,
    sendConnectionRequest,
    withdrawConnectionRequest,
} from "./connection.controller.js";

const router = Router();

router.use(protectRoute);

router.get("/", getUserConnections);
router.get("/requests", getConnectionRequests);
router.get("/requests/sent", getSentConnectionRequests);
router.get("/status/:userId", getConnectionStatus);
router.post("/request/:userId", sendConnectionRequest);
router.delete("/request/:userId", withdrawConnectionRequest);
router.put("/accept/:requestId", acceptConnectionRequest);
router.put("/reject/:requestId", rejectConnectionRequest);
router.delete("/:userId", removeConnection);

export default router;

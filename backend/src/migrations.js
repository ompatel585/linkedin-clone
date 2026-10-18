import User from "./models/user.model.js";
import { migrateLegacyLikes } from "./models/post.model.js";

// Idempotent fixes for data created by older versions of the app.
export const runMigrations = async () => {
    // Older schema made `name` unique, which blocked people sharing a name.
    const indexes = await User.collection.indexes().catch(() => []);
    if (indexes.some((index) => index.name === "name_1" && index.unique)) {
        await User.collection.dropIndex("name_1");
        console.log("Dropped unique index on user name");
    }

    // Usernames and emails are now stored lowercase.
    await User.collection.updateMany({ username: { $regex: /[A-Z]/ } }, [{ $set: { username: { $toLower: "$username" } } }]);
    await User.collection.updateMany({ email: { $regex: /[A-Z]/ } }, [{ $set: { email: { $toLower: "$email" } } }]);
    try {
        await User.syncIndexes();
    } catch (error) {
        console.warn("Could not sync user indexes (duplicate emails or usernames?):", error.message);
    }

    await migrateLegacyLikes();
};

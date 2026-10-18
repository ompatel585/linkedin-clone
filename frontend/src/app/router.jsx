import { lazy } from "react";
import { Route, Routes } from "react-router";
import AppLayout from "../components/layout/AppLayout";
import NotFoundPage from "../components/layout/NotFoundPage";
import { ProtectedRoute, PublicOnlyRoute } from "../components/layout/RouteGuards";

// Route-level code splitting: each page loads on demand
const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const SignUpPage = lazy(() => import("../features/auth/SignUpPage"));
const HomePage = lazy(() => import("../features/feed/HomePage"));
const PostPage = lazy(() => import("../features/feed/PostPage"));
const HashtagPage = lazy(() => import("../features/feed/HashtagPage"));
const SavedPostsPage = lazy(() => import("../features/feed/SavedPostsPage"));
const ProfilePage = lazy(() => import("../features/profile/ProfilePage"));
const NetworkPage = lazy(() => import("../features/network/NetworkPage"));
const NotificationsPage = lazy(() => import("../features/notifications/NotificationsPage"));
const MessagingPage = lazy(() => import("../features/messaging/MessagingPage"));
const JobsPage = lazy(() => import("../features/jobs/JobsPage"));
const JobDetailPage = lazy(() => import("../features/jobs/JobDetailPage"));
const MyJobsPage = lazy(() => import("../features/jobs/MyJobsPage"));
const ApplicantsPage = lazy(() => import("../features/jobs/ApplicantsPage"));
const SearchPage = lazy(() => import("../features/search/SearchPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));

const AppRoutes = () => (
    <Routes>
        <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="post/:postId" element={<PostPage />} />
                <Route path="hashtag/:tag" element={<HashtagPage />} />
                <Route path="saved" element={<SavedPostsPage />} />
                <Route path="profile/:username" element={<ProfilePage />} />
                <Route path="network" element={<NetworkPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="messaging/:conversationId?" element={<MessagingPage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="jobs/my" element={<MyJobsPage />} />
                <Route path="jobs/:jobId" element={<JobDetailPage />} />
                <Route path="jobs/:jobId/applicants" element={<ApplicantsPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Route>
    </Routes>
);

export default AppRoutes;

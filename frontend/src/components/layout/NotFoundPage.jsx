import { Link } from "react-router";
import { Compass } from "lucide-react";
import { EmptyState } from "../ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const NotFoundPage = ({ title = "This page doesn't exist", description = "The link may be broken or the page may have been removed." }) => {
    useDocumentTitle("Not found");
    return (
        <div className="card-surface max-w-xl mx-auto">
            <EmptyState
                icon={Compass}
                title={title}
                description={description}
                action={
                    <Link to="/" className="btn btn-primary">
                        Go to your feed
                    </Link>
                }
            />
        </div>
    );
};

export default NotFoundPage;

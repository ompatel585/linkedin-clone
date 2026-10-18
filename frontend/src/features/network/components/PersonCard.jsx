import { Link } from "react-router";
import Avatar from "../../../components/ui/Avatar";
import { pluralize } from "../../../lib/utils";
import { Banner } from "../../feed/components/Sidebars";
import ConnectButton from "./ConnectButton";

// Grid card used for "People you may know"
const PersonCard = ({ person }) => (
    <div className="card-surface overflow-hidden flex flex-col text-center">
        <Banner user={person} className="h-14" />
        <div className="-mt-9 flex justify-center">
            <Link to={`/profile/${person.username}`}>
                <Avatar user={person} size="lg" className="ring-4 ring-base-100 rounded-full" showOpenToWork />
            </Link>
        </div>
        <div className="px-3 pt-2 pb-3 flex-1 flex flex-col">
            <Link to={`/profile/${person.username}`} className="font-semibold hover:underline line-clamp-1">
                {person.name}
            </Link>
            <p className="text-xs text-muted line-clamp-2 min-h-8">{person.headline}</p>
            <p className="text-xs text-muted mt-2 min-h-4">{person.mutualCount > 0 && pluralize(person.mutualCount, "mutual connection")}</p>
            <div className="mt-auto pt-3">
                <ConnectButton userId={person._id} initialStatus="not_connected" className="w-full" />
            </div>
        </div>
    </div>
);

export default PersonCard;

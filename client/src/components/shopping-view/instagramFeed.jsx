import React, { useState } from "react";
import InstagramCard from "./InstagramCard";
import { InstagramEmbed } from "react-social-media-embed";

const InstagramFeed = ({ posts }) => {
    const [selectedPost, setSelectedPost] = useState(null);

    return (
        <div className="p-2 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Instagram Post Thumbnails */}
            {posts.map((post, index) => (
                <div
                    key={index}
                    className=" overflow-hidden relative group cursor-pointer h-[400px]"
                    onClick={() => setSelectedPost(post)}
                >
                    <div className="pointer-events-none ">
                        <InstagramEmbed url={post} width="100%" captioned />
                    </div>
                </div>
            ))}

            {/* InstagramCard Modal */}
            {selectedPost && (
                <InstagramCard
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </div>
    );
};

export default InstagramFeed;

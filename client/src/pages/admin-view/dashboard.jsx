import ProductImageUpload from "@/components/admin-view/image-upload";
import MainData from "@/components/admin-view/main-data";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);








  return (
    <div>
     
  
      <div className="flex flex-col gap-4">
       <MainData />
      </div>
    </div>
  );
}

export default AdminDashboard;

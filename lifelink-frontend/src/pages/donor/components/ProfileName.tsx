interface AvatarUploadProps {
  fullName?: string;
  initialImage?: string;
}

const AvatarUpload = ({
  fullName = "LifeLink Donor",
  initialImage,
}: AvatarUploadProps) => {
  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="w-36 h-36 rounded-full overflow-hidden border-[5px] border-white shadow-xl bg-slate-100 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-4xl font-black">
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;

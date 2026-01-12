import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa6";

export function SocialIcon({
  platform,
}: {
  platform: "facebook" | "instagram" | "twitter" | "linkedin" | "youtube";
}) {
  switch (platform) {
    case "facebook":
      return <FaFacebook className="h-5 w-5" />;
    case "instagram":
      return <FaInstagram className="h-5 w-5" />;
    case "twitter":
      return <FaXTwitter className="h-5 w-5" />;
    case "linkedin":
      return <FaLinkedin className="h-5 w-5" />;
    case "youtube":
      return <FaYoutube className="h-5 w-5" />;
    default:
      return null;
  }
}

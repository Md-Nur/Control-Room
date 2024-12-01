import { usePolapainAuth } from "@/context/polapainAuth";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import toast from "react-hot-toast";

const PageLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { polapainAuth } = usePolapainAuth();
  if (polapainAuth) {
    return children;
  } else {
    router.push("/login");
    toast.error("You are not authorized to view this page");
    return <>You are not authorized to view this page</>;
  }
};

export default PageLayout;

import AddKhorochProvider from "@/provider/AddKhorochProvider";
import { ReactNode } from "react";

const AddExpenseLayout = ({ children }: { children: ReactNode }) => {
  return <AddKhorochProvider>{children}</AddKhorochProvider>;
};

export default AddExpenseLayout;

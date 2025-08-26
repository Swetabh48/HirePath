import { InterviewForm } from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <InterviewForm userId={user?.id} />
    </>
  );
};

export default page;
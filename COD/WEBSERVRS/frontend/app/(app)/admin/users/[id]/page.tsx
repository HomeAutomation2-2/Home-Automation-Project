import { UserFormContent } from "@/components/admin/user-form-content";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditUserPage({ params }: PageProps) {
  const { id } = await params;
  const userId = Number(id);

  return <UserFormContent mode="edit" userId={Number.isNaN(userId) ? undefined : userId} />;
}

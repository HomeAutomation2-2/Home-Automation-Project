import { HeatingParamsContent } from "@/components/heating/heating-params-content";

type PageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function HeatingRoomSettingsPage({ params }: PageProps) {
  const { roomId } = await params;
  const id = Number(roomId);
  if (Number.isNaN(id)) {
    return (
      <p className="text-sm text-[#b42318]">Invalid room ID.</p>
    );
  }
  return <HeatingParamsContent roomId={id} />;
}

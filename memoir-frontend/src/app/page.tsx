import PwaInit from "@/components/PwaInit"; // ✅ 路径根据你的位置修改
import Dialog from "@/components/Dialog";

export default function Home() {
  return (
    <div>
      <PwaInit />
      <Dialog />
    </div>
  );
}

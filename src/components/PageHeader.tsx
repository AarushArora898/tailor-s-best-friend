import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, showBack, right }: Props) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
      {showBack && (
        <button onClick={() => navigate(-1)} className="rounded-lg p-1 text-foreground hover:bg-secondary">
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold tracking-tight">{title}</h1>
      {right}
    </header>
  );
}

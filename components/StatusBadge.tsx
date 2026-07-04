import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap: Record<string, "default" | "success" | "warning" | "danger" | "info" | "secondary"> = {
    Draft: "secondary",
    Sent: "info",
    Accepted: "success",
    Rejected: "danger",
    Unpaid: "warning",
    "Partially Paid": "info",
    Paid: "success",
    Cancelled: "danger",
  };

  return (
    <Badge variant={variantMap[status] ?? "secondary"}>
      {status}
    </Badge>
  );
}

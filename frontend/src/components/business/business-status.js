"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  PhoneCall,
  Star,
  Clock,
  Ban,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const STATUS_OPTIONS = [
  { value: "new", label: "New", icon: Star },
  { value: "contacted", label: "Contacted", icon: PhoneCall },
  { value: "responded", label: "Responded", icon: CheckCircle2 },
  { value: "converted", label: "Converted", icon: Star },
  { value: "rejected", label: "Rejected", icon: XCircle },
  { value: "ignored", label: "Ignored", icon: Ban },
  { value: "follow_up", label: "Follow Up", icon: Clock },
];

export function getStatusIcon(status) {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status);
  return option ? option.icon : Star;
}

export function getStatusColor(status) {
  switch (status) {
    case "converted":
      return "text-green-600 dark:text-green-500";
    case "contacted":
      return "text-blue-600 dark:text-blue-500";
    case "responded":
      return "text-purple-600 dark:text-purple-500";
    case "rejected":
      return "text-red-600 dark:text-red-500";
    case "ignored":
      return "text-gray-600 dark:text-gray-500";
    case "follow_up":
      return "text-amber-600 dark:text-amber-500";
    default:
      return "text-primary";
  }
}

export default function BusinessStatus({ status, placeId, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/hexagons/businesses/${placeId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedBusiness = await response.json();
      onStatusChange(updatedBusiness);
    } catch (error) {
      console.error("Error updating business status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusIcon = getStatusIcon(status);

  return (
    <div className="flex items-center gap-2">
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <StatusIcon className={`h-4 w-4 ${getStatusColor(status)}`} />
      )}
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${getStatusColor(option.value)}`} />
                  {option.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

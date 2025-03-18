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
      await onStatusChange({ status: newStatus, place_id: placeId });
    } catch (error) {
      console.error("Error updating business status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusIcon = getStatusIcon(status);

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[140px]">
        <div className="flex items-center gap-2">
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <StatusIcon className={`h-4 w-4 ${getStatusColor(status)}`} />
          )}
          <SelectValue placeholder="Select status" />
        </div>
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
  );
}

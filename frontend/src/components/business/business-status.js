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

// Updated to return hex color values instead of Tailwind classes
export function getStatusColor(status) {
  switch (status) {
    case "new":
      return "#FFFFFF"; // white
    case "converted":
      return "#22C55E"; // green-600
    case "contacted":
      return "#2563EB"; // blue-600
    case "responded":
      return "#9333EA"; // purple-600
    case "rejected":
      return "#DC2626"; // red-600
    case "ignored":
      return "#4B5563"; // gray-600
    case "follow_up":
      return "#D97706"; // amber-600
    default:
      return "#FFFFFF"; // white (default)
  }
}

// Function to get Tailwind classes for UI elements
export function getStatusColorClass(status) {
  switch (status) {
    case "new":
      return "text-white dark:text-white";
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
      return "text-white dark:text-white";
  }
}

export default function BusinessStatus({ status, placeId, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;

    setIsUpdating(true);
    try {
      await onStatusChange(placeId, newStatus);
    } catch (error) {
      console.error("Error updating business status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusIcon = getStatusIcon(status);
  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status);

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
            <StatusIcon className={`h-4 w-4 ${getStatusColorClass(status)}`} />
          )}
          <SelectValue placeholder="Select status">
            {currentOption?.label}
          </SelectValue>
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
                <Icon
                  className={`h-4 w-4 ${getStatusColorClass(option.value)}`}
                />
                {option.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

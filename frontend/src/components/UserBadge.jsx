// components/UserBadge.jsx
import React from "react";
import { Shield, CheckCircle, User } from "lucide-react";
const UserBadge = ({ badge, showLabel = true, size = "sm" }) => {
  const badges = {
    verified: {
      icon: CheckCircle,
      label: "Verified",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    trusted: {
      icon: Shield,
      label: "Trusted",
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-100"
    },
    normal: {
      icon: User,
      label: "Member",
      color: "bg-gray-500",
      textColor: "text-gray-600",
      bgColor: "bg-gray-100"
    }
  };

  const currentBadge = badges[badge] || badges.normal;
  const Icon = currentBadge.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2"
  };

  if (!showLabel) {
    return (
      <div className={`inline-flex items-center justify-center rounded-full ${currentBadge.bgColor} p-1`}>
        <Icon className={`w-4 h-4 ${currentBadge.textColor}`} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center rounded-full ${currentBadge.bgColor} ${sizeClasses[size]}`}>
      <Icon className={`w-3 h-3 ${currentBadge.textColor}`} />
      <span className={`font-medium ${currentBadge.textColor}`}>{currentBadge.label}</span>
    </div>
  );
};

export default UserBadge;

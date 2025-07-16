import { Card } from "@/components/ui/card";
import { UserWeeklyHoursTable } from "@/components/ui/user-weekly-hours-table";
import React from "react";

interface AdminWeeklyHoursTableProps {
  users: any[];
}

export const AdminWeeklyHoursTable: React.FC<AdminWeeklyHoursTableProps> = ({ users }) => (
  <Card className="mb-6 border-blue-200 bg-blue-50">
    <UserWeeklyHoursTable users={users} />
  </Card>
); 
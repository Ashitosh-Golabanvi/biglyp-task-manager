export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "done";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
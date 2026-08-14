"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { API_URL } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

type TaskStatus = "todo" | "in-progress" | "done";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type FilterStatus = "all" | TaskStatus;

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<FilterStatus>("all");

  // Create task
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [creating, setCreating] =
    useState(false);

  // Edit task
  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);
  const [editTitle, setEditTitle] =
    useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [savingEdit, setSavingEdit] =
    useState(false);

  // General action state
  const [deletingTaskId, setDeletingTaskId] =
    useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] =
    useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] =
    useState(1);

  async function loadTasks(
    currentPage = page,
    currentSearch = search,
    currentFilter = filter,
  ) {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();

      params.set("page", String(currentPage));
      params.set("pageSize", String(pageSize));

      if (currentSearch.trim()) {
        params.set(
          "search",
          currentSearch.trim(),
        );
      }

      if (currentFilter !== "all") {
        params.set(
          "status",
          currentFilter,
        );
      }

      const response = await fetch(
        `${API_URL}/api/tasks?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          router.push("/login");
          return;
        }

        throw new Error(
          data.error ||
            "Failed to load tasks",
        );
      }

      setTasks(data.tasks ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(
        data.totalPages ?? 1,
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  async function createTask(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim() || undefined,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create task",
        );
      }

      setTitle("");
      setDescription("");

      // Return to first page after creating.
      setPage(1);

      await loadTasks(
        1,
        search,
        filter,
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create task",
      );
    } finally {
      setCreating(false);
    }
  }

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(
      task.description ?? "",
    );
    setError("");
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(taskId: string) {
    if (!editTitle.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description:
              editDescription.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update task",
        );
      }

      cancelEditing();

      await loadTasks(
        page,
        search,
        filter,
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function updateStatus(
    id: string,
    status: TaskStatus,
  ) {
    try {
      setUpdatingStatusId(id);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update task status",
        );
      }

      await loadTasks(
        page,
        search,
        filter,
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function deleteTask(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTaskId(id);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        response.status === 204
          ? null
          : await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to delete task",
        );
      }

      // If the current page becomes empty,
      // move back one page.
      const shouldGoBack =
        tasks.length === 1 &&
        page > 1;

      const nextPage = shouldGoBack
        ? page - 1
        : page;

      setPage(nextPage);

      await loadTasks(
        nextPage,
        search,
        filter,
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete task",
      );
    } finally {
      setDeletingTaskId(null);
    }
  }

  function handleSearchSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setPage(1);

    loadTasks(
      1,
      search,
      filter,
    );
  }

  function clearSearch() {
    setSearch("");
    setPage(1);

    loadTasks(
      1,
      "",
      filter,
    );
  }

  function changeFilter(
    newFilter: FilterStatus,
  ) {
    setFilter(newFilter);
    setPage(1);

    loadTasks(
      1,
      search,
      newFilter,
    );
  }

  function goToPage(
    nextPage: number,
  ) {
    if (
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return;
    }

    setPage(nextPage);

    loadTasks(
      nextPage,
      search,
      filter,
    );
  }

  function logout() {
    removeToken();
    router.push("/login");
  }

  useEffect(() => {
    loadTasks(1, "", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <p>Loading tasks...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              My Tasks
            </h1>

            <p className="text-gray-600 mt-1">
              Manage your tasks
            </p>
          </div>

          <button
            onClick={logout}
            className="border px-4 py-2 rounded bg-white hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        {/* Create Task */}
        <form
          onSubmit={createTask}
          className="bg-white border rounded-lg p-5 mb-6 space-y-4"
        >
          <h2 className="text-xl font-bold">
            Create Task
          </h2>

          <input
            className="w-full border p-2.5 rounded"
            placeholder="Task title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />

          <textarea
            className="w-full border p-2.5 rounded min-h-24"
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value,
              )
            }
          />

          <button
            type="submit"
            disabled={creating}
            className="border px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Create Task"}
          </button>
        </form>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white border rounded-lg p-4 mb-4"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="flex-1 border p-2.5 rounded"
              placeholder="Search tasks by title..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              type="submit"
              className="border px-5 py-2.5 rounded bg-black text-white"
            >
              Search
            </button>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="border px-5 py-2.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() =>
              changeFilter("all")
            }
            className={`border px-4 py-2 rounded ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            All
          </button>

          <button
            onClick={() =>
              changeFilter("todo")
            }
            className={`border px-4 py-2 rounded ${
              filter === "todo"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            Todo
          </button>

          <button
            onClick={() =>
              changeFilter("in-progress")
            }
            className={`border px-4 py-2 rounded ${
              filter === "in-progress"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() =>
              changeFilter("done")
            }
            className={`border px-4 py-2 rounded ${
              filter === "done"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            Done
          </button>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            {total}{" "}
            {total === 1
              ? "task"
              : "tasks"}
          </p>

          {loading && (
            <p className="text-sm text-gray-500">
              Updating...
            </p>
          )}
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white border rounded-lg p-6 text-center">
              <p className="text-gray-600">
                No tasks found.
              </p>

              {(search ||
                filter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setPage(1);

                    loadTasks(
                      1,
                      "",
                      "all",
                    );
                  }}
                  className="mt-3 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            tasks.map((task) => {
              const isEditing =
                editingTaskId ===
                task.id;

              return (
                <div
                  key={task.id}
                  className="bg-white border rounded-lg p-5"
                >
                  {isEditing ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <h2 className="font-bold text-lg">
                        Edit Task
                      </h2>

                      <input
                        className="w-full border p-2.5 rounded"
                        value={editTitle}
                        onChange={(e) =>
                          setEditTitle(
                            e.target.value,
                          )
                        }
                        placeholder="Task title"
                      />

                      <textarea
                        className="w-full border p-2.5 rounded min-h-24"
                        value={
                          editDescription
                        }
                        onChange={(e) =>
                          setEditDescription(
                            e.target.value,
                          )
                        }
                        placeholder="Description"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            saveEdit(
                              task.id,
                            )
                          }
                          disabled={
                            savingEdit
                          }
                          className="border px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                        >
                          {savingEdit
                            ? "Saving..."
                            : "Save"}
                        </button>

                        <button
                          onClick={
                            cancelEditing
                          }
                          disabled={
                            savingEdit
                          }
                          className="border px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal mode */
                    <>
                      <div className="flex flex-col md:flex-row md:justify-between gap-3">
                        <div className="flex-1">
                          <h2 className="font-bold text-xl">
                            {task.title}
                          </h2>

                          {task.description && (
                            <p className="mt-2 text-gray-600">
                              {
                                task.description
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <select
                            value={
                              task.status
                            }
                            disabled={
                              updatingStatusId ===
                              task.id
                            }
                            onChange={(
                              e,
                            ) =>
                              updateStatus(
                                task.id,
                                e.target
                                  .value as TaskStatus,
                              )
                            }
                            className="border p-2 rounded"
                          >
                            <option value="todo">
                              Todo
                            </option>

                            <option value="in-progress">
                              In Progress
                            </option>

                            <option value="done">
                              Done
                            </option>
                          </select>
                        </div>
                      </div>

                      {task.dueDate && (
                        <p className="text-sm text-gray-500 mt-3">
                          Due:{" "}
                          {new Date(
                            task.dueDate,
                          ).toLocaleString()}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() =>
                            startEditing(
                              task,
                            )
                          }
                          className="border px-4 py-2 rounded hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteTask(
                              task.id,
                            )
                          }
                          disabled={
                            deletingTaskId ===
                            task.id
                          }
                          className="border border-red-300 text-red-600 px-4 py-2 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingTaskId ===
                          task.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() =>
                goToPage(page - 1)
              }
              disabled={page === 1}
              className="border px-4 py-2 rounded disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-4">
              Page {page} of{" "}
              {totalPages}
            </span>

            <button
              onClick={() =>
                goToPage(page + 1)
              }
              disabled={
                page === totalPages
              }
              className="border px-4 py-2 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
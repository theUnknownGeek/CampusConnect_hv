"use client";
// this has task 4
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { events } from "@/data/events";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { useState } from "react";

export default function OrganizerPage() {
  const { currentUser } = useAuth();

  const [myEvents, setMyEvents] = useState(
    events.filter((e) => e.organizerId === currentUser.id),
  );

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    venue: "",
    capacity: 0,
  });

  if (currentUser.role !== "organizer") {
    return (
      <section className="shell" style={{ padding: "56px 0" }}>
        <EmptyState
          title="This page is for organizers"
          description="Switch to an organizer account from the top-right menu to manage events."
        />
      </section>
    );
  }

  const handleCreateEvent = async () => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        organizerId: currentUser.id,
      }),
    });

    const newEvent = await response.json();

    setMyEvents((prev) => [...prev, newEvent]);

    setShowForm(false);
  };

  const handleCancelEvent = async (id: string) => {
    await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });

    setMyEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, cancelled: true } : event,
      ),
    );
  };

  const handleEditEvent = async (id: string, updatedData: object) => {
    const response = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const updatedEvent = await response.json();

    setMyEvents((prev) =>
      prev.map((event) => (event.id === id ? updatedEvent : event)),
    );
  };

  return (
    <section className="shell" style={{ padding: "40px 0 64px" }}>
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span className="eyebrow-tag">organizer console</span>
          <h1 style={{ fontSize: 30, marginTop: 10 }}>Manage your events</h1>
          <p style={{ marginTop: 8 }}>
            {/* PARTICIPANT TASK (Task 4): wire "New event" up to a form +
                POST /api/events, and make Edit/Cancel below call
                PATCH/DELETE on /api/events/[id]. */}
            This starter shows your seeded events — creating, editing, and
            cancelling are Task 4.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          title="Event creation isn't wired up yet — that's Task 4"
        >
          + New event
        </button>
      </div>

      {showForm && (
        <div className="card-surface" style={{ padding: 20 }}>
          <input
            placeholder="Event name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <input
            placeholder="Venue"
            value={formData.venue}
            onChange={(e) =>
              setFormData({
                ...formData,
                venue: e.target.value,
              })
            }
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({
                ...formData,
                date: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({
                ...formData,
                capacity: Number(e.target.value),
              })
            }
          />

          <button className="btn btn-primary" onClick={handleCreateEvent}>
            Create
          </button>
        </div>
      )}

      {myEvents.length === 0 ? (
        <EmptyState
          title="No events posted yet"
          description="Once you create an event, it'll show up here."
        />
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {myEvents.map((event) => {
            const status = event.cancelled
              ? "cancelled"
              : event.seatsAvailable <= 0
                ? "full"
                : "open";
            return (
              <li
                key={event.id}
                className="card-surface"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 17,
                      textDecoration: "none",
                    }}
                  >
                    {event.name}
                  </Link>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--ink-soft)",
                      marginTop: 4,
                    }}
                  >
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {event.venue} · {event.seatsAvailable}/{event.capacity}{" "}
                    seats
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StatusBadge status={status} />
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      handleEditEvent(event.id, {
                        name: prompt("Enter new event name", event.name),
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCancelEvent(event.id)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

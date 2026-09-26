"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getRegistrationsForStudent } from "@/data/registrations";
import { getEventById } from "@/data/events";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { useState } from "react";

export default function RegistrationsPage() {
  const { currentUser } = useAuth();

  const [myRegistrations, setMyRegistrations] = useState(
    getRegistrationsForStudent(currentUser.id),
  );

  if (currentUser.role !== "student") {
    return (
      <section className="shell" style={{ padding: "56px 0" }}>
        <EmptyState
          title="This page is for students"
          description="Switch to a student account from the top-right menu to see registered events."
        />
      </section>
    );
  }

  const handleCancelRegistration = async (id: string) => {
    await fetch(`/api/registrations/${id}`, {
      method: "DELETE",
    });

    setMyRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === id
          ? { ...reg, status: "cancelled" }
          : reg,
      ),
    );
  };

  const upcomingRegistrations = myRegistrations.filter((reg) => {
    const event = getEventById(reg.eventId);

    return event && new Date(event.date) >= new Date();
  });

  const pastRegistrations = myRegistrations.filter((reg) => {
    const event = getEventById(reg.eventId);

    return event && new Date(event.date) < new Date();
  });

  const renderRegistration = (reg: any) => {
    const event = getEventById(reg.eventId);

    if (!event) return null;

    return (
      <li
        key={reg.id}
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
            · {event.venue}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <StatusBadge
            status={
              reg.status === "cancelled"
                ? "cancelled"
                : "open"
            }
          />

          <button
            className="btn btn-secondary"
            disabled={reg.status === "cancelled"}
            onClick={() =>
              handleCancelRegistration(reg.id)
            }
          >
            {reg.status === "cancelled"
              ? "Cancelled"
              : "Cancel"}
          </button>
        </div>
      </li>
    );
  };

  return (
    <section className="shell" style={{ padding: "40px 0 64px" }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">
          signed up as {currentUser.name}
        </span>

        <h1 style={{ fontSize: 30, marginTop: 10 }}>
          My registrations
        </h1>

        <p style={{ marginTop: 8 }}>
          Everything you've registered for.
        </p>
      </div>

      {myRegistrations.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Once you register for an event, it'll show up here."
          action={
            <Link href="/events" className="btn btn-primary">
              Browse events
            </Link>
          }
        />
      ) : (
        <>
          {/* Upcoming Events */}
          <section>
            <h2 style={{ marginBottom: 16 }}>
              Upcoming events
            </h2>

            {upcomingRegistrations.length === 0 ? (
              <EmptyState
                title="No upcoming events"
                description="You have no upcoming registrations."
              />
            ) : (
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {upcomingRegistrations.map(renderRegistration)}
              </ul>
            )}
          </section>

          {/* Past Events */}
          <section style={{ marginTop: 36 }}>
            <h2 style={{ marginBottom: 16 }}>
              Past events
            </h2>

            {pastRegistrations.length === 0 ? (
              <EmptyState
                title="No past events"
                description="Your completed events will appear here."
              />
            ) : (
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {pastRegistrations.map(renderRegistration)}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  );
}
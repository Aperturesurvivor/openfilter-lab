import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  categoryLabels,
  cloneProfile,
  defaultProfile,
  findNextSkipBoundary,
  formatTimestamp,
  getActiveDecisions,
  validateAnnotationShape
} from "@openfilter/core";
import type { FilterAction, FilterCategory, FilterProfile, OpenFilterAnnotation } from "@openfilter/core";
import "./styles.css";

const annotationUrl = "/annotations/openfilter-test-reel.of.json";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [annotation, setAnnotation] = useState<OpenFilterAnnotation | null>(null);
  const [profile, setProfile] = useState<FilterProfile>(() => cloneProfile(defaultProfile));
  const [timeMs, setTimeMs] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch(annotationUrl)
      .then((response) => response.json())
      .then((data: OpenFilterAnnotation) => {
        setAnnotation(data);
        setValidationErrors(validateAnnotationShape(data));
      })
      .catch((error: unknown) => {
        setValidationErrors([`Could not load annotation: ${String(error)}`]);
      });
  }, []);

  const activeDecisions = useMemo(() => {
    if (!annotation) return [];
    return getActiveDecisions(annotation.events, timeMs, profile);
  }, [annotation, profile, timeMs]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !annotation) return;

    const shouldMute = activeDecisions.some((decision) => decision.action === "mute");
    video.muted = shouldMute;

    const skipToMs = findNextSkipBoundary(activeDecisions);
    if (skipToMs !== null && Math.abs(video.currentTime * 1000 - skipToMs) > 250) {
      const activeIds = activeDecisions.map((decision) => decision.event.id).join(", ");
      video.currentTime = Math.min(skipToMs / 1000, video.duration || annotation.media.runtimeMs / 1000);
      setLog((entries) => [
        `${formatTimestamp(timeMs)} skipped to ${formatTimestamp(skipToMs)} (${activeIds})`,
        ...entries.slice(0, 7)
      ]);
    }
  }, [activeDecisions, annotation, timeMs]);

  function updateCategory(category: FilterCategory, update: Partial<FilterProfile[FilterCategory]>) {
    setProfile((current) => ({
      ...current,
      [category]: { ...current[category], ...update }
    }));
  }

  if (!annotation) {
    return <main className="loading">Loading OpenFilter annotation...</main>;
  }

  const duration = annotation.media.runtimeMs;
  const filteredEvents = annotation.events.filter((event) => {
    const category = profile[event.category];
    return category.enabled && event.severity >= category.minSeverity;
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>OpenFilter Lab</h1>
          <p>{annotation.media.title} - {annotation.media.edition}</p>
        </div>
        <a className="download-link" href={annotationUrl} download>
          Download annotation
        </a>
      </header>

      <section className="workspace">
        <div className="player-column">
          <div className="video-frame">
            <video
              ref={videoRef}
              controls
              src={annotation.media.sourceUrl}
              onTimeUpdate={(event) => setTimeMs(event.currentTarget.currentTime * 1000)}
              onLoadedMetadata={(event) => setTimeMs(event.currentTarget.currentTime * 1000)}
            />
            <div className="decision-strip">
              {activeDecisions.length === 0 ? (
                <span>No active filter</span>
              ) : (
                activeDecisions.map((decision) => (
                  <span className={`decision decision-${decision.action}`} key={decision.event.id}>
                    {decision.action.toUpperCase()} {categoryLabels[decision.event.category]}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="timeline" aria-label="Annotation timeline">
            <div className="playhead" style={{ left: `${Math.min(100, (timeMs / duration) * 100)}%` }} />
            {annotation.events.map((event) => {
              const left = (event.startMs / duration) * 100;
              const width = Math.max(0.8, ((event.endMs - event.startMs) / duration) * 100);
              return (
                <button
                  className={`marker marker-${event.defaultAction}`}
                  key={event.id}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${formatTimestamp(event.startMs)} ${categoryLabels[event.category]}: ${event.note}`}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = event.startMs / 1000;
                  }}
                />
              );
            })}
          </div>

          <section className="status-grid">
            <StatusItem label="Schema" value={annotation.schema.replace("https://openfilter.local/schema/", "")} />
            <StatusItem label="Runtime" value={formatTimestamp(duration)} />
            <StatusItem label="Filtered events" value={`${filteredEvents.length}/${annotation.events.length}`} />
            <StatusItem label="Validation" value={validationErrors.length === 0 ? "pass" : "needs attention"} tone={validationErrors.length === 0 ? "good" : "warn"} />
          </section>
        </div>

        <aside className="profile-panel">
          <h2>Filter profile</h2>
          {(Object.keys(profile) as FilterCategory[]).map((category) => (
            <div className="profile-row" key={category}>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={profile[category].enabled}
                  onChange={(event) => updateCategory(category, { enabled: event.target.checked })}
                />
                <span>{categoryLabels[category]}</span>
              </label>
              <div className="row-controls">
                <select
                  value={profile[category].action}
                  onChange={(event) => updateCategory(category, { action: event.target.value as FilterAction })}
                >
                  <option value="mute">Mute</option>
                  <option value="skip">Skip</option>
                  <option value="blank">Blank/skip</option>
                </select>
                <label>
                  Severity {profile[category].minSeverity}+
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={profile[category].minSeverity}
                    onChange={(event) => updateCategory(category, { minSeverity: Number(event.target.value) })}
                  />
                </label>
              </div>
            </div>
          ))}
        </aside>
      </section>

      <section className="event-section">
        <div className="section-heading">
          <h2>Annotation events</h2>
          <p>{annotation.coverage.filter((item) => item.reviewed).length} reviewed categories in this fixture</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Default</th>
                <th>Tags</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {annotation.events.map((event) => (
                <tr key={event.id} className={filteredEvents.includes(event) ? "is-active-rule" : ""}>
                  <td>{formatTimestamp(event.startMs)}</td>
                  <td>{formatTimestamp(event.endMs)}</td>
                  <td>{categoryLabels[event.category]}</td>
                  <td>{event.severity}</td>
                  <td>{event.defaultAction}</td>
                  <td>{event.tags.join(", ")}</td>
                  <td>{event.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="diagnostics">
        <div>
          <h2>Runtime log</h2>
          {log.length === 0 ? <p>No skip decisions yet.</p> : log.map((entry) => <p key={entry}>{entry}</p>)}
        </div>
        <div>
          <h2>Validation</h2>
          {validationErrors.length === 0 ? (
            <p>Annotation shape passed local validation.</p>
          ) : (
            validationErrors.map((error) => <p className="warn-text" key={error}>{error}</p>)
          )}
        </div>
      </section>
    </main>
  );
}

function StatusItem({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div className={`status-item ${tone ? `status-${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

export default function TrackMeta({ currentTrack }) {
  return (
    <section className="track-meta">
      <h2 className="track-meta-heading">
        <span className="track-title">{currentTrack.name}</span>
        <span className="track-divider">|</span>
        <span className="track-artist">{currentTrack.artists[0].name}</span>
      </h2>
    </section>
  );
}

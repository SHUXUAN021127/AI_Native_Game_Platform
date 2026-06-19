export default function TagList({
  tags
}: {
  tags: string
}) {

  if (!tags) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      {
        tags
          .split(",")
          .map(tag => (

            <span
              key={tag}
              style={{
                background:"#eef2ff",
                color:"#4f46e5",
                padding:"6px 12px",
                borderRadius:"999px",
                fontSize:"12px"
              }}
            >
              {tag.trim()}
            </span>

          ))
      }
    </div>
  );
}
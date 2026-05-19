export default function Spinner({ size = 14 }) {
  return (
    <span
      className="inline-block border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

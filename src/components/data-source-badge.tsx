export function DataSourceBadge({ note }: { note?: string | null }) {
  const isPublic = note?.startsWith("[公开数据]");

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        isPublic
          ? "bg-blue-500/15 text-blue-200"
          : "bg-orange-500/15 text-orange-200"
      }`}
    >
      {isPublic ? "公开数据汇总" : "人工录入"}
    </span>
  );
}

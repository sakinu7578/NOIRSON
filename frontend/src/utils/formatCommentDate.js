// API 的 LocalDateTime 直接格式化顯示，不額外換算時區。
export function formatCommentDate(value) {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  return match ? `${match[1]}/${match[2]}/${match[3]} ${match[4]}:${match[5]}` : value;
}

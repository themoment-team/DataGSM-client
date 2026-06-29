const koreanTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
});

export const formatKoreanTime = (date: Date) => koreanTimeFormatter.format(date);

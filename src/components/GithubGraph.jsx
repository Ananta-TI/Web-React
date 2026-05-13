import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const BLOCK_SIZE = 11;
const BLOCK_MARGIN = 4;
const FONT_SIZE = 14;
const WEEK_COUNT = 53;

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

function startOfWeek(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function getContributionLevel(count) {
  if (!count || count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function getThemeColors(isDarkMode) {
  return isDarkMode
    ? ["#18181b", "#0e4429", "#006d32", "#26a641", "#39d353"]
    : ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
}

function normalizeContributions(data) {
  if (!data) return [];

  if (Array.isArray(data.contributions)) {
    return data.contributions
      .filter((item) => item?.date)
      .map((item) => ({
        date: item.date,
        count: Number(item.count || 0),
        level: Number(
          item.level ?? getContributionLevel(Number(item.count || 0))
        ),
      }));
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item?.date)
      .map((item) => ({
        date: item.date,
        count: Number(item.count || 0),
        level: Number(
          item.level ?? getContributionLevel(Number(item.count || 0))
        ),
      }));
  }

  return [];
}

function buildCalendar(contributions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = startOfWeek(today);
  start.setDate(start.getDate() - (WEEK_COUNT - 1) * 7);

  const contributionMap = new Map();

  contributions.forEach((item) => {
    contributionMap.set(item.date, {
      count: item.count,
      level: item.level,
    });
  });

  const weeks = [];
  let total = 0;

  for (let weekIndex = 0; weekIndex < WEEK_COUNT; weekIndex += 1) {
    const week = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + weekIndex * 7 + dayIndex);

      const dateKey = formatDateKey(currentDate);
      const contribution = contributionMap.get(dateKey);

      const count = contribution?.count || 0;
      const level = contribution?.level ?? getContributionLevel(count);

      total += count;

      week.push({
        date: dateKey,
        count,
        level,
      });
    }

    weeks.push(week);
  }

  return {
    weeks,
    total,
  };
}

function GithubCalendarClone({ username, contributions, isDarkMode }) {
  const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);

  const calendar = useMemo(() => {
    return buildCalendar(contributions);
  }, [contributions]);

  const monthMarkers = useMemo(() => {
    const markers = [];
    let lastMonth = null;

    calendar.weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      const date = new Date(firstDay.date);
      const month = date.getMonth();

      if (month !== lastMonth) {
        markers.push({
          label: MONTH_LABELS[month],
          weekIndex,
        });

        lastMonth = month;
      }
    });

    return markers;
  }, [calendar.weeks]);

  const calendarWidth = WEEK_COUNT * BLOCK_SIZE + (WEEK_COUNT - 1) * BLOCK_MARGIN;
  const calendarHeight = 7 * BLOCK_SIZE + 6 * BLOCK_MARGIN;

  return (
    <div
      className={isDarkMode ? "github-calendar-dark" : "github-calendar-light"}
      style={{
        fontSize: FONT_SIZE,
      }}
    >
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div
          style={{
            width: calendarWidth + 34,
            minWidth: calendarWidth + 34,
          }}
        >
          <div
            className="relative mb-1"
            style={{
              height: 18,
              marginLeft: 32,
              width: calendarWidth,
            }}
          >
            {monthMarkers.map((marker) => (
              <span
                key={`${marker.label}-${marker.weekIndex}`}
                className="absolute text-[10px] font-normal leading-none"
                style={{
                  left: marker.weekIndex * (BLOCK_SIZE + BLOCK_MARGIN),
                }}
              >
                {marker.label}
              </span>
            ))}
          </div>

          <div className="flex">
            <div
              className="mr-2 grid shrink-0"
              style={{
                width: 24,
                gridTemplateRows: `repeat(7, ${BLOCK_SIZE}px)`,
                rowGap: BLOCK_MARGIN,
              }}
            >
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="text-[10px] font-normal leading-none"
                  style={{
                    height: BLOCK_SIZE,
                    lineHeight: `${BLOCK_SIZE}px`,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="flex shrink-0"
              style={{
                gap: BLOCK_MARGIN,
                width: calendarWidth,
                height: calendarHeight,
              }}
            >
              {calendar.weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid shrink-0"
                  style={{
                    gridTemplateRows: `repeat(7, ${BLOCK_SIZE}px)`,
                    rowGap: BLOCK_MARGIN,
                    width: BLOCK_SIZE,
                  }}
                >
                  {week.map((day) => (
                    <span
                      key={day.date}
                      title={`${day.date}: ${day.count} contribution${
                        day.count === 1 ? "" : "s"
                      }`}
                      className="block rounded-[2px]"
                      style={{
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        backgroundColor: colors[day.level],
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-3 flex items-center justify-between gap-4 text-xs font-normal"
            style={{
              marginLeft: 32,
              width: calendarWidth,
            }}
          >
            <span>{calendar.total.toLocaleString()} contributions in the last year</span>

            <div className="flex items-center gap-1">
              <span>Less</span>

              {[0, 1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className="block rounded-[2px]"
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    backgroundColor: colors[level],
                  }}
                />
              ))}

              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noreferrer"
        className="sr-only"
      >
        View GitHub profile
      </a>

      <style>
        {`
          .github-calendar-dark {
            color: #e6edf3;
          }

          .github-calendar-light {
            color: #24292f;
          }

          .github-calendar-dark span {
            color: #7d8590;
          }

          .github-calendar-light span {
            color: #656d76;
          }
        `}
      </style>
    </div>
  );
}

const GithubGraph = ({ username = "Ananta-TI", isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchContributions() {
      try {
        setLoading(true);
        setFailed(false);

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=${previousYear}&y=${currentYear}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch GitHub contributions");
        }

        const data = await response.json();

        if (!cancelled) {
          setContributions(normalizeContributions(data));
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchContributions();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return (
    <div className="flex justify-center font-bold">
      <motion.div
        className={`cursor-target ${
          isDarkMode
            ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0"
            : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"
        } backdrop-blur-lg p-6 rounded-xl shadow-xl  transition-all duration-500 max-w-full`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <motion.div
              className={`w-10 h-10 border-4 ${
                isDarkMode
                  ? "border-indigo-400 border-t-transparent"
                  : "border-indigo-600 border-t-transparent"
              } rounded-full animate-spin`}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </div>
        ) : failed ? (
          <div
            className={`flex justify-center items-center h-40 text-sm ${
              isDarkMode ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            GitHub contribution data unavailable.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={isDarkMode ? "github-calendar-dark" : "github-calendar-light"}
          >
            <GithubCalendarClone
              username={username}
              contributions={contributions}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default React.memo(GithubGraph);
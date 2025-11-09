export default function CourseCard({ course }) {
  return (
    <div className="bg-gray-900 rounded-2xl shadow-lg p-4 flex flex-col hover:scale-105 transition-all border border-gray-700">
      <img
        src={course.image_240x135}
        alt={course.title}
        className="rounded-xl mb-3"
      />
      <h2 className="text-lg font-semibold text-white line-clamp-2">{course.title}</h2>
      <p className="text-gray-400 text-sm mt-1">
        {course.visible_instructors?.[0]?.title || "Unknown Instructor"}
      </p>
      <div className="flex justify-between items-center mt-auto pt-3">
        <span className="text-yellow-400 font-bold">{course.avg_rating.toFixed(1)}★</span>
        <span className="text-green-400 font-semibold">
          {course.price || "Free"}
        </span>
      </div>
    </div>
  );
}

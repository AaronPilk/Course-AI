import { redirect } from "next/navigation";
import { getPublishedCourseBySlug } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function CourseLearnEntry({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getPublishedCourseBySlug(params.slug);
  if (!course) redirect(`/courses`);
  redirect(`/learn/${params.slug}/0/0`);
}

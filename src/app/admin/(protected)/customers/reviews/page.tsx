import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockProductReviews } from "@/features/admin/mock-data";
import { requireAdmin } from "@/server/auth/admin";

export const metadata = {
  title: "Reviews & Ratings | UAG E-commerce",
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const normalizedQuery = query.toLowerCase();
  const reviews = normalizedQuery
    ? mockProductReviews.filter((review) =>
        [
          review.id,
          review.productName,
          review.reviewer,
          review.sentiment,
          review.latestComment,
          review.updatedAt,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : mockProductReviews;

  const averageRating =
    mockProductReviews.reduce((sum, review) => sum + review.rating, 0) /
    mockProductReviews.length;
  const totalReviews = mockProductReviews.reduce(
    (sum, review) => sum + review.reviews,
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
            <Star className="h-4 w-4" aria-hidden="true" />
            Customers
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Reviews & Ratings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Product-wise ratings and latest review signals in table format.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <Summary label="Average rating" value={averageRating.toFixed(1)} />
          <Summary label="Total reviews" value={totalReviews.toString()} />
        </div>
      </div>

      <Card className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b">
          <CardTitle>Product Review Performance</CardTitle>
          <CardDescription>
            {query
              ? `${reviews.length} result${reviews.length === 1 ? "" : "s"} for "${query}".`
              : "Review count, latest customer comment, and sentiment by product."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px] px-4">Review ID</TableHead>
                <TableHead className="min-w-[260px]">Product</TableHead>
                <TableHead className="min-w-[160px]">Latest Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead className="min-w-[280px]">Latest Comment</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead className="min-w-[120px]">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-zinc-500">
                    No reviews match this search.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="px-4 font-semibold">{review.id}</TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                      {review.productName}
                    </TableCell>
                    <TableCell>{review.reviewer}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {review.rating.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>{review.reviews}</TableCell>
                    <TableCell className="whitespace-normal text-zinc-600 dark:text-zinc-300">
                      {review.latestComment}
                    </TableCell>
                    <TableCell>
                      <Badge className={review.sentiment === "Positive" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"}>
                        {review.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell>{review.updatedAt}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}
